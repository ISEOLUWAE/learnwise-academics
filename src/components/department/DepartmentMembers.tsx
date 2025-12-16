import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Crown, Shield, UserCircle, Loader2, Phone, PhoneCall, AlertTriangle, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Member {
  id: string;
  user_id: string;
  role: 'student' | 'class_rep' | 'dept_admin';
  joined_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    phone_number: string | null;
  };
}

interface DepartmentMembersProps {
  spaceId: string;
  isDeptAdmin: boolean;
  isClassRep?: boolean;
}

export const DepartmentMembers = ({ spaceId, isDeptAdmin, isClassRep }: DepartmentMembersProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [showUrgentCallModal, setShowUrgentCallModal] = useState(false);
  const [urgentMessage, setUrgentMessage] = useState('');
  const [sendingCall, setSendingCall] = useState(false);
  const [userProfile, setUserProfile] = useState<{ phone_number: string | null } | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leavingDepartment, setLeavingDepartment] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchUserProfile();
  }, [spaceId, user?.id]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('id', user.id)
      .single();
    setUserProfile(data);
    if (data?.phone_number) {
      setPhoneNumber(data.phone_number);
    }
  };

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
            .select('full_name, username, avatar_url, phone_number')
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
    if (!session) return;
    
    try {
      const response = await fetch(
        `https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/department-space`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'update_member_role',
            memberId,
            newRole,
            spaceId
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Role updated!' });
        fetchMembers();
      } else {
        toast({ title: data.error || 'Failed to update role', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ title: 'Failed to update role', variant: 'destructive' });
    }
  };

  const savePhoneNumber = async () => {
    if (!user || !phoneNumber.trim()) return;
    
    setSavingPhone(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber.trim() })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({ title: 'Phone number saved!' });
      setShowPhoneModal(false);
      fetchUserProfile();
      fetchMembers();
    } catch (error) {
      console.error('Error saving phone:', error);
      toast({ title: 'Failed to save phone number', variant: 'destructive' });
    } finally {
      setSavingPhone(false);
    }
  };

  const triggerUrgentCall = async () => {
    if (!session || !urgentMessage.trim()) return;
    
    setSendingCall(true);
    try {
      const response = await fetch(
        `https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/trigger-urgent-call`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            departmentSpaceId: spaceId,
            message: urgentMessage.trim()
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ 
          title: 'Urgent calls triggered!',
          description: data.message
        });
        setShowUrgentCallModal(false);
        setUrgentMessage('');
      } else {
        toast({ 
          title: 'Call notification sent',
          description: data.message || data.error,
          variant: data.announcementCreated ? 'default' : 'destructive'
        });
        if (data.announcementCreated) {
          setShowUrgentCallModal(false);
          setUrgentMessage('');
        }
      }
    } catch (error) {
      console.error('Error triggering calls:', error);
      toast({ title: 'Failed to trigger calls', variant: 'destructive' });
    } finally {
      setSendingCall(false);
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

  const getDisplayName = (member: Member) => {
    // Prioritize username for display
    if (member.profiles?.username && member.profiles.username.trim()) {
      return member.profiles.username;
    }
    if (member.profiles?.full_name && member.profiles.full_name.trim()) {
      return member.profiles.full_name;
    }
    return 'Student';
  };

  const leaveDepartment = async () => {
    if (!session) return;
    
    setLeavingDepartment(true);
    try {
      const response = await fetch(
        `https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/department-space`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'leave_department',
            spaceId
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Successfully left department' });
        setShowLeaveModal(false);
        navigate('/');
        window.location.reload();
      } else {
        toast({ title: data.error || 'Failed to leave department', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error leaving department:', error);
      toast({ title: 'Failed to leave department', variant: 'destructive' });
    } finally {
      setLeavingDepartment(false);
    }
  };

  const getInitials = (member: Member) => {
    const name = getDisplayName(member);
    if (name === 'Student') return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canManageRoles = isDeptAdmin || isClassRep;

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
  const membersWithPhones = members.filter(m => m.profiles?.phone_number);

  return (
    <div className="space-y-6">
      {/* Phone Number & Urgent Call Actions */}
      <Card className="bg-bg-secondary/50 border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPhoneModal(true)}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              {userProfile?.phone_number ? 'Update Phone Number' : 'Add Phone Number'}
            </Button>
            
            {(isClassRep || isDeptAdmin) && (
              <Button
                variant="destructive"
                onClick={() => setShowUrgentCallModal(true)}
                className="gap-2"
              >
                <PhoneCall className="h-4 w-4" />
                Trigger Urgent Call ({membersWithPhones.length} reachable)
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowLeaveModal(true)}
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Leave Department
            </Button>
          </div>
          
          {!userProfile?.phone_number && (
            <p className="text-sm text-muted-foreground mt-3">
              <AlertTriangle className="h-4 w-4 inline mr-1 text-amber-400" />
              Add your phone number to receive urgent voice call notifications from your class rep.
            </p>
          )}
        </CardContent>
      </Card>

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
                    canManageRoles={canManageRoles}
                    isClassRep={isClassRep}
                    currentUserId={user?.id}
                    onRoleChange={updateMemberRole}
                    getRoleBadge={getRoleBadge}
                    getDisplayName={getDisplayName}
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
                    canManageRoles={canManageRoles}
                    isClassRep={isClassRep}
                    currentUserId={user?.id}
                    onRoleChange={updateMemberRole}
                    getRoleBadge={getRoleBadge}
                    getDisplayName={getDisplayName}
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
                    canManageRoles={canManageRoles}
                    isClassRep={isClassRep}
                    currentUserId={user?.id}
                    onRoleChange={updateMemberRole}
                    getRoleBadge={getRoleBadge}
                    getDisplayName={getDisplayName}
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

      {/* Phone Number Modal */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Your Phone Number
            </DialogTitle>
            <DialogDescription>
              Add your phone number to receive urgent voice call notifications from your class representative.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="tel"
              placeholder="e.g., 08012345678 or +2348012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your number will only be used for urgent class notifications.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPhoneModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={savePhoneNumber} disabled={savingPhone || !phoneNumber.trim()} className="flex-1">
                {savingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Urgent Call Modal */}
      <Dialog open={showUrgentCallModal} onOpenChange={setShowUrgentCallModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <PhoneCall className="h-5 w-5" />
              Trigger Urgent Voice Call
            </DialogTitle>
            <DialogDescription>
              This will call all department members ({membersWithPhones.length} with phone numbers) with an automated voice message. Use only for urgent announcements!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your urgent message (e.g., 'Class has been moved to Room 101. Please come immediately.')"
              value={urgentMessage}
              onChange={(e) => setUrgentMessage(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUrgentCallModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={triggerUrgentCall} 
                disabled={sendingCall || !urgentMessage.trim()} 
                className="flex-1"
              >
                {sendingCall ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Calling...
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call Everyone
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Department Modal */}
      <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <LogOut className="h-5 w-5" />
              Leave Department
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this department? You won't be able to join another department after leaving.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowLeaveModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={leaveDepartment} 
              disabled={leavingDepartment} 
              className="flex-1"
            >
              {leavingDepartment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Leaving...
                </>
              ) : (
                'Leave Department'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface MemberRowProps {
  member: Member;
  canManageRoles: boolean;
  isClassRep?: boolean;
  currentUserId?: string;
  onRoleChange: (memberId: string, newRole: 'student' | 'class_rep' | 'dept_admin') => void;
  getRoleBadge: (role: string) => React.ReactNode;
  getDisplayName: (member: Member) => string;
  getInitials: (member: Member) => string;
}

const MemberRow = ({ 
  member, 
  canManageRoles, 
  isClassRep, 
  currentUserId,
  onRoleChange, 
  getRoleBadge, 
  getDisplayName,
  getInitials 
}: MemberRowProps) => {
  // Class rep can change anyone's role (including demoting admins)
  // Dept admin cannot change class rep's role
  const canEditThisMember = canManageRoles && (
    isClassRep || // Class rep can edit anyone
    (member.role !== 'class_rep') // Dept admin can't edit class rep
  );
  
  // Don't allow changing your own role
  const isSelf = member.user_id === currentUserId;

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-brand-blue/20 text-brand-blue">
            {getInitials(member)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{getDisplayName(member)}</p>
            {member.profiles?.phone_number && (
              <Phone className="h-3 w-3 text-green-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Joined {format(new Date(member.joined_at), 'PP')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canEditThisMember && !isSelf ? (
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