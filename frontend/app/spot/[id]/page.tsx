"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Navigation,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GoogleMap } from "@/components/google-map"

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  date: string
  helpful: number
  images?: string[]
}

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
  images: string[]
  priceRange: "$" | "$$" | "$$$"
  cuisine: string[]
  openNow: boolean
  hours: { [key: string]: string }
  phone?: string
  website?: string
  submittedBy: string
  submittedDate: string
  verificationVotes: { up: number; down: number }
  amenities: string[]
  reviews: Review[]
}

export default function SpotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const spotId = params.id as string

  const [spot, setSpot] = useState<AmalaSspot | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockSpot: AmalaSspot = {
      id: spotId,
      name: "Mama Kemi's Authentic Amala",
      address: "123 Lagos Street, Brooklyn, NY 11201",
      lat: 40.7589,
      lng: -73.9851,
      description:
        "Traditional Yoruba cuisine with the best amala in Brooklyn. Family recipes passed down for generations. We pride ourselves on using authentic ingredients imported directly from Nigeria, ensuring every bite transports you to the heart of Yoruba culture.",
      rating: 4.8,
      reviewCount: 127,
      distance: "0.2 mi",
      isVerified: true,
      verificationStatus: "verified",
      isFavorite: false,
      imageUrl: "/traditional-nigerian-amala-restaurant-interior.jpg",
      images: [
        "/traditional-nigerian-amala-restaurant-interior.jpg",
        "/modern-nigerian-restaurant-amala-dish.jpg",
        "/homestyle-nigerian-kitchen-amala-preparation.jpg",
        "/vibrant-nigerian-restaurant-cultural-atmosphere.jpg",
      ],
      priceRange: "$$",
      cuisine: ["Nigerian", "Yoruba", "Traditional"],
      openNow: true,
      hours: {
        Monday: "11:00 AM - 9:00 PM",
        Tuesday: "11:00 AM - 9:00 PM",
        Wednesday: "11:00 AM - 9:00 PM",
        Thursday: "11:00 AM - 9:00 PM",
        Friday: "11:00 AM - 10:00 PM",
        Saturday: "10:00 AM - 10:00 PM",
        Sunday: "12:00 PM - 8:00 PM",
      },
      phone: "+1 (718) 555-0123",
      website: "https://mamakemis.com",
      submittedBy: "Community",
      submittedDate: "2024-01-15",
      verificationVotes: { up: 89, down: 3 },
      amenities: ["Takeout", "Dine-in", "Parking", "WiFi", "Family-friendly"],
      reviews: [
        {
          id: "1",
          userId: "user1",
          userName: "Adunni O.",
          userAvatar: "/placeholder.svg?height=40&width=40",
          rating: 5,
          comment:
            "Absolutely authentic! The amala here tastes just like my grandmother's. The gbegiri and ewedu are perfectly seasoned. Highly recommend!",
          date: "2024-03-15",
          helpful: 12,
          images: ["/modern-nigerian-restaurant-amala-dish.jpg"],
        },
        {
          id: "2",
          userId: "user2",
          userName: "Michael R.",
          rating: 4,
          comment:
            "Great introduction to Nigerian cuisine. The staff was very helpful in explaining the dishes. Portions are generous and prices are fair.",
          date: "2024-03-10",
          helpful: 8,
        },
        {
          id: "3",
          userId: "user3",
          userName: "Folake A.",
          userAvatar: "/placeholder.svg?height=40&width=40",
          rating: 5,
          comment:
            "This place brings back memories of home. The atmosphere is warm and welcoming, and the food is consistently excellent.",
          date: "2024-03-05",
          helpful: 15,
        },
      ],
    }

    setSpot(mockSpot)
    setIsFavorite(mockSpot.isFavorite)
  }, [spotId])

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: spot?.name,
          text: spot?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body text-muted-foreground">Loading spot details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-subheading font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
                  {spot.name}
                </h1>
                <p className="text-caption hidden sm:block">{spot.cuisine.join(" • ")}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleFavorite} className="text-foreground hover:bg-accent">
                <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare} className="text-foreground hover:bg-accent">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={spot.images[selectedImageIndex] || "/placeholder.svg"}
                  alt={spot.name}
                  className="w-full h-64 sm:h-80 object-cover"
                />

                {/* Verification badge overlay */}
                <div className="absolute top-4 left-4">
                  {spot.verificationStatus === "verified" && (
                    <Badge className="verification-badge verified">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Community Verified
                    </Badge>
                  )}
                  {spot.verificationStatus === "pending" && (
                    <Badge className="verification-badge pending">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Verification Pending
                    </Badge>
                  )}
                </div>

                {/* Image counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {selectedImageIndex + 1} / {spot.images.length}
                </div>
              </div>

              {/* Image thumbnails */}
              {spot.images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {spot.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                          selectedImageIndex === index ? "border-primary" : "border-border",
                        )}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${spot.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Spot information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-heading font-bold text-card-foreground">{spot.name}</h2>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{spot.rating}</span>
                        <span className="text-muted-foreground">({spot.reviewCount} reviews)</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{spot.priceRange}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{spot.distance}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-body text-muted-foreground leading-relaxed">{spot.description}</p>

                {/* Cuisine tags */}
                <div className="flex flex-wrap gap-2">
                  {spot.cuisine.map((cuisine) => (
                    <Badge key={cuisine} variant="secondary">
                      {cuisine}
                    </Badge>
                  ))}
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-semibold text-card-foreground mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {spot.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-subheading font-bold text-card-foreground">Reviews ({spot.reviewCount})</h3>
                  <Button variant="outline" size="sm">
                    Write Review
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {spot.reviews.map((review, index) => (
                  <div key={review.id}>
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.userAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-card-foreground">{review.userName}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-caption text-muted-foreground">{review.date}</span>
                        </div>

                        <p className="text-body text-muted-foreground mb-3">{review.comment}</p>

                        {review.images && (
                          <div className="flex gap-2 mb-3">
                            {review.images.map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={image || "/placeholder.svg"}
                                alt="Review"
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-caption">
                          <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                          <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                            <Flag className="h-4 w-4" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {index < spot.reviews.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() =>
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`, "_blank")
                  }
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>

                {spot.phone && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href={`tel:${spot.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                )}

                {spot.website && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href={spot.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Contact & Hours */}
            <Card>
              <CardHeader>
                <h3 className="text-subheading font-bold text-card-foreground">Contact & Hours</h3>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-body text-card-foreground">{spot.address}</p>
                  </div>
                </div>

                {spot.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="text-body text-card-foreground">{spot.phone}</p>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={spot.openNow ? "default" : "secondary"} className="text-xs">
                        {spot.openNow ? "Open Now" : "Closed"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-caption">
                      {Object.entries(spot.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-muted-foreground">{day}</span>
                          <span className="text-card-foreground">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <h3 className="text-subheading font-bold text-card-foreground">Location</h3>
              </CardHeader>

              <CardContent className="p-0">
                <div className="h-64">
                  <GoogleMap
                    locations={[
                      {
                        id: spot.id,
                        name: spot.name,
                        address: spot.address,
                        lat: spot.lat,
                        lng: spot.lng,
                        source: spot.submittedBy,
                        rating: spot.rating,
                        isVerified: spot.isVerified,
                      },
                    ]}
                    selectedLocation={{
                      id: spot.id,
                      name: spot.name,
                      address: spot.address,
                      lat: spot.lat,
                      lng: spot.lng,
                      source: spot.submittedBy,
                      rating: spot.rating,
                      isVerified: spot.isVerified,
                    }}
                    className="h-full rounded-b-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Verification info */}
            <Card className="mt-12">
              <CardHeader>
                <h3 className="text-subheading font-bold text-card-foreground">Community Verification</h3>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-body text-card-foreground">Verification Status</span>
                  {spot.verificationStatus === "verified" && (
                    <Badge className="verification-badge verified">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-muted-foreground">Community Votes</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-body font-medium">{spot.verificationVotes.up}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-body font-medium">{spot.verificationVotes.down}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="text-caption text-muted-foreground">
                  <p>
                    Submitted by {spot.submittedBy} on {new Date(spot.submittedDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Verify
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
