import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Course {
  department: string
  level: string
  semester: string
  session: string
  course_code: string
  course_title: string
  units: number
  status: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin access
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'head_admin')) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const courses: Course[] = [
      // 100 Level First Semester
      { department: 'Computer Science', level: '100', semester: 'First', session: '2024-2025', course_code: 'GST 111', course_title: 'Communication in English', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'First', session: '2024-2025', course_code: 'MTH 101', course_title: 'Elementary Mathematics I', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'First', session: '2024-2025', course_code: 'PHY 101', course_title: 'General Physics I', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'First', session: '2024-2025', course_code: 'PHY 107', course_title: 'General Practical Physics I', units: 1, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'First', session: '2024-2025', course_code: 'STA 111', course_title: 'Descriptive Statistics', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'First', session: '2024-2025', course_code: 'COS 101', course_title: 'Introduction to Computing Sciences', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 103', course_title: 'Fundamental of Programming', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'First', session: '2024-2025', course_code: 'LAG-CYB 105', course_title: 'Introduction to Data Analysis with Statistical Packages', units: 2, status: 'Elective' },
      
      // 100 Level Second Semester
      { department: 'Computer Science', level: '100', semester: 'Second', session: '2024-2025', course_code: 'GST 112', course_title: 'Nigerian Peoples and Culture', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'Second', session: '2024-2025', course_code: 'MTH 102', course_title: 'Elementary Mathematics II', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'Second', session: '2024-2025', course_code: 'PHY 102', course_title: 'General Physics II', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'Second', session: '2024-2025', course_code: 'PHY 108', course_title: 'General Practical Physics II', units: 1, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'Second', session: '2024-2025', course_code: 'COS 102', course_title: 'Problem Solving', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'Second', session: '2024-2025', course_code: 'LAG-CSC 104', course_title: 'Introduction to Web Design and Development', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '100', semester: 'Second', session: '2024-2025', course_code: 'LAG-CYB 106', course_title: 'Basic Theory and Principles of Computer Security', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '100', semester: 'Second', session: '2024-2025', course_code: 'LAG-CSC 106', course_title: 'Introduction to Algorithms and Data Structures', units: 3, status: 'Compulsory' },
      
      // 200 Level First Semester
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'ENT 211', course_title: 'Entrepreneurship and Innovation', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'MTH 201', course_title: 'Mathematical Methods I', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'COS 201', course_title: 'Computer Programming I', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'CSC 203', course_title: 'Discrete Structures', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'IFT 211', course_title: 'Digital Logic Design', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'SEN 201', course_title: 'Introduction to Software Engineering', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 205', course_title: 'Introduction to Computational Methods', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'DTS 201', course_title: 'Introduction to Data Science', units: 2, status: 'Elective' },
      { department: 'Computer Science', level: '200', semester: 'First', session: '2024-2025', course_code: 'ICT 201', course_title: 'Introduction to Information and Communication technologies', units: 2, status: 'Elective' },
      
      // 200 Level Second Semester
      { department: 'Computer Science', level: '200', semester: 'Second', session: '2024-2025', course_code: 'GST 212', course_title: 'Philosophy, Logic and Human Existence', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'Second', session: '2024-2025', course_code: 'MTH 202', course_title: 'Elementary Differential equations', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'Second', session: '2024-2025', course_code: 'COS 202', course_title: 'Computer Programming II', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'Second', session: '2024-2025', course_code: 'CSC 224', course_title: 'Introduction to Information Processing', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'Second', session: '2024-2025', course_code: 'INS 202', course_title: 'Human-Computer Interface', units: 2, status: 'Elective' },
      { department: 'Computer Science', level: '200', semester: 'Second', session: '2024-2025', course_code: 'INS 204', course_title: 'Systems Analysis and design', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '200', semester: 'Second', session: '2024-2025', course_code: 'DTS 204', course_title: 'Statistical Computing Inference and Modelling', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '200', semester: 'Second', session: '2024-2025', course_code: 'LAG-CSC 210', course_title: 'Concurrent Programming', units: 2, status: 'Elective' },
      
      // 300 Level First Semester
      { department: 'Computer Science', level: '300', semester: 'First', session: '2024-2025', course_code: 'CSC 301', course_title: 'Data Structures', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'First', session: '2024-2025', course_code: 'CSC 309', course_title: 'Artificial Intelligence', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'First', session: '2024-2025', course_code: 'CYB 201', course_title: 'Introduction to Cybersecurity and Strategy', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'First', session: '2024-2025', course_code: 'ICT 305', course_title: 'Data Communication System & Network', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 315', course_title: 'Introduction to Machine and Assembly languages', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 331', course_title: 'Real-Time Systems and Programming', units: 3, status: 'Elective' },
      
      // 300 Level Second Semester
      { department: 'Computer Science', level: '300', semester: 'Second', session: '2024-2025', course_code: 'GST 312', course_title: 'Peace and Conflict Resolution', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'Second', session: '2024-2025', course_code: 'ENT 312', course_title: 'Venture Creation', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'Second', session: '2024-2025', course_code: 'CSC 308', course_title: 'Operating Systems', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'Second', session: '2024-2025', course_code: 'CSC 322', course_title: 'Computer Science Innovation and New Technologies', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'Second', session: '2024-2025', course_code: 'DTS 304', course_title: 'Data Management I', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'Second', session: '2024-2025', course_code: 'LAG-ISR 302', course_title: 'Information and Knowledge Management', units: 2, status: 'Elective' },
      { department: 'Computer Science', level: '300', semester: 'Second', session: '2024-2025', course_code: 'LAG-CSC 326', course_title: 'Introduction to Compiler Construction', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '300', semester: 'Second', session: '2024-2025', course_code: 'LAG-CSC 328', course_title: 'Introduction to Theory of Computing', units: 3, status: 'Compulsory' },
      
      // 400 Level First Semester
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'COS 409', course_title: 'Research Methodology and Technical Report Writing', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'CSC 401', course_title: 'Algorithms and Complexity Analysis', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'INS 401', course_title: 'Project Management', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 407', course_title: 'Entrepreneurship and Business development for Computer Scientists', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 403', course_title: 'Numerical Computation', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 405', course_title: 'Modelling And Simulation', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 415', course_title: 'Advanced Operating Systems', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 411', course_title: 'Advanced Data Structures', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '400', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC 413', course_title: 'System Performance Evaluation', units: 3, status: 'Elective' },
      
      // 400 Level Second Semester
      { department: 'Computer Science', level: '400', semester: 'Second', session: '2024-2025', course_code: 'CSC 498', course_title: 'SIWES', units: 6, status: 'Compulsory' },
      
      // 500 Level First Semester
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'CSC 597', course_title: 'Final Year Project I', units: 6, status: 'Compulsory' },
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC513', course_title: 'Advanced Compiler Construction', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC515', course_title: 'Advanced Statistical Processing', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC517', course_title: 'Machine Learning', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC519', course_title: 'Computer Graphics and Animation', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC523', course_title: 'Computer Networks', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC525', course_title: 'Computer Architecture', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC527', course_title: 'Optimization Techniques', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '500', semester: 'First', session: '2024-2025', course_code: 'LAG-CSC529', course_title: 'Introduction to Telemedicine and e-Health', units: 3, status: 'Elective' },
      
      // 500 Level Second Semester
      { department: 'Computer Science', level: '500', semester: 'Second', session: '2024-2025', course_code: 'CSC 598', course_title: 'Final Year Project II', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '500', semester: 'Second', session: '2024-2025', course_code: 'CSC 402', course_title: 'Ethics and Legal Issues in Computer Science', units: 2, status: 'Compulsory' },
      { department: 'Computer Science', level: '500', semester: 'Second', session: '2024-2025', course_code: 'LAG-CSC516', course_title: 'Further Numerical Computation', units: 3, status: 'Elective' },
      { department: 'Computer Science', level: '500', semester: 'Second', session: '2024-2025', course_code: 'LAG-CSC518', course_title: 'Financial Software Projects', units: 3, status: 'Compulsory' },
      { department: 'Computer Science', level: '500', semester: 'Second', session: '2024-2025', course_code: 'LAG-CSC522', course_title: 'Principle of Programming Language', units: 3, status: 'Compulsory' },
    ]

    // Insert courses with created_by field
    const coursesToInsert = courses.map(course => ({
      ...course,
      created_by: user.id
    }))

    const { data, error } = await supabaseClient
      .from('departmental_courses')
      .insert(coursesToInsert)
      .select()

    if (error) {
      console.error('Error inserting courses:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log admin action
    await supabaseClient
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'bulk_import',
        target_type: 'departmental_courses',
        details: {
          department: 'Computer Science',
          courses_count: courses.length,
          session: '2024-2025'
        }
      })

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully imported ${data.length} Computer Science courses`,
      courses: data 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
