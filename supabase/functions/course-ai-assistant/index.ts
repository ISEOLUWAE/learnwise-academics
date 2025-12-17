import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, courseContext, action, fileName, fileUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on context
    let systemPrompt = `You are an AI Assistant helping students with course materials and department files.
Your role is to help students understand content, explain concepts, and prepare for exams.

Guidelines:
- Explain concepts in simple, step-by-step terms
- When analyzing uploaded files, carefully read and analyze the content provided
- Answer questions based ONLY on the file content provided
- If the user uploads material (PDF, documents, images), analyze it and answer questions based on its content
- Be encouraging and supportive
- Use examples and analogies to clarify complex topics
- When generating quizzes, create questions strictly based on provided material
- Never hallucinate or make up information not in the provided content
- Format responses with clear headings and bullet points when helpful
- Always reference the file you're analyzing`;

    if (courseContext?.title) {
      systemPrompt += `

CONTEXT: You are assisting with a course titled "${courseContext.title}"${courseContext.code ? ` (${courseContext.code})` : ''}.`;
    }

    if (fileName) {
      systemPrompt += `

IMPORTANT: The user has uploaded a file named "${fileName}". The file content has been provided below. Use this content to answer all questions accurately. If the user asks about something not in the file, let them know.`;
    }

    if (action === 'quiz') {
      systemPrompt += `

QUIZ GENERATION MODE:
Generate a quiz with 5-10 multiple choice questions based ONLY on the material provided in the file.
Format each question as:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Answer: [Correct letter]
Explanation: [Why this is correct]

Make questions progressively harder. Focus on key concepts from the file.`;
    }

    if (action === 'explain') {
      systemPrompt += `

EXPLANATION MODE:
Provide a detailed, beginner-friendly explanation based on the file content.
- Start with the basics
- Build up to more complex aspects
- Use real-world analogies
- Include examples where helpful
- Reference specific parts of the file`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Course AI assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
