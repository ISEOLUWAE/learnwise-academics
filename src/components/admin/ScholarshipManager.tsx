import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GraduationCap, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ScholarshipManager = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    type: 'Government',
    level: 'Undergraduate',
    amount: '',
    deadline: '',
    requirements: [] as string[],
    requirementsText: '',
    description: '',
    apply_link: '',
    is_active: true,
    google_ads_slot: ''
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .order('deadline', { ascending: false });

      if (error) throw error;
      setScholarships(data || []);
    } catch (error: any) {
      console.error('Error fetching scholarships:', error);
      toast.error('Failed to fetch scholarships');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const requirements = formData.requirementsText
        .split('\n')
        .filter(r => r.trim())
        .map(r => r.trim());

      const { error } = await supabase
        .from('scholarships')
        .insert({
          ...formData,
          requirements,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Scholarship added successfully');
      setShowForm(false);
      resetForm();
      fetchScholarships();
    } catch (error: any) {
      console.error('Error adding scholarship:', error);
      toast.error(error.message || 'Failed to add scholarship');
    }
  };

  const deleteScholarship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Scholarship deleted successfully');
      fetchScholarships();
    } catch (error: any) {
      console.error('Error deleting scholarship:', error);
      toast.error('Failed to delete scholarship');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      provider: '',
      type: 'Government',
      level: 'Undergraduate',
      amount: '',
      deadline: '',
      requirements: [],
      requirementsText: '',
      description: '',
      apply_link: '',
      is_active: true,
      google_ads_slot: ''
    });
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
          <GraduationCap className="h-5 w-5" />
          Scholarship Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Scholarship'}
        </Button>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g., ₦500,000 per year"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="requirementsText">Requirements (one per line) *</Label>
                <Textarea
                  id="requirementsText"
                  value={formData.requirementsText}
                  onChange={(e) => setFormData({ ...formData, requirementsText: e.target.value })}
                  rows={3}
                  placeholder="Nigerian citizenship&#10;Minimum CGPA of 3.5&#10;Financial need documentation"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="apply_link">Application Link *</Label>
                <Input
                  id="apply_link"
                  type="url"
                  value={formData.apply_link}
                  onChange={(e) => setFormData({ ...formData, apply_link: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_ads_slot">Google Ads Slot ID (Optional)</Label>
                <Input
                  id="google_ads_slot"
                  value={formData.google_ads_slot}
                  onChange={(e) => setFormData({ ...formData, google_ads_slot: e.target.value })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Scholarship
            </Button>
          </form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scholarships.map((scholarship) => (
              <TableRow key={scholarship.id}>
                <TableCell>{scholarship.title}</TableCell>
                <TableCell>{scholarship.provider}</TableCell>
                <TableCell>
                  <Badge variant="outline">{scholarship.type}</Badge>
                </TableCell>
                <TableCell>{new Date(scholarship.deadline).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={scholarship.is_active ? 'default' : 'secondary'}>
                    {scholarship.is_active ? 'Active' : 'Closed'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteScholarship(scholarship.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};