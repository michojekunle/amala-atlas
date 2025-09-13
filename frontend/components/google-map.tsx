"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { MapPin } from "lucide-react"

interface Location {
  id?: string
  name: string
  address: string
  lat: number
  lng: number
  source: string
  rating?: number
  isVerified?: boolean
  isFavorite?: boolean
}

interface GoogleMapProps {
  locations: Location[]
  onLocationAdd?: (location: Omit<Location, "source">) => void
  selectedLocation?: Location | null
  onLocationSelect?: (location: Location | null) => void
  className?: string
}

export function GoogleMap({
  locations,
  onLocationAdd,
  selectedLocation,
  onLocationSelect,
  className = "",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
        libraries: ["places", "geometry"],
      })

      try {
        const google = await loader.load()

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 6.511720832863404, lng: 3.3926679183154658 },
            zoom: 1200,
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#D2B48C" }], // Tan water to match amala theme
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#F5F5DC" }], // Beige landscape
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }], // White roads
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#C2B280" }], // Light brown road borders
              },
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }], // Hide POI labels for cleaner look
              },
              {
                featureType: "administrative",
                elementType: "labels.text.fill",
                stylers: [{ color: "#8B5A2B" }], // Brown text for admin labels
              },
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_BOTTOM,
            },
          })

          mapInstanceRef.current = map
          setIsLoaded(true)
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
      }
    }

    initMap()
  }, [])

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    const google = (window as any).google
    if (!google) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    locations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstanceRef.current,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: location.isVerified ? 10 : 8,
          fillColor: location.isVerified ? "#8B5A2B" : "#D2B48C", // Primary brown for verified, tan for unverified
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-4 min-w-[250px] max-w-[300px]">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-lg text-gray-800 pr-2">${location.name}</h3>
              ${location.isVerified ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>' : ""}
            </div>
            
            <p class="text-sm text-gray-600 mb-2">${location.address}</p>
            
            <div class="flex items-center justify-between mb-3">
              ${
                location.rating
                  ? `
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <span class="text-sm font-medium">${location.rating}</span>
                </div>
              `
                  : ""
              }
              <span class="text-xs text-gray-500">${location.source}</span>
            </div>
            
            <div class="flex space-x-2">
              <button 
                onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}', '_blank')"
                class="flex-1 bg-amber-700 hover:bg-amber-800 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center space-x-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <span>Directions</span>
              </button>
            </div>
          </div>
        `,
      })

      marker.addListener("click", () => {
        // Close other info windows
        markersRef.current.forEach((m) => {
          if (m.infoWindow) {
            m.infoWindow.close()
          }
        })

        infoWindow.open(mapInstanceRef.current, marker)

        // Notify parent component of selection
        if (onLocationSelect) {
          onLocationSelect(location)
        }
      })

      // Store info window reference
      marker.infoWindow = infoWindow
      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (locations.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      locations.forEach((location) => {
        bounds.extend({ lat: location.lat, lng: location.lng })
      })
      mapInstanceRef.current?.fitBounds(bounds)
    }
  }, [locations, isLoaded, onLocationSelect])

  useEffect(() => {
    if (!selectedLocation || !isLoaded) return

    const google = (window as any).google
    if (!google) return

    // Find and highlight the selected marker
    const selectedMarker = markersRef.current.find((marker) => {
      const position = marker.getPosition()
      return position?.lat() === selectedLocation.lat && position.lng() === selectedLocation.lng
    })

    if (selectedMarker) {
      // Center map on selected location
      mapInstanceRef.current?.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng })
      mapInstanceRef.current?.setZoom(15)

      // Open info window
      if (selectedMarker.infoWindow) {
        selectedMarker.infoWindow.open(mapInstanceRef.current, selectedMarker)
      }
    }
  }, [selectedLocation, isLoaded])

  // Handle search functionality
  const handleSearch = useCallback(async () => {
    if (!mapInstanceRef.current || !searchQuery.trim()) return

    const google = (window as any).google
    if (!google) return

    setIsSearching(true)

    try {
      const geocoder = new google.maps.Geocoder()
      const result = await geocoder.geocode({ address: searchQuery })

      if (result.results[0]) {
        const location = result.results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()

        mapInstanceRef.current.setCenter({ lat, lng })
        mapInstanceRef.current.setZoom(15)

        // If onLocationAdd is provided, call it with the geocoded location
        if (onLocationAdd) {
          onLocationAdd({
            name: searchQuery,
            address: result.results[0].formatted_address,
            lat,
            lng,
          })
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, onLocationAdd])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
          <div className="text-center bg-card p-6 rounded-xl border border-border shadow-lg">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-primary-foreground animate-pulse" />
            </div>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-card-foreground font-medium">Loading Amala locations...</p>
            <p className="text-xs text-muted-foreground mt-1">Finding the best spots for you</p>
          </div>
        </div>
      )}
    </div>
  )
}
