"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, MapPin, Navigation, CheckCircle, Clock, Heart, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

interface LocationCardProps {
  spot: AmalaSspot
  onToggleFavorite: (spotId: string) => void
  onViewOnMap: (spot: AmalaSspot) => void
  showMapPreview?: boolean
}

export function LocationCard({ spot, onToggleFavorite, onViewOnMap, showMapPreview = true }: LocationCardProps) {
  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-200 border-border overflow-hidden animate-fade-in location-card",
        spot.submittedBy === "AI Discovery" && "border-primary/30 bg-primary/5",
      )}
    >
      {showMapPreview ? (
        <div className="relative h-48 bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-card-foreground">{spot.name}</p>
              <p className="text-xs text-muted-foreground">{spot.address}</p>
              <Button size="sm" variant="outline" className="mt-2 bg-transparent" onClick={() => onViewOnMap(spot)}>
                View on Map
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90 h-8 w-8"
            onClick={() => onToggleFavorite(spot.id)}
          >
            <Heart className={cn("h-4 w-4", spot.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          </Button>

          <div className="absolute top-3 left-3">
            {spot.submittedBy === "AI Discovery" && (
              <Badge className="bg-primary/90 text-primary-foreground mb-1">
                <MapPin className="h-3 w-3 mr-1" />
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
      ) : (
        <div className="relative">
          <img
            src={spot.imageUrl || "/placeholder.svg"}
            alt={spot.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {/* ... existing image overlay content ... */}
        </div>
      )}

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
  )
}
