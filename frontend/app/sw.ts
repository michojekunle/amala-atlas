import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from "workbox-strategies"
import { ExpirationPlugin } from "workbox-expiration"

declare const self: ServiceWorkerGlobalScope

// Clean up old caches
cleanupOutdatedCaches()

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST)

// Cache Google Maps API
registerRoute(
  ({ url }) => url.origin === "https://maps.googleapis.com",
  new StaleWhileRevalidate({
    cacheName: "google-maps-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
      }),
    ],
  }),
)

// Cache API routes
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  }),
)

// Cache images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  }),
)

// Cache static resources
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style" || request.destination === "font",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
  }),
)

// Background sync for location submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "location-submission") {
    event.waitUntil(syncLocationSubmissions())
  }
})

async function syncLocationSubmissions() {
  // Handle offline location submissions
  const submissions = await getStoredSubmissions()
  for (const submission of submissions) {
    try {
      await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      })
      await removeStoredSubmission(submission.id)
    } catch (error) {
      console.log("Failed to sync submission:", error)
    }
  }
}

async function getStoredSubmissions() {
  // Implementation would use IndexedDB to store offline submissions
  return []
}

async function removeStoredSubmission(id: string) {
  // Implementation would remove from IndexedDB
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/android-chrome-192x192.jpg",
    badge: "/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      {
        action: "view",
        title: "View Location",
        icon: "/action-view.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/action-close.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(self.clients.openWindow(event.notification.data.url || "/"))
  }
})
