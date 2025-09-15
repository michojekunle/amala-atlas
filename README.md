# AmalaAtlas 🌍🍲
Your Guide to Amala Adventures

AmalaAtlas is an open-source platform that celebrates Nigeria’s beloved Amala dish by empowering foodies to discover, share, and verify authentic Amala spots. With an interactive Google Maps interface, AI-powered search, and a chat-driven experience, it’s the ultimate guide for Amala lovers to hunt for their next delicious bowl, starting with iconic spots like Iya Moria in Lagos.

## 🌟 Features

- Interactive Map: Pinpoint verified Amala spots with colorful markers, featuring details like ratings, addresses, and verification status.
- AI-Driven Discovery: Autonomous agents scour blogs, social posts, and reviews to propose new Amala spots for community verification.
- Chat-Based Interaction: Submit or verify spots via a friendly chat interface, with voice input planned for the future.
- RESTful API: Integrate with third-party clients to manage spots, reviews, and ratings programmatically.
- Progressive Web App (PWA): Installable on web, iOS, and Android for a seamless, app-like experience.
- Sleek UI/UX: Clean Next.js frontend with Tailwind CSS, designed for foodies and tech enthusiasts.
- Extensible Backend: Powered by Google’s Agent Development Kit (ADK) and A2A protocol for easy feature expansion.

## 🎯 Why AmalaAtlas?
We’re passionate about Amala’s soulful flavors and the stories behind every steaming bowl. Inspired by the challenge of finding authentic spots in bustling cities like Lagos, we built AmalaAtlas to blend Nigerian culture with cutting-edge tech. Think Google Maps meets a foodie community, powered by AI—making every Amala hunt a delicious adventure!

## 🚀 Getting Started

Prerequisites

- Node.js (v20+): Download
- pnpm (recommended), npm, or yarn: pnpm setup
- Google Cloud Account: For Maps API key, Vertex AI, and Firestore
- Git: To clone the repo

## Installation

Clone the repository:
```
git clone https://github.com/michojekunle/amala-atlas.git
cd amala-atlas
```

Install dependencies:
Using pnpm (recommended)
pnpm install

Or npm
npm install --legacy-peer-deps

Or yarn
yarn install


#### Set up environment variables: 
Create a .env.local file in the root:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_BACKEND_API_URL=https://your-cloud-run-url
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=True
```

Get a Maps API key from Google Cloud Console.

## Usage

Run the frontend:
pnpm dev
or
npm run dev
or
yarn dev

Access at http://localhost:3000.

Explore AmalaAtlas:

See a map centered on Iya Moria Amala Spot (Lagos, Nigeria).
Use the chat sidebar to submit or verify Amala spots.
Watch AI-proposed spots populate the verification queue.

## 🤝 Contributing
Join our Amala adventure! To contribute:

Fork the repo: github.com/michojekunle/amala-atlas
Create a branch: git checkout -b feature/your-feature
Commit changes: git commit -m "Add your feature"
Push and open a pull request
Follow CONTRIBUTING.md for details

## 📜 License
Licensed under the MIT License. Use, modify, and share freely!

## 📬 Contact
Questions or ideas? Open an issue!
Thank you for joining the AmalaAtlas journey! Let’s find Amala at last! 🍲
