import { api } from './api';

export interface Task {
  _id: string;
  project: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'Pending'|'In Progress'|'Completed';
}

export const taskApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTaskById: build.query<{ task: Task }, string>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response: { status: number; data: { task: Task } }) => response.data,
      providesTags: (result, _e, id) => [{ type: 'Task' as const, id }]
    }),
    getTasksByProject: build.query<{ items: Task[] }, { projectId: string; q?: string }>({
      query: ({ projectId, q }) => {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        const qs = params.toString();
        return `/tasks/project/${projectId}${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: { status: number; data: { items: Task[] } }) => response.data,
      providesTags: (result, _e, { projectId }) => [
        { type: 'Task' as const, id: `LIST-${projectId}` }
      ]
    }),
    createTask: build.mutation<any, Partial<Task>>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: (r, e, body) => [{ type: 'Task', id: `LIST-${body.project}` }]
    }),
    updateTask: build.mutation<any, { id: string; body: Partial<Task> }>({
      query: ({ id, body }) => ({ url: `/tasks/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { body }) => body?.project
        ? [{ type: 'Task', id: `LIST-${body.project}` }]
        : [{ type: 'Task', id: 'LIST' }]
    }),
    deleteTask: build.mutation<any, { id: string; projectId: string }>({
      query: ({ id }) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: (r, e, { projectId }) => [{ type: 'Task', id: `LIST-${projectId}` }]
    })
  })
});

export const { useGetTaskByIdQuery, useGetTasksByProjectQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = taskApi;
