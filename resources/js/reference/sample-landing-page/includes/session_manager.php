<?php
/**
 * Session Manager for Multi-User System
 * Handles multiple user sessions without conflicts
 */

class SessionManager {
    private static $instance = null;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Start a new session for a user
     */
    public function startUserSession($userData) {
        // Store user data in type-specific session
        $userType = $userData['user_type'];
        $sessionKey = $userType . '_' . $userData['id'];
        
        $_SESSION[$sessionKey] = [
            'user_id' => $userData['id'],
            'username' => $userData['username'],
            'user_type' => $userData['user_type'],
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'login_time' => date('Y-m-d H:i:s'),
            'session_id' => session_id()
        ];
        
        // Set current active session
        $_SESSION['current_user'] = $sessionKey;
        
        return $sessionKey;
    }
    
    /**
     * Get current user data
     */
    public function getCurrentUser() {
        if (isset($_SESSION['current_user'])) {
            $sessionKey = $_SESSION['current_user'];
            return $_SESSION[$sessionKey] ?? null;
        }
        return null;
    }
    
    /**
     * Check if user is logged in
     */
    public function isLoggedIn($userType = null) {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser) {
            return false;
        }
        
        if ($userType) {
            return $currentUser['user_type'] === $userType;
        }
        
        return true;
    }
    
    /**
     * Check if specific user type is logged in
     */
    public function isAdminLoggedIn() {
        return $this->isLoggedIn('admin');
    }
    
    public function isResidentLoggedIn() {
        return $this->isLoggedIn('resident');
    }
    
    public function isStaffLoggedIn() {
        return $this->isLoggedIn('staff');
    }
    
    /**
     * Switch to a different user session
     */
    public function switchToUser($sessionKey) {
        if (isset($_SESSION[$sessionKey])) {
            $_SESSION['current_user'] = $sessionKey;
            return true;
        }
        return false;
    }
    
    /**
     * Get all active sessions
     */
    public function getActiveSessions() {
        $sessions = [];
        foreach ($_SESSION as $key => $value) {
            if (strpos($key, '_') !== false && is_array($value) && isset($value['user_type'])) {
                $sessions[$key] = $value;
            }
        }
        return $sessions;
    }
    
    /**
     * Logout current user
     */
    public function logoutCurrentUser() {
        $currentUser = $this->getCurrentUser();
        if ($currentUser) {
            $sessionKey = $_SESSION['current_user'];
            unset($_SESSION[$sessionKey]);
            unset($_SESSION['current_user']);
        }
    }
    
    /**
     * Logout specific user
     */
    public function logoutUser($sessionKey) {
        if (isset($_SESSION[$sessionKey])) {
            unset($_SESSION[$sessionKey]);
            
            // If this was the current user, clear current_user
            if (isset($_SESSION['current_user']) && $_SESSION['current_user'] === $sessionKey) {
                unset($_SESSION['current_user']);
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Logout all users
     */
    public function logoutAllUsers() {
        $sessions = $this->getActiveSessions();
        foreach ($sessions as $sessionKey => $sessionData) {
            unset($_SESSION[$sessionKey]);
        }
        unset($_SESSION['current_user']);
    }
    
    /**
     * Get session info for debugging
     */
    public function getSessionInfo() {
        return [
            'current_user' => $_SESSION['current_user'] ?? null,
            'active_sessions' => $this->getActiveSessions(),
            'session_id' => session_id(),
            'all_session_keys' => array_keys($_SESSION)
        ];
    }
}
?>
