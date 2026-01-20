// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// ============ Auth API ============

export const authAPI = {
  signup: async (username, secretPhrase) => {
    const data = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, secret_phrase: secretPhrase }),
      skipAuth: true,
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  login: async (username, secretPhrase) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, secret_phrase: secretPhrase }),
      skipAuth: true,
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  logout: () => {
    clearAuthToken();
  },

  getCurrentUser: async () => {
    return apiRequest('/api/auth/me');
  },
};

// ============ Messages API ============

export const messagesAPI = {
  getMessages: async () => {
    return apiRequest('/api/messages/');
  },

  sendMessage: async (receiverUsername, content) => {
    return apiRequest('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiver_username: receiverUsername, content }),
      skipAuth: true, // Allow anonymous messages
    });
  },

  updateMessageStatus: async (messageId, status) => {
    return apiRequest(`/api/messages/${messageId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteMessage: async (messageId) => {
    return apiRequest(`/api/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Links API ============

export const linksAPI = {
  getLinks: async () => {
    return apiRequest('/api/links/', {
      skipAuth: true,
    });
  },

  createLink: async (temporaryName, expirationMinutes = 60) => {
    return apiRequest('/api/links/create', {
      method: 'POST',
      body: JSON.stringify({ temporary_name: temporaryName, expiration_minutes: expirationMinutes }),
      skipAuth: true,
    });
  },

  getLink: async (linkId) => {
    return apiRequest(`/api/links/get/${linkId}`, {
      skipAuth: true,
    });
  },
};

// ============ Users API ============

export const usersAPI = {
  searchUsers: async (username) => {
    return apiRequest('/api/users/search', {
      method: 'POST',
      body: JSON.stringify({ username }),
      skipAuth: true,
    });
  },

  addFriend: async (friendUsername) => {
    return apiRequest('/api/users/friends/add', {
      method: 'POST',
      body: JSON.stringify({ friend_username: friendUsername }),
    });
  },

  getFriends: async () => {
    return apiRequest('/api/users/friends');
  },
};
