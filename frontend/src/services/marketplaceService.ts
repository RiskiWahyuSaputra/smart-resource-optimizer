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
  user: {
    id: number;
    name: string;
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

export const claimFoodPost = async (foodPostId: number, quantity = 1, notes?: string) => {
  const response = await axios.post(`/food-posts/${foodPostId}/claims`, {
    quantity,
    notes,
  });

  return response.data;
};
