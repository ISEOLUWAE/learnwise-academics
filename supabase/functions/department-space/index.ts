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

    const { action, school, department, level, code } = await req.json();

    if (action === 'create_or_join') {
      // Validate inputs
      if (!school || !department || !level || !code) {
        return new Response(
          JSON.stringify({ error: 'All fields are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Rate limiting check - max 5 attempts per minute
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      // Note: In production, implement proper rate limiting with Redis or similar

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

        // Check if user is already a member
        const { data: existingMember } = await supabaseClient
          .from('department_members')
          .select('id')
          .eq('user_id', user.id)
          .eq('department_space_id', existingSpace.id)
          .single();

        if (existingMember) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'You are already a member of this department space',
              spaceId: existingSpace.id,
              isNew: false
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Add user as member
        const { error: joinError } = await supabaseClient
          .from('department_members')
          .insert({
            user_id: user.id,
            department_space_id: existingSpace.id,
            role: 'student'
          });

        if (joinError) {
          console.error('Error joining space:', joinError);
          return new Response(
            JSON.stringify({ error: 'Failed to join department space' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Successfully joined department space',
            spaceId: existingSpace.id,
            isNew: false
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