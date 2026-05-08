import axios from '@/lib/axios';

export const register = async (data: FormData | Record<string, unknown>) => {
  const response = await axios.post('/register', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return response.data;
};

export const login = async (data: Record<string, unknown>) => {
  const response = await axios.post('/login', data);
  return response.data;
};

export const logout = async () => {
  const response = await axios.post('/logout');
  return response.data;
};

export const getProfile = async () => {
  const response = await axios.get('/user');
  return response.data;
};

export const getVerificationUsers = async (status: 'pending' | 'verified' | 'rejected' | 'all' = 'all') => {
  const response = await axios.get('/admin/users', {
    params: { status },
  });
  return response.data;
};

export const verifyUser = async (userId: number, status: 'verified' | 'rejected') => {
  const response = await axios.patch(`/admin/verify/${userId}`, { status });
  return response.data;
};

export const getVerificationDocument = async (userId: number) => {
  const response = await axios.get(`/admin/users/${userId}/document`, {
    responseType: 'blob',
  });
  return response.data as Blob;
};
