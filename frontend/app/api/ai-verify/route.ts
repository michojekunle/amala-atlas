"use client"

import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
})

interface EnhancedVerificationRequest {
  name: string
  address: string
  description: string
  cuisine: string[]
  specialties?: string[]
  phone?: string
  website?: string
  email?: string
  priceRange?: string
  averagePrice?: number
  amenities?: string[]
  atmosphere?: string[]
  images?: string[]
  submitterInfo?: {
    name: string
    email: string
    relationship: string
    visitFrequency: string
  }
  socialMedia?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
}

interface VerificationResult {
  score: number
  status: "verified" | "uncertain" | "flagged"
  reasons: string[]
  confidence: number
  recommendations: string[]
  detailedAnalysis?: any
  riskFactors?: string[]
  authenticityIndicators?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: EnhancedVerificationRequest = await request.json()
    const {
      name,
      address,
      description,
      cuisine,
      specialties,
      phone,
      website,
      email,
      priceRange,
      averagePrice,
      amenities,
      atmosphere,
      images,
      submitterInfo,
      socialMedia,
    } = body

    if (!name || !address || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, address, description" },
        { status: 400 },
      )
    }

    const enhancedVerificationPrompt = `
You are an expert AI system specializing in verifying authentic Nigerian Amala restaurants and food establishments. Conduct a comprehensive analysis of this restaurant submission.

RESTAURANT SUBMISSION:
- Name: ${name}
- Address: ${address}
- Description: ${description}
- Cuisine Types: ${cuisine.join(", ")}
- Specialties: ${specialties?.join(", ") || "Not specified"}
- Phone: ${phone || "Not provided"}
- Website: ${website || "Not provided"}
- Email: ${email || "Not provided"}
- Price Range: ${priceRange || "Not specified"}
- Average Price: $${averagePrice || "Not specified"}
- Amenities: ${amenities?.join(", ") || "Not specified"}
- Atmosphere: ${atmosphere?.join(", ") || "Not specified"}
- Images: ${images?.length || 0} images provided
- Submitter: ${submitterInfo?.relationship || "Unknown"} who visits ${submitterInfo?.visitFrequency || "Unknown frequency"}
- Social Media: ${
      socialMedia
        ? Object.entries(socialMedia)
            .filter(([k, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ") || "None"
        : "None"
    }

COMPREHENSIVE ANALYSIS REQUIRED:

1. AUTHENTICITY VERIFICATION (Weight: 30%)
   - Nigerian/Yoruba food terminology usage
   - Traditional naming conventions (Mama, Iya, Baba, etc.)
   - Specific Amala preparation knowledge
   - Cultural authenticity indicators
   - Abula completeness (Amala + Ewedu + Gbegiri)

2. BUSINESS LEGITIMACY (Weight: 25%)
   - Address format and geographic consistency
   - Contact information completeness and validity
   - Price range consistency with offerings
   - Business name authenticity
   - Operational details coherence

3. CONTENT QUALITY (Weight: 20%)
   - Description depth and specificity
   - Personal experience indicators
   - Culinary knowledge demonstration
   - Absence of generic/template language
   - Detailed food preparation mentions

4. SUBMITTER CREDIBILITY (Weight: 15%)
   - Relationship to establishment
   - Visit frequency credibility
   - Contact information validity
   - Expertise level assessment

5. CONSISTENCY ANALYSIS (Weight: 10%)
   - Cuisine-specialty alignment
   - Price-atmosphere consistency
   - Amenities-atmosphere coherence
   - Cross-field validation

RED FLAGS TO IDENTIFY:
- Generic descriptions without specific details
- Inconsistent pricing information
- Suspicious address formats or placeholder text
- Overuse of superlatives without substance
- Missing core Nigerian food terminology
- Contradictory information across fields

AUTHENTICITY INDICATORS TO REWARD:
- Proper Yoruba/Nigerian terminology
- Specific cooking method descriptions
- Traditional family recipe mentions
- Cultural context understanding
- Complete Abula offering knowledge
- Regional Nigerian food awareness

Provide your analysis in this exact JSON format:
{
  "score": number (0-100),
  "status": "verified" | "uncertain" | "flagged",
  "reasons": ["primary reason 1", "primary reason 2", "primary reason 3"],
  "confidence": number (0-100),
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "authenticityIndicators": ["indicator 1", "indicator 2"],
  "riskFactors": ["risk 1", "risk 2"],
  "detailedAnalysis": {
    "authenticityScore": number,
    "businessLegitimacyScore": number,
    "contentQualityScore": number,
    "submitterCredibilityScore": number,
    "consistencyScore": number
  }
}

SCORING GUIDELINES:
- 80-100: Verified (High confidence, authentic Nigerian restaurant)
- 60-79: Uncertain (Needs manual review, some concerns)
- 0-59: Flagged (Significant issues, likely not authentic)
`

    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro-latest"),
      prompt: enhancedVerificationPrompt,
      temperature: 0.2, // Lower temperature for more consistent analysis
    })

    // Parse AI response with enhanced error handling
    let aiResult: VerificationResult
    try {
      const parsedResult = JSON.parse(text)
      aiResult = {
        score: parsedResult.score || 50,
        status: parsedResult.status || "uncertain",
        reasons: parsedResult.reasons || ["AI analysis completed"],
        confidence: parsedResult.confidence || 50,
        recommendations: parsedResult.recommendations || ["Manual review recommended"],
        authenticityIndicators: parsedResult.authenticityIndicators || [],
        riskFactors: parsedResult.riskFactors || [],
        detailedAnalysis: parsedResult.detailedAnalysis || {},
      }
    } catch (parseError) {
      console.error("Enhanced AI response parsing error:", parseError)
      console.log("Raw AI response:", text)

      // Fallback analysis with pattern matching
      aiResult = {
        score: 50,
        status: "uncertain",
        reasons: ["AI analysis completed but response format needs review"],
        confidence: 40,
        recommendations: ["Manual review recommended due to parsing issues"],
        authenticityIndicators: [],
        riskFactors: ["AI response parsing failed"],
        detailedAnalysis: {},
      }
    }

    const locationVerification = await enhancedLocationVerification(name, address, cuisine)

    const businessVerification = await enhancedBusinessVerification(name, phone, website, email)

    const finalScore = Math.round(
      aiResult.score * 0.6 + locationVerification.score * 0.25 + businessVerification.score * 0.15,
    )

    const finalStatus = finalScore >= 80 ? "verified" : finalScore >= 60 ? "uncertain" : "flagged"

    const finalConfidence = Math.round(
      aiResult.confidence * 0.5 + locationVerification.confidence * 0.3 + businessVerification.confidence * 0.2,
    )

    const result: VerificationResult = {
      score: finalScore,
      status: finalStatus,
      reasons: [
        ...aiResult.reasons.slice(0, 3),
        ...locationVerification.reasons.slice(0, 2),
        ...businessVerification.reasons.slice(0, 1),
      ].slice(0, 5),
      confidence: finalConfidence,
      recommendations: [
        ...aiResult.recommendations.slice(0, 2),
        ...locationVerification.recommendations.slice(0, 1),
        ...businessVerification.recommendations.slice(0, 1),
      ].slice(0, 3),
      authenticityIndicators: aiResult.authenticityIndicators || [],
      riskFactors: [
        ...(aiResult.riskFactors || []),
        ...(locationVerification.riskFactors || []),
        ...(businessVerification.riskFactors || []),
      ],
      detailedAnalysis: {
        aiAnalysis: aiResult.detailedAnalysis,
        locationCheck: locationVerification,
        businessCheck: businessVerification,
      },
    }

    console.log(
      `[Enhanced AI Verification] ${name}: Score ${finalScore}, Status ${finalStatus}, Confidence ${finalConfidence}%`,
    )

    return NextResponse.json({
      success: true,
      verification: result,
      timestamp: new Date().toISOString(),
      version: "enhanced-v2.0",
    })
  } catch (error) {
    console.error("Enhanced AI verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify location with enhanced AI system",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function enhancedLocationVerification(
  name: string,
  address: string,
  cuisine: string[],
): Promise<VerificationResult> {
  try {
    const locationPrompt = `
Analyze this Nigerian restaurant location for authenticity and legitimacy:

RESTAURANT: ${name}
ADDRESS: ${address}
CUISINE: ${cuisine.join(", ")}

VERIFICATION CRITERIA:
1. Address Format Validation
   - Proper US address structure (number, street, city, state, ZIP)
   - Realistic street names and geographic locations
   - No placeholder or template text

2. Geographic Cultural Context
   - Location in areas with known Nigerian/West African communities
   - Proximity to other ethnic restaurants or cultural centers
   - Realistic for Nigerian restaurant establishment

3. Business Name Analysis
   - Authentic Nigerian naming conventions
   - Cultural appropriateness
   - No test/placeholder terminology

4. Regional Consistency
   - Address matches claimed cuisine type
   - Geographic plausibility for Nigerian restaurant

Provide analysis in JSON format:
{
  "score": number (0-100),
  "confidence": number (0-100),
  "reasons": ["reason1", "reason2"],
  "recommendations": ["recommendation1"],
  "riskFactors": ["risk1"],
  "geographicContext": "analysis of location appropriateness"
}
`

    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro-latest"),
      prompt: locationPrompt,
      temperature: 0.1,
    })

    const result = JSON.parse(text)
    return {
      score: result.score || 60,
      status: result.score >= 70 ? "verified" : result.score >= 50 ? "uncertain" : "flagged",
      reasons: result.reasons || ["Location analysis completed"],
      confidence: result.confidence || 60,
      recommendations: result.recommendations || [],
      riskFactors: result.riskFactors || [],
    }
  } catch (error) {
    console.error("Enhanced location verification error:", error)
    return {
      score: 50,
      status: "uncertain",
      reasons: ["Location verification unavailable"],
      confidence: 30,
      recommendations: ["Manual location verification recommended"],
      riskFactors: ["Automated location check failed"],
    }
  }
}

async function enhancedBusinessVerification(
  name: string,
  phone?: string,
  website?: string,
  email?: string,
): Promise<VerificationResult> {
  try {
    const businessPrompt = `
Verify business legitimacy for this Nigerian restaurant:

BUSINESS NAME: ${name}
PHONE: ${phone || "Not provided"}
WEBSITE: ${website || "Not provided"}
EMAIL: ${email || "Not provided"}

ANALYSIS REQUIRED:
1. Contact Information Completeness
2. Format Validation (phone, email, website)
3. Business Name Authenticity
4. Professional Presentation Level

Provide JSON analysis:
{
  "score": number (0-100),
  "confidence": number (0-100),
  "reasons": ["reason1", "reason2"],
  "recommendations": ["recommendation1"],
  "riskFactors": ["risk1"],
  "contactCompleteness": number
}
`

    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro-latest"),
      prompt: businessPrompt,
      temperature: 0.1,
    })

    const result = JSON.parse(text)
    return {
      score: result.score || 60,
      status: result.score >= 70 ? "verified" : result.score >= 50 ? "uncertain" : "flagged",
      reasons: result.reasons || ["Business verification completed"],
      confidence: result.confidence || 60,
      recommendations: result.recommendations || [],
      riskFactors: result.riskFactors || [],
    }
  } catch (error) {
    console.error("Enhanced business verification error:", error)
    return {
      score: 50,
      status: "uncertain",
      reasons: ["Business verification unavailable"],
      confidence: 30,
      recommendations: ["Manual business verification recommended"],
      riskFactors: ["Automated business check failed"],
    }
  }
}
