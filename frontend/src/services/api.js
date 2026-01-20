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
  signup: async (username, name, secretPhrase, secretAnswer) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username,
        name,
        secret_phrase: secretPhrase,
        secret_answer: secretAnswer,
      }),
      skipAuth: true,
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  login: async (username, secretAnswer) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, secret_answer: secretAnswer }),
      skipAuth: true,
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  recoverPassword: async (username) => {
    return apiRequest('/auth/recover', {
      method: 'POST',
      body: JSON.stringify({ username }),
      skipAuth: true,
    });
  },

  verifyRecovery: async (username, secretAnswer) => {
    const data = await apiRequest('/auth/recover/verify', {
      method: 'POST',
      body: JSON.stringify({ username, secret_answer: secretAnswer }),
      skipAuth: true,
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  updateSettings: async (settings) => {
    return apiRequest('/auth/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  logout: () => {
    clearAuthToken();
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// ============ Messages API ============

export const messagesAPI = {
  getMessages: async () => {
    return apiRequest('/messages/');
  },

  getInbox: async () => {
    // Fetch all messages grouped by status: inbox, public, deleted
    return apiRequest('/messages/inbox');
  },

  sendMessage: async (receiverUsername, content) => {
    return apiRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiver_username: receiverUsername, content }),
      skipAuth: true, // Allow anonymous messages
    });
  },

  updateMessageStatus: async (messageId, status) => {
    return apiRequest(`/messages/${messageId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  makeMessagePublic: async (messageId) => {
    return apiRequest(`/messages/${messageId}/make-public`, {
      method: 'PATCH',
    });
  },

  makeMessagePrivate: async (messageId) => {
    return apiRequest(`/messages/${messageId}/make-private`, {
      method: 'PATCH',
    });
  },

  deleteMessage: async (messageId) => {
    return apiRequest(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Links API ============

export const linksAPI = {
  // Create a temporary anonymous messaging link
  createLink: async (displayName = null, expirationOption = "24h") => {
    return apiRequest('/links/create', {
      method: 'POST',
      body: JSON.stringify({ 
        display_name: displayName, 
        expiration_option: expirationOption 
      }),
      skipAuth: true, // Allow both guest and logged-in users
    });
  },

  // Get public info about a link
  getLinkInfo: async (publicId) => {
    return apiRequest(`/links/${publicId}/info`, {
      skipAuth: true,
    });
  },

  // Send message to a public link
  sendLinkMessage: async (publicId, content) => {
    return apiRequest(`/links/${publicId}/send`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      skipAuth: true, // Allow anonymous message sending
    });
  },

  // Get messages from a private link
  getLinkMessages: async (privateId) => {
    return apiRequest(`/links/${privateId}/messages`, {
      skipAuth: true, // Private ID acts as access token
    });
  },

  // Make a link message public
  makeLinkMessagePublic: async (privateId, messageId) => {
    return apiRequest(`/links/${privateId}/messages/${messageId}/make-public`, {
      method: 'PATCH',
    });
  },

  // Make a link message private
  makeLinkMessagePrivate: async (privateId, messageId) => {
    return apiRequest(`/links/${privateId}/messages/${messageId}/make-private`, {
      method: 'PATCH',
    });
  },

  // Delete a link message
  deleteLinkMessage: async (privateId, messageId) => {
    return apiRequest(`/links/${privateId}/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Users API ============

export const userAPI = {
  searchUsers: async (username) => {
    return apiRequest('/users/search', {
      method: 'POST',
      body: JSON.stringify({ username }),
      skipAuth: true,
    });
  },

  getUserByUsername: async (username) => {
    return apiRequest(`/users/username/${username}`, {
      skipAuth: true,
    });
  },

  getUserProfile: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      skipAuth: true, // Public profile accessible by anyone
    });
  },

  followUser: async (userId) => {
    return apiRequest(`/users/follow/${userId}`, {
      method: 'POST',
    });
  },

  unfollowUser: async (userId) => {
    return apiRequest(`/users/unfollow/${userId}`, {
      method: 'DELETE',
    });
  },

  getFollowing: async () => {
    return apiRequest('/users/following');
  },

  getFollowers: async () => {
    return apiRequest('/users/followers');
  },

  sendAnonymousMessage: async (userId, content) => {
    // Helper to send anonymous message to a user by ID
    // First fetch user to get username, then send message
    try {
      const profile = await userAPI.getUserProfile(userId);
      return await messagesAPI.sendMessage(profile.username, content);
    } catch (err) {
      throw new Error('Failed to send message');
    }
  },

  sendAnonymousMessageByUsername: async (username, content) => {
    try {
      return await messagesAPI.sendMessage(username, content);
    } catch (err) {
      throw new Error('Failed to send message');
    }
  },
};

// Keep old usersAPI for backward compatibility
export const usersAPI = userAPI;
