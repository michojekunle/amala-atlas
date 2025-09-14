export interface Review {
	id: string;
	userId: string;
	userName: string;
	userAvatar?: string;
	rating: number;
	comment: string;
	date: string;
	helpful: number;
	images?: string[];
}

export interface AmalaSspot {
	id: string;
	name: string;
	address: string;
	lat: number;
	lng: number;
	description: string;
	rating: number;
	reviewCount: number;
	distance: string;
	isVerified: boolean;
	verificationStatus: "verified" | "pending" | "unverified";
	isFavorite: boolean;
	imageUrl: string;
	images: string[];
	priceRange: "$" | "$$" | "$$$";
	cuisine: string[];
	openNow: boolean;
	hours: { [key: string]: string };
	phone?: string;
	website?: string;
	submittedBy: string;
	submittedDate: string;
	verificationVotes: { up: number; down: number };
	amenities: string[];
	reviews: Review[];
}

export interface PendingSpot {
	id: string;
	name: string;
	raw_address: string;
	lat: number;
	lng: number;
	description: string;
	category: string;
	photo_url: string;
	submittedBy: string;
	submittedDate: string;
	website?: string;
	phone?: string;
	status: "pending";
}
