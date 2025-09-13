import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

interface SearchRequest {
  query: string;
  location?: string;
  userLat?: number;
  userLng?: number;
}

interface AISearchResult {
  name: string;
  address: string;
  description: string;
  estimatedRating: number;
  priceRange: "$" | "$$" | "$$$";
  cuisine: string[];
  confidence: number;
  source: "ai_discovered" | "web_search";
  aiGenerated: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, location, userLat, userLng } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    console.log(" AI search initiated for:", query);

    const searchPrompt = `
You are an AI assistant specialized in finding authentic Nigerian Amala restaurants and food spots. A user is searching for: "${query}"${
      location ? ` in ${location}` : ""
    }.

Your task is to suggest potential Amala spots that might exist based on the search query. Consider:
1. Common Nigerian restaurant naming patterns
2. Typical locations where Nigerian restaurants are found
3. Authentic Amala preparation and serving styles
4. Cultural and community aspects

Generate 3-5 realistic Amala restaurant suggestions that could potentially exist. For each suggestion, provide:
- A culturally appropriate restaurant name
- A realistic address (use common Nigerian restaurant location patterns)
- A detailed description focusing on Amala authenticity
- Estimated rating (3.5-5.0 range)
- Price range ($, $$, or $$$)
- Cuisine types (focus on Nigerian, Yoruba, Traditional, etc.)
- Confidence score (0-100) for how likely this type of place exists

Important guidelines:
- Use authentic Yoruba/Nigerian naming conventions
- Focus on traditional Amala preparation methods
- Include cultural elements and community aspects
- Make descriptions specific and authentic
- Vary the restaurant types (home-style, modern, traditional, etc.)

Respond in JSON format:
{
  "results": [
    {
      "name": "Restaurant Name",
      "address": "Full Address",
      "description": "Detailed description",
      "estimatedRating": 4.2,
      "priceRange": "$$",
      "cuisine": ["Nigerian", "Yoruba", "Traditional"],
      "confidence": 85,
      "source": "ai_discovered",
      "aiGenerated": true
    }
  ],
  "searchInsights": "Brief explanation of search approach",
  "totalResults": 3
}
`;

    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro-latest"),
      prompt: searchPrompt,
      temperature: 0.7,
    });

    let aiResults;
    try {
      aiResults = JSON.parse(text);
    } catch (parseError) {
      console.error(" AI response parsing error:", parseError);
      aiResults = {
        results: [
          {
            name: "AI-Suggested Amala Spot",
            address: "Location based on your search",
            description:
              "AI discovered potential Amala location matching your search criteria",
            estimatedRating: 4.0,
            priceRange: "$$",
            cuisine: ["Nigerian", "Traditional"],
            confidence: 60,
            source: "ai_discovered",
            aiGenerated: true,
          },
        ],
        searchInsights: "AI analysis completed with limited data",
        totalResults: 1,
      };
    }

    let webSearchResults = [];
    try {
      console.log(" Fetching web search results...");
      const webSearchResponse = await fetch(
        `${request.nextUrl.origin}/api/web-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `${query} Nigerian restaurant Amala`,
            location: location,
            type: "restaurants",
          }),
        }
      );

      if (webSearchResponse.ok) {
        const webData = await webSearchResponse.json();
        webSearchResults = webData.results || [];
        console.log(" Web search results integrated:", webSearchResults.length);
      }
    } catch (webError) {
      console.error(" Web search integration error:", webError);
    }

    if (userLat && userLng) {
      aiResults.results = aiResults.results.map(
        (result: AISearchResult, index: number) => ({
          ...result,
          id: `ai-${Date.now()}-${index}`,
          lat: userLat + (Math.random() - 0.5) * 0.02,
          lng: userLng + (Math.random() - 0.5) * 0.02,
          distance: `${(Math.random() * 2 + 0.5).toFixed(1)} mi`,
          verificationStatus: "unverified",
          reviewCount: Math.floor(Math.random() * 50) + 10,
          openNow: Math.random() > 0.3,
          submittedBy: "AI Discovery",
          submittedDate: new Date().toISOString().split("T")[0],
          imageUrl: "/nigerian-amala-restaurant.jpg",
        })
      );
    }

    console.log(
      " AI search completed, found",
      aiResults.totalResults,
      "suggestions"
    );

    return NextResponse.json({
      success: true,
      results: aiResults.results,
      insights: aiResults.searchInsights,
      totalResults: aiResults.totalResults,
      source: "ai_search",
      webResults: webSearchResults.slice(0, 3),
      webResultsCount: webSearchResults.length,
    });
  } catch (error) {
    console.error(" AI search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform AI search" },
      { status: 500 }
    );
  }
}
