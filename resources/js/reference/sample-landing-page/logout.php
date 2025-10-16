<?php
session_start();
require_once 'includes/session_manager.php';

// Log the logout action if user is logged in
if (isset($_SESSION['user_id'])) {
    try {
        require_once 'config/database.php';
        $pdo = getDBConnection();
        
        // Log logout action
        $stmt = $pdo->prepare("INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $_SESSION['user_id'],
            'logout',
            'users',
            $_SESSION['user_id'],
            json_encode(['logout_time' => date('Y-m-d H:i:s')]),
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
        
        // Update last login time
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        
    } catch (Exception $e) {
        error_log('Logout logging error: ' . $e->getMessage());
    }
}

// Use session manager to logout current user
$sessionManager = SessionManager::getInstance();
$sessionManager->logoutCurrentUser();

// Destroy session
session_destroy();

// Redirect to home page
header('Location: index.php');
exit();
?>
