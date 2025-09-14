export interface AmalaSspot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  rating: number;
  reviewCount: number;
  distance?: string;
  isVerified: boolean;
  verificationStatus: "verified" | "pending" | "unverified";
  isFavorite?: boolean;
  imageUrl: string;
  images?: string[];
  priceRange: "$" | "$$" | "$$$";
  cuisine: string[];
  openNow: boolean;
  submittedBy: string;
  submittedDate: string;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  ai_generated: boolean;
  phoneNumber?: string;
  website?: string;
  hours?: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  tags?: string[];
  averagePrice?: number;
}

export interface AmalaReview {
  id: string;
  spotId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  tags?: string[];
}

export interface AmalaVote {
  id: string;
  spotId: string;
  userId: string;
  type: "upvote" | "downvote";
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isVerified: boolean;
  reviewCount: number;
  spotsSubmitted: number;
  createdAt: Date;
  bio?: string;
  favoriteSpots: string[];
}
