import type React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { Space_Grotesk } from "next/font/google";
import { DM_Sans } from "next/font/google";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthHeader } from "@/components/auth-header";
import { AuthProvider } from "@/hooks/use-auth";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
	display: "swap",
});

const dmSans = DM_Sans({
	subsets: ["latin"],
	variable: "--font-dm-sans",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Amala Atlas - Find Authentic Amala Spots",
	description:
		"Discover and verify authentic Amala restaurants and spots near you with our interactive map and community-driven platform.",
	applicationName: "Amala Atlas",
	referrer: "origin-when-cross-origin",
	keywords: [
		"amala",
		"restaurants",
		"food",
		"locations",
		"map",
		"authentic",
		"nigerian food",
	],
	authors: [{ name: "Amala Atlas Team" }],
	creator: "Amala Atlas",
	publisher: "Amala Atlas",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL("https://amalaatlas.vercel.app"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		siteName: "Amala Locations",
		title: "Amala Locations - Find Authentic Amala Spots",
		description:
			"Discover and verify authentic Amala restaurants and spots near you with our interactive map and community-driven platform.",
		url: "https://amalaatlas.vercel.app",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Amala Locations App",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Amala Atlas - Find Authentic Amala Spots",
		description:
			"Discover and verify authentic Amala restaurants and spots near you with our interactive map and community-driven platform.",
		images: ["/og-image.jpg"],
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Amala Atlas",
	},
	manifest: "/manifest.json",
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0f172a" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Amala Locations" />
				<meta name="msapplication-TileColor" content="#2563eb" />
				<meta name="msapplication-config" content="/browserconfig.xml" />

				{/* Apple Touch Icons */}
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.jpg"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.jpg"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.jpg"
				/>
				<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2563eb" />
				<link rel="shortcut icon" href="/favicon.ico" />
			</head>
			<body className={`font-sans ${spaceGrotesk.variable} ${dmSans.variable}`}>
				<Provider>
					<Suspense fallback={null}>
						<AuthProvider>
							<AuthHeader />
							{children}
						</AuthProvider>
						<Toaster position="top-right" richColors />
					</Suspense>
					<Analytics />
				</Provider>
			</body>
		</html>
	);
}
