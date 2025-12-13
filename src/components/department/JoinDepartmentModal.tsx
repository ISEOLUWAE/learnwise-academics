import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDepartmentSpace } from '@/hooks/useDepartmentSpace';
import { Building2, GraduationCap, Users, Lock, Loader2 } from 'lucide-react';

interface JoinDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SCHOOLS = [
  'University of Lagos',
  'University of Ibadan',
  'University of Nigeria, Nsukka',
  'Obafemi Awolowo University',
  'Ahmadu Bello University',
  'University of Benin',
  'University of Ilorin',
  'Federal University of Technology, Akure',
  'Covenant University',
  'Babcock University',
  'Other',
];

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Accounting',
  'Economics',
  'Medicine',
  'Law',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Mass Communication',
  'Business Administration',
  'Other',
];

const LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L'];

export const JoinDepartmentModal = ({ isOpen, onClose, onSuccess }: JoinDepartmentModalProps) => {
  const [school, setSchool] = useState('');
  const [customSchool, setCustomSchool] = useState('');
  const [department, setDepartment] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { joinOrCreateSpace } = useDepartmentSpace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalSchool = school === 'Other' ? customSchool : school;
    const finalDepartment = department === 'Other' ? customDepartment : department;

    if (!finalSchool || !finalDepartment || !level || !code) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (code.length < 4) {
      toast({
        title: 'Code too short',
        description: 'Department code must be at least 4 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await joinOrCreateSpace(finalSchool, finalDepartment, level, code);

      if (result.success) {
        toast({
          title: result.isNew ? 'Department Space Created!' : 'Joined Successfully!',
          description: result.message,
        });
        onSuccess?.();
        onClose();
      } else {
        toast({
          title: 'Failed to join',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-blue" />
            Join Your Department
          </DialogTitle>
          <DialogDescription>
            Enter your school details and the shared department code agreed upon by your classmates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              School
            </Label>
            <Select value={school} onValueChange={setSchool}>
              <SelectTrigger>
                <SelectValue placeholder="Select your school" />
              </SelectTrigger>
              <SelectContent>
                {SCHOOLS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {school === 'Other' && (
              <Input
                placeholder="Enter your school name"
                value={customSchool}
                onChange={(e) => setCustomSchool(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Department
            </Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {department === 'Other' && (
              <Input
                placeholder="Enter your department name"
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Department Code
            </Label>
            <Input
              id="code"
              type="password"
              placeholder="Enter the shared department code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This code should be agreed upon by your classmates (e.g., via WhatsApp group).
              If you're the first, you're creating the department space.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Department'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};