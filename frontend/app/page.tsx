"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Moon,
  Sun,
  Search,
  MapPin,
  Star,
  Navigation,
  Filter,
  Heart,
  Plus,
  CheckCircle,
  Clock,
  Users,
  Utensils,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"
import { VoiceCommandButton } from "@/components/voice-command-button"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AmalaSspot {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  description: string
  rating: number
  reviewCount: number
  distance: string
  isVerified: boolean
  verificationStatus: "verified" | "pending" | "unverified"
  isFavorite: boolean
  imageUrl: string
  priceRange: "$" | "$$" | "$$$"
  cuisine: string[]
  openNow: boolean
  submittedBy: string
  submittedDate: string
}

export default function AmalaSpotsList() {
  const router = useRouter()
  const [spots, setSpots] = useState<AmalaSspot[]>([
    {
      id: "1",
      name: "Mama Kemi's Authentic Amala",
      address: "123 Lagos Street, Brooklyn, NY 11201",
      lat: 40.7589,
      lng: -73.9851,
      description:
        "Traditional Yoruba cuisine with the best amala in Brooklyn. Family recipes passed down for generations.",
      rating: 4.8,
      reviewCount: 127,
      distance: "0.2 mi",
      isVerified: true,
      verificationStatus: "verified",
      isFavorite: false,
      imageUrl: "/traditional-nigerian-amala-restaurant-interior.jpg",
      priceRange: "$$",
      cuisine: ["Nigerian", "Yoruba", "Traditional"],
      openNow: true,
      submittedBy: "Community",
      submittedDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Abula Palace",
      address: "456 Nostrand Ave, Brooklyn, NY 11216",
      lat: 40.7505,
      lng: -73.9934,
      description: "Modern take on classic amala with gbegiri and ewedu. Clean, contemporary dining experience.",
      rating: 4.6,
      reviewCount: 89,
      distance: "0.5 mi",
      isVerified: true,
      verificationStatus: "verified",
      isFavorite: true,
      imageUrl: "/modern-nigerian-restaurant-amala-dish.jpg",
      priceRange: "$$$",
      cuisine: ["Nigerian", "Modern", "Fusion"],
      openNow: true,
      submittedBy: "Restaurant Partner",
      submittedDate: "2024-02-01",
    },
    {
      id: "3",
      name: "Iya Agba Kitchen",
      address: "789 Fulton Street, Brooklyn, NY 11238",
      lat: 40.7831,
      lng: -73.9712,
      description: "Home-style cooking with generous portions. Known for their perfectly smooth amala texture.",
      rating: 4.3,
      reviewCount: 45,
      distance: "1.1 mi",
      isVerified: false,
      verificationStatus: "pending",
      isFavorite: false,
      imageUrl: "/homestyle-nigerian-kitchen-amala-preparation.jpg",
      priceRange: "$",
      cuisine: ["Nigerian", "Home-style", "Comfort Food"],
      openNow: false,
      submittedBy: "User: @foodie_bk",
      submittedDate: "2024-03-10",
    },
    {
      id: "4",
      name: "Yoruba Delights",
      address: "321 Atlantic Ave, Brooklyn, NY 11201",
      lat: 40.6892,
      lng: -73.9442,
      description: "Authentic Yoruba dishes in a vibrant atmosphere. Weekend live music and cultural events.",
      rating: 4.5,
      reviewCount: 203,
      distance: "1.8 mi",
      isVerified: true,
      verificationStatus: "verified",
      isFavorite: false,
      imageUrl: "/vibrant-nigerian-restaurant-cultural-atmosphere.jpg",
      priceRange: "$$",
      cuisine: ["Nigerian", "Yoruba", "Cultural"],
      openNow: true,
      submittedBy: "Community",
      submittedDate: "2023-11-20",
    },
  ])

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "newest">("distance")
  const [isAISearching, setIsAISearching] = useState(false)
  const [aiResults, setAiResults] = useState<AmalaSspot[]>([])
  const [showAIResults, setShowAIResults] = useState(false)
  const [aiSearchInsights, setAiSearchInsights] = useState("")

  const voiceCommands = [
    {
      command: "search for",
      pattern: /search for (.+)/i,
      action: () => {},
      description: "Search for Amala spots",
    },
    {
      command: "find nearby",
      pattern: /find nearby|nearby spots|spots near me/i,
      action: () => {
        setSearchQuery("nearby Amala spots")
        performAISearch()
      },
      description: "Find nearby Amala spots",
    },
    {
      command: "add spot",
      pattern: /add spot|submit location|new restaurant/i,
      action: () => {
        router.push("/submit")
      },
      description: "Add a new Amala spot",
    },
    {
      command: "sort by rating",
      pattern: /sort by rating|best rated|highest rated/i,
      action: () => {
        setSortBy("rating")
      },
      description: "Sort by highest rating",
    },
    {
      command: "sort by distance",
      pattern: /sort by distance|closest|nearest/i,
      action: () => {
        setSortBy("distance")
      },
      description: "Sort by distance",
    },
    {
      command: "open AI assistant",
      pattern: /ai assistant|assistant|help me find/i,
      action: () => {
        router.push("/ai-assistant")
      },
      description: "Open AI assistant",
    },
    {
      command: "toggle dark mode",
      pattern: /dark mode|light mode|toggle theme/i,
      action: () => {
        setIsDarkMode(!isDarkMode)
      },
      description: "Toggle dark/light mode",
    },
  ]

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const toggleFavorite = (spotId: string) => {
    setSpots((prev) => prev.map((spot) => (spot.id === spotId ? { ...spot, isFavorite: !spot.isFavorite } : spot)))
  }

  const filteredSpots = spots.filter(
    (spot) =>
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const performAISearch = async () => {
    if (!searchQuery.trim() || isAISearching) return

    setIsAISearching(true)
    console.log("[v0] Starting AI search for:", searchQuery)

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          location: "Brooklyn, NY",
          userLat: 40.7589,
          userLng: -73.9851,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] AI search completed:", data)

        setAiResults(data.results || [])
        setAiSearchInsights(data.insights || "")
        setShowAIResults(true)
      } else {
        throw new Error("AI search failed")
      }
    } catch (error) {
      console.error("[v0] AI search error:", error)
      setAiResults([])
      setAiSearchInsights("AI search temporarily unavailable")
    } finally {
      setIsAISearching(false)
    }
  }

  const allResults = showAIResults ? [...filteredSpots, ...aiResults] : filteredSpots

  const sortedSpots = [...allResults].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "newest":
        return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
      default:
        return Number.parseFloat(a.distance) - Number.parseFloat(b.distance)
    }
  })

  useEffect(() => {
    if (searchQuery.trim() && filteredSpots.length === 0 && !isAISearching && !showAIResults) {
      const timer = setTimeout(() => {
        performAISearch()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [searchQuery, filteredSpots.length])

  const handleVoiceTranscript = (transcript: string) => {
    const searchMatch = transcript.toLowerCase().match(/search for (.+)/i)
    if (searchMatch) {
      setSearchQuery(searchMatch[1])
      if (showAIResults) {
        setShowAIResults(false)
        setAiResults([])
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PWAInstallPrompt />
      <OfflineIndicator />

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Utensils className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-heading font-bold text-foreground">Amala Spots</h1>
                <p className="text-caption hidden sm:block">Discover authentic Amala experiences</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link href="/web-search">
                <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
                  <Globe className="h-4 w-4 mr-2" />
                  Web Search
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                  <Search className="h-4 w-4 mr-2" />
                  AI Search
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-foreground hover:bg-accent"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search spots, cuisine, or location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (showAIResults) {
                    setShowAIResults(false)
                    setAiResults([])
                  }
                }}
                className="pl-10 pr-12 h-11 bg-background border-border focus:ring-primary text-body"
              />
              {isAISearching && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                </div>
              )}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <VoiceCommandButton
                  commands={voiceCommands}
                  onTranscript={handleVoiceTranscript}
                  onCommand={(command) => {
                    console.log("[v0] Voice command executed:", command)
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)} className="h-11 px-4">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Link href="/submit">
                <Button className="h-11 px-4 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Spot
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <span className="text-caption">Sort by:</span>
            <div className="flex gap-2">
              {[
                { key: "distance", label: "Distance" },
                { key: "rating", label: "Rating" },
                { key: "newest", label: "Newest" },
              ].map((option) => (
                <Button
                  key={option.key}
                  variant={sortBy === option.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(option.key as any)}
                  className="h-8 text-sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-subheading text-foreground">
              {sortedSpots.length} Amala Spots Found
              {showAIResults && (
                <Badge variant="secondary" className="ml-2">
                  Including AI Suggestions
                </Badge>
              )}
            </h2>
            <p className="text-caption mt-1">
              Showing results {searchQuery ? `for "${searchQuery}"` : "in your area"}
              {aiSearchInsights && (
                <span className="block text-muted-foreground mt-1">AI Insights: {aiSearchInsights}</span>
              )}
            </p>
          </div>
        </div>

        {isAISearching && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              <div>
                <h3 className="font-semibold text-primary">AI Search in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Discovering potential Amala spots that match your search...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSpots.map((spot) => (
            <Card
              key={spot.id}
              className={cn(
                "group hover:shadow-lg transition-all duration-200 border-border overflow-hidden animate-fade-in",
                spot.submittedBy === "AI Discovery" && "border-primary/30 bg-primary/5",
              )}
            >
              <div className="relative">
                <img
                  src={spot.imageUrl || "/placeholder.svg"}
                  alt={spot.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90 h-8 w-8"
                  onClick={() => toggleFavorite(spot.id)}
                >
                  <Heart
                    className={cn("h-4 w-4", spot.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")}
                  />
                </Button>

                <div className="absolute top-3 left-3">
                  {spot.submittedBy === "AI Discovery" && (
                    <Badge className="bg-primary/90 text-primary-foreground mb-1">
                      <Search className="h-3 w-3 mr-1" />
                      AI Discovered
                    </Badge>
                  )}
                  {spot.verificationStatus === "verified" && (
                    <Badge className="verification-badge verified">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {spot.verificationStatus === "pending" && (
                    <Badge className="verification-badge pending">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-3 left-3">
                  <Badge variant={spot.openNow ? "default" : "secondary"} className="text-xs">
                    {spot.openNow ? "Open Now" : "Closed"}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-subheading font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {spot.name}
                    </h3>
                    <p className="text-caption mt-1">{spot.address}</p>
                  </div>
                  <div className="text-right ml-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">{spot.rating}</span>
                    </div>
                    <p className="text-caption">({spot.reviewCount})</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-body text-muted-foreground mb-4 line-clamp-2">{spot.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {spot.cuisine.slice(0, 3).map((cuisine) => (
                    <Badge key={cuisine} variant="secondary" className="text-xs">
                      {cuisine}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-caption">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {spot.distance}
                    </span>
                    <span>{spot.priceRange}</span>
                  </div>

                  <Link href={`/spot/${spot.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Navigation className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-caption flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Added by {spot.submittedBy}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedSpots.length === 0 && !isAISearching && (
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-subheading text-foreground mb-2">No spots found</h3>
            <p className="text-body text-muted-foreground mb-6">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term or let AI help discover new spots.`
                : "No Amala spots in this area yet."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/submit">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add a spot
                </Button>
              </Link>
              {searchQuery && (
                <Button variant="outline" onClick={performAISearch} disabled={isAISearching}>
                  <Search className="h-4 w-4 mr-2" />
                  AI Search
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
