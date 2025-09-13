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
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [infoWindow, setInfoWindow] = useState<any>(null)

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,places&callback=initMap`
      script.async = true
      script.defer = true

      window.initMap = initializeMap
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  useEffect(() => {
    if (map && spots.length > 0) {
      updateMarkers()
    }
  }, [map, spots])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

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

    setMap(mapInstance)
    setInfoWindow(infoWindowInstance)
  }

  const updateMarkers = () => {
    if (!map || !window.google) return

    markers.forEach((marker) => marker.setMap(null))
    if (markerCluster) {
      markerCluster.clearMarkers()
    }

    const newMarkers = spots.map((spot) => {
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

      marker.addListener("click", () => {
        setSelectedSpot(spot)
        showInfoWindow(marker, spot)
        onMarkerClick?.(spot)
      })

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

      return marker
    })

    setMarkers(newMarkers)

    if (window.google.maps.MarkerClusterer) {
      const clusterer = new window.google.maps.MarkerClusterer({
        map,
        markers: newMarkers,
        gridSize: 60,
        maxZoom: 15,
      })
      setMarkerCluster(clusterer)
    }
  }

  const showInfoWindow = (marker: any, spot: AmalaSspot) => {
    if (!infoWindow) return

    const content = `
      <div class="map-popup">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-lg text-card-foreground">${spot.name}</h3>
          <div class="flex items-center space-x-1 ml-2">
            <svg class="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="font-semibold text-sm">${spot.rating}</span>
          </div>
        </div>
        <p class="text-sm text-muted-foreground mb-2">${spot.address}</p>
        <p class="text-sm text-card-foreground mb-3 line-clamp-2">${spot.description}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            ${
              spot.verificationStatus === "verified"
                ? '<span class="verification-badge verified"><svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>Verified</span>'
                : spot.verificationStatus === "pending"
                  ? '<span class="verification-badge pending"><svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>Pending</span>'
                  : '<span class="text-xs text-muted-foreground">Unverified</span>'
            }
            <span class="text-xs">${spot.priceRange}</span>
          </div>
          <a href="/spot/${spot.id}" class="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded hover:bg-primary/90 transition-colors">
            View Details
          </a>
        </div>
      </div>
    `

    infoWindow.setContent(content)
    infoWindow.open(map, marker)
  }

  return (
    <div className={`map-container ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      {typeof window !== "undefined" && !window.google && (
        <div className="flex items-center justify-center h-full bg-muted">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
