import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/admin/FileUploader';
import { UserManagement } from '@/components/admin/UserManagement';
import { AdminManagement } from '@/components/admin/AdminManagement';
import { AuditLog } from '@/components/admin/AuditLog';
import { MessageCenter } from '@/components/admin/MessageCenter';
import { CourseManager } from '@/components/admin/CourseManager';
import { NewsManager } from '@/components/admin/NewsManager';
import { ScholarshipManager } from '@/components/admin/ScholarshipManager';
import { Loader2, Shield } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, isHeadAdmin, isLoading } = useAdminRole();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-4xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1 h-auto mb-6 md:mb-8">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            {isHeadAdmin && <TabsTrigger value="admins">Admins</TabsTrigger>}
            {isHeadAdmin && <TabsTrigger value="audit">Audit</TabsTrigger>}
          </TabsList>

          <TabsContent value="files">
            <FileUploader />
          </TabsContent>

          <TabsContent value="courses">
            <CourseManager />
          </TabsContent>

          <TabsContent value="news">
            <NewsManager />
          </TabsContent>

          <TabsContent value="scholarships">
            <ScholarshipManager />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="messages">
            <MessageCenter />
          </TabsContent>

          {isHeadAdmin && (
            <TabsContent value="admins">
              <AdminManagement />
            </TabsContent>
          )}

          {isHeadAdmin && (
            <TabsContent value="audit">
              <AuditLog />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
