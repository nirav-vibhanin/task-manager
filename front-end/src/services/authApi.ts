import { api } from './api';

type LoginReq = { email: string; password: string };
interface LoginRes { token: string; user: { id: string; name: string; email: string } }

type RegisterReq = { name: string; email: string; password: string; gender: 'Male'|'Female'|'Other' };

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginRes, LoginReq>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: { status: number; data: LoginRes }) => response.data
    }),
    register: build.mutation<{ id: string; email: string; name: string }, RegisterReq>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (response: { status: number; data: { id: string; email: string; name: string } }) => response.data
    })
  })
});

export const { useLoginMutation, useRegisterMutation } = authApi;
