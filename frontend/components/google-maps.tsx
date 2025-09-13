"use client"

import { useEffect, useRef, useState } from "react"

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

interface GoogleMapsProps {
  spots: AmalaSspot[]
  center?: { lat: number; lng: number }
  zoom?: number
  onMarkerClick?: (spot: AmalaSspot) => void
  className?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function GoogleMaps({
  spots,
  center = { lat: 6.511720832863404, lng: 3.3926679183154658 },
  zoom = 12,
  onMarkerClick,
  className,
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [markerCluster, setMarkerCluster] = useState<any>(null)
  const [selectedSpot, setSelectedSpot] = useState<any>(null)
  const [infoWindow, setInfoWindow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if Google Maps API key is available
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is missing")
      setIsLoading(false)
      return
    }
  }, [])

  useEffect(() => {
    const loadGoogleMaps = () => {
      // If Google Maps is already loaded
      if (window.google && window.google.maps) {
        console.log("Google Maps already loaded")
        initializeMap()
        return
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        console.log("Google Maps script already exists, waiting for load...")
        existingScript.addEventListener('load', initializeMap)
        return
      }

      console.log("Loading Google Maps script...")
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,places&callback=initMap`
      script.async = true
      script.defer = true

      script.onerror = () => {
        console.error("Failed to load Google Maps script")
        setError("Failed to load Google Maps")
        setIsLoading(false)
      }

      window.initMap = initializeMap
      document.head.appendChild(script)
    }

    loadGoogleMaps()

    // Cleanup function
    return () => {
      if (window.initMap) {
        delete window?.initMap
      }
    }
  }, [])

  useEffect(() => {
    console.log("Map or spots changed:", { map: !!map, spotsCount: spots.length })
    if (map && spots.length > 0) {
      updateMarkers()
    } else if (map && spots.length === 0) {
      // Clear existing markers if no spots
      clearMarkers()
    }
  }, [map, spots])

  const initializeMap = () => {
    console.log("Initializing map...")
    
    if (!mapRef.current) {
      console.error("Map ref is not available")
      setError("Map container not found")
      setIsLoading(false)
      return
    }

    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not loaded")
      setError("Google Maps API not loaded")
      setIsLoading(false)
      return
    }

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels", 
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      const infoWindowInstance = new window.google.maps.InfoWindow()

      console.log("Map initialized successfully")
      setMap(mapInstance)
      setInfoWindow(infoWindowInstance)
      setIsLoading(false)
      setError(null)

      // Test marker to verify map is working
      if (spots.length === 0) {
        console.log("No spots provided, adding test marker")
        const testMarker = new window.google.maps.Marker({
          position: center,
          map: mapInstance,
          title: "Test Marker",
        })
      }

    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map")
      setIsLoading(false)
    }
  }

  const clearMarkers = () => {
    console.log("Clearing existing markers")
    markers.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
    
    if (markerCluster && markerCluster.clearMarkers) {
      markerCluster.clearMarkers()
    }
    
    setMarkers([])
  }

  const updateMarkers = () => {
    console.log("Updating markers for", spots.length, "spots")
    
    if (!map || !window.google) {
      console.error("Map or Google Maps API not available")
      return
    }

    // Clear existing markers
    clearMarkers()

    // Validate spots data
    const validSpots = spots.filter(spot => {
      const isValid = spot && 
                     typeof spot.lat === 'number' && 
                     typeof spot.lng === 'number' && 
                     !isNaN(spot.lat) && 
                     !isNaN(spot.lng) &&
                     spot.lat >= -90 && spot.lat <= 90 &&
                     spot.lng >= -180 && spot.lng <= 180
      
      if (!isValid) {
        console.warn("Invalid spot data:", spot)
      }
      return isValid
    })

    console.log(`Creating ${validSpots.length} markers from ${spots.length} spots`)

    const newMarkers = validSpots.map((spot, index) => {
      try {
        console.log(`Creating marker ${index + 1}:`, {
          name: spot.name,
          lat: spot.lat,
          lng: spot.lng,
          status: spot.verificationStatus
        })

        const marker = new window.google.maps.Marker({
          position: { lat: spot.lat, lng: spot.lng },
          map,
          title: spot.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor:
              spot.verificationStatus === "verified"
                ? "#10B981"
                : spot.verificationStatus === "pending"
                  ? "#F59E0B"
                  : "#8B5B29",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        })

        // Add click listener
        marker.addListener("click", () => {
          console.log("Marker clicked:", spot.name)
          setSelectedSpot(spot)
          showInfoWindow(marker, spot)
          onMarkerClick?.(spot)
        })

        // Add hover effects
        marker.addListener("mouseover", () => {
          marker.setIcon({
            ...marker.getIcon(),
            scale: 12,
          })
        })

        marker.addListener("mouseout", () => {
          marker.setIcon({
            ...marker.getIcon(),
            scale: 8,
          })
        })

        console.log(`Marker ${index + 1} created successfully`)
        return marker

      } catch (err) {
        console.error(`Error creating marker for spot ${spot.name}:`, err)
        return null
      }
    }).filter(Boolean) // Remove null markers

    console.log(`Successfully created ${newMarkers.length} markers`)
    setMarkers(newMarkers)

    // Adjust map bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        if (marker && marker.getPosition) {
          bounds.extend(marker.getPosition())
        }
      })
      
      // Only fit bounds if we have multiple markers
      if (newMarkers.length > 1) {
        map.fitBounds(bounds)
      }
    }

    // Initialize marker clustering if available
    if (window.google.maps.MarkerClusterer && newMarkers.length > 0) {
      try {
        const clusterer = new window.google.maps.MarkerClusterer({
          map,
          markers: newMarkers,
          gridSize: 60,
          maxZoom: 15, // Changed from 1000 to reasonable value
        })
        setMarkerCluster(clusterer)
        console.log("Marker clustering initialized")
      } catch (err) {
        console.warn("Marker clustering failed:", err)
      }
    }
  }

  const showInfoWindow = (marker: any, spot: AmalaSspot) => {
    if (!infoWindow) {
      console.error("InfoWindow not available")
      return
    }

    const content = `
      <div style="max-width: 300px; padding: 8px;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">
          <h3 style="font-weight: 600; font-size: 18px; margin: 0; color: #1f2937;">${spot.name}</h3>
          <div style="display: flex; align-items: center; margin-left: 8px;">
            <span style="color: #fbbf24;">★</span>
            <span style="font-weight: 600; font-size: 14px; margin-left: 2px;">${spot.rating}</span>
          </div>
        </div>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">${spot.address}</p>
        <p style="font-size: 14px; color: #1f2937; margin: 0 0 12px 0; line-height: 1.4;">${spot.description}</p>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${
              spot.verificationStatus === "verified"
                ? '<span style="display: inline-flex; align-items: center; gap: 4px; background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-size: 12px;"><span style="color: #10b981;">✓</span>Verified</span>'
                : spot.verificationStatus === "pending"
                  ? '<span style="display: inline-flex; align-items: center; gap: 4px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 12px;"><span style="color: #f59e0b;">⏳</span>Pending</span>'
                  : '<span style="font-size: 12px; color: #6b7280;">Unverified</span>'
            }
            <span style="font-size: 12px;">${spot.priceRange}</span>
          </div>
          <a href="/spot/${spot.id}" style="display: inline-flex; align-items: center; padding: 4px 12px; background: #3b82f6; color: white; font-size: 12px; font-weight: 500; border-radius: 4px; text-decoration: none;">
            View Details
          </a>
        </div>
      </div>
    `

    infoWindow.setContent(content)
    infoWindow.open(map, marker)
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-red-50 border border-red-200 rounded ${className}`}>
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      {!isLoading && spots.length === 0 && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
          <p className="text-sm text-gray-600">No spots to display</p>
        </div>
      )}
      {!isLoading && markers.length > 0 && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
          <p className="text-sm text-gray-600">{markers.length} spots shown</p>
        </div>
      )}
    </div>
  )
}