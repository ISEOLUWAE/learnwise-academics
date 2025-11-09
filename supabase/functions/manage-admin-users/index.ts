import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email } = await req.json()

    if (action === 'find_user') {
      // Find user by email
      const { data: { users }, error: authError } = await supabaseClient.auth.admin.listUsers()
      
      if (authError) throw authError

      const targetUser = users.find((u: any) => u.email === email)

      if (!targetUser) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          }
        )
      }

      return new Response(
        JSON.stringify({ user: { id: targetUser.id, email: targetUser.email } }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'list_admins') {
      // Get admin roles
      const { data: adminRoles, error: rolesError } = await supabaseClient
        .from('user_roles')
        .select('*')
        .in('role', ['admin', 'head_admin'])
        .order('created_at', { ascending: false })

      if (rolesError) throw rolesError

      // Get all auth users
      const { data: { users }, error: authError } = await supabaseClient.auth.admin.listUsers()

      if (authError) throw authError

      // Merge admin roles with user details
      const adminsWithDetails = adminRoles?.map(admin => ({
        ...admin,
        email: users.find((u: any) => u.id === admin.user_id)?.email || 'N/A',
        username: users.find((u: any) => u.id === admin.user_id)?.user_metadata?.username || 'N/A'
      })) || []

      return new Response(
        JSON.stringify({ admins: adminsWithDetails }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  } catch (error) {
    console.error('Error in manage-admin-users:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
