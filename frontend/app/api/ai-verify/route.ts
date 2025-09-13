import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

interface VerificationRequest {
  name: string
  address: string
  description: string
  cuisine: string[]
  phone?: string
  website?: string
  images?: string[]
}

interface VerificationResult {
  score: number
  status: "verified" | "uncertain" | "flagged"
  reasons: string[]
  confidence: number
  recommendations: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json()
    const { name, address, description, cuisine, phone, website, images } = body

    if (!name || !address || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, address, description" },
        { status: 400 },
      )
    }

    const verificationPrompt = `
You are an AI expert in verifying authentic Nigerian Amala restaurants and food spots. Analyze the following restaurant submission and provide a detailed verification assessment.

Restaurant Details:
- Name: ${name}
- Address: ${address}
- Description: ${description}
- Cuisine Types: ${cuisine.join(", ")}
- Phone: ${phone || "Not provided"}
- Website: ${website || "Not provided"}
- Images: ${images?.length || 0} images provided

Please analyze this submission for authenticity and provide:
1. A confidence score (0-100) for authenticity
2. Key verification points (positive and negative)
3. Specific recommendations for improvement
4. Overall assessment

Focus on:
- Authenticity indicators (traditional Nigerian food terms, proper Yoruba references)
- Location legitimacy (realistic address format, proper business details)
- Description quality (specific details about Amala preparation, traditional aspects)
- Contact information validity
- Potential red flags (generic descriptions, suspicious patterns)

Respond in JSON format:
{
  "score": number (0-100),
  "status": "verified" | "uncertain" | "flagged",
  "reasons": ["reason1", "reason2", ...],
  "confidence": number (0-100),
  "recommendations": ["recommendation1", "recommendation2", ...]
}
`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: verificationPrompt,
      temperature: 0.3,
    })

    // Parse AI response
    let aiResult: VerificationResult
    try {
      aiResult = JSON.parse(text)
    } catch (parseError) {
      // Fallback parsing if JSON is malformed
      console.error("AI response parsing error:", parseError)
      aiResult = {
        score: 50,
        status: "uncertain",
        reasons: ["AI analysis completed but response format needs review"],
        confidence: 50,
        recommendations: ["Manual review recommended"],
      }
    }

    const locationVerification = await verifyLocationOnline(name, address)

    const finalScore = Math.round((aiResult.score + locationVerification.score) / 2)
    const finalStatus = finalScore >= 70 ? "verified" : finalScore >= 50 ? "uncertain" : "flagged"

    const result: VerificationResult = {
      score: finalScore,
      status: finalStatus,
      reasons: [...aiResult.reasons, ...locationVerification.reasons],
      confidence: Math.round((aiResult.confidence + locationVerification.confidence) / 2),
      recommendations: [...aiResult.recommendations, ...locationVerification.recommendations],
    }

    return NextResponse.json({
      success: true,
      verification: result,
      aiAnalysis: aiResult,
      locationCheck: locationVerification,
    })
  } catch (error) {
    console.error("AI verification error:", error)
    return NextResponse.json({ success: false, error: "Failed to verify location with AI" }, { status: 500 })
  }
}

async function verifyLocationOnline(name: string, address: string): Promise<VerificationResult> {
  try {
    // Use Groq to analyze if the location details seem realistic
    const locationPrompt = `
Analyze this restaurant location for legitimacy:
- Name: ${name}
- Address: ${address}

Check for:
1. Address format validity (proper street names, city, state format)
2. Business name authenticity (does it sound like a real Nigerian restaurant?)
3. Geographic consistency (does the location make sense for a Nigerian restaurant?)

Provide a score (0-100) and brief analysis in JSON format:
{
  "score": number,
  "confidence": number,
  "reasons": ["reason1", "reason2"],
  "recommendations": ["recommendation1"]
}
`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: locationPrompt,
      temperature: 0.2,
    })

    const result = JSON.parse(text)
    return {
      score: result.score || 60,
      status: result.score >= 70 ? "verified" : result.score >= 50 ? "uncertain" : "flagged",
      reasons: result.reasons || ["Location analysis completed"],
      confidence: result.confidence || 60,
      recommendations: result.recommendations || [],
    }
  } catch (error) {
    console.error("Location verification error:", error)
    return {
      score: 50,
      status: "uncertain",
      reasons: ["Unable to verify location online"],
      confidence: 30,
      recommendations: ["Manual verification recommended"],
    }
  }
}
