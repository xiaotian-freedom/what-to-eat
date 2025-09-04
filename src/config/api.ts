// API Configuration
export const API_CONFIG = {
  // Base URL - 会被vite代理到后端服务器
  BASE_URL: '/api',

  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USERS_ME: '/auth/users/me',
    RESET_PASSWORD: '/auth/reset-password',
    RESET_PASSWORD_VERIFY: '/auth/reset-password-verify',
  },

  // User preferences endpoints
  USER_PREFERENCES: {
    GET_MY_PREFERENCES: '/me/preferences',
    UPDATE_MY_PREFERENCES: '/me/preferences',
    CREATE_MY_PREFERENCES: '/me/preferences',
    DELETE_MY_PREFERENCES: '/me/preferences',
  },

  // Favorites endpoints
  FAVORITES: {
    GET_MY_FAVORITES: '/me/favorites',
    ADD_FAVORITE: '/me/favorites',
    GET_FAVORITE: '/me/favorites',
    UPDATE_FAVORITE: '/me/favorites',
    REMOVE_FAVORITE: '/me/favorites',
    CHECK_FAVORITE: '/me/favorites/check',
    SEARCH_FAVORITES: '/me/favorites/search',
  },

  // Challenge endpoints
  CHALLENGES: {
    GET_MY_CHALLENGE_STATS: '/me/challenges',
    USE_CHALLENGE: '/me/challenges/use',
    GET_TRIED_DISHES: '/me/challenges/tried-dishes',
    RESET_DAILY_USES: '/me/challenges/reset-daily',
    UPDATE_CHALLENGE_SETTINGS: '/me/challenges/settings',
    GET_CHALLENGE_LEADERBOARD: '/me/challenges/leaderboard',
  },

  // Achievement endpoints
  ACHIEVEMENTS: {
    GET_MY_ACHIEVEMENTS: '/me/achievements',
    CREATE_ACHIEVEMENT: '/me/achievements',
    GET_ACHIEVEMENT: '/me/achievements',
    UPDATE_ACHIEVEMENT: '/me/achievements',
    UPDATE_ACHIEVEMENT_PROGRESS: '/me/achievements/progress',
    UNLOCK_ACHIEVEMENT: '/me/achievements/unlock',
    GET_ACHIEVEMENT_STATS: '/me/achievements/stats',
  },

  // Choice history endpoints
  CHOICE_HISTORY: {
    GET_MY_CHOICE_HISTORY: '/me/choice-history',
    RECORD_CHOICE: '/me/choice-history',
    GET_CHOICE_DETAIL: '/me/choice-history',
    UPDATE_CHOICE: '/me/choice-history',
    GET_CHOICE_STATS: '/me/choice-history/stats',
    SEARCH_CHOICE_HISTORY: '/me/choice-history/search',
    GET_CHOICE_ANALYTICS: '/me/choice-history/analytics',
  },

  // Session endpoints
  SESSIONS: {
    GET_MY_SESSIONS: '/me/sessions',
    CREATE_SESSION: '/me/sessions',
    REVOKE_ALL_SESSIONS: '/me/sessions',
    GET_SESSION: '/me/sessions',
    REVOKE_SESSION: '/me/sessions',
    CLEANUP_EXPIRED_SESSIONS: '/me/sessions/expired',
    GET_SESSION_STATS: '/me/sessions/stats',
  },

  // Food endpoints
  FOODS: {
    GET_CATEGORIES: '/foods/categories',
    CREATE_CATEGORY: '/foods/categories',
    UPDATE_CATEGORY: '/foods/categories',
    GET_CUISINES: '/foods/cuisines',
    CREATE_CUISINE: '/foods/cuisines',
    UPDATE_CUISINE: '/foods/cuisines',
    GET_FOODS: '/foods',
    CREATE_FOOD: '/foods',
    GET_FOOD: '/foods',
    UPDATE_FOOD: '/foods',
    DELETE_FOOD: '/foods',
    GET_RECOMMENDATIONS_BY_WEATHER: '/foods/recommendations/weather',
    GET_RECOMMENDATIONS_BY_MOOD: '/foods/recommendations/mood',
    GET_COMFORT_FOODS: '/foods/recommendations/comfort',
    GET_POPULAR_FOODS: '/foods/recommendations/popular',
  },

  // Upload endpoints
  UPLOAD: {
    GET_QINIU_TOKEN: '/upload/qiniu-token',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  code?: number;
}

// Error Response Type
export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}
