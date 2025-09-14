"use client";
import { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, MapPin, Globe, Phone, User } from "lucide-react";
import { GoogleMaps } from "@/components/google-maps";
import Image from "next/image";
import { PendingSpot, mockPendingSpots } from "../utils/mock";
import useAPIFetch from "@/app/hooks/use-api-fetch";
import postData from "../hooks/use-api-post";
import { useRouter } from "next/navigation";

export default function PendingSpotsPage() {
	const [pendingSpots, setPendingSpots] =
		useState<PendingSpot[]>(mockPendingSpots);
	const router = useRouter();
	const [selectedSpot, setSelectedSpot] = useState<PendingSpot | null>(
		pendingSpots[0]
	);

	const { data, isLoading, error } = useAPIFetch<PendingSpot[]>({
		url: `/verify/queue/`,
		queryKeys: ["queue", "verify"],
	});

	useEffect(() => {
		if (data) {
			setPendingSpots(data);
		}
	}, [data]);

	const handleAction = (spotId: string) => {
		const spotToPost = pendingSpots.find(
			(spot: PendingSpot) => spot.id === spotId
		);
		if (spotToPost) {
			const response = postData<PendingSpot>("/verify/action/", spotToPost);
			console.log("Spot Created");
			router.push("/");
		}
		if (selectedSpot?.id === spotId) {
			const remainingSpots = pendingSpots.filter((spot) => spot.id !== spotId);
			setSelectedSpot(remainingSpots.length > 0 ? remainingSpots[0] : null);
		}
		console.log("[v0] Accepted spot:", spotId);
	};

	const handleSpotSelect = (spot: PendingSpot) => {
		setSelectedSpot(spot);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
					{/* Left Panel - Pending Spots List */}
					<div className="lg:col-span-2">
						<Card className="h-full">
							<CardHeader className="pb-4">
								<h2 className="text-subheading font-semibold">Pending Spots</h2>
								<p className="text-caption">
									{pendingSpots.length} spots awaiting review
								</p>
							</CardHeader>
							<CardContent className="p-0">
								<div className="space-y-0 max-h-[calc(100vh-12rem)] overflow-y-auto">
									{pendingSpots.map((spot, index) => (
										<div
											key={spot.id}
											className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
												selectedSpot?.id === spot.id
													? "bg-primary/5 border-l-4 border-l-primary"
													: ""
											}`}
											onClick={() => handleSpotSelect(spot)}
										>
											<div className="flex items-start space-x-3">
												<Avatar className="w-12 h-12 flex-shrink-0">
													<AvatarImage
														src={spot.photo_url || "/placeholder.svg"}
														alt={spot.name}
													/>
													<AvatarFallback className="bg-primary text-primary-foreground">
														{spot.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<h3 className="font-semibold text-foreground truncate">
														{spot.name}
													</h3>
													<p className="text-caption text-muted-foreground">
														{spot.raw_address}
													</p>
													<div className="flex items-center gap-2 mt-2">
														<Button
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																handleAction(spot.id);
															}}
															className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
														>
															<ThumbsUp className="h-3 w-3 mr-1" />
															Accept
														</Button>
														<Button
															size="sm"
															variant="destructive"
															onClick={(e) => {
																e.stopPropagation();
																handleAction(spot.id);
															}}
															className="h-8 px-3"
														>
															<ThumbsDown className="h-3 w-3 mr-1" />
															Reject
														</Button>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Panel - Selected Spot Details */}
					<div className="lg:col-span-1">
						{selectedSpot ? (
							<div className="space-y-6 h-full">
								{/* Spot Header */}
								<div className="w-full h-48 relative overflow-hidden">
									<Image
										src={selectedSpot.photo_url}
										alt={selectedSpot.name}
										layout="fill"
										objectFit="cover"
									/>
								</div>
								<div className="p-2">
									<div className="flex flex-col items-start space-x-2">
										<h3 className="text-subheading font-semibold">
											{selectedSpot.name}
										</h3>
										<p className="text-caption text-muted-foreground">
											{selectedSpot.raw_address}
										</p>
									</div>
									<div className="flex flex-col items-start space-x-2 mt-4">
										<h3 className="text-subheading font-semibold">Note</h3>
										<p className="text-caption text-muted-foreground">
											{selectedSpot.description}
										</p>
									</div>
									<div className="w-full mt-4">
										<h3 className="font-semibold text-foreground">Location</h3>
										<Card className="w-full border-none rounded-lg p-1">
											<CardContent className="p-0">
												<div className="h-64 bg-muted p-0 rounded-[inherit] w-full">
													<GoogleMaps
														spots={[
															{
																id: selectedSpot.id,
																name: selectedSpot.name,
																address: selectedSpot.raw_address,
																lat: selectedSpot.lat,
																lng: selectedSpot.lng,
																description: selectedSpot.description,
																rating: 0,
																reviewCount: 0,
																distance: "0 mi",
																isVerified: false,
																verificationStatus: "pending",
																isFavorite: false,
																imageUrl: selectedSpot.photo_url,
																priceRange: "$$",
																cuisine: ["Nigerian"],
																openNow: true,
																submittedBy: selectedSpot.submittedBy,
																submittedDate: selectedSpot.submittedDate,
															},
														]}
														center={{
															lat: selectedSpot.lat,
															lng: selectedSpot.lng,
														}}
														zoom={15}
														onMarkerClick={() => {}}
														className="h-64 rounded-lg"
													/>
												</div>
											</CardContent>
										</Card>
									</div>
								</div>
								{/* Location Map */}
								<div className="space-y-4">
									<div className="flex items-center space-x-2">
										<Globe className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium text-foreground">
											{selectedSpot.website}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium text-foreground">
											{selectedSpot.phone}
										</span>
									</div>
									<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
										<User className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium text-foreground">
											Submitted by
										</span>
									</div>
								</div>
							</div>
						) : (
							<Card className="h-full flex items-center justify-center">
								<CardContent className="text-center">
									<MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-subheading text-foreground mb-2">
										No spots to review
									</h3>
									<p className="text-body text-muted-foreground">
										All pending spots have been processed.
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
