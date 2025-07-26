import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Types for API responses
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: {
    user: User;
  };
}

export interface LoginResponse {
  success: boolean;
  token: string;
  data: {
    user: User;
  };
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Resume {
  id: string;
  title: string;
  type: 'form' | 'file';
  content: ResumeContent;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeContent {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    gpa: string;
  }>;
  skills: string;
}

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  // Updated scoring fields matching database schema
  overallScore: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  formatScore: number;
  
  // Feedback arrays
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  
  // Structured data
  keywordData: Array<{
    category: string;
    matched: number;
    total: number;
    percentage: number;
  }>;
  detailedAnalysis?: {
    experienceMatch: string;
    skillsMatch: string;
    educationMatch: string;
    overallFit: string;
  };
  recommendations?: {
    resumeImprovements: string[];
    skillDevelopment: string[];
    experienceGaps: string[];
  };
  aiResponse: Record<string, unknown>;
  
  // Legacy fields for backward compatibility
  matchScore?: number;
  weaknesses?: string[];
  suggestions?: string[];
  missingSkills?: string[];
  
  createdAt: string;
  updatedAt: string;
  userId: string;
  resumeId: string;
  jobDescId: string;
  
  // Nested objects returned by backend when using include
  resume?: {
    id: string;
    title: string;
  };
  jobDescription?: {
    id: string;
    title: string;
  };
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Token management
class TokenManager {
  private static TOKEN_KEY = 'resumeats_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Generic API request handler
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...TokenManager.getAuthHeaders(),
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (defaultHeaders as Record<string, string>)['Content-Type'];
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  async register(userData: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      const authResponse = response.data as AuthResponse;
      TokenManager.setToken(authResponse.token);
      return authResponse;
    }

    throw new Error(response.error || 'Registration failed');
  },

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      // The backend returns: { success: true, token: "...", data: { user: {...} } }
      const response = await apiRequest<unknown>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('Raw API response:', response);

      // Cast the response to the expected structure
      const loginResponse = response as {
        success: boolean;
        token: string;
        data: { user: User };
        error?: string;
      };

      if (loginResponse.success && loginResponse.token && loginResponse.data) {
        TokenManager.setToken(loginResponse.token);
        return {
          success: true,
          token: loginResponse.token,
          data: loginResponse.data
        };
      }

      throw new Error(loginResponse.error || 'Login failed');
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      const response = await apiRequest('/auth/logout', {
        method: 'POST',
      });
      TokenManager.removeToken();
      return response;
    } catch (error) {
      // Even if the API call fails, remove the token locally
      TokenManager.removeToken();
      throw error;
    }
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return apiRequest('/auth/me');
  },

  async updateProfile(userData: {
    name?: string;
    avatarUrl?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return apiRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  async changePassword(passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return apiRequest('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(passwords),
    });
  },

  async forgotPassword(email: string): Promise<ApiResponse> {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// Resume API
export const resumeApi = {
  // Get user's resume (single resume)
  getResume: () => {
    return apiRequest<{ resume: Resume | null }>('/resumes');
  },

  // Get single resume by ID (for compatibility)
  getResumeById: (id: string) => {
    return apiRequest<{ resume: Resume }>(`/resumes/${id}`);
  },

  // Create or update resume
  createResume: (data: { title: string; type: 'form' | 'file'; content: ResumeContent }) => {
    return apiRequest<{ resume: Resume }>('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update resume
  updateResume: (id: string, data: { title?: string; type?: 'form' | 'file'; content?: ResumeContent; isActive?: boolean }) => {
    return apiRequest<{ resume: Resume }>(`/resumes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete resume
  deleteResume: (id: string) => {
    return apiRequest(`/resumes/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload resume file
  uploadResume: async (file: File, title: string): Promise<ApiResponse<{ resume: Resume }>> => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('title', title);

    const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TokenManager.getToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  },

  // Parse resume file without saving (for review flow)
  parseResume: async (file: File): Promise<ApiResponse<{ parsedContent: ResumeContent; fileName: string; fileSize: number }>> => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/resumes/parse`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TokenManager.getToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Parse failed');
    }

    return response.json();
  },

  async downloadResume(id: string): Promise<Blob> {
    const token = TokenManager.getToken();
    const response = await fetch(`${API_BASE_URL}/resumes/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error('Failed to download resume');
    }

    return response.blob();
  },

  async duplicateResume(id: string): Promise<ApiResponse<{ resume: Resume }>> {
    return apiRequest(`/resumes/${id}/duplicate`, {
      method: 'POST',
    });
  },
};

// Job Description API
export const jobApi = {
  async getJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ jobs: JobDescription[]; pagination: PaginationData }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);

    return apiRequest(`/jobs?${queryParams.toString()}`);
  },

  async getJob(id: string): Promise<ApiResponse<{ job: JobDescription }>> {
    return apiRequest(`/jobs/${id}`);
  },

  async createJob(jobData: {
    title?: string;
    description: string;
  }): Promise<ApiResponse<{ job: JobDescription }>> {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  async updateJob(
    id: string,
    updates: {
      title?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<{ job: JobDescription }>> {
    return apiRequest(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteJob(id: string): Promise<ApiResponse> {
    return apiRequest(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  async duplicateJob(id: string): Promise<ApiResponse<{ job: JobDescription }>> {
    return apiRequest(`/jobs/${id}/duplicate`, {
      method: 'POST',
    });
  },

  async getJobStats(): Promise<ApiResponse> {
    return apiRequest('/jobs/stats/overview');
  },
};

// Analysis API
export const analysisApi = {
  async getAnalyses(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ analyses: Analysis[]; pagination: PaginationData }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    return apiRequest(`/analysis?${queryParams.toString()}`);
  },

  async getAnalysis(id: string): Promise<ApiResponse<{ analysis: Analysis }>> {
    return apiRequest(`/analysis/${id}`);
  },

  async createAnalysis(data: {
    resumeId: string;
    jobDescId: string;
  }): Promise<ApiResponse<{ analysis: Analysis }>> {
    return apiRequest('/analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async reanalyze(id: string): Promise<ApiResponse<{ analysis: Analysis }>> {
    return apiRequest(`/analysis/${id}/reanalyze`, {
      method: 'POST',
    });
  },

  async deleteAnalysis(id: string): Promise<ApiResponse> {
    return apiRequest(`/analysis/${id}`, {
      method: 'DELETE',
    });
  },

  async getOptimization(data: {
    resumeId: string;
    jobDescId: string;
  }): Promise<ApiResponse> {
    return apiRequest('/analysis/optimize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAnalysisStats(): Promise<ApiResponse> {
    return apiRequest('/analysis/stats/overview');
  },
};

// User API
export const userApi = {
  async getDashboard(): Promise<ApiResponse> {
    return apiRequest('/users/dashboard');
  },

  async getActivity(params?: {
    page?: number;
    limit?: number;
    days?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.days) queryParams.set('days', params.days.toString());

    return apiRequest(`/users/activity?${queryParams.toString()}`);
  },

  async getProfile(): Promise<ApiResponse> {
    return apiRequest('/users/profile');
  },

  async exportData(): Promise<ApiResponse> {
    return apiRequest('/users/export');
  },

  async deleteAccount(confirmPassword: string): Promise<ApiResponse> {
    return apiRequest('/users/account', {
      method: 'DELETE',
      body: JSON.stringify({ confirmPassword }),
    });
  },
};

// Export token manager for use in components
export { TokenManager }; 