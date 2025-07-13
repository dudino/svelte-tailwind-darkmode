// Admin Reviews Store
// Centralized state management for review operations

import { writable, derived } from 'svelte/store';
import { getPocketBaseClient } from '../authStore';
import { deleteRecord } from '$lib/utils/deleteHandler';

// Types
interface Review {
  id: string;
  client_id: string;
  service_id?: string;
  location_id?: string;
  rating: number;
  comment: string;
  status: string;
  created: string;
  updated: string;
  expand?: any;
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  searchTerm: string;
  ratingFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Initial state
const initialState: ReviewsState = {
  reviews: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalItems: 0,
  totalPages: 0,
  searchTerm: '',
  ratingFilter: 'all',
  statusFilter: 'all',
  sortBy: 'created',
  sortOrder: 'desc'
};

// Main store
export const reviewsStore = writable<ReviewsState>(initialState);

// Derived stores
export const reviews = derived(reviewsStore, $state => $state.reviews);
export const reviewsLoading = derived(reviewsStore, $state => $state.loading);
export const reviewsError = derived(reviewsStore, $state => $state.error);
export const reviewsState = derived(reviewsStore, $state => $state);
export const reviewsCount = derived(reviewsStore, $state => $state.totalItems);

// Filtered reviews based on current filters
export const filteredReviews = derived(reviewsStore, $state => {
  return $state.reviews.filter(review => {
    const matchesSearch = !$state.searchTerm || 
      review.comment?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      review.client_id?.toLowerCase().includes($state.searchTerm.toLowerCase());
    
    const matchesRating = $state.ratingFilter === 'all' || review.rating === parseInt($state.ratingFilter);
    
    return matchesSearch && matchesRating;
  });
});

// Actions
export const reviewsActions = {
  async loadReviews(page: number = 1, itemsPerPage: number = 10) {
    reviewsStore.update(state => ({ ...state, loading: true, error: null }));

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const state = await new Promise<ReviewsState>(resolve => {
        reviewsStore.subscribe(s => resolve(s))();
      });

      // Build filter conditions
      let filter = '';
      const filterConditions = [];

      if (state.searchTerm) {
        filterConditions.push(`(comment ~ "${state.searchTerm}")`);
      }

      if (state.ratingFilter !== 'all') {
        filterConditions.push(`rating = ${state.ratingFilter}`);
      }

      if (state.statusFilter !== 'all') {
        filterConditions.push(`status = "${state.statusFilter}"`);
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' && ');
      }

      const sortString = `${state.sortOrder === 'desc' ? '-' : ''}${state.sortBy}`;

      const result = await pb.collection('reviews').getList(page, itemsPerPage, {
        filter: filter,
        sort: sortString,
        expand: 'client_id,service_id,location_id'
      });

      reviewsStore.update(state => ({
        ...state,
        reviews: result.items,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: page,
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reviews';
      reviewsStore.update(state => ({
        ...state,
        loading: false,
        error: errorMessage
      }));
    }
  },

  async createReview(reviewData: Partial<Review>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const newReview = await pb.collection('reviews').create(reviewData);
      await this.loadReviews();
      return newReview;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      reviewsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async updateReview(id: string, reviewData: Partial<Review>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const updatedReview = await pb.collection('reviews').update(id, reviewData);
      
      reviewsStore.update(state => ({
        ...state,
        reviews: state.reviews.map(review => review.id === id ? updatedReview : review)
      }));
      
      return updatedReview;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update review';
      reviewsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async deleteReview(id: string) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('reviews', id);
      
      if (result.success) {
        // Reviews don't have is_active field, so this will always be hard delete
        reviewsStore.update(state => ({
          ...state,
          reviews: state.reviews.filter(review => review.id !== id),
          totalItems: state.totalItems - 1
        }));
        
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || 'Failed to delete review';
        reviewsStore.update(state => ({ ...state, error: errorMessage }));
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
      reviewsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  // Get recent reviews for dashboard
  async getRecentReviews(limit: number = 5) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await pb.collection('reviews').getList(1, limit, {
        filter: 'status = "published"',
        sort: '-created',
        expand: 'client_id,service_id'
      });

      return result.items;
    } catch (error) {
      console.error('Failed to load recent reviews:', error);
      return [];
    }
  },

  // Get average rating
  async getAverageRating() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await pb.collection('reviews').getList(1, 1000, {
        filter: 'status = "published"',
        fields: 'rating'
      });

      if (result.items.length === 0) return 0;

      const sum = result.items.reduce((acc: number, review: any) => acc + review.rating, 0);
      return Number((sum / result.items.length).toFixed(1));
    } catch (error) {
      console.error('Failed to calculate average rating:', error);
      return 0;
    }
  },

  // Toggle review status
  async toggleReviewStatus(id: string) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      // Find the review in store
      let currentReview: Review | undefined;
      reviewsStore.subscribe(state => {
        currentReview = state.reviews.find(r => r.id === id);
      })();

      if (!currentReview) throw new Error('Review not found');

      const newStatus = currentReview.status === 'published' ? 'hidden' : 'published';
      
      const updatedReview = await pb.collection('reviews').update(id, {
        status: newStatus
      });

      reviewsStore.update(state => ({
        ...state,
        reviews: state.reviews.map(review => review.id === id ? updatedReview : review)
      }));

      return updatedReview;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle review status';
      reviewsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  setSearchTerm(term: string) {
    reviewsStore.update(state => ({ ...state, searchTerm: term, currentPage: 1 }));
  },

  setRatingFilter(rating: string) {
    reviewsStore.update(state => ({ ...state, ratingFilter: rating, currentPage: 1 }));
  },

  setStatusFilter(status: string) {
    reviewsStore.update(state => ({ ...state, statusFilter: status, currentPage: 1 }));
  },

  setSorting(sortBy: string, sortOrder: 'asc' | 'desc') {
    reviewsStore.update(state => ({ ...state, sortBy, sortOrder, currentPage: 1 }));
  },

  clearError() {
    reviewsStore.update(state => ({ ...state, error: null }));
  },

  reset() {
    reviewsStore.set(initialState);
  }
};

export default reviewsStore;
