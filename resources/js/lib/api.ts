// API service for citizen portal
const API_BASE_URL = '/api/auth';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp_code: string;
}

export interface ResendOtpRequest {
    email: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    citizen_id: string;
    is_verified: boolean;
    phone?: string;
    address?: string;
    barangay?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    user?: User;
    otp_code?: string;
    expires_at?: string;
    errors?: Record<string, string[]>;
}

class ApiService {
    private async getCSRFToken(): Promise<string> {
        // Get CSRF token from meta tag
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            throw new Error('CSRF token not found');
        }
        return token;
    }

    private async refreshCSRFToken(): Promise<string> {
        try {
            // Try to get a fresh CSRF token by making a GET request to a simple endpoint
            const response = await fetch('/api/csrf-token', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.csrf_token || data.token;
            }
        } catch (error) {
            console.warn('Failed to refresh CSRF token via API:', error);
        }
        
        // Fallback: try to get token from meta tag again
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            return token;
        }
        
        throw new Error('Unable to refresh CSRF token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // Get CSRF token for non-GET requests
        let csrfToken = '';
        if (options.method && options.method !== 'GET') {
            try {
                csrfToken = await this.getCSRFToken();
            } catch (error) {
                console.error('Failed to get CSRF token:', error);
            }
        }
        
        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
            },
        };

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        });

        const data = await response.json();
        
        if (!response.ok) {
            // If CSRF token mismatch, try to refresh the token and retry the request
            if (response.status === 419) {
                console.log('🔄 CSRF token mismatch, attempting to refresh token...');
                try {
                    const newToken = await this.refreshCSRFToken();
                    
                    // Retry the request with the new token
                    const retryResponse = await fetch(url, {
                        ...defaultOptions,
                        ...options,
                        headers: {
                            ...defaultOptions.headers,
                            ...options.headers,
                            'X-CSRF-TOKEN': newToken,
                        },
                    });
                    
                    if (retryResponse.ok) {
                        return await retryResponse.json();
                    }
                } catch (refreshError) {
                    console.error('Failed to refresh CSRF token:', refreshError);
                }
                
                // If refresh fails, show user-friendly error instead of reloading
                throw new Error('Session expired. Please refresh the page and try again.');
            }
            throw new Error(data.message || 'An error occurred');
        }

        return data;
    }

    async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
        return this.request<User>('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async verifyOtp(otpData: VerifyOtpRequest): Promise<ApiResponse<User>> {
        return this.request<User>('/verify-otp', {
            method: 'POST',
            body: JSON.stringify(otpData),
        });
    }

    async resendOtp(email: ResendOtpRequest): Promise<ApiResponse<User>> {
        return this.request<User>('/resend-otp', {
            method: 'POST',
            body: JSON.stringify(email),
        });
    }

    async getCurrentUser(): Promise<ApiResponse<User>> {
        return this.request<User>('/me');
    }

    async logout(): Promise<ApiResponse<null>> {
        return this.request<null>('/logout', {
            method: 'POST',
        });
    }
}

export const apiService = new ApiService();
