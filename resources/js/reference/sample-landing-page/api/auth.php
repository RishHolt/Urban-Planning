<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'POST':
            switch ($action) {
                case 'login':
                    handleLogin();
                    break;
                case 'register':
                    handleRegister();
                    break;
                case 'logout':
                    handleLogout();
                    break;
                case 'verify-otp':
                    handleVerifyOTP();
                    break;
                case 'resend-otp':
                    handleResendOTP();
                    break;
                case 'forgot-password':
                    handleForgotPassword();
                    break;
                case 'reset-password':
                    handleResetPassword();
                    break;
                default:
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid action']);
            }
            break;
            
        case 'GET':
            switch ($action) {
                case 'verify-session':
                    handleVerifySession();
                    break;
                case 'user-profile':
                    handleGetUserProfile();
                    break;
                default:
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid action']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
        return;
    }
    
    $username = trim($input['username']);
    $password = $input['password'];
    
    try {
        $pdo = getDBConnection();
        
        // Check if account is locked
        $stmt = $pdo->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND status != 'suspended'");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }
        
        // Check if account is locked
        if ($user['locked_until'] && $user['locked_until'] > date('Y-m-d H:i:s')) {
            http_response_code(423);
            echo json_encode(['error' => 'Account is locked. Please try again later.']);
            return;
        }
        
        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            // Increment login attempts
            $stmt = $pdo->prepare("UPDATE users SET login_attempts = login_attempts + 1 WHERE id = ?");
            $stmt->execute([$user['id']]);
            
            // Lock account after 5 failed attempts
            if ($user['login_attempts'] >= 4) {
                $lockUntil = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                $stmt = $pdo->prepare("UPDATE users SET locked_until = ? WHERE id = ?");
                $stmt->execute([$lockUntil, $user['id']]);
                
                http_response_code(423);
                echo json_encode(['error' => 'Too many failed attempts. Account locked for 15 minutes.']);
                return;
            }
            
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }
        
        // Reset login attempts and update last login
        $stmt = $pdo->prepare("UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Generate session token
        $sessionToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 minutes'));
        
        // Store session
        $stmt = $pdo->prepare("INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $user['id'],
            $sessionToken,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? '',
            $expiresAt
        ]);
        
        // Log audit
        logAudit($user['id'], 'user_login', 'users', $user['id'], null, ['ip' => $_SERVER['REMOTE_ADDR'] ?? '']);
        
        // Return user data and session token
        unset($user['password_hash']);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'session_token' => $sessionToken,
            'expires_at' => $expiresAt
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Login failed. Please try again.']);
    }
}

function handleRegister() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'birth_date'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            http_response_code(400);
            echo json_encode(['error' => ucfirst($field) . ' is required']);
            return;
        }
    }
    
    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }
    
    // Validate password strength
    if (strlen($input['password']) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 8 characters long']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Check if username or email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$input['username'], $input['email']]);
        
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Username or email already exists']);
            return;
        }
        
        // Hash password
        $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, password_hash, first_name, last_name, phone, birth_date, user_type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'resident', 'active')
        ");
        
        $stmt->execute([
            trim($input['username']),
            trim($input['email']),
            $passwordHash,
            trim($input['first_name']),
            trim($input['last_name']),
            trim($input['phone']),
            $input['birth_date']
        ]);
        
        $userId = $pdo->lastInsertId();
        
        // Log audit
        logAudit($userId, 'user_registration', 'users', $userId, null, [
            'username' => $input['username'],
            'email' => $input['email']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful. Please check your email for verification.',
            'user_id' => $userId
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed. Please try again.']);
    }
}

function handleLogout() {
    $headers = getallheaders();
    $sessionToken = $headers['Authorization'] ?? '';
    
    if (empty($sessionToken)) {
        http_response_code(400);
        echo json_encode(['error' => 'Session token required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Get user ID from session
        $stmt = $pdo->prepare("SELECT user_id FROM user_sessions WHERE session_token = ? AND is_active = 1");
        $stmt->execute([$sessionToken]);
        $session = $stmt->fetch();
        
        if ($session) {
            // Deactivate session
            $stmt = $pdo->prepare("UPDATE user_sessions SET is_active = 0 WHERE session_token = ?");
            $stmt->execute([$sessionToken]);
            
            // Log audit
            logAudit($session['user_id'], 'user_logout', 'user_sessions', null, null, ['session_token' => $sessionToken]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Logout successful'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Logout failed']);
    }
}

function handleVerifySession() {
    $headers = getallheaders();
    $sessionToken = $headers['Authorization'] ?? '';
    
    if (empty($sessionToken)) {
        http_response_code(401);
        echo json_encode(['error' => 'Session token required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Verify session
        $stmt = $pdo->prepare("
            SELECT us.*, u.username, u.email, u.first_name, u.last_name, u.user_type, u.status
            FROM user_sessions us
            JOIN users u ON us.user_id = u.id
            WHERE us.session_token = ? AND us.is_active = 1 AND us.expires_at > NOW()
        ");
        $stmt->execute([$sessionToken]);
        $session = $stmt->fetch();
        
        if (!$session) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired session']);
            return;
        }
        
        // Extend session if needed
        if (strtotime($session['expires_at']) - time() < 300) { // Less than 5 minutes
            $newExpires = date('Y-m-d H:i:s', strtotime('+30 minutes'));
            $stmt = $pdo->prepare("UPDATE user_sessions SET expires_at = ? WHERE id = ?");
            $stmt->execute([$newExpires, $session['id']]);
            $session['expires_at'] = $newExpires;
        }
        
        echo json_encode([
            'success' => true,
            'session' => $session
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Session verification failed']);
    }
}

function handleGetUserProfile() {
    $headers = getallheaders();
    $sessionToken = $headers['Authorization'] ?? '';
    
    if (empty($sessionToken)) {
        http_response_code(401);
        echo json_encode(['error' => 'Session token required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Get user profile
        $stmt = $pdo->prepare("
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.birth_date, 
                   u.user_type, u.status, u.email_verified, u.phone_verified, u.created_at, u.last_login
            FROM users u
            JOIN user_sessions us ON u.id = us.user_id
            WHERE us.session_token = ? AND us.is_active = 1 AND us.expires_at > NOW()
        ");
        $stmt->execute([$sessionToken]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid session']);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get user profile']);
    }
}

function handleVerifyOTP() {
    // Placeholder for OTP verification
    http_response_code(501);
    echo json_encode(['error' => 'OTP verification not implemented yet']);
}

function handleResendOTP() {
    // Placeholder for OTP resend
    http_response_code(501);
    echo json_encode(['error' => 'OTP resend not implemented yet']);
}

function handleForgotPassword() {
    // Placeholder for forgot password
    http_response_code(501);
    echo json_encode(['error' => 'Forgot password not implemented yet']);
}

function handleResetPassword() {
    // Placeholder for reset password
    http_response_code(501);
    echo json_encode(['error' => 'Reset password not implemented yet']);
}

function logAudit($userId, $action, $tableName, $recordId, $oldValues, $newValues) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("
            INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $action,
            $tableName,
            $recordId,
            $oldValues ? json_encode($oldValues) : null,
            $newValues ? json_encode($newValues) : null,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (Exception $e) {
        // Log audit failure silently to avoid breaking main functionality
        error_log("Audit log failed: " . $e->getMessage());
    }
}
?>
