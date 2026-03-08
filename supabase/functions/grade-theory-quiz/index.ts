import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { questions, answers, courseTitle, courseCode, courseId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build grading prompt
    const gradingPrompt = questions.map((q: string, i: number) => 
      `Question ${i + 1}: ${q}\nStudent's Answer: ${answers[i] || "(No answer provided)"}`
    ).join('\n\n');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a strict but fair university examiner grading theory questions for the course "${courseTitle}" (${courseCode}).

Grade each answer on a scale of 0-10. Be thorough and fair. Consider:
- Accuracy and correctness of the answer
- Completeness and depth of explanation  
- Use of appropriate technical terminology
- Clarity and organization of the response
- If the answer is empty or says "No answer", give 0 marks

For each question, provide a brief feedback explaining the grade.`
          },
          {
            role: "user",
            content: `Grade the following theory answers:\n\n${gradingPrompt}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_grades",
            description: "Submit grades for all theory questions",
            parameters: {
              type: "object",
              properties: {
                grades: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question_number: { type: "number" },
                      score: { type: "number", minimum: 0, maximum: 10 },
                      feedback: { type: "string" }
                    },
                    required: ["question_number", "score", "feedback"],
                    additionalProperties: false
                  }
                }
              },
              required: ["grades"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "submit_grades" } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.error("AI gateway error:", status, await response.text());
      throw new Error("AI grading failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let grades: Array<{ question_number: number; score: number; feedback: string }> = [];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      grades = parsed.grades || [];
    }

    // Save submissions to database
    const userName = user.email?.split('@')[0] || 'Anonymous';
    const submissions = questions.map((q: string, i: number) => {
      const grade = grades.find(g => g.question_number === i + 1);
      return {
        course_id: courseId,
        user_id: user.id,
        user_name: userName,
        question: q,
        answer: answers[i] || "",
        ai_score: grade?.score || 0,
        ai_feedback: grade?.feedback || "Unable to grade",
        max_score: 10,
        graded: true
      };
    });

    const { error: insertError } = await supabaseClient
      .from('theory_quiz_submissions')
      .insert(submissions);

    if (insertError) {
      console.error('Error saving submissions:', insertError);
    }

    // Calculate total score
    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const maxTotal = questions.length * 10;
    const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;

    // Update leaderboard if score > 0
    if (percentage > 0) {
      await supabaseClient.from('leaderboard').upsert({
        course_id: courseId,
        user_id: user.id,
        name: userName,
        score: percentage,
        avatar: user.email?.charAt(0).toUpperCase() || 'A'
      }, { onConflict: 'course_id,user_id' });
    }

    return new Response(JSON.stringify({
      grades,
      totalScore,
      maxTotal,
      percentage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Theory quiz grading error:", error);
    return new Response(JSON.stringify({ error: "Failed to grade quiz" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
