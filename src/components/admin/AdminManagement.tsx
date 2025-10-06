import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'head_admin';
  created_at: string;
  email?: string;
  username?: string;
}

export const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-admin-users', {
        body: { action: 'list_admins' }
      });

      if (error) throw error;

      setAdmins(data.admins || []);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setAdding(true);
    try {
      // Find user by email using edge function
      const { data: userData, error: findError } = await supabase.functions.invoke('manage-admin-users', {
        body: { action: 'find_user', email: newAdminEmail.trim() }
      });

      if (findError || !userData?.user) {
        toast.error('User not found with this email address');
        setAdding(false);
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'admin',
          created_by: user?.id
        });

      if (error) throw error;

      // Log action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'add_admin',
        target_id: userData.user.id,
        details: { email: newAdminEmail }
      });

      toast.success('Admin added successfully');
      setNewAdminEmail('');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast.error(error.message || 'Failed to add admin');
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (adminId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      // Log action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'remove_admin',
        target_id: userId
      });

      toast.success('Admin removed successfully');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Management
        </CardTitle>
        <CardDescription>Add or remove admin privileges (Head Admin only)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="adminEmail">User Email</Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="user@example.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addAdmin} disabled={adding}>
              {adding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Add Admin
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.username || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={admin.role === 'head_admin' ? 'default' : 'secondary'}>
                    {admin.role === 'head_admin' ? 'Head Admin' : 'Admin'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {admin.role !== 'head_admin' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeAdmin(admin.id, admin.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
