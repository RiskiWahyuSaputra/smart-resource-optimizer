import axios from '@/lib/axios';

export type MarketplaceFoodPost = {
  id: number;
  title: string;
  description?: string | null;
  quantity: number;
  quantity_unit: string;
  pickup_address: string;
  lat?: number | string | null;
  long?: number | string | null;
  available_until: string;
  image_url?: string | null;
  status: 'available' | 'claimed' | 'completed' | 'expired';
  created_at?: string;
  updated_at?: string;
  user: {
    id: number;
    name: string;
    profile?: {
      name?: string;
      address?: string;
      store_image_url?: string;
    } | null;
  };
};

export type FoodPostPayload = {
  title: string;
  description?: string;
  quantity: number;
  quantity_unit: string;
  pickup_address: string;
  lat?: number | null;
  long?: number | null;
  available_until: string;
  image_url?: string;
  status?: 'available' | 'claimed' | 'completed' | 'expired';
};

export type MarketplaceClaim = {
  id: number;
  quantity: number;
  notes?: string | null;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';
  created_at?: string;
  updated_at?: string;
  food_post: MarketplaceFoodPost;
  user?: {
    id: number;
    name: string;
    email: string;
    profile?: {
      name?: string;
      address?: string;
    } | null;
  };
};

export const getFoodPosts = async (search?: string) => {
  const response = await axios.get('/food-posts', {
    params: {
      status: 'available',
      search: search || undefined,
    },
  });

  return response.data as { food_posts: MarketplaceFoodPost[] };
};

export const getMyFoodPosts = async () => {
  const response = await axios.get('/my-food-posts');
  return response.data as { food_posts: MarketplaceFoodPost[] };
};

export const createFoodPost = async (payload: FoodPostPayload | FormData) => {
  const response = await axios.post('/food-posts', payload);
  return response.data as { food_post: MarketplaceFoodPost };
};

export const updateFoodPost = async (
  foodPostId: number,
  payload: Partial<FoodPostPayload>
) => {
  const response = await axios.patch(`/food-posts/${foodPostId}`, payload);
  return response.data as { food_post: MarketplaceFoodPost };
};

export const getMyClaims = async () => {
  const response = await axios.get('/claims');
  return response.data as { claims: MarketplaceClaim[] };
};

export const getIncomingClaims = async () => {
  const response = await axios.get('/incoming-claims');
  return response.data as { claims: MarketplaceClaim[] };
};

export const updateClaimStatus = async (
  claimId: number,
  status: MarketplaceClaim['status']
) => {
  const response = await axios.patch(`/claims/${claimId}`, { status });
  return response.data as { claim: MarketplaceClaim };
};

export const claimFoodPost = async (foodPostId: number, quantity = 1, notes?: string) => {
  const response = await axios.post(`/food-posts/${foodPostId}/claims`, {
    quantity,
    notes,
  });

  return response.data;
};
