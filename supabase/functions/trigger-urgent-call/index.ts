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

    // Get all department members
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

    const userIds = members.map(m => m.user_id);

    // Get phone numbers from profiles table
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, phone_number, full_name, username')
      .in('id', userIds)
      .not('phone_number', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch member details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const membersWithPhones = profiles?.filter(p => p.phone_number && p.phone_number.trim() !== '') || [];

    if (membersWithPhones.length === 0) {
      // Still create announcement even if no calls can be made
      await supabaseClient
        .from('department_announcements')
        .insert({
          department_space_id: departmentSpaceId,
          title: 'URGENT NOTIFICATION',
          content: message,
          is_urgent: true,
          created_by: user.id
        });

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No members have registered phone numbers. Announcement was posted instead.',
          callsSent: 0,
          announcementCreated: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make calls using Twilio
    const callResults = [];
    const twilioBaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    console.log(`Starting Twilio calls for ${membersWithPhones.length} members`);
    console.log(`Twilio Account SID: ${twilioAccountSid?.substring(0, 10)}...`);
    console.log(`Twilio Phone Number: ${twilioPhoneNumber}`);

    for (const member of membersWithPhones) {
      try {
        // Format phone number to E.164
        let phoneNumber = member.phone_number!.trim();
        
        // Remove any spaces, dashes, or special characters
        phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneNumber.startsWith('+')) {
          // Assume Nigerian number if no country code
          if (phoneNumber.startsWith('0')) {
            phoneNumber = '+234' + phoneNumber.slice(1);
          } else if (phoneNumber.startsWith('234')) {
            phoneNumber = '+' + phoneNumber;
          } else {
            phoneNumber = '+234' + phoneNumber;
          }
        }

        console.log(`Calling ${member.full_name || member.username} at ${phoneNumber}`);

        const twimlMessage = `<Response><Say voice="alice">Urgent notification from your class representative: ${message}. I repeat: ${message}</Say></Response>`;
        
        const formData = new URLSearchParams();
        formData.append('To', phoneNumber);
        formData.append('From', twilioPhoneNumber);
        formData.append('Twiml', twimlMessage);

        const response = await fetch(twilioBaseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const responseText = await response.text();
        console.log(`Twilio response for ${phoneNumber}: ${response.status} - ${responseText}`);

        if (response.ok) {
          callResults.push({ userId: member.id, name: member.full_name || member.username, status: 'success', phone: phoneNumber });
          console.log(`Call initiated successfully for ${member.full_name || member.username}`);
        } else {
          console.error(`Failed to call ${member.id} at ${phoneNumber}:`, responseText);
          callResults.push({ userId: member.id, name: member.full_name || member.username, status: 'failed', error: responseText, phone: phoneNumber });
        }
      } catch (callError) {
        console.error(`Error calling ${member.id}:`, callError);
        callResults.push({ userId: member.id, name: member.full_name || member.username, status: 'error', error: String(callError) });
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
        message: `Urgent calls triggered for ${successCount} of ${membersWithPhones.length} members with phone numbers`,
        callsSent: successCount,
        totalMembers: members.length,
        membersWithPhones: membersWithPhones.length,
        callResults
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