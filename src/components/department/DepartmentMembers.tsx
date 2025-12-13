import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Crown, Shield, UserCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Member {
  id: string;
  user_id: string;
  role: 'student' | 'class_rep' | 'dept_admin';
  joined_at: string;
  profiles?: {
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}

interface DepartmentMembersProps {
  spaceId: string;
  isDeptAdmin: boolean;
}

export const DepartmentMembers = ({ spaceId, isDeptAdmin }: DepartmentMembersProps) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [spaceId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('department_members')
        .select('*')
        .eq('department_space_id', spaceId)
        .order('role', { ascending: true });

      if (error) throw error;

      // Fetch profile info for each member
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', member.user_id)
            .single();
          return { ...member, profiles: profile };
        })
      );

      setMembers(membersWithProfiles as Member[]);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'student' | 'class_rep' | 'dept_admin') => {
    try {
      const { error } = await supabase
        .from('department_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      toast({ title: 'Role updated!' });
      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ title: 'Failed to update role', variant: 'destructive' });
    }
  };

  const getRoleBadge = (role: string) => {
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

  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const admins = members.filter((m) => m.role === 'dept_admin');
  const classReps = members.filter((m) => m.role === 'class_rep');
  const students = members.filter((m) => m.role === 'student');

  return (
    <div className="space-y-6">
      <Card className="bg-bg-secondary/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-blue" />
            Department Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Admins Section */}
          {admins.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Administrators</h4>
              <div className="space-y-2">
                {admins.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isDeptAdmin={isDeptAdmin}
                    onRoleChange={updateMemberRole}
                    getRoleBadge={getRoleBadge}
                    getInitials={getInitials}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Class Reps Section */}
          {classReps.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Class Representatives</h4>
              <div className="space-y-2">
                {classReps.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isDeptAdmin={isDeptAdmin}
                    onRoleChange={updateMemberRole}
                    getRoleBadge={getRoleBadge}
                    getInitials={getInitials}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Students Section */}
          {students.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Students ({students.length})</h4>
              <div className="space-y-2">
                {students.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isDeptAdmin={isDeptAdmin}
                    onRoleChange={updateMemberRole}
                    getRoleBadge={getRoleBadge}
                    getInitials={getInitials}
                  />
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No members yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface MemberRowProps {
  member: Member;
  isDeptAdmin: boolean;
  onRoleChange: (memberId: string, newRole: 'student' | 'class_rep' | 'dept_admin') => void;
  getRoleBadge: (role: string) => React.ReactNode;
  getInitials: (name: string | undefined) => string;
}

const MemberRow = ({ member, isDeptAdmin, onRoleChange, getRoleBadge, getInitials }: MemberRowProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-brand-blue/20 text-brand-blue">
            {getInitials(member.profiles?.full_name || member.profiles?.username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {member.profiles?.full_name || member.profiles?.username || 'Unknown User'}
          </p>
          <p className="text-xs text-muted-foreground">
            Joined {format(new Date(member.joined_at), 'PP')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isDeptAdmin ? (
          <Select
            value={member.role}
            onValueChange={(value) => onRoleChange(member.id, value as any)}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="class_rep">Class Rep</SelectItem>
              <SelectItem value="dept_admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          getRoleBadge(member.role)
        )}
      </div>
    </div>
  );
};