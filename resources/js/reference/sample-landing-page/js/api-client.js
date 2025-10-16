/**
 * API Client for Caloocan City Social Services Management System
 * Handles all communication with the PHP backend
 */

class APIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.sessionToken = localStorage.getItem('session_token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // Set session token and user data
    setSession(sessionToken, user) {
        this.sessionToken = sessionToken;
        this.user = user;
        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Clear session
    clearSession() {
        this.sessionToken = null;
        this.user = null;
        localStorage.removeItem('session_token');
        localStorage.removeItem('user');
    }

    // Get headers for authenticated requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.sessionToken) {
            headers['Authorization'] = this.sessionToken;
        }
        
        return headers;
    }

    // Make HTTP request
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: this.getHeaders()
            });

            if (response.status === 401) {
                // Session expired
                this.clearSession();
                window.location.href = '/login.html';
                return null;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(username, password) {
        const response = await this.request(`${this.baseURL}/api/auth.php?action=login`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response && response.success) {
            this.setSession(response.session_token, response.user);
        }

        return response;
    }

    async register(userData) {
        return await this.request(`${this.baseURL}/api/auth.php?action=register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        if (this.sessionToken) {
            try {
                await this.request(`${this.baseURL}/api/auth.php?action=logout`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }
        
        this.clearSession();
        window.location.href = '/index.html';
    }

    async verifySession() {
        if (!this.sessionToken) {
            return null;
        }

        try {
            const response = await this.request(`${this.baseURL}/api/auth.php?action=verify-session`);
            if (response && response.success) {
                this.user = response.session;
                localStorage.setItem('user', JSON.stringify(this.user));
                return response.session;
            }
        } catch (error) {
            console.error('Session verification failed:', error);
            this.clearSession();
        }

        return null;
    }

    async getUserProfile() {
        return await this.request(`${this.baseURL}/api/auth.php?action=user-profile`);
    }

    // Services methods
    async getServiceCategories() {
        return await this.request(`${this.baseURL}/api/services.php?action=categories`);
    }

    async getServices(categoryId = null) {
        const url = categoryId 
            ? `${this.baseURL}/api/services.php?action=services&category_id=${categoryId}`
            : `${this.baseURL}/api/services.php?action=services`;
        
        return await this.request(url);
    }

    async getServiceDetails(serviceId) {
        return await this.request(`${this.baseURL}/api/services.php?action=service-details&service_id=${serviceId}`);
    }

    async getAnnouncements(type = 'all', limit = 10) {
        return await this.request(`${this.baseURL}/api/services.php?action=announcements&type=${type}&limit=${limit}`);
    }

    async getUserApplications() {
        return await this.request(`${this.baseURL}/api/services.php?action=user-applications`);
    }

    async submitApplication(serviceId, notes) {
        return await this.request(`${this.baseURL}/api/services.php?action=apply`, {
            method: 'POST',
            body: JSON.stringify({ service_id: serviceId, notes })
        });
    }

    async uploadDocument(applicationId, documentType, file) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('application_id', applicationId);
        formData.append('document_type', documentType);

        // Override headers for file upload
        const headers = {};
        if (this.sessionToken) {
            headers['Authorization'] = this.sessionToken;
        }

        try {
            const response = await fetch(`${this.baseURL}/api/services.php?action=upload-document`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (response.status === 401) {
                this.clearSession();
                window.location.href = '/login.html';
                return null;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Document upload failed:', error);
            throw error;
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.sessionToken && !!this.user;
    }

    getUserType() {
        return this.user ? this.user.user_type : null;
    }

    isAdmin() {
        return this.getUserType() === 'admin';
    }

    isStaff() {
        return this.getUserType() === 'staff';
    }

    isResident() {
        return this.getUserType() === 'resident';
    }

    // Check if user has permission for specific action
    hasPermission(action) {
        if (!this.isAuthenticated()) {
            return false;
        }

        switch (action) {
            case 'view_applications':
                return this.isAdmin() || this.isStaff() || this.isResident();
            case 'manage_services':
                return this.isAdmin() || this.isStaff();
            case 'manage_users':
                return this.isAdmin();
            case 'create_announcements':
                return this.isAdmin() || this.isStaff();
            default:
                return false;
        }
    }

    // Auto-refresh session if needed
    async refreshSessionIfNeeded() {
        if (this.sessionToken && this.user) {
            const sessionExpiry = new Date(this.user.expires_at);
            const now = new Date();
            const timeUntilExpiry = sessionExpiry.getTime() - now.getTime();
            
            // Refresh if session expires in less than 5 minutes
            if (timeUntilExpiry < 5 * 60 * 1000) {
                await this.verifySession();
            }
        }
    }

    // Initialize API client
    async init() {
        // Check for existing session
        if (this.sessionToken) {
            await this.verifySession();
        }

        // Set up auto-refresh
        setInterval(() => {
            this.refreshSessionIfNeeded();
        }, 60000); // Check every minute
    }
}

// Create global API client instance
const apiClient = new APIClient();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    apiClient.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
