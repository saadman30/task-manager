/**
 * Route path constants
 * Using Object.freeze to make the object immutable
 */
export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  TASKS: '/tasks',
});

/**
 * Get route paths with parameters
 */
export const getRoutePath = {
  home: () => ROUTES.HOME,
  login: () => ROUTES.LOGIN,
  tasks: () => ROUTES.TASKS,
};

/**
 * Navigation helper functions
 */
export const navigate = {
  toHome: () => ROUTES.HOME,
  toLogin: () => ROUTES.LOGIN,
  toTasks: () => ROUTES.TASKS,
}; 