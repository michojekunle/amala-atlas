import { type NextRequest, NextResponse } from "next/server"

interface Location {
  name: string
  address: string
  lat: number
  lng: number
  source: string
}

// Sample locations data (in a real app, this would come from a database)
const sampleLocations: Location[] = [
  {
    name: "Amala Spot Downtown",
    address: "123 Main St, New York, NY 10001",
    lat: 40.7589,
    lng: -73.9851,
    source: "Community Verified",
  },
  {
    name: "Traditional Amala House",
    address: "456 Broadway, New York, NY 10013",
    lat: 40.7505,
    lng: -73.9934,
    source: "Restaurant Partner",
  },
  {
    name: "Mama's Amala Kitchen",
    address: "789 Amsterdam Ave, New York, NY 10025",
    lat: 40.7831,
    lng: -73.9712,
    source: "User Submitted",
  },
  {
    name: "Authentic Amala Corner",
    address: "321 Lenox Ave, New York, NY 10027",
    lat: 40.8075,
    lng: -73.9533,
    source: "Community Verified",
  },
  {
    name: "Yoruba Kitchen",
    address: "654 Malcolm X Blvd, New York, NY 10037",
    lat: 40.8176,
    lng: -73.9482,
    source: "Restaurant Partner",
  },
]

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Connect to your database
    // 2. Query for locations based on filters (if any)
    // 3. Return the results

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius")

    let filteredLocations = sampleLocations

    // Filter by search query if provided
    if (query) {
      filteredLocations = filteredLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.address.toLowerCase().includes(query.toLowerCase()),
      )
    }

    // Filter by geographic proximity if coordinates provided
    if (lat && lng && radius) {
      const centerLat = Number.parseFloat(lat)
      const centerLng = Number.parseFloat(lng)
      const radiusKm = Number.parseFloat(radius)

      filteredLocations = filteredLocations.filter((location) => {
        const distance = calculateDistance(centerLat, centerLng, location.lat, location.lng)
        return distance <= radiusKm
      })
    }

    return NextResponse.json({
      success: true,
      locations: filteredLocations,
      count: filteredLocations.length,
    })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch locations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, lat, lng, source = "User Submitted" } = body

    // Validate required fields
    if (!name || !address || !lat || !lng) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Validate the data more thoroughly
    // 2. Check for duplicates
    // 3. Save to database
    // 4. Return the created location with an ID

    const newLocation: Location = {
      name,
      address,
      lat: Number.parseFloat(lat),
      lng: Number.parseFloat(lng),
      source,
    }

    // Simulate saving to database
    console.log("New location submitted:", newLocation)

    return NextResponse.json({
      success: true,
      location: newLocation,
      message: "Location submitted successfully",
    })
  } catch (error) {
    console.error("Error creating location:", error)
    return NextResponse.json({ success: false, error: "Failed to create location" }, { status: 500 })
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
