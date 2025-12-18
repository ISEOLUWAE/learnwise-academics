import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for department codes
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'create_or_join') {
      const { school, department, level, code } = body;
      
      // Validate inputs
      if (!school || !department || !level || !code) {
        return new Response(
          JSON.stringify({ error: 'All fields are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is already in ANY department space
      const { data: existingMembership, error: membershipError } = await supabaseClient
        .from('department_members')
        .select('id, department_spaces(display_tag)')
        .eq('user_id', user.id)
        .limit(1);

      if (membershipError) {
        console.error('Error checking membership:', membershipError);
        return new Response(
          JSON.stringify({ error: 'Failed to check membership status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (existingMembership && existingMembership.length > 0) {
        const currentSpace = existingMembership[0].department_spaces as any;
        return new Response(
          JSON.stringify({ 
            error: `You are already a member of ${currentSpace?.display_tag || 'a department'}. You can only join one department space.` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const codeHash = await hashCode(code);
      const displayTag = `${school} ${department} ${level}`;

      // Check if department space exists
      const { data: existingSpace, error: fetchError } = await supabaseClient
        .from('department_spaces')
        .select('*')
        .eq('school', school)
        .eq('department', department)
        .eq('level', level)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching space:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to check department space' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (existingSpace) {
        // Verify code matches
        if (existingSpace.code_hash !== codeHash) {
          return new Response(
            JSON.stringify({ error: 'Invalid department code. Please check with your classmates.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if user was previously in this department with a higher role
        // Look up previous membership history (using audit or check if they were the creator)
        let roleToAssign: 'student' | 'class_rep' | 'dept_admin' = 'student';
        
        // Check if user was the original creator (should be dept_admin)
        if (existingSpace.created_by === user.id) {
          roleToAssign = 'dept_admin';
          console.log(`User ${user.id} is the original creator, restoring as dept_admin`);
        } else {
          // Check if there's currently no class_rep and user was previously one
          // We'll check the current votes to see if this user won a previous election
          const { data: previousVoteWin } = await supabaseClient
            .from('vote_candidates')
            .select('id, vote_id, vote_count, department_votes!inner(department_space_id, ended_at)')
            .eq('user_id', user.id)
            .eq('department_votes.department_space_id', existingSpace.id)
            .not('department_votes.ended_at', 'is', null)
            .order('vote_count', { ascending: false })
            .limit(1);

          if (previousVoteWin && previousVoteWin.length > 0) {
            // Check if they were the winner of a completed election
            const voteId = previousVoteWin[0].vote_id;
            const { data: allCandidates } = await supabaseClient
              .from('vote_candidates')
              .select('user_id, vote_count')
              .eq('vote_id', voteId)
              .order('vote_count', { ascending: false });

            if (allCandidates && allCandidates.length > 0 && allCandidates[0].user_id === user.id) {
              // User won this election, check if there's currently no class_rep
              const { data: currentClassRep } = await supabaseClient
                .from('department_members')
                .select('id')
                .eq('department_space_id', existingSpace.id)
                .eq('role', 'class_rep')
                .limit(1);

              if (!currentClassRep || currentClassRep.length === 0) {
                roleToAssign = 'class_rep';
                console.log(`User ${user.id} was previous election winner with no current class_rep, restoring as class_rep`);
              }
            }
          }
        }

        // Add user as member with appropriate role
        const { error: joinError } = await supabaseClient
          .from('department_members')
          .insert({
            user_id: user.id,
            department_space_id: existingSpace.id,
            role: roleToAssign
          });

        if (joinError) {
          console.error('Error joining space:', joinError);
          return new Response(
            JSON.stringify({ error: 'Failed to join department space' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const roleMessage = roleToAssign === 'student' 
          ? 'Successfully joined department space'
          : `Successfully rejoined as ${roleToAssign === 'dept_admin' ? 'Admin' : 'Class Rep'}`;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: roleMessage,
            spaceId: existingSpace.id,
            isNew: false,
            role: roleToAssign
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Create new department space
        const { data: newSpace, error: createError } = await supabaseClient
          .from('department_spaces')
          .insert({
            school,
            department,
            level,
            display_tag: displayTag,
            code_hash: codeHash,
            created_by: user.id
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating space:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create department space' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Add creator as dept_admin
        const { error: memberError } = await supabaseClient
          .from('department_members')
          .insert({
            user_id: user.id,
            department_space_id: newSpace.id,
            role: 'dept_admin'
          });

        if (memberError) {
          console.error('Error adding creator as admin:', memberError);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Department space created! You are now the admin.',
            spaceId: newSpace.id,
            isNew: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'get_user_spaces') {
      const { data: memberships, error } = await supabaseClient
        .from('department_members')
        .select(`
          id,
          role,
          joined_at,
          department_spaces (
            id,
            school,
            department,
            level,
            display_tag
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user spaces:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch department spaces' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ spaces: memberships }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update_member_role') {
      const { memberId, newRole, targetUserId, spaceId } = body;
      
      if (!memberId || !newRole || !spaceId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if current user is class_rep or dept_admin
      const { data: currentMember } = await supabaseClient
        .from('department_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('department_space_id', spaceId)
        .single();

      if (!currentMember || !['class_rep', 'dept_admin'].includes(currentMember.role)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized to manage roles' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Class rep has higher authority than dept_admin
      // Class rep can demote/remove dept_admin
      const { data: targetMember } = await supabaseClient
        .from('department_members')
        .select('role')
        .eq('id', memberId)
        .single();

      if (!targetMember) {
        return new Response(
          JSON.stringify({ error: 'Member not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Dept admin cannot modify class_rep role
      if (currentMember.role === 'dept_admin' && targetMember.role === 'class_rep') {
        return new Response(
          JSON.stringify({ error: 'Admins cannot modify class representative roles' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Class rep can modify anyone's role
      const { error: updateError } = await supabaseClient
        .from('department_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (updateError) {
        console.error('Error updating role:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Role updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'promote_class_rep') {
      // Called after voting ends to promote winner to class_rep
      const { voteId, winnerId, spaceId } = body;
      
      // First, demote any existing class_rep to student
      await supabaseClient
        .from('department_members')
        .update({ role: 'student' })
        .eq('department_space_id', spaceId)
        .eq('role', 'class_rep');

      // Promote the winner
      const { error } = await supabaseClient
        .from('department_members')
        .update({ role: 'class_rep' })
        .eq('user_id', winnerId)
        .eq('department_space_id', spaceId);

      if (error) {
        console.error('Error promoting class rep:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to promote class representative' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Class representative promoted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'leave_department') {
      const { spaceId } = body;
      
      // Get current role before leaving (for logging)
      const { data: currentMember } = await supabaseClient
        .from('department_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('department_space_id', spaceId)
        .single();

      console.log(`User ${user.id} leaving department ${spaceId} with role: ${currentMember?.role}`);
      
      // Delete membership
      const { error } = await supabaseClient
        .from('department_members')
        .delete()
        .eq('user_id', user.id)
        .eq('department_space_id', spaceId);

      if (error) {
        console.error('Error leaving department:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to leave department' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Successfully left department' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'restart_voting') {
      const { spaceId, voteId } = body;
      
      // Check if user is class_rep or dept_admin
      const { data: currentMember } = await supabaseClient
        .from('department_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('department_space_id', spaceId)
        .single();

      if (!currentMember || !['class_rep', 'dept_admin'].includes(currentMember.role)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized to restart voting' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Demote current class_rep to student if voting is being restarted
      await supabaseClient
        .from('department_members')
        .update({ role: 'student' })
        .eq('department_space_id', spaceId)
        .eq('role', 'class_rep');

      // Reset all candidates vote counts
      await supabaseClient
        .from('vote_candidates')
        .update({ vote_count: 0 })
        .eq('vote_id', voteId);

      // Delete all user votes for this session
      await supabaseClient
        .from('user_votes')
        .delete()
        .eq('vote_id', voteId);

      // Reset voting status
      await supabaseClient
        .from('department_votes')
        .update({ 
          is_active: false, 
          started_at: null, 
          ended_at: null 
        })
        .eq('id', voteId);

      return new Response(
        JSON.stringify({ success: true, message: 'Voting has been reset and previous class rep demoted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Department space error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
