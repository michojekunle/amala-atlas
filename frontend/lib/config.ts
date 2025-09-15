export const config = {
  // Agent API Configuration
  agentApiBaseUrl: process.env.AGENT_API_BASE_URL || 'http://localhost:8000',
  
  // Google Maps API Key
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  
  // Cloudinary Configuration
  cloudinaryUploadPreset: process.env.NEXT_PUBLIC_API_CLOUDINARY_UPLOAD_PRESET || '',
  cloudinaryCloudName: process.env.NEXT_PUBLIC_API_CLOUDINARY_CLOUD_NAME || '',
  
  // Backend API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  
  // Feature Flags
  features: {
    agentIntegration: true,
    realTimeValidation: true,
    coordinateSuggestions: true,
    duplicateChecking: true,
    photoNudges: true,
  }
};
