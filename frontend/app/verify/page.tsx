"use client";
import { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, MapPin, Globe, Phone, User } from "lucide-react";
import { GoogleMaps } from "@/components/google-maps";
import Image from "next/image";
import { mockPendingSpots } from "../utils/mock";
import useAPIFetch from "@/app/hooks/use-api-fetch";
import postData from "../hooks/use-api-post";
import { useRouter } from "next/navigation";
import { PendingSpot, SpotCandidate } from "../utils/typing";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Queue from "yocto-queue";

export default function PendingSpotsPage() {
	const [pendingSpots, setPendingSpots] = useState<SpotCandidate[]>([]);
	const router = useRouter();
	const [selectedSpotCandidate, setSelectedSpotCandidate] =
		useState<SpotCandidate>(pendingSpots[0]);

	const { data, isLoading, error } = useAPIFetch<SpotCandidate[]>({
		url: `/verify/queue/`,
		queryKeys: ["queue", "verify"],
	});

	useEffect(() => {
		if (data) {
			const sortedData = [...data].sort(
				(a, b) =>
					new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
			);
			const verificationQueue = new Queue<SpotCandidate>();
			sortedData.forEach((item) => verificationQueue.enqueue(item));
			setPendingSpots(Array.from(verificationQueue));
			return;
		}
		setPendingSpots(mockPendingSpots);
	}, [data]);

	const handleAction = async (spotId: string, action: string) => {
		const verification = {
			candidate_id: spotId,
			action,
			notes: "",
		};
		if (verification) {
			const response = await postData<
				{
					candidate_id: string;
					action: string;
					notes: string;
					by_user?: string;
				},
				PendingSpot
			>("/verify/action/", verification);
			if (response) {
				toast.success("Spot Verification Action Was Successful");
				console.log("Spot Created");
				setTimeout(() => {
					router.push("/");
				}, 2000);
			} else {
				toast.error("Spot Verification Action Unuccessful");
			}
		}
		if (selectedSpotCandidate?.id === spotId) {
			const remainingSpots = pendingSpots.filter((spot) => spot.id !== spotId);
			setSelectedSpotCandidate(remainingSpots[0]);
		}
		console.log("[v0] Accepted spot:", spotId);
	};

	const handleSpotSelect = (spot: SpotCandidate) => {
		setSelectedSpotCandidate(spot);
	};

	if (isLoading) {
		return (
			<div className="w-screen h-screen flex items-center justify-center">
				<p>Loading unverified spots from the queue</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen w-screen flex items-center justify-center">
				<p>An error occured</p>
			</div>
		);
	}

	return pendingSpots.length ? (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
					{/* Left Panel - Pending Spots List */}
					<div className="lg:col-span-2">
						<div className="pb-4">
							<h2 className="text-subheading font-semibold">Pending Spots</h2>
							<p className="text-caption">
								{pendingSpots.length} spots awaiting review
							</p>
						</div>

						<div className="space-y-0 max-h-[calc(100vh-12rem)] overflow-y-auto">
							{pendingSpots.map((spot, index) => (
								<Card className="h-full bg-gradient-to-br from-primary/10 via-white to-accent/10 border-none shadow-xl">
									<CardContent className="p-0">
										{pendingSpots.length === 0 ? (
											<div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
												<MapPin className="h-10 w-10 mb-2" />
												<span className="font-semibold">
													No unverified spots available
												</span>
											</div>
										) : (
											<div className="divide-y divide-border">
												{pendingSpots.map((spot) => (
													<div
														key={spot.id}
														className={`group grid grid-cols-[56px_1fr_120px] gap-4 items-center px-4 py-3 cursor-pointer transition-all duration-200 rounded-xl mb-1
															${
																selectedSpotCandidate?.id === spot.id
																	? "bg-primary/10 border-l-4 border-l-primary shadow-lg"
																	: "hover:bg-accent/30"
															}
														`}
														onClick={() => handleSpotSelect(spot)}
													>
														{/* Avatar */}
														<div className="flex flex-col items-center">
															<Avatar className="w-14 h-14 ring-2 ring-primary/60 shadow-md">
																<AvatarImage
																	src={spot.photo_urls[0] || "/placeholder.svg"}
																	alt={spot.name}
																/>
																<AvatarFallback className="bg-primary text-primary-foreground">
																	{spot.name.charAt(0)}
																</AvatarFallback>
															</Avatar>
														</div>
														{/* Main info */}
														<div className="flex flex-col min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
																	{spot.name}
																</h3>
																{spot.status && (
																	<Badge className="bg-yellow-400/80 text-yellow-900 text-xs ml-1">
																		{spot.status.toUpperCase()}
																	</Badge>
																)}
															</div>
															<p className="text-caption text-muted-foreground truncate mb-1">
																{spot.raw_address}
															</p>
															{spot.notes && (
																<p className="text-xs text-muted-foreground italic truncate mb-1">
																	{spot.notes}
																</p>
															)}
															<div className="flex flex-wrap gap-1 mt-1">
																{spot.tags?.slice(0, 3).map((tag: string) => (
																	<Badge
																		key={tag}
																		className="bg-primary/20 text-primary text-xs px-2 py-0.5"
																	>
																		{tag}
																	</Badge>
																))}
															</div>
														</div>
														{/* Actions */}
														<div className="flex flex-col items-end gap-2">
															<Button
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	handleAction(spot.id, "accept");
																}}
																className="h-8 px-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-transform"
															>
																<ThumbsUp className="h-3 w-3 mr-1" /> Accept
															</Button>
															<Button
																size="sm"
																variant="destructive"
																onClick={(e) => {
																	e.stopPropagation();
																	handleAction(spot.id, "reject");
																}}
																className="h-8 px-4 font-semibold shadow hover:scale-105 transition-transform"
															>
																<ThumbsDown className="h-3 w-3 mr-1" /> Reject
															</Button>
														</div>
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Right Panel - Selected Spot Details */}
					<div className="lg:col-span-1">
						{selectedSpotCandidate ? (
							<div className="space-y-6 h-full">
								{/* Spot Header */}
								<div className="w-full h-48 relative overflow-hidden">
									<Carousel
										plugins={[
											Autoplay({
												delay: 2000,
											}),
										]}
									>
										<CarouselContent>
											{selectedSpotCandidate.photo_urls.map((url, index) => (
												<CarouselItem key={index}>
													<Image
														key={url}
														src={url}
														alt={selectedSpotCandidate.name}
														layout="fill"
														objectFit="cover"
													/>
												</CarouselItem>
											))}
											<CarouselPrevious />
											<CarouselNext />
										</CarouselContent>
									</Carousel>
								</div>
								<div className="p-2">
									<div className="flex flex-col items-start space-x-2">
										<h3 className="text-subheading font-semibold">
											{selectedSpotCandidate.name}
										</h3>
										<p className="text-caption text-muted-foreground">
											{selectedSpotCandidate.raw_address}
										</p>
									</div>
									<div className="flex flex-col items-start space-x-2 mt-4">
										<h3 className="text-subheading font-semibold">Note</h3>
										<p className="text-caption text-muted-foreground">
											{selectedSpotCandidate.notes}
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
																id: selectedSpotCandidate.id,
																name: selectedSpotCandidate.name,
																address: selectedSpotCandidate.raw_address,
																lat: selectedSpotCandidate.lat,
																lng: selectedSpotCandidate.lng,
																description: selectedSpotCandidate.notes,
																rating: 0,
																reviewCount: 0,
																distance: "0 mi",
																isVerified: false,
																verificationStatus: "pending",
																isFavorite: false,
																imageUrl: selectedSpotCandidate.photo_urls[0],
																priceRange: "$$",
																cuisine: ["Nigerian"],
																openNow: true,
																submittedBy:
																	"selectedSpotCandidate.submittedBy",
																submittedDate:
																	"selectedSpotCandidate.submittedDate",
															},
														]}
														center={{
															lat: selectedSpotCandidate.lat,
															lng: selectedSpotCandidate.lng,
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
											{selectedSpotCandidate.website}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium text-foreground">
											{selectedSpotCandidate.phone}
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
	) : (
		<div className="min-h-screen min-w-screen bg-background flex items-center justify-center">
			No unverified spot available
		</div>
	);
}
