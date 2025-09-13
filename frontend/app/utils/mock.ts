import { AmalaSspot } from "./typing";

const spotId = "1";
export const mockSpot: AmalaSspot = {
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
};

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

export const mockPendingSpots: PendingSpot[] = [
	{
		id: "1",
		name: "Amala Hotspot",
		raw_address: "Agege, Lagos State",
		lat: 6.6158,
		lng: 3.3417,
		description:
			"Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
		category: "Restaurant",
		photo_url: "/traditional-nigerian-amala-restaurant-interior.jpg",
		submittedBy: "Community Scout",
		submittedDate: "2024-03-15",
		website: "https://amalahotspot.com",
		phone: "+234 801 234 5678",
		status: "pending",
	},
	{
		id: "2",
		name: "Ile Amala",
		raw_address: "Agege, Lagos State",
		lat: 6.62,
		lng: 3.345,
		description:
			"Traditional Yoruba cuisine with authentic amala preparation methods passed down through generations.",
		category: "Restaurant",
		photo_url: "/homestyle-nigerian-kitchen-amala-preparation.jpg",
		submittedBy: "User: @foodie_lagos",
		submittedDate: "2024-03-14",
		status: "pending",
	},
	{
		id: "3",
		name: "Ile Amala",
		raw_address: "Agege, Lagos State",
		lat: 6.618,
		lng: 3.34,
		description:
			"Family-owned restaurant specializing in traditional Nigerian dishes with focus on quality amala.",
		category: "Restaurant",
		photo_url: "/vibrant-nigerian-restaurant-cultural-atmosphere.jpg",
		submittedBy: "Restaurant Owner",
		submittedDate: "2024-03-13",
		status: "pending",
	},
	{
		id: "4",
		name: "Ile Amala",
		raw_address: "Agege, Lagos State",
		lat: 6.622,
		lng: 3.338,
		description:
			"Modern take on traditional amala with contemporary dining experience and authentic flavors.",
		category: "Restaurant",
		photo_url: "/modern-nigerian-restaurant-amala-dish.jpg",
		submittedBy: "Community",
		submittedDate: "2024-03-12",
		status: "pending",
	},
	{
		id: "5",
		name: "Ile Amala",
		raw_address: "Agege, Lagos State",
		lat: 6.616,
		lng: 3.342,
		description:
			"Authentic Nigerian restaurant known for exceptional amala and traditional Yoruba hospitality.",
		category: "Restaurant",
		photo_url: "/traditional-nigerian-amala-restaurant-interior.jpg",
		submittedBy: "Local Guide",
		submittedDate: "2024-03-11",
		status: "pending",
	},
];
