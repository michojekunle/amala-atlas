import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

interface AssistantRequest {
  message: string;
  context: string;
  conversationHistory?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AssistantRequest = await request.json();
    const { message, context, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    console.log(" AI Assistant processing:", message);

    // Build conversation context
    const historyContext = conversationHistory
      .slice(-3)
      .map((msg: any) => `${msg.sender}: ${msg.content}`)
      .join("\n");

    const assistantPrompt = `
You are an expert AI assistant specializing in Nigerian Amala restaurants and authentic Yoruba cuisine. You help users discover, learn about, and enjoy authentic Amala experiences.

Your expertise includes:
- Authentic Amala preparation methods and ingredients
- Nigerian restaurant culture and dining etiquette  
- Regional variations and traditional accompaniments
- Quality indicators for authentic establishments
- Cultural significance and history of Amala

Current conversation context:
${historyContext}

User's current message: "${message}"

Guidelines for responses:
1. Be knowledgeable, friendly, and culturally respectful
2. Provide specific, actionable advice when possible
3. If asked about locations, suggest realistic search strategies
4. Share cultural insights and cooking tips when relevant
5. Encourage community participation and authentic experiences
6. Keep responses conversational but informative
7. Use Nigerian/Yoruba terms appropriately with explanations

Response types you can provide:
- "text" for general conversation and information
- "location_suggestion" for restaurant recommendations (include data object with suggestions)
- "search_results" for search-related responses
- "recommendation" for personalized suggestions

If providing location suggestions, include a data object with realistic suggestions based on common Nigerian restaurant patterns.

Respond in JSON format:
{
  "response": "Your helpful response here",
  "type": "text|location_suggestion|search_results|recommendation",
  "data": {optional data object for special response types}
}
`;

    const { text } = await generateText({
      model: googleAI("gemini-2.5-pro"),
      prompt: assistantPrompt,
      temperature: 0.7,
    });

    let aiResponse;
    try {
      console.log("AI TEXTTTTTTTTTTTTT", text);
      aiResponse = JSON.parse(text);
    } catch (parseError) {
      console.error(" AI response parsing error:", parseError);
      // Fallback response
      aiResponse = {
        response:
          "I'm here to help you discover amazing Amala spots! What would you like to know about authentic Nigerian cuisine?",
        type: "text",
      };
    }

    console.log(" AI Assistant response generated:", aiResponse.type);

    return NextResponse.json({
      success: true,
      response: aiResponse.response,
      type: aiResponse.type,
      data: aiResponse.data,
    });
  } catch (error) {
    console.error(" AI Assistant error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
