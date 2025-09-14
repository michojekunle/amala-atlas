"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ArrowLeft,
	MapPin,
	Camera,
	X,
	Clock,
	Phone,
	Globe,
	Utensils,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import postData from "../hooks/use-api-post";
import axios from "axios";

interface SubmissionForm {
	lat: number;
	lng: number;
	name: string;
	kind: "manual" | "agentic";
	city: string;
	state: string;
	country: string;
	address: string;
	description: string;
	notes: string;
	phone: string;
	email: string;
	website: string;
	price_band: "#" | "##" | "###" | "";
	tags: string[];
	hours: { open: string; close: string };
	photo_urls: string[];
	hours_text: string;
	raw_payload: string;
}

const tagOptions = ["Abula", "Ewedu", "Gbegiri", "Ila", "Ogunfe", "Efo riro"];

const amenityOptions = [
	"Takeout",
	"Dine-in",
	"Delivery",
	"Parking",
	"WiFi",
	"Family-friendly",
	"Wheelchair accessible",
	"Outdoor seating",
	"Live music",
	"Catering",
	"Private dining",
	"Bar/Alcohol",
];

const daysOfWeek = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export default function SubmitSpotPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationResult, setVerificationResult] = useState<any>(null);
	const [currentStep, setCurrentStep] = useState(1);
	const totalSteps = 4;

	const [form, setForm] = useState<SubmissionForm>({
		lat: 0,
		lng: 0,
		name: "",
		kind: "manual",
		city: "Lagos",
		state: "",
		country: "Nigeria",
		address: "",
		description: "",
		notes: "",
		phone: "",
		email: "",
		website: "",
		price_band: "",
		tags: [],
		hours: { open: "9:00", close: "21:00" },
		photo_urls: [],
		hours_text: "",
		raw_payload: "",
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const handleInputChange = (field: keyof SubmissionForm, value: any) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleHoursChange = (
		day: string,
		field: "open" | "close" | "closed",
		value: string | boolean
	) => {
		setForm((prev) => ({
			...prev,
			hours: {
				...prev.hours,
				[day]: {
					...(prev.hours as any)[day],
					[field]: value,
				},
			},
		}));
	};

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = Array.from(event.target.files || []);
		if (files.length === 0) {
			return;
		}

		const uploadPreset =
			process.env.NEXT_PUBLIC_API_CLOUDINARY_UPLOAD_PRESET || "";
		const cloudName = process.env.NEXT_PUBLIC_API_CLOUDINARY_CLOUD_NAME || "";

		if (!uploadPreset || !cloudName) {
			console.error("Cloudinary configuration missing");
			return;
		}

		try {
			const uploadPromises = files.map(async (file) => {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("upload_preset", uploadPreset);
				formData.append("resource_type", "auto");

				const response = await fetch(
					`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
					{
						method: "POST",
						body: formData,
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						`Upload failed: ${errorData.error?.message || "Unknown error"}`
					);
				}

				const data = await response.json();

				if (!data.secure_url) {
					throw new Error("No secure URL returned from Cloudinary");
				}

				return data.secure_url;
			});

			const uploadResults = await Promise.allSettled(uploadPromises);

			const uploadedUrls: string[] = [];
			const failedUploads: string[] = [];

			uploadResults.forEach((result, index) => {
				if (result.status === "fulfilled") {
					uploadedUrls.push(result.value);
				} else {
					failedUploads.push(`File ${index + 1}: ${result.reason.message}`);
					console.error(`Upload failed for file ${index + 1}:`, result.reason);
				}
			});

			if (uploadedUrls.length > 0) {
				setForm((prev) => ({
					...prev,
					photo_urls: [...(prev.photo_urls || []), ...uploadedUrls].slice(0, 5),
				}));
			}
			if (failedUploads.length > 0) {
				console.warn(`${failedUploads.length} uploads failed:`, failedUploads);
			}
		} catch (error) {
			console.error("Batch upload failed:", error);
		}
	};
	const removeImage = (index: number) => {
		setForm((prev) => ({
			...prev,
			photo_urls: prev.photo_urls.filter((_, i) => i !== index),
		}));
	};

	const validateStep = (step: number): boolean => {
		const newErrors: { [key: string]: string } = {};

		switch (step) {
			case 1:
				if (!form.name.trim()) newErrors.name = "Restaurant name is required";
				if (!form.address.trim()) newErrors.address = "Address is required";
				if (!form.description.trim())
					newErrors.description = "Description is required";
				if (form.description.length < 50)
					newErrors.description = "Description must be at least 50 characters";
				break;

			case 3:
				// Hours validation is optional
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const nextStep = () => {
		if (validateStep(currentStep)) {
			setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
		}
	};

	const prevStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const handleSubmit = async () => {
		if (!validateStep(currentStep)) return;
		setIsSubmitting(true);
		setIsVerifying(true);

		try {
			const lat = 0;
			const lng = 0;
			await postData<SubmissionForm, any>("/submit-candidate/", {
				name: form.name,
				address: form.address,
				description: form.description,
				phone: form.phone,
				website: form.website,
				lat,
				lng,
				kind: "manual",
				city: form.city,
				state: form.state,
				country: form.country === "" ? "Nigeria" : form.country,
				email: form.email,
				price_band: form.price_band,
				tags: form.tags,
				hours: form.hours,
				photo_urls: form.photo_urls,
				hours_text: JSON.stringify(form.hours),
				raw_payload: JSON.stringify(form),
				notes: form.notes,
			});

			setIsVerifying(false);
			setIsSubmitting(false);
			router.push("/");
		} catch (error) {
			setIsVerifying(false);
			setIsSubmitting(false);
			console.error("Submission error:", error);
		}
	};

	const handleTagsToggle = (tag: string) => {
		setForm((prev) => ({
			...prev,
			tags: prev.tags.includes(tag)
				? prev.tags.filter((t) => t !== tag)
				: [...prev.tags, tag],
		}));
	};
	// const handleSubmit = async () => {
	// 	if (!validateStep(currentStep)) return;

	// 	setIsSubmitting(true);
	// 	setIsVerifying(true);

	// 	try {
	// 		console.log("[v0] Starting AI verification for spot:", form.name);

	// 		const verificationResponse = await fetch("/api/ai-verify", {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 			body: JSON.stringify({
	// 				name: form.name,
	// 				address: form.address,
	// 				description: form.description,
	// 				cuisine: form.cuisine,
	// 				phone: form.phone,
	// 				website: form.website,
	// 				images: form.photo_urls, // Use the URLs for now
	// 			}),
	// 		});

	// 		if (!verificationResponse.ok) {
	// 			throw new Error("AI verification failed");
	// 		}

	// 		const verificationData = await verificationResponse.json();
	// 		console.log("[v0] AI verification completed:", verificationData);

	// 		setVerificationResult(verificationData.verification);
	// 		setIsVerifying(false);

	// 		const submissionData = {
	// 			...form,
	// 			aiVerification: verificationData.verification,
	// 			status: verificationData.verification.status,
	// 			submittedAt: new Date().toISOString(),
	// 			submittedBy: "current-user", // In real app, get from auth
	// 		};

	// 		await new Promise((resolve) => setTimeout(resolve, 1000));
	// 		console.log("[v0] Spot submitted successfully:", submissionData);

	// 		router.push(
	// 			`/?submitted=true&status=${verificationData.verification.status}`
	// 		);
	// 	} catch (error) {
	// 		console.error("[v0] Submission error:", error);
	// 		setIsVerifying(false);
	// 		setVerificationResult({
	// 			score: 50,
	// 			status: "uncertain",
	// 			reasons: ["AI verification unavailable, manual review required"],
	// 		});
	// 	} finally {
	// 		setIsSubmitting(false);
	// 	}
	// };

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
						<div>
							<h2 className="text-subheading font-bold text-foreground mb-2">
								Basic Information
							</h2>
							<p className="text-body text-muted-foreground">
								Tell us about this Amala spot
							</p>
						</div>

						<div className="space-y-4">
							<div>
								<Label htmlFor="name" className="text-body font-medium">
									Restaurant Name *
								</Label>
								<Input
									id="name"
									value={form.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="e.g., Mama Kemi's Authentic Amala"
									className={cn("mt-1", errors.name && "border-destructive")}
								/>
								{errors.name && (
									<p className="text-caption text-destructive mt-1 flex items-center">
										<AlertCircle className="h-3 w-3 mr-1" />
										{errors.name}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="address" className="text-body font-medium">
									Address *
								</Label>
								<div className="relative mt-1">
									<Input
										id="address"
										value={form.address}
										onChange={(e) => {
											handleInputChange("address", e.target.value);
										}}
										placeholder="123 Main Street, Brooklyn, NY 11201"
										className={cn(
											"pl-10",
											errors.address && "border-destructive"
										)}
									/>
								</div>
								{errors.address && (
									<p className="text-caption text-destructive mt-1 flex items-center">
										<AlertCircle className="h-3 w-3 mr-1" />
										{errors.address}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="description" className="text-body font-medium">
									Description *
								</Label>
								<Textarea
									id="description"
									value={form.description}
									onChange={(e) =>
										handleInputChange("description", e.target.value)
									}
									placeholder="Describe what makes this place special. Include details about the food, atmosphere, and what customers should expect..."
									rows={4}
									className={cn(
										"mt-1 resize-none",
										errors.description && "border-destructive"
									)}
								/>
								<div className="flex justify-between items-center mt-1">
									{errors.description ? (
										<p className="text-caption text-destructive flex items-center">
											<AlertCircle className="h-3 w-3 mr-1" />
											{errors.description}
										</p>
									) : (
										<p className="text-caption text-muted-foreground">
											{form.description.length}/500 characters (minimum 50)
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<div>
							<h2 className="text-subheading font-bold text-foreground mb-2">
								Tags & Price Band
							</h2>
							<p className="text-body text-muted-foreground">
								Help people find the right spot
							</p>
						</div>

						<div className="space-y-6">
							<div>
								<Label className="text-body font-medium">Price Range *</Label>
								<Select
									value={form.price_band}
									onValueChange={(value) =>
										handleInputChange("price_band", value)
									}
								>
									<SelectTrigger
										className={cn(
											"mt-1",
											errors.priceRange && "border-destructive"
										)}
									>
										<SelectValue placeholder="Select price range" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="$">
											$ - Budget friendly (Under $15)
										</SelectItem>
										<SelectItem value="$$">$$ - Moderate ($15-30)</SelectItem>
										<SelectItem value="$$$">$$$ - Upscale ($30+)</SelectItem>
									</SelectContent>
								</Select>
								{errors.priceRange && (
									<p className="text-caption text-destructive mt-1 flex items-center">
										<AlertCircle className="h-3 w-3 mr-1" />
										{errors.priceRange}
									</p>
								)}
							</div>

							<div>
								<Label className="text-body font-medium">Tags *</Label>
								<p className="text-caption text-muted-foreground mb-3">
									Select all that apply
								</p>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
									{tagOptions.map((tag) => (
										<div
											key={tag}
											onClick={() => handleTagsToggle(tag)}
											className={cn(
												"flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
												form.tags.includes(tag)
													? "border-primary bg-primary/10 text-primary"
													: "border-border hover:border-primary/50"
											)}
										>
											<Checkbox
												checked={form.tags.includes(tag)}
												onChange={() => {}}
												// Handled by parent onClick
												className="pointer-events-none"
											/>
											<span className="text-sm">{tag}</span>
										</div>
									))}
								</div>
								{errors.cuisine && (
									<p className="text-caption text-destructive mt-2 flex items-center">
										<AlertCircle className="h-3 w-3 mr-1" />
										{errors.cuisine}
									</p>
								)}
							</div>
						</div>
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						<div>
							<h2 className="text-subheading font-bold text-foreground mb-2">
								Contact & Hours
							</h2>
							<p className="text-body text-muted-foreground">
								Help customers reach and visit
							</p>
						</div>

						<div className="space-y-6">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="phone" className="text-body font-medium">
										Phone Number
									</Label>
									<div className="relative mt-1">
										<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											id="phone"
											value={form.phone}
											onChange={(e) =>
												handleInputChange("phone", e.target.value)
											}
											placeholder="(718) 555-0123"
											className="pl-10"
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="website" className="text-body font-medium">
										Website
									</Label>
									<div className="relative mt-1">
										<Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											id="website"
											value={form.website}
											onChange={(e) =>
												handleInputChange("website", e.target.value)
											}
											placeholder="https://restaurant.com"
											className="pl-10"
										/>
									</div>
								</div>
							</div>

							<div>
								<Label className="text-body font-medium flex items-center">
									<Clock className="h-4 w-4 mr-2" />
									Operating Hours
								</Label>
								<p className="text-caption text-muted-foreground mb-4">
									Set the hours for each day
								</p>
							</div>
						</div>
					</div>
				);

			case 4:
				return (
					<div className="space-y-6">
						<div>
							<h2 className="text-subheading font-bold text-foreground mb-2">
								Photos
							</h2>
							<p className="text-body text-muted-foreground">
								Show off this amazing spot (max 5 photos)
							</p>
						</div>

						<div className="space-y-4">
							<div
								className={cn(
									"border-2 border-dashed rounded-lg p-8 text-center transition-colors",
									errors.images
										? "border-destructive"
										: "border-border hover:border-primary"
								)}
							>
								<input
									type="file"
									multiple
									accept="image/*"
									onChange={handleImageUpload}
									className="hidden"
									id="image-upload"
									disabled={form.photo_urls.length >= 5}
								/>
								<label
									htmlFor="image-upload"
									className={cn(
										"cursor-pointer",
										form.photo_urls.length >= 5 &&
											"cursor-not-allowed opacity-50"
									)}
								>
									<Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-body font-medium text-foreground mb-2">
										{form.photo_urls.length >= 5
											? "Maximum photos reached"
											: "Upload Photos"}
									</p>
									<p className="text-caption text-muted-foreground">
										Drag and drop or click to select ({form.photo_urls.length}
										/5)
									</p>
								</label>
							</div>

							{errors.images && (
								<p className="text-caption text-destructive flex items-center">
									<AlertCircle className="h-3 w-3 mr-1" />
									{errors.images}
								</p>
							)}

							{form.photo_urls.length > 0 && (
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									{form.photo_urls.map((url, index) => (
										<div key={index} className="relative group">
											<img
												src={url || "/placeholder.svg"}
												alt={`Upload ${index + 1}`}
												className="w-full h-32 object-cover rounded-lg"
											/>
											<Button
												variant="destructive"
												size="icon"
												className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={() => removeImage(index)}
											>
												<X className="h-3 w-3" />
											</Button>
											{index === 0 && (
												<Badge className="absolute bottom-2 left-2 text-xs">
													Main Photo
												</Badge>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-3">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => router.back()}
								className="text-foreground hover:bg-accent"
							>
								<ArrowLeft className="h-5 w-5" />
							</Button>
							<div>
								<h1 className="text-subheading font-bold text-foreground">
									Add Amala Spot
								</h1>
								<p className="text-caption hidden sm:block">
									Share a great spot with the community
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<span className="text-caption text-muted-foreground">
								Step {currentStep} of {totalSteps}
							</span>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<div className="flex items-center justify-between mb-2">
						{Array.from({ length: totalSteps }, (_, i) => (
							<div
								key={i}
								className={cn(
									"flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
									i + 1 <= currentStep
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								)}
							>
								{i + 1 <= currentStep ? (
									<CheckCircle className="h-4 w-4" />
								) : (
									i + 1
								)}
							</div>
						))}
					</div>
					<div className="w-full bg-muted rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300"
							style={{ width: `${(currentStep / totalSteps) * 100}%` }}
						/>
					</div>
				</div>

				<Card>
					<CardContent className="p-6 sm:p-8">
						{isVerifying && (
							<div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
									<div>
										<h3 className="font-semibold text-primary">
											AI Verification in Progress
										</h3>
										<p className="text-sm text-muted-foreground">
											Our AI is analyzing your submission for authenticity and
											accuracy...
										</p>
									</div>
								</div>
							</div>
						)}

						{verificationResult && !isVerifying && (
							<div className="mb-6 p-4 border rounded-lg">
								<div className="flex items-center space-x-3 mb-3">
									{verificationResult.status === "verified" ? (
										<CheckCircle className="h-5 w-5 text-green-600" />
									) : verificationResult.status === "uncertain" ? (
										<AlertCircle className="h-5 w-5 text-yellow-600" />
									) : (
										<AlertCircle className="h-5 w-5 text-red-600" />
									)}
									<div>
										<h3 className="font-semibold">
											AI Verification:{" "}
											{verificationResult.status.charAt(0).toUpperCase() +
												verificationResult.status.slice(1)}
										</h3>
										<p className="text-sm text-muted-foreground">
											Confidence Score: {verificationResult.score}%
										</p>
									</div>
								</div>

								<div className="space-y-2">
									<p className="text-sm font-medium">Key Findings:</p>
									<ul className="space-y-1">
										{verificationResult.reasons
											?.slice(0, 3)
											.map((reason: string, index: number) => (
												<li
													key={index}
													className="text-sm text-muted-foreground flex items-start space-x-2"
												>
													<div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
													<span>{reason}</span>
												</li>
											))}
									</ul>
								</div>
							</div>
						)}

						{renderStep()}
					</CardContent>
				</Card>

				<div className="flex items-center justify-between mt-8">
					<Button
						variant="outline"
						onClick={prevStep}
						disabled={currentStep === 1 || isSubmitting}
						className="bg-transparent"
					>
						Previous
					</Button>

					<div className="flex space-x-3">
						{currentStep < totalSteps ? (
							<Button
								onClick={nextStep}
								disabled={isSubmitting}
								className="bg-primary hover:bg-primary/90"
							>
								Next Step
							</Button>
						) : (
							<Button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className="bg-primary hover:bg-primary/90"
							>
								{isSubmitting ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
										{isVerifying ? "AI Verifying..." : "Submitting..."}
									</>
								) : (
									<>
										<Utensils className="h-4 w-4 mr-2" />
										Submit Spot
									</>
								)}
							</Button>
						)}
					</div>
				</div>

				<Card className="mt-8 bg-muted/50">
					<CardContent className="p-6">
						<h3 className="text-subheading font-bold text-foreground mb-3">
							Submission Guidelines
						</h3>
						<ul className="space-y-2 text-body text-muted-foreground">
							<li className="flex items-start space-x-2">
								<CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
								<span>Only submit spots that actually serve Amala</span>
							</li>
							<li className="flex items-start space-x-2">
								<CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
								<span>Provide accurate information and recent photos</span>
							</li>
							<li className="flex items-start space-x-2">
								<CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
								<span>Be respectful and honest in your descriptions</span>
							</li>
							<li className="flex items-start space-x-2">
								<CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
								<span>All submissions will be reviewed by the community</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
