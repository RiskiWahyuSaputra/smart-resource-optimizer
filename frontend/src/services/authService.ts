import axios from '@/lib/axios';

export const register = async (data: any) => {
  const response = await axios.post('/register', data);
  return response.data;
};

export const login = async (data: any) => {
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
