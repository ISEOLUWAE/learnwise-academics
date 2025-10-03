import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  admin_id: string;
  action_type: string;
  target_id: string | null;
  target_type: string | null;
  details: any;
  created_at: string;
  admin_email?: string;
}

export const AuditLog = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get admin emails
      const { data: { users } } = await supabase.auth.admin.listUsers();
      
      const logsWithDetails = data?.map(log => ({
        ...log,
        admin_email: users?.find((u: any) => u.id === log.admin_id)?.email
      })) || [];

      setLogs(logsWithDetails);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (actionType: string) => {
    const colorMap: Record<string, string> = {
      'add_admin': 'bg-blue-500',
      'remove_admin': 'bg-red-500',
      'upload_file': 'bg-green-500',
      'send_message': 'bg-purple-500',
    };

    return (
      <Badge className={colorMap[actionType] || 'bg-gray-500'}>
        {actionType.replace('_', ' ').toUpperCase()}
      </Badge>
    );
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
          <FileText className="h-5 w-5" />
          Audit Log
        </CardTitle>
        <CardDescription>All admin actions are logged here</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell>{log.admin_email || 'Unknown'}</TableCell>
                <TableCell>{getActionBadge(log.action_type)}</TableCell>
                <TableCell className="max-w-md truncate">
                  {JSON.stringify(log.details)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
