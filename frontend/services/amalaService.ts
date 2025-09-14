import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  runTransaction,
  GeoPoint,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../lib/firebase";
import {
  AmalaSspot,
  AmalaReview,
  AmalaVote,
  UserProfile,
} from "../types/amala";

export class AmalaService {
  // Collection references
  private spotsCollection = collection(db, "amalaSpots");
  private reviewsCollection = collection(db, "reviews");
  private votesCollection = collection(db, "votes");
  private usersCollection = collection(db, "users");

  // ===========================================
  // AMALA SPOTS METHODS
  // ===========================================

  async createSpot(
    spotData: Omit<AmalaSspot, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(this.spotsCollection, {
        ...spotData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        rating: 0,
        reviewCount: 0,
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating spot:", error);
      throw error;
    }
  }

  async updateSpot(
    spotId: string,
    updates: Partial<AmalaSspot>
  ): Promise<void> {
    try {
      const spotRef = doc(this.spotsCollection, spotId);
      await updateDoc(spotRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating spot:", error);
      throw error;
    }
  }

  async getSpot(spotId: string): Promise<AmalaSspot | null> {
    try {
      const spotDoc = await getDoc(doc(this.spotsCollection, spotId));
      if (spotDoc.exists()) {
        const data = spotDoc.data();
        return {
          id: spotDoc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as AmalaSspot;
      }
      return null;
    } catch (error) {
      console.error("Error getting spot:", error);
      throw error;
    }
  }

  async getAllSpots(
    lastDoc?: QueryDocumentSnapshot,
    limitCount = 20
  ): Promise<{
    spots: AmalaSspot[];
    lastDoc: QueryDocumentSnapshot | null;
    hasMore: boolean;
  }> {
    try {
      let q = query(
        this.spotsCollection,
        orderBy("createdAt", "desc"),
        limit(limitCount + 1)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const spots: AmalaSspot[] = [];
      const docs = snapshot.docs;

      docs.slice(0, limitCount).forEach((doc) => {
        const data = doc.data();
        spots.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as AmalaSspot);
      });

      return {
        spots,
        lastDoc: docs.length > limitCount ? docs[limitCount - 1] : null,
        hasMore: docs.length > limitCount,
      };
    } catch (error) {
      console.error("Error getting spots:", error);
      throw error;
    }
  }

  async getVerifiedSpots(): Promise<AmalaSspot[]> {
    try {
      const q = query(
        this.spotsCollection,
        where("verificationStatus", "==", "verified"),
        orderBy("rating", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as AmalaSspot;
      });
    } catch (error) {
      console.error("Error getting verified spots:", error);
      throw error;
    }
  }

  async searchSpots(searchTerm: string): Promise<AmalaSspot[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation. Consider using Algolia or similar for production
      const q = query(
        this.spotsCollection,
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff"),
        orderBy("name"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as AmalaSspot;
      });
    } catch (error) {
      console.error("Error searching spots:", error);
      throw error;
    }
  }

  async verifySpot(spotId: string, isVerified: boolean): Promise<void> {
    try {
      const spotRef = doc(this.spotsCollection, spotId);
      await updateDoc(spotRef, {
        isVerified,
        verificationStatus: isVerified ? "verified" : "unverified",
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error verifying spot:", error);
      throw error;
    }
  }

  async deleteSpot(spotId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.spotsCollection, spotId));
      // Also delete related reviews and votes
      await this.deleteSpotReviews(spotId);
      await this.deleteSpotVotes(spotId);
    } catch (error) {
      console.error("Error deleting spot:", error);
      throw error;
    }
  }

  // ===========================================
  // REVIEWS METHODS
  // ===========================================

  async addReview(
    reviewData: Omit<AmalaReview, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      return await runTransaction(db, async (transaction) => {
        const reviewRef = doc(this.reviewsCollection);
        const spotRef = doc(this.spotsCollection, reviewData.spotId);

        // Get current spot data
        const spotDoc = await transaction.get(spotRef);
        if (!spotDoc.exists()) {
          throw new Error("Spot not found");
        }

        const spotData = spotDoc.data();
        const currentRating = spotData.rating || 0;
        const currentReviewCount = spotData.reviewCount || 0;

        // Calculate new rating
        const newReviewCount = currentReviewCount + 1;
        const newRating =
          (currentRating * currentReviewCount + reviewData.rating) /
          newReviewCount;

        // Create review
        transaction.set(reviewRef, {
          ...reviewData,
          id: reviewRef.id,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          helpfulVotes: 0,
        });

        // Update spot rating and review count
        transaction.update(spotRef, {
          rating: Math.round(newRating * 10) / 10, // Round to 1 decimal
          reviewCount: newReviewCount,
          updatedAt: Timestamp.now(),
        });

        return reviewRef.id;
      });
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  }

  async getSpotReviews(
    spotId: string,
    limitCount = 10
  ): Promise<AmalaReview[]> {
    try {
      const q = query(
        this.reviewsCollection,
        where("spotId", "==", spotId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as AmalaReview;
      });
    } catch (error) {
      console.error("Error getting reviews:", error);
      throw error;
    }
  }

  async updateReview(
    reviewId: string,
    updates: Partial<AmalaReview>
  ): Promise<void> {
    try {
      const reviewRef = doc(this.reviewsCollection, reviewId);
      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const reviewRef = doc(this.reviewsCollection, reviewId);
        const reviewDoc = await transaction.get(reviewRef);

        if (!reviewDoc.exists()) {
          throw new Error("Review not found");
        }

        const reviewData = reviewDoc.data();
        const spotRef = doc(this.spotsCollection, reviewData.spotId);
        const spotDoc = await transaction.get(spotRef);

        if (spotDoc.exists()) {
          const spotData = spotDoc.data();
          const currentRating = spotData.rating || 0;
          const currentReviewCount = spotData.reviewCount || 0;

          if (currentReviewCount > 1) {
            // Recalculate rating without this review
            const newReviewCount = currentReviewCount - 1;
            const totalRating = currentRating * currentReviewCount;
            const newRating =
              (totalRating - reviewData.rating) / newReviewCount;

            transaction.update(spotRef, {
              rating: Math.round(newRating * 10) / 10,
              reviewCount: newReviewCount,
              updatedAt: Timestamp.now(),
            });
          } else {
            // This was the only review
            transaction.update(spotRef, {
              rating: 0,
              reviewCount: 0,
              updatedAt: Timestamp.now(),
            });
          }
        }

        transaction.delete(reviewRef);
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  }

  private async deleteSpotReviews(spotId: string): Promise<void> {
    const q = query(this.reviewsCollection, where("spotId", "==", spotId));
    const snapshot = await getDocs(q);
    const batch = [];
    for (const doc of snapshot.docs) {
      batch.push(deleteDoc(doc.ref));
    }
    await Promise.all(batch);
  }

  // ===========================================
  // VOTING METHODS
  // ===========================================

  async voteSpot(
    spotId: string,
    userId: string,
    voteType: "upvote" | "downvote"
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const spotRef = doc(this.spotsCollection, spotId);
        const existingVoteQuery = query(
          this.votesCollection,
          where("spotId", "==", spotId),
          where("userId", "==", userId)
        );

        const existingVotes = await getDocs(existingVoteQuery);
        const spotDoc = await transaction.get(spotRef);

        if (!spotDoc.exists()) {
          throw new Error("Spot not found");
        }

        let upvoteChange = 0;
        let downvoteChange = 0;

        // Remove existing vote if any
        if (!existingVotes.empty) {
          const existingVote = existingVotes.docs[0];
          const existingVoteData = existingVote.data();

          if (existingVoteData.type === "upvote") {
            upvoteChange -= 1;
          } else {
            downvoteChange -= 1;
          }

          transaction.delete(existingVote.ref);

          // If same vote type, just remove and exit
          if (existingVoteData.type === voteType) {
            transaction.update(spotRef, {
              upvotes: increment(upvoteChange),
              downvotes: increment(downvoteChange),
              totalVotes: increment(upvoteChange + downvoteChange),
              updatedAt: Timestamp.now(),
            });
            return;
          }
        }

        // Add new vote
        const voteRef = doc(this.votesCollection);
        transaction.set(voteRef, {
          spotId,
          userId,
          type: voteType,
          createdAt: Timestamp.now(),
        });

        if (voteType === "upvote") {
          upvoteChange += 1;
        } else {
          downvoteChange += 1;
        }

        transaction.update(spotRef, {
          upvotes: increment(upvoteChange),
          downvotes: increment(downvoteChange),
          totalVotes: increment(upvoteChange + downvoteChange),
          updatedAt: Timestamp.now(),
        });
      });
    } catch (error) {
      console.error("Error voting on spot:", error);
      throw error;
    }
  }

  async getUserVote(spotId: string, userId: string): Promise<AmalaVote | null> {
    try {
      const q = query(
        this.votesCollection,
        where("spotId", "==", spotId),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as AmalaVote;
      }
      return null;
    } catch (error) {
      console.error("Error getting user vote:", error);
      throw error;
    }
  }

  private async deleteSpotVotes(spotId: string): Promise<void> {
    const q = query(this.votesCollection, where("spotId", "==", spotId));
    const snapshot = await getDocs(q);
    const batch = [];
    for (const doc of snapshot.docs) {
      batch.push(deleteDoc(doc.ref));
    }
    await Promise.all(batch);
  }

  // ===========================================
  // IMAGE UPLOAD METHODS
  // ===========================================

  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const imageRef = ref(storage, path);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  async deleteImage(path: string): Promise<void> {
    try {
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  // ===========================================
  // USER PROFILE METHODS
  // ===========================================

  async createUserProfile(
    userData: Omit<UserProfile, "createdAt">
  ): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, userData.id);
      await updateDoc(userRef, {
        ...userData,
        createdAt: Timestamp.now(),
        reviewCount: 0,
        spotsSubmitted: 0,
        favoriteSpots: [],
      });
    } catch (error) {
      // If document doesn't exist, create it
      const userRef = doc(this.usersCollection, userData.id);
      await addDoc(this.usersCollection, {
        ...userData,
        createdAt: Timestamp.now(),
        reviewCount: 0,
        spotsSubmitted: 0,
        favoriteSpots: [],
      });
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.usersCollection, userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  async toggleFavoriteSpot(
    userId: string,
    spotId: string,
    isFavorite: boolean
  ): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, userId);
      if (isFavorite) {
        await updateDoc(userRef, {
          favoriteSpots: arrayUnion(spotId),
        });
      } else {
        await updateDoc(userRef, {
          favoriteSpots: arrayRemove(spotId),
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const amalaService = new AmalaService();