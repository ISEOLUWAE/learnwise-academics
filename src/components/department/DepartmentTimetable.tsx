import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Loader2, Trash2, Clock, MapPin, User } from 'lucide-react';

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course_code: string;
  course_title: string;
  venue: string | null;
  lecturer: string | null;
}

interface DepartmentTimetableProps {
  spaceId: string;
  canManage: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DepartmentTimetable = ({ spaceId, canManage }: DepartmentTimetableProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [lecturer, setLecturer] = useState('');

  useEffect(() => {
    fetchTimetable();
  }, [spaceId]);

  const fetchTimetable = async () => {
    try {
      const { data, error } = await supabase
        .from('department_timetables')
        .select('*')
        .eq('department_space_id', spaceId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!startTime || !endTime || !courseCode || !courseTitle) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase
        .from('department_timetables')
        .insert({
          department_space_id: spaceId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          course_code: courseCode.toUpperCase(),
          course_title: courseTitle,
          venue: venue || null,
          lecturer: lecturer || null,
          created_by: session?.user?.id,
        });

      if (error) throw error;

      toast({ title: 'Class added to timetable!' });
      setShowCreateModal(false);
      resetForm();
      fetchTimetable();
    } catch (error) {
      console.error('Error creating entry:', error);
      toast({ title: 'Failed to add class', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('department_timetables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Entry deleted' });
      fetchTimetable();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setDayOfWeek('Monday');
    setStartTime('');
    setEndTime('');
    setCourseCode('');
    setCourseTitle('');
    setVenue('');
    setLecturer('');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupedByDay = DAYS.reduce((acc, day) => {
    acc[day] = entries.filter(e => e.day_of_week === day);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Class to Timetable</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Day</label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Start Time</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">End Time</label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Course Code *</label>
                  <Input
                    placeholder="e.g., CSC 101"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Course Title *</label>
                  <Input
                    placeholder="e.g., Introduction to Computing"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Venue (optional)</label>
                  <Input
                    placeholder="e.g., LT1"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Lecturer (optional)</label>
                  <Input
                    placeholder="e.g., Dr. Smith"
                    value={lecturer}
                    onChange={(e) => setLecturer(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to Timetable'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {entries.length === 0 ? (
        <Card className="bg-bg-secondary/50 border-white/10">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No timetable entries yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {DAYS.map((day) => {
            const dayEntries = groupedByDay[day];
            if (dayEntries.length === 0) return null;

            return (
              <Card key={day} className="bg-bg-secondary/50 border-white/10 w-full overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-blue" />
                    {day}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dayEntries.map((entry) => (
                      <div 
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-semibold break-words">{entry.course_code}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="break-words">{entry.course_title}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="break-words">{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
                            </span>
                            {entry.venue && (
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="break-words">{entry.venue}</span>
                              </span>
                            )}
                            {entry.lecturer && (
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <User className="h-3 w-3 flex-shrink-0" />
                                <span className="break-words">{entry.lecturer}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(entry.id)}
                            className="text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};