const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Project & Task Management API',
    version: '1.0.0',
    description:
      'REST API for authentication, projects and tasks. Uses JWT auth. All non-auth routes require Authorization: Bearer <token>.\n\nDefault base path: /api',
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth' },
    { name: 'Projects' },
    { name: 'Tasks' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          status: { type: 'integer', example: 200 },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'gender'],
        properties: {
          name: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              gender: { type: 'string' },
            },
          },
        },
      },
      Project: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date', nullable: true },
          status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] },
          createdBy: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProjectCreateRequest: {
        type: 'object',
        required: ['name', 'startDate', 'status'],
        properties: {
          name: { type: 'string', minLength: 3 },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date', nullable: true },
          status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] },
        },
      },
      ProjectUpdateRequest: {
        $ref: '#/components/schemas/ProjectCreateRequest',
      },
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          project: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          dueDate: { type: 'string', format: 'date', nullable: true },
          status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TaskCreateRequest: {
        type: 'object',
        required: ['project', 'title', 'status'],
        properties: {
          project: { type: 'string' },
          title: { type: 'string', minLength: 3 },
          description: { type: 'string' },
          dueDate: { type: 'string', format: 'date', nullable: true },
          status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] },
        },
      },
      TaskUpdateRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3 },
          description: { type: 'string' },
          dueDate: { type: 'string', format: 'date', nullable: true },
          status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] },
        },
      },
      PaginatedProjects: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already exists' },
        },
        security: [],
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': { description: 'Invalid credentials' },
        },
        security: [],
      },
    },

    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects with search/filter/sort/pagination',
        parameters: [
          { in: 'query', name: 'q', schema: { type: 'string' } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] } },
          { in: 'query', name: 'sort', schema: { type: 'string', enum: ['startDate'] } },
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedProjects' } } } },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectCreateRequest' } } },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Projects'],
        summary: 'Update project',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectUpdateRequest' } } },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '400': { description: 'Validation error' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Deleted' },
          '404': { description: 'Not found' },
        },
      },
    },

    '/tasks/project/{projectId}': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks by project',
        parameters: [{ in: 'path', name: 'projectId', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } } } },
          },
          '404': { description: 'Not found' },
        },
      },
    },
    '/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create task',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskCreateRequest' } } },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/tasks/{id}': {
      put: {
        tags: ['Tasks'],
        summary: 'Update task',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskUpdateRequest' } } },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
          '400': { description: 'Validation error' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Deleted' },
          '404': { description: 'Not found' },
        },
      },
    },
  },
};

export default swaggerSpec;
