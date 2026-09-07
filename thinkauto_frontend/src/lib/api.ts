const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request(endpoint: string, options: any = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.includeAuth !== false),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false,
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount(password) {
    return this.request('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }

  // Tickets
  async getTickets(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tickets${queryString ? `?${queryString}` : ''}`);
  }

  async getTicket(id) {
    return this.request(`/tickets/${id}`);
  }

  async createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id, updates) {
    return this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async addComment(ticketId, text) {
    return this.request(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async assignTicket(ticketId, technicianId) {
    return this.request(`/tickets/${ticketId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ technicianId }),
    });
  }

  async getTicketStats() {
    return this.request('/tickets/stats');
  }

  async requestVerification(ticketId: string) {
    return this.request(`/tickets/${ticketId}/request-verification`, {
      method: 'POST',
    });
  }

  async verifyTicketCompletion(ticketId: string, otp: string) {
    return this.request(`/tickets/${ticketId}/verify-completion`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  async getChatLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/chat/logs${queryString ? `?${queryString}` : ''}`);
  }

  // Users
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getTechnicians() {
    return this.request('/users/technicians');
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // Generic HTTP methods
  async get(endpoint: string, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, data: any, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export default new ApiService();
