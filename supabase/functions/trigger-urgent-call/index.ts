import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Voice call service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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

    const { departmentSpaceId, message } = await req.json();

    if (!departmentSpaceId || !message) {
      return new Response(
        JSON.stringify({ error: 'Department space ID and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is class_rep or dept_admin
    const { data: memberData, error: memberError } = await supabaseClient
      .from('department_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('department_space_id', departmentSpaceId)
      .single();

    if (memberError || !memberData || !['class_rep', 'dept_admin'].includes(memberData.role)) {
      return new Response(
        JSON.stringify({ error: 'Only class representatives and admins can trigger urgent calls' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all department members with their phone numbers from profiles
    const { data: members, error: membersError } = await supabaseClient
      .from('department_members')
      .select('user_id')
      .eq('department_space_id', departmentSpaceId);

    if (membersError || !members || members.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No members found in department' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get phone numbers from auth.users (if available)
    const userIds = members.map(m => m.user_id);
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch member details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const membersWithPhones = users
      .filter(u => userIds.includes(u.id) && u.phone)
      .map(u => ({ id: u.id, phone: u.phone }));

    if (membersWithPhones.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No members have registered phone numbers. Announcement was posted instead.',
          callsSent: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make calls using Twilio
    const callResults = [];
    const twilioBaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    for (const member of membersWithPhones) {
      try {
        const twimlMessage = `<Response><Say voice="alice">Urgent notification from your class representative: ${message}</Say></Response>`;
        
        const response = await fetch(twilioBaseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: member.phone!,
            From: twilioPhoneNumber,
            Twiml: twimlMessage,
          }),
        });

        if (response.ok) {
          callResults.push({ userId: member.id, status: 'success' });
        } else {
          const errorText = await response.text();
          console.error(`Failed to call ${member.id}:`, errorText);
          callResults.push({ userId: member.id, status: 'failed' });
        }
      } catch (callError) {
        console.error(`Error calling ${member.id}:`, callError);
        callResults.push({ userId: member.id, status: 'error' });
      }
    }

    // Also create an urgent announcement
    await supabaseClient
      .from('department_announcements')
      .insert({
        department_space_id: departmentSpaceId,
        title: 'URGENT NOTIFICATION',
        content: message,
        is_urgent: true,
        created_by: user.id
      });

    const successCount = callResults.filter(r => r.status === 'success').length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Urgent calls triggered for ${successCount} members`,
        callsSent: successCount,
        totalMembers: membersWithPhones.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Trigger urgent call error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});