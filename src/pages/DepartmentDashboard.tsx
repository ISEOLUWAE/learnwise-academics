import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartmentSpace } from '@/hooks/useDepartmentSpace';
import { JoinDepartmentModal } from '@/components/department/JoinDepartmentModal';
import { DepartmentAnnouncements } from '@/components/department/DepartmentAnnouncements';
import { DepartmentTimetable } from '@/components/department/DepartmentTimetable';
import { DepartmentVoting } from '@/components/department/DepartmentVoting';
import { DepartmentMembers } from '@/components/department/DepartmentMembers';
import { 
  Users, 
  Megaphone, 
  Calendar, 
  Vote, 
  Crown,
  Shield,
  UserCircle,
  Plus,
  Loader2
} from 'lucide-react';

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    memberships, 
    currentSpace, 
    setCurrentSpace, 
    loading, 
    isPublicUser,
    currentRole,
    canManageDepartment,
    isDeptAdmin
  } = useDepartmentSpace();
  
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      </Layout>
    );
  }

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'dept_admin':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case 'class_rep':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Shield className="h-3 w-3 mr-1" />
            Class Rep
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <UserCircle className="h-3 w-3 mr-1" />
            Student
          </Badge>
        );
    }
  };

  // Public user view - show locked features
  if (isPublicUser) {
    return (
      <Layout>
        <div className="pt-20">
          <section className="py-12 min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className="mb-8">
                  <Users className="h-16 w-16 mx-auto mb-4 text-brand-blue opacity-50" />
                  <h1 className="text-3xl font-bold mb-4">
                    <span className="hero-text">Department Dashboard</span>
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    Join your department to access exclusive features like announcements, 
                    timetables, voting, and more!
                  </p>
                </div>

                <Card className="bg-bg-secondary/50 backdrop-blur border-white/10 mb-8">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold mb-4">What you'll get access to:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <Megaphone className="h-5 w-5 text-brand-blue mt-0.5" />
                        <div>
                          <p className="font-medium">Announcements</p>
                          <p className="text-sm text-muted-foreground">Get class updates from your reps</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <Calendar className="h-5 w-5 text-brand-purple mt-0.5" />
                        <div>
                          <p className="font-medium">Class Timetable</p>
                          <p className="text-sm text-muted-foreground">Never miss a class again</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <Vote className="h-5 w-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Voting System</p>
                          <p className="text-sm text-muted-foreground">Elect your class representatives</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <Users className="h-5 w-5 text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Department Community</p>
                          <p className="text-sm text-muted-foreground">Connect with classmates</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  size="lg" 
                  onClick={() => setShowJoinModal(true)}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Join Your Department
                </Button>
              </motion.div>
            </div>
          </section>
        </div>

        <JoinDepartmentModal 
          isOpen={showJoinModal} 
          onClose={() => setShowJoinModal(false)} 
        />
      </Layout>
    );
  }

  // Department user view
  return (
    <Layout>
      <div className="pt-20">
        <section className="py-8 min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    <span className="hero-text">{currentSpace?.department_spaces.display_tag}</span>
                  </h1>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(currentRole)}
                    {memberships.length > 1 && (
                      <span className="text-sm text-muted-foreground">
                        ({memberships.length} departments)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {memberships.length > 1 && (
                    <select
                      value={currentSpace?.id}
                      onChange={(e) => {
                        const space = memberships.find(m => m.id === e.target.value);
                        if (space) setCurrentSpace(space);
                      }}
                      className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-sm"
                    >
                      {memberships.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.department_spaces.display_tag}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Join Another
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <Tabs defaultValue="announcements" className="space-y-6">
                <TabsList className="bg-bg-secondary/50 border border-white/10">
                  <TabsTrigger value="announcements" className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    <span className="hidden sm:inline">Announcements</span>
                  </TabsTrigger>
                  <TabsTrigger value="timetable" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Timetable</span>
                  </TabsTrigger>
                  <TabsTrigger value="voting" className="flex items-center gap-2">
                    <Vote className="h-4 w-4" />
                    <span className="hidden sm:inline">Voting</span>
                  </TabsTrigger>
                  <TabsTrigger value="members" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Members</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="announcements">
                  {currentSpace && (
                    <DepartmentAnnouncements 
                      spaceId={currentSpace.department_spaces.id}
                      canManage={canManageDepartment}
                    />
                  )}
                </TabsContent>

                <TabsContent value="timetable">
                  {currentSpace && (
                    <DepartmentTimetable 
                      spaceId={currentSpace.department_spaces.id}
                      canManage={canManageDepartment}
                    />
                  )}
                </TabsContent>

                <TabsContent value="voting">
                  {currentSpace && (
                    <DepartmentVoting 
                      spaceId={currentSpace.department_spaces.id}
                      isDeptAdmin={isDeptAdmin}
                    />
                  )}
                </TabsContent>

                <TabsContent value="members">
                  {currentSpace && (
                    <DepartmentMembers 
                      spaceId={currentSpace.department_spaces.id}
                      isDeptAdmin={isDeptAdmin}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>
      </div>

      <JoinDepartmentModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
      />
    </Layout>
  );
};

export default DepartmentDashboard;