import { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { amalaService } from "../services/amalaService";
import { AmalaSspot, AmalaReview, AmalaVote } from "../types/amala";

export function useAmalaSpots() {
  const [user] = useAuthState(auth);
  const [spots, setSpots] = useState<AmalaSspot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const fetchSpots = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const result = await amalaService.getAllSpots(
          reset ? undefined : lastDoc,
          20
        );

        if (reset) {
          setSpots(result.spots);
        } else {
          setSpots((prev) => [...prev, ...result.spots]);
        }

        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch spots");
      } finally {
        setLoading(false);
      }
    },
    [lastDoc]
  );

  const createSpot = useCallback(
    async (spotData: Omit<AmalaSspot, "id" | "createdAt" | "updatedAt">) => {
      try {
        setLoading(true);
        const spotId = await amalaService.createSpot({
          ...spotData,
          submittedBy: user?.uid || "anonymous",
          submittedDate: new Date().toISOString(),
        });

        // Refresh spots
        await fetchSpots(true);
        return spotId;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create spot");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchSpots]
  );

  const updateSpot = useCallback(
    async (spotId: string, updates: Partial<AmalaSspot>) => {
      try {
        await amalaService.updateSpot(spotId, updates);

        // Update local state
        setSpots((prev) =>
          prev.map((spot) =>
            spot.id === spotId ? { ...spot, ...updates } : spot
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update spot");
        throw err;
      }
    },
    []
  );

  const deleteSpot = useCallback(async (spotId: string) => {
    try {
      await amalaService.deleteSpot(spotId);

      // Remove from local state
      setSpots((prev) => prev.filter((spot) => spot.id !== spotId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete spot");
      throw err;
    }
  }, []);

  const voteSpot = useCallback(
    async (spotId: string, voteType: "upvote" | "downvote") => {
      if (!user) throw new Error("Must be logged in to vote");

      try {
        await amalaService.voteSpot(spotId, user.uid, voteType);

        // Refresh the specific spot
        const updatedSpot = await amalaService.getSpot(spotId);
        if (updatedSpot) {
          setSpots((prev) =>
            prev.map((spot) => (spot.id === spotId ? updatedSpot : spot))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to vote");
        throw err;
      }
    },
    [user]
  );

  useEffect(() => {
    fetchSpots(true);
  }, []);

  return {
    spots,
    loading,
    error,
    hasMore,
    fetchSpots,
    createSpot,
    updateSpot,
    deleteSpot,
    voteSpot,
    refreshSpots: () => fetchSpots(true),
    loadMoreSpots: () => fetchSpots(false),
  };
}

export function useSpotReviews(spotId: string) {
  const [user] = useAuthState(auth);
  const [reviews, setReviews] = useState<AmalaReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const spotReviews = await amalaService.getSpotReviews(spotId);
      setReviews(spotReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, [spotId]);

  const addReview = useCallback(
    async (
      reviewData: Omit<
        AmalaReview,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "userId"
        | "userDisplayName"
        | "userPhotoURL"
      >
    ) => {
      if (!user) throw new Error("Must be logged in to review");

      try {
        setLoading(true);
        await amalaService.addReview({
          ...reviewData,
          spotId,
          userId: user.uid,
          userDisplayName: user.displayName || "Anonymous",
          userPhotoURL: user.photoURL || undefined,
          isVerified: false,
        });

        // Refresh reviews
        await fetchReviews();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add review");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, spotId, fetchReviews]
  );

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      await amalaService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
      throw err;
    }
  }, []);

  useEffect(() => {
    if (spotId) {
      fetchReviews();
    }
  }, [spotId, fetchReviews]);

  return {
    reviews,
    loading,
    error,
    addReview,
    deleteReview,
    refreshReviews: fetchReviews,
  };
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (
      file: File,
      folder: "spots" | "reviews" = "spots"
    ): Promise<string> => {
      try {
        setUploading(true);
        setError(null);

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const path = `${folder}/${fileName}`;

        const url = await amalaService.uploadImage(file, path);
        return url;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload image";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const uploadMultipleImages = useCallback(
    async (
      files: File[],
      folder: "spots" | "reviews" = "spots"
    ): Promise<string[]> => {
      const uploadPromises = files.map((file) => uploadImage(file, folder));
      return Promise.all(uploadPromises);
    },
    [uploadImage]
  );

  return {
    uploadImage,
    uploadMultipleImages,
    uploading,
    error,
  };
}

export function useUserVote(spotId: string) {
  const [user] = useAuthState(auth);
  const [vote, setVote] = useState<AmalaVote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && spotId) {
      const fetchVote = async () => {
        try {
          setLoading(true);
          const userVote = await amalaService.getUserVote(spotId, user.uid);
          setVote(userVote);
        } catch (error) {
          console.error("Error fetching user vote:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchVote();
    }
  }, [user, spotId]);

  return { vote, loading };
}
