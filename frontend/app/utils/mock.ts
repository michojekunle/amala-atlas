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
