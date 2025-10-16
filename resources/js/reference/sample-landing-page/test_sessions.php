<?php
session_start();
require_once 'includes/session_manager.php';

echo "<h2>Session Manager Test</h2>";

$sessionManager = SessionManager::getInstance();

// Test 1: Check initial state
echo "<h3>1. Initial State</h3>";
echo "<pre>";
print_r($sessionManager->getSessionInfo());
echo "</pre>";

// Test 2: Simulate admin login
echo "<h3>2. Simulating Admin Login</h3>";
$adminData = [
    'id' => 1,
    'username' => 'admin',
    'user_type' => 'admin',
    'first_name' => 'Admin',
    'last_name' => 'User'
];

$adminSessionKey = $sessionManager->startUserSession($adminData);
echo "Admin session key: $adminSessionKey<br>";
echo "Current user: ";
print_r($sessionManager->getCurrentUser());

// Test 3: Simulate resident login (should not conflict)
echo "<h3>3. Simulating Resident Login (Should Not Conflict)</h3>";
$residentData = [
    'id' => 2,
    'username' => 'resident1',
    'user_type' => 'resident',
    'first_name' => 'John',
    'last_name' => 'Doe'
];

$residentSessionKey = $sessionManager->startUserSession($residentData);
echo "Resident session key: $residentSessionKey<br>";
echo "Current user: ";
print_r($sessionManager->getCurrentUser());

// Test 4: Check all active sessions
echo "<h3>4. All Active Sessions</h3>";
echo "<pre>";
print_r($sessionManager->getActiveSessions());
echo "</pre>";

// Test 5: Switch to admin
echo "<h3>5. Switching to Admin</h3>";
$sessionManager->switchToUser($adminSessionKey);
echo "Current user after switch: ";
print_r($sessionManager->getCurrentUser());

// Test 6: Check login status
echo "<h3>6. Login Status Checks</h3>";
echo "Is admin logged in: " . ($sessionManager->isAdminLoggedIn() ? 'Yes' : 'No') . "<br>";
echo "Is resident logged in: " . ($sessionManager->isResidentLoggedIn() ? 'Yes' : 'No') . "<br>";
echo "Is any user logged in: " . ($sessionManager->isLoggedIn() ? 'Yes' : 'No') . "<br>";

// Test 7: Switch to resident
echo "<h3>7. Switching to Resident</h3>";
$sessionManager->switchToUser($residentSessionKey);
echo "Current user after switch: ";
print_r($sessionManager->getCurrentUser());

// Test 8: Check login status again
echo "<h3>8. Login Status After Switch</h3>";
echo "Is admin logged in: " . ($sessionManager->isAdminLoggedIn() ? 'Yes' : 'No') . "<br>";
echo "Is resident logged in: " . ($sessionManager->isResidentLoggedIn() ? 'Yes' : 'No') . "<br>";
echo "Is any user logged in: " . ($sessionManager->isLoggedIn() ? 'Yes' : 'No') . "<br>";

// Test 9: Final session info
echo "<h3>9. Final Session Info</h3>";
echo "<pre>";
print_r($sessionManager->getSessionInfo());
echo "</pre>";

echo "<h3>✅ Session Manager Test Complete!</h3>";
echo "<p>If you see multiple active sessions and can switch between them, the session manager is working correctly.</p>";
?>
