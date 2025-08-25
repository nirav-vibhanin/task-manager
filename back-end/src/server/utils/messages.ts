// Centralized messages (kept as JS as requested)
export const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: 'Registration successful',
    LOGIN_SUCCESS: 'Login successful',
    EMAIL_EXISTS: 'Email already in use',
    INVALID_CREDENTIALS: 'Invalid email or password'
  },
  PROJECT: {
    CREATED: 'Project created successfully',
    UPDATED: 'Project updated successfully',
    DELETED: 'Project deleted successfully',
    NOT_FOUND: 'Project not found'
  },
  TASK: {
    CREATED: 'Task created successfully',
    UPDATED: 'Task updated successfully',
    DELETED: 'Task deleted successfully',
    NOT_FOUND: 'Task not found',
    TITLE_EXISTS: 'Task title already exists in this project'
  },
  COMMON: {
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    BAD_REQUEST: 'Bad request'
  }
};
