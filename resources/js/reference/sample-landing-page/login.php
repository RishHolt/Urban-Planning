<?php
session_start();
require_once 'config/database.php';
require_once 'includes/session_manager.php';

$error = '';
$success = '';

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'Please enter both username/email and password.';
    } else {
        try {
            $pdo = getDBConnection();
            
            // Check if input is email or username
            $isEmail = filter_var($username, FILTER_VALIDATE_EMAIL);
            
            if ($isEmail) {
                $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND status = 'active'");
            } else {
                $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND status = 'active'");
            }
            
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password_hash'])) {
                // Check if account is locked
                if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
                    $error = 'Account is temporarily locked. Please try again later.';
                } else {
                    // Reset login attempts and lock status
                    $stmt = $pdo->prepare("UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?");
                    $stmt->execute([$user['id']]);
                    
                    // Use session manager to create user session
                    $sessionManager = SessionManager::getInstance();
                    $sessionKey = $sessionManager->startUserSession($user);
                    
                    // Keep backward compatibility for existing code
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['user_type'] = $user['user_type'];
                    $_SESSION['first_name'] = $user['first_name'];
                    $_SESSION['last_name'] = $user['last_name'];
                    
                    // Log successful login
                    $stmt = $pdo->prepare("INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $user['id'],
                        'login_success',
                        'users',
                        $user['id'],
                        json_encode(['login_time' => date('Y-m-d H:i:s')]),
                        $_SERVER['REMOTE_ADDR'] ?? '',
                        $_SERVER['HTTP_USER_AGENT'] ?? ''
                    ]);
                    
                    // Redirect based on user type
                    if ($user['user_type'] === 'admin' || $user['user_type'] === 'staff') {
                        header('Location: admin/dashboard.php');
                    } else {
                        header('Location: residents/index.php');
                    }
                    exit();
                }
            } else {
                // Failed login attempt
                if ($user) {
                    $loginAttempts = $user['login_attempts'] + 1;
                    $lockedUntil = null;
                    
                    // Lock account after 5 failed attempts for 15 minutes
                    if ($loginAttempts >= 5) {
                        $lockedUntil = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                    }
                    
                    $stmt = $pdo->prepare("UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?");
                    $stmt->execute([$loginAttempts, $lockedUntil, $user['id']]);
                    
                    if ($lockedUntil) {
                        $error = 'Account locked due to multiple failed login attempts. Please try again after 15 minutes.';
                    } else {
                        $error = 'Invalid username/email or password. Attempts remaining: ' . (5 - $loginAttempts);
                    }
                } else {
                    $error = 'Invalid username/email or password.';
                }
                
                // Log failed login attempt
                if ($user) {
                    $stmt = $pdo->prepare("INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $user['id'],
                        'login_failed',
                        'users',
                        $user['id'],
                        json_encode(['failed_attempts' => $loginAttempts, 'ip' => $_SERVER['REMOTE_ADDR'] ?? '']),
                        $_SERVER['REMOTE_ADDR'] ?? '',
                        $_SERVER['HTTP_USER_AGENT'] ?? ''
                    ]);
                }
            }
        } catch (Exception $e) {
            $error = 'System error. Please try again later.';
            error_log('Login error: ' . $e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Caloocan City Social Services Management System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=EB+Garamond:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#ff6600',
                        secondary: '#ff8829',
                        accent: '#ffb366',
                        success: '#a5c90f',
                        dark: '#6f9c3d'
                    },
                    fontFamily: {
                        'sans': ['Poppins', 'sans-serif'],
                        'serif': ['EB Garamond', 'serif'],
                    }
                }
            }
        }
    </script>
    <style>
        /* Apply Bold EB Garamond to all headings */
        h1, h2, h3, h4, h5, h6 {
            font-family: 'EB Garamond', serif !important;
            font-weight: 700 !important;
        }
        
        /* Increase heading font sizes */
        h1 {
            font-size: 2.5rem !important; /* 40px */
        }
        
        h2 {
            font-size: 2rem !important; /* 32px */
        }
        
        h3 {
            font-size: 1.75rem !important; /* 28px */
        }
        
        h4 {
            font-size: 1.5rem !important; /* 24px */
        }
        
        h5 {
            font-size: 1.25rem !important; /* 20px */
        }
        
        h6 {
            font-size: 1.125rem !important; /* 18px */
        }
        /* Make Caloocan City header text smaller */
        nav h1 {
            font-size: 1rem !important; /* 16px */
        }
        
        /* Responsive font sizes for Caloocan City header */
        @media (min-width: 640px) {
            nav h1 {
                font-size: 1.125rem !important; /* 18px */
            }
        }
        
        @media (min-width: 768px) {
            nav h1 {
                font-size: 1.25rem !important; /* 20px */
            }
        }
        
        @media (min-width: 1024px) {
            nav h1 {
                font-size: 1.375rem !important; /* 22px */
            }
        }
    </style>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-50 font-sans">
    <!-- Navigation Bar -->
    <nav class="bg-primary shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo and City Name -->
                <div class="flex items-center space-x-2 sm:space-x-3">
                    <img src="caloocan-seal.png" alt="Caloocan City Seal" class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain">
                    <div>
                        <h1 class="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white">Caloocan City</h1>
                        <p class="text-xs text-white opacity-90">Social Services</p>
                    </div>
                </div>

                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden text-white p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>

                <!-- Right Side: Navigation Links, Auth Buttons, and Time/Date -->
                <div class="hidden md:flex items-center space-x-4 lg:space-x-6">
                    <!-- Navigation Links -->
                    <div class="flex items-center space-x-4 lg:space-x-6">
                        <a href="index.php" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Home</a>
                        <a href="index.php#services" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Our Services</a>
                    </div>

                    <!-- Authentication Buttons -->
                    <div class="flex items-center space-x-2 lg:space-x-4">
                        <a href="index.php" class="bg-white hover:bg-gray-100 text-primary px-3 lg:px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-block text-sm lg:text-base">
                            Back to Home
                        </a>
                    </div>

                    <!-- Live Time and Date -->
                    <div class="hidden lg:block text-right">
                        <div id="current-time" class="text-lg font-semibold text-white"></div>
                        <div id="current-date" class="text-sm text-white opacity-90"></div>
                    </div>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div id="mobile-menu" class="md:hidden hidden pb-4">
                <div class="flex flex-col space-y-4">
                    <a href="index.php" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Home</a>
                    <a href="index.php#services" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Our Services</a>
                    <div class="flex flex-col space-y-2">
                        <a href="index.php" class="bg-white hover:bg-gray-100 text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Login Section -->
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <!-- Logo and Title -->
            <div class="text-center">
                <img src="caloocan-seal.png" alt="Caloocan City Seal" class="mx-auto w-24 h-24 object-contain mb-6">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Mag-login</h2>
                <p class="text-gray-600">Punan ang mga kailangan impormasyon upang ma-access ang iyong account</p>
            </div>

            <!-- Error/Success Messages -->
            <?php if ($error): ?>
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <?php echo htmlspecialchars($success); ?>
                </div>
            <?php endif; ?>

            <!-- Login Form -->
            <form class="mt-8 space-y-6" method="POST" action="">
                <div class="space-y-4">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                            Username o Email
                        </label>
                        <input 
                            id="username" 
                            name="username" 
                            type="text" 
                            required 
                            minlength="3"
                            maxlength="50"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="Ilagay ang iyong username o email"
                            value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>"
                        >
                    </div>
                    
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div class="relative">
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                required 
                                minlength="8"
                                maxlength="128"
                                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                placeholder="Ilagay ang iyong password"
                            >
                            <button 
                                type="button" 
                                onclick="togglePassword()" 
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <svg id="eye-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input 
                            id="remember-me" 
                            name="remember-me" 
                            type="checkbox" 
                            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        >
                        <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                            Tandaan
                        </label>
                    </div>
                    
                    <div class="text-sm">
                        <a href="forgot-password.php" class="font-medium text-primary hover:text-secondary transition-colors duration-200">
                            Nakalimutan ang password?
                        </a>
                    </div>
                </div>

                <div>
                    <button 
                        type="submit" 
                        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                    >
                        Mag-login
                    </button>
                </div>

                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        Wala pang account? 
                        <a href="register.php" class="font-medium text-primary hover:text-secondary transition-colors duration-200">
                            Mag-register dito
                        </a>
                    </p>
                </div>
            </form>

            <!-- Security Features -->
            <div class="mt-8 space-y-4">
                <!-- Security Information -->
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 class="text-sm font-medium text-blue-800 mb-2">Mga Paalala sa Seguridad:</h3>
                    <ul class="text-xs text-blue-700 space-y-1">
                        <li>• Siguraduhing tama ang impormasyong ilalagay</li>
                        <li>• Huwag ibahagi ang iyong password sa iba</li>
                        <li>• Kung may problema, tumawag sa IT Department</li>
                        <li>• Account ay maaaring ma-lock pagkatapos ng 5 failed attempts</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p class="text-sm text-gray-300">
                © <?php echo date('Y'); ?> Caloocan City Social Services Management System. Lahat ng karapatan ay nakalaan.
            </p>
        </div>
    </footer>

    <script>
        // Password visibility toggle
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eye-icon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>';
            } else {
                passwordInput.type = 'password';
                eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>';
            }
        }

        // JavaScript for mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Update current time and date
        function updateDateTime() {
            const now = new Date();
            
            // Update time
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('en-US', { 
                    hour12: true, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                });
            }
            
            // Update date
            const dateElement = document.getElementById('current-date');
            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
        }

        // Update time every second
        setInterval(updateDateTime, 1000);
        updateDateTime(); // Initial call

        // Add input focus effects
        document.addEventListener('DOMContentLoaded', function() {
            const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.parentElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-20');
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-20');
                });
            });
        });
    </script>
</body>
</html>
