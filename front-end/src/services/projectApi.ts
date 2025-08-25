import { api } from './api';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'Pending'|'In Progress'|'Completed';
  createdBy: string;
}

export const projectApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<{ items: Project[]; total: number; page: number; limit: number }, { q?: string; status?: string; sort?: 'asc'|'desc'; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/projects', params: (params ?? {}) as Record<string, any> }),
      transformResponse: (response: { status: number; data: { items: Project[]; total: number; page: number; limit: number } }) => response.data,
      providesTags: (result) => result ? [
        ...result.items.map((p) => ({ type: 'Project' as const, id: p._id })),
        { type: 'Project' as const, id: 'LIST' }
      ] : [{ type: 'Project' as const, id: 'LIST' }]
    }),
    getProjectById: build.query<{ project: Project; tasks: any[] }, string>({
      query: (id) => `/projects/${id}`,
      transformResponse: (response: { status: number; data: { project: Project; tasks: any[] } }) => response.data,
      providesTags: (res, _e, id) => [{ type: 'Project', id }]
    }),
    createProject: build.mutation<any, Partial<Project>>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }]
    }),
    updateProject: build.mutation<any, { id: string; body: Partial<Project> }>({
      query: ({ id, body }) => ({ url: `/projects/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Project', id }, { type: 'Project', id: 'LIST' }]
    }),
    deleteProject: build.mutation<any, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }]
    })
  })
});

export const { useGetProjectsQuery, useGetProjectByIdQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation } = projectApi;
