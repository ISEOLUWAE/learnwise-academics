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
import { Newspaper, Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const NewsManager = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    excerpt: '',
    content: '',
    is_external: false,
    external_link: '',
    google_ads_slot: ''
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('news')
        .insert({
          ...formData,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('News added successfully');
      setShowForm(false);
      resetForm();
      fetchNews();
    } catch (error: any) {
      console.error('Error adding news:', error);
      toast.error(error.message || 'Failed to add news');
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('News deleted successfully');
      fetchNews();
    } catch (error: any) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Academic',
      excerpt: '',
      content: '',
      is_external: false,
      external_link: '',
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
          <Newspaper className="h-5 w-5" />
          News Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add News'}
        </Button>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
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
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admissions">Admissions</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Scholarships">Scholarships</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Full Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_external"
                checked={formData.is_external}
                onChange={(e) => setFormData({ ...formData, is_external: e.target.checked })}
              />
              <Label htmlFor="is_external">External Link</Label>
            </div>

            {formData.is_external && (
              <div className="space-y-2">
                <Label htmlFor="external_link">External URL</Label>
                <Input
                  id="external_link"
                  type="url"
                  value={formData.external_link}
                  onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="google_ads_slot">Google Ads Slot ID (Optional)</Label>
              <Input
                id="google_ads_slot"
                value={formData.google_ads_slot}
                onChange={(e) => setFormData({ ...formData, google_ads_slot: e.target.value })}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add News
            </Button>
          </form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteNews(item.id)}
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