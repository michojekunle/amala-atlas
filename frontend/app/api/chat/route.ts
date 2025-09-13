import { type NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  message: string
  context?: string
}

interface ChatResponse {
  response: string
  type: "text" | "location_submission" | "verification"
  locationData?: any
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatMessage = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
    }

    // Simple AI-like response logic (in a real app, you'd use an AI service)
    const response = generateChatResponse(message, context)

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error("Error processing chat message:", error)
    return NextResponse.json({ success: false, error: "Failed to process message" }, { status: 500 })
  }
}

function generateChatResponse(message: string, context?: string): ChatResponse {
  const lowerMessage = message.toLowerCase()

  // Location submission patterns
  if (lowerMessage.includes("submit") || lowerMessage.includes("add") || lowerMessage.includes("new location")) {
    return {
      response:
        "I'd be happy to help you submit a new Amala location! Please provide me with:\n\n**1. Restaurant/Spot Name**\n**2. Full Address**\n**3. Any additional details** (hours, specialties, etc.)\n\nYou can also use the search bar on the map to find and add the location directly.",
      type: "text",
    }
  }

  // Verification patterns
  if (lowerMessage.includes("verify") || lowerMessage.includes("confirm") || lowerMessage.includes("check")) {
    return {
      response:
        "Great! I can help you verify existing Amala locations. Are you looking to:\n\n**• Confirm a location exists and serves Amala**\n**• Update location details (hours, menu, etc.)**\n**• Report if a location has closed**\n\nWhich location would you like to verify?",
      type: "verification",
    }
  }

  // Location search patterns
  if (lowerMessage.includes("find") || lowerMessage.includes("search") || lowerMessage.includes("where")) {
    return {
      response:
        "I can help you find Amala locations! You can:\n\n**• Use the search bar** on the map to look for specific areas\n**• Browse the map markers** to see all verified locations\n**• Tell me a neighborhood or area** you're interested in\n\nWhat area are you looking for Amala spots in?",
      type: "text",
    }
  }

  // Help patterns
  if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
    return {
      response:
        "I'm here to help with Amala locations! Here's what I can do:\n\n**🗺️ Find Locations:** Search and browse verified Amala spots\n**➕ Submit New Spots:** Add locations you know about\n**✅ Verify Existing:** Confirm details of current locations\n**📍 Get Directions:** Help you navigate to spots\n\nWhat would you like to do?",
      type: "text",
    }
  }

  // Address/location parsing (simple pattern matching)
  const addressPattern = /(\d+.*(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|place|pl).*)/i
  const addressMatch = message.match(addressPattern)

  if (addressMatch) {
    return {
      response: `I found an address in your message: **${addressMatch[1]}**\n\nWould you like me to:\n**• Add this as a new Amala location**\n**• Search for existing locations nearby**\n**• Get more details about this spot**\n\nPlease let me know the restaurant name and any other details!`,
      type: "location_submission",
      locationData: {
        address: addressMatch[1],
        needsName: true,
      },
    }
  }

  // Default response
  return {
    response:
      "I understand you're interested in Amala locations! I can help you:\n\n**• Find existing Amala spots** on the map\n**• Submit new locations** you know about\n**• Verify information** about current spots\n\nCould you tell me more specifically what you'd like to do?",
    type: "text",
  }
}
