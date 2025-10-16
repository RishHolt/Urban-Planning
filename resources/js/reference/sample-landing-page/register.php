<?php
session_start();
require_once 'config/database.php';
require_once 'config/email_config.php';

$error = '';
$success = '';

// Handle registration form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $firstName = trim($_POST['first_name'] ?? '');
    $lastName = trim($_POST['last_name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $birthDate = $_POST['birth_date'] ?? '';
    $barangay = $_POST['barangay'] ?? '';
    
    // Validation
    if (empty($email) || empty($firstName) || empty($lastName) || empty($birthDate) || empty($barangay)) {
        $error = 'All required fields must be filled.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } else {
        try {
            $pdo = getDBConnection();
            
            // Check if email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $error = 'Email already exists. Please use a different email address.';
            } else {
                // Generate username: RES + incremental ID
                $stmt = $pdo->prepare("SELECT MAX(CAST(SUBSTRING(username, 4) AS UNSIGNED)) as max_id FROM users WHERE username LIKE 'RES%'");
                $stmt->execute();
                $result = $stmt->fetch();
                $nextId = ($result['max_id'] ?? 0) + 1;
                $username = 'RES' . str_pad($nextId, 10, '0', STR_PAD_LEFT);
                
                // Generate secure random password: 8-10 characters with uppercase, lowercase, number, and special character
                $password = generateSecurePassword();
                
                // Hash the generated password
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                
                // Create new user
                $stmt = $pdo->prepare("
                    INSERT INTO users (username, email, password_hash, first_name, last_name, phone, birth_date, barangay, user_type, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'resident', 'active', NOW())
                ");
                
                $stmt->execute([
                    $username,
                    $email,
                    $passwordHash,
                    $firstName,
                    $lastName,
                    $phone ?: null,
                    $birthDate,
                    $barangay
                ]);
                
                $userId = $pdo->lastInsertId();
                
                // Log user creation
                $stmt = $pdo->prepare("INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $userId,
                    'user_registered',
                    'users',
                    $userId,
                    json_encode(['username' => $username, 'email' => $email]),
                    $_SERVER['REMOTE_ADDR'] ?? '',
                    $_SERVER['HTTP_USER_AGENT'] ?? ''
                ]);
                
                // Send email with credentials using new email system
                $emailSent = sendCredentialsEmail($email, $firstName, $lastName, $username, $password);
                
                if ($emailSent) {
                    $success = 'Registration successful! Your login credentials (Username: ' . $username . ') have been sent to your email address.';
                } else {
                    $success = 'Registration successful! However, there was an issue sending your credentials. Please contact support.';
                }
                
                // Clear form data
                $_POST = array();
            }
        } catch (Exception $e) {
            $error = 'System error. Please try again later.';
            error_log('Registration error: ' . $e->getMessage());
        }
    }
}

/**
 * Generate secure random password with specified requirements
 * 8-10 characters: uppercase, lowercase, number, and special character
 */
function generateSecurePassword() {
    $length = rand(8, 10); // Random length between 8-10
    
    // Character sets
    $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $lowercase = 'abcdefghijklmnopqrstuvwxyz';
    $numbers = '0123456789';
    $special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Ensure at least one character from each set
    $password = '';
    $password .= $uppercase[rand(0, strlen($uppercase) - 1)]; // 1 uppercase
    $password .= $lowercase[rand(0, strlen($lowercase) - 1)]; // 1 lowercase
    $password .= $numbers[rand(0, strlen($numbers) - 1)];     // 1 number
    $password .= $special[rand(0, strlen($special) - 1)];     // 1 special
    
    // Fill remaining characters randomly
    $allChars = $uppercase . $lowercase . $numbers . $special;
    for ($i = 4; $i < $length; $i++) {
        $password .= $allChars[rand(0, strlen($allChars) - 1)];
    }
    
    // Shuffle the password to make it more random
    return str_shuffle($password);
}

// Function to send credentials email
function sendCredentialsEmail($email, $firstName, $lastName, $username, $password) {
    $subject = "Your Caloocan City Social Services Login Credentials";
    
    $message = "
    <html>
    <head>
        <title>Login Credentials</title>
    </head>
    <body>
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='background-color: #ff6600; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0;'>Caloocan City Social Services</h1>
                <p style='margin: 10px 0 0 0;'>Your Account Has Been Created</p>
            </div>
            
            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;'>
                <h2 style='color: #333;'>Hello {$firstName} {$lastName},</h2>
                
                <p>Your account has been successfully created in the Caloocan City Social Services Management System.</p>
                
                <div style='background-color: white; border: 2px solid #ff6600; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                    <h3 style='color: #ff6600; margin-top: 0;'>Your Login Credentials:</h3>
                    <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;'>
                        <p style='margin: 5px 0; font-family: monospace; font-size: 16px;'><strong>Username:</strong> <span style='background-color: #e9ecef; padding: 4px 8px; border-radius: 3px;'>{$username}</span></p>
                        <p style='margin: 5px 0; font-family: monospace; font-size: 16px;'><strong>Password:</strong> <span style='background-color: #e9ecef; padding: 4px 8px; border-radius: 3px;'>{$password}</span></p>
                    </div>
                    <p style='color: #666; font-size: 14px; margin-top: 15px;'>
                        <strong>Note:</strong> Your username follows the format RES + ID number. Please save these credentials securely.
                    </p>
                </div>
                
                <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;'>
                    <h4 style='color: #856404; margin-top: 0;'>Important Notes:</h4>
                    <ul style='color: #856404;'>
                        <li>Please keep your credentials secure and do not share them with anyone</li>
                        <li>You can change your password after your first login</li>
                        <li>If you have any issues, please contact support</li>
                    </ul>
                </div>
                
                <p>You can now login to access social services at: <a href='http://localhost/govservesample/login.php' style='color: #ff6600;'>Login Page</a></p>
                
                <p>Thank you for registering with Caloocan City Social Services!</p>
                
                <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                
                <p style='font-size: 12px; color: #666;'>
                    This is an automated message. Please do not reply to this email.<br>
                    For support, contact: support@caloocancity.gov.ph
                </p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Use the new email system instead of PHP mail()
    return sendEmail($email, $subject, $message);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Caloocan City Social Services Management System</title>
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

    <!-- Registration Section -->
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <!-- Logo and Title -->
            <div class="text-center">
                <img src="caloocan-seal.png" alt="Caloocan City Seal" class="mx-auto w-24 h-24 object-contain mb-6">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Mag-register</h2>
                <p class="text-gray-600">Gumawa ng account para ma-access ang mga social services</p>
                <p class="text-sm text-gray-500 mt-2">Your login credentials will be sent to your email</p>
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
                    <div class="mt-2">
                        <?php if (strpos($success, 'sent to your email') !== false): ?>
                            <p class="text-sm">Please check your email for your login credentials.</p>
                        <?php else: ?>
                            <p class="text-sm">Please contact support to get your login credentials.</p>
                        <?php endif; ?>
                        <a href="login.php" class="text-green-800 underline font-medium">Click here to login</a>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Registration Form -->
            <form class="mt-8 space-y-6" method="POST" action="">
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="first_name" class="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <input 
                                id="first_name" 
                                name="first_name" 
                                type="text" 
                                required 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                placeholder="First name"
                                value="<?php echo htmlspecialchars($_POST['first_name'] ?? ''); ?>"
                            >
                        </div>
                        
                        <div>
                            <label for="last_name" class="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                            </label>
                            <input 
                                id="last_name" 
                                name="last_name" 
                                type="text" 
                                required 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                placeholder="Last name"
                                value="<?php echo htmlspecialchars($_POST['last_name'] ?? ''); ?>"
                            >
                        </div>
                    </div>
                    
                                         <div>
                         <label for="barangay" class="block text-sm font-medium text-gray-700 mb-2">
                             Barangay Number *
                         </label>
                         <select 
                             id="barangay" 
                             name="barangay" 
                             required 
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                         >
                             <option value="">Select your barangay</option>
                             <option value="1">Barangay 1</option>
                             <option value="2">Barangay 2</option>
                             <option value="3">Barangay 3</option>
                             <option value="4">Barangay 4</option>
                             <option value="5">Barangay 5</option>
                             <option value="6">Barangay 6</option>
                             <option value="7">Barangay 7</option>
                             <option value="8">Barangay 8</option>
                             <option value="9">Barangay 9</option>
                             <option value="10">Barangay 10</option>
                             <option value="11">Barangay 11</option>
                             <option value="12">Barangay 12</option>
                             <option value="13">Barangay 13</option>
                             <option value="14">Barangay 14</option>
                             <option value="15">Barangay 15</option>
                             <option value="16">Barangay 16</option>
                             <option value="17">Barangay 17</option>
                             <option value="18">Barangay 18</option>
                             <option value="19">Barangay 19</option>
                             <option value="20">Barangay 20</option>
                             <option value="21">Barangay 21</option>
                             <option value="22">Barangay 22</option>
                             <option value="23">Barangay 23</option>
                             <option value="24">Barangay 24</option>
                             <option value="25">Barangay 25</option>
                             <option value="26">Barangay 26</option>
                             <option value="27">Barangay 27</option>
                             <option value="28">Barangay 28</option>
                             <option value="29">Barangay 29</option>
                             <option value="30">Barangay 30</option>
                             <option value="31">Barangay 31</option>
                             <option value="32">Barangay 32</option>
                             <option value="33">Barangay 33</option>
                             <option value="34">Barangay 34</option>
                             <option value="35">Barangay 35</option>
                             <option value="36">Barangay 36</option>
                             <option value="37">Barangay 37</option>
                             <option value="38">Barangay 38</option>
                             <option value="39">Barangay 39</option>
                             <option value="40">Barangay 40</option>
                             <option value="41">Barangay 41</option>
                             <option value="42">Barangay 42</option>
                             <option value="43">Barangay 43</option>
                             <option value="44">Barangay 44</option>
                             <option value="45">Barangay 45</option>
                             <option value="46">Barangay 46</option>
                             <option value="47">Barangay 47</option>
                             <option value="48">Barangay 48</option>
                             <option value="49">Barangay 49</option>
                             <option value="50">Barangay 50</option>
                             <option value="51">Barangay 51</option>
                             <option value="52">Barangay 52</option>
                             <option value="53">Barangay 53</option>
                             <option value="54">Barangay 54</option>
                             <option value="55">Barangay 55</option>
                             <option value="56">Barangay 56</option>
                             <option value="57">Barangay 57</option>
                             <option value="58">Barangay 58</option>
                             <option value="59">Barangay 59</option>
                             <option value="60">Barangay 60</option>
                             <option value="61">Barangay 61</option>
                             <option value="62">Barangay 62</option>
                             <option value="63">Barangay 63</option>
                             <option value="64">Barangay 64</option>
                             <option value="65">Barangay 65</option>
                             <option value="66">Barangay 66</option>
                             <option value="67">Barangay 67</option>
                             <option value="68">Barangay 68</option>
                             <option value="69">Barangay 69</option>
                             <option value="70">Barangay 70</option>
                             <option value="71">Barangay 71</option>
                             <option value="72">Barangay 72</option>
                             <option value="73">Barangay 73</option>
                             <option value="74">Barangay 74</option>
                             <option value="75">Barangay 75</option>
                             <option value="76">Barangay 76</option>
                             <option value="77">Barangay 77</option>
                             <option value="78">Barangay 78</option>
                             <option value="79">Barangay 79</option>
                             <option value="80">Barangay 80</option>
                             <option value="81">Barangay 81</option>
                             <option value="82">Barangay 82</option>
                             <option value="83">Barangay 83</option>
                             <option value="84">Barangay 84</option>
                             <option value="85">Barangay 85</option>
                             <option value="86">Barangay 86</option>
                             <option value="87">Barangay 87</option>
                             <option value="88">Barangay 88</option>
                             <option value="89">Barangay 89</option>
                             <option value="90">Barangay 90</option>
                             <option value="91">Barangay 91</option>
                             <option value="92">Barangay 92</option>
                             <option value="93">Barangay 93</option>
                             <option value="94">Barangay 94</option>
                             <option value="95">Barangay 95</option>
                             <option value="96">Barangay 96</option>
                             <option value="97">Barangay 97</option>
                             <option value="98">Barangay 98</option>
                             <option value="99">Barangay 99</option>
                             <option value="100">Barangay 100</option>
                             <option value="101">Barangay 101</option>
                             <option value="102">Barangay 102</option>
                             <option value="103">Barangay 103</option>
                             <option value="104">Barangay 104</option>
                             <option value="105">Barangay 105</option>
                             <option value="106">Barangay 106</option>
                             <option value="107">Barangay 107</option>
                             <option value="108">Barangay 108</option>
                             <option value="109">Barangay 109</option>
                             <option value="110">Barangay 110</option>
                             <option value="111">Barangay 111</option>
                             <option value="112">Barangay 112</option>
                             <option value="113">Barangay 113</option>
                             <option value="114">Barangay 114</option>
                             <option value="115">Barangay 115</option>
                             <option value="116">Barangay 116</option>
                             <option value="117">Barangay 117</option>
                             <option value="118">Barangay 118</option>
                             <option value="119">Barangay 119</option>
                             <option value="120">Barangay 120</option>
                             <option value="121">Barangay 121</option>
                             <option value="122">Barangay 122</option>
                             <option value="123">Barangay 123</option>
                             <option value="124">Barangay 124</option>
                             <option value="125">Barangay 125</option>
                             <option value="126">Barangay 126</option>
                             <option value="127">Barangay 127</option>
                             <option value="128">Barangay 128</option>
                             <option value="129">Barangay 129</option>
                             <option value="130">Barangay 130</option>
                             <option value="131">Barangay 131</option>
                             <option value="132">Barangay 132</option>
                             <option value="133">Barangay 133</option>
                             <option value="134">Barangay 134</option>
                             <option value="135">Barangay 135</option>
                             <option value="136">Barangay 136</option>
                             <option value="137">Barangay 137</option>
                             <option value="138">Barangay 138</option>
                             <option value="139">Barangay 139</option>
                             <option value="140">Barangay 140</option>
                             <option value="141">Barangay 141</option>
                             <option value="142">Barangay 142</option>
                             <option value="143">Barangay 143</option>
                             <option value="144">Barangay 144</option>
                             <option value="145">Barangay 145</option>
                             <option value="146">Barangay 146</option>
                             <option value="147">Barangay 147</option>
                             <option value="148">Barangay 148</option>
                             <option value="149">Barangay 149</option>
                             <option value="150">Barangay 150</option>
                             <option value="151">Barangay 151</option>
                             <option value="152">Barangay 152</option>
                             <option value="153">Barangay 153</option>
                             <option value="154">Barangay 154</option>
                             <option value="155">Barangay 155</option>
                             <option value="156">Barangay 156</option>
                             <option value="157">Barangay 157</option>
                             <option value="158">Barangay 158</option>
                             <option value="159">Barangay 159</option>
                             <option value="160">Barangay 160</option>
                             <option value="161">Barangay 161</option>
                             <option value="162">Barangay 162</option>
                             <option value="163">Barangay 163</option>
                             <option value="164">Barangay 164</option>
                             <option value="165">Barangay 165</option>
                             <option value="166">Barangay 166</option>
                             <option value="167">Barangay 167</option>
                             <option value="168">Barangay 168</option>
                             <option value="169">Barangay 169</option>
                             <option value="170">Barangay 170</option>
                             <option value="171">Barangay 171</option>
                             <option value="172">Barangay 172</option>
                             <option value="173">Barangay 173</option>
                             <option value="174">Barangay 174</option>
                             <option value="175">Barangay 175</option>
                             <option value="176">Barangay 176</option>
                             <option value="176-A">Barangay 176-A</option>
                             <option value="176-B">Barangay 176-B</option>
                             <option value="176-C">Barangay 176-C</option>
                             <option value="176-D">Barangay 176-D</option>
                             <option value="176-E">Barangay 176-E</option>
                             <option value="177">Barangay 177</option>
                             <option value="178">Barangay 178</option>
                             <option value="179">Barangay 179</option>
                             <option value="180">Barangay 180</option>
                             <option value="181">Barangay 181</option>
                             <option value="182">Barangay 182</option>
                             <option value="183">Barangay 183</option>
                             <option value="184">Barangay 184</option>
                             <option value="185">Barangay 185</option>
                             <option value="186">Barangay 186</option>
                             <option value="187">Barangay 187</option>
                             <option value="188">Barangay 188</option>
                         </select>
                         <p class="text-xs text-gray-500 mt-1">Select your barangay number</p>
                     </div>
                    
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            required 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="Enter your email"
                            value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                        >
                    </div>
                    
                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input 
                            id="phone" 
                            name="phone" 
                            type="tel" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="Phone number (optional)"
                            value="<?php echo htmlspecialchars($_POST['phone'] ?? ''); ?>"
                        >
                    </div>
                    
                    <div>
                        <label for="birth_date" class="block text-sm font-medium text-gray-700 mb-2">
                            Birth Date
                        </label>
                        <input 
                            id="birth_date" 
                            name="birth_date" 
                            type="date" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            value="<?php echo htmlspecialchars($_POST['birth_date'] ?? ''); ?>"
                        >
                    </div>
                    
                    
                </div>

                <div class="flex items-center">
                    <input 
                        id="terms" 
                        name="terms" 
                        type="checkbox" 
                        required
                        class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    >
                    <label for="terms" class="ml-2 block text-sm text-gray-700">
                        I agree to the <a href="#" onclick="showTermsModal()" class="text-primary hover:text-secondary">Terms and Conditions</a> and <a href="#" onclick="showPrivacyModal()" class="text-primary hover:text-secondary">Privacy Policy</a>
                    </label>
                </div>

                <div>
                    <button 
                        type="submit" 
                        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                    >
                        Create Account
                    </button>
                </div>

                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        May account ka na? 
                        <a href="login.php" class="font-medium text-primary hover:text-secondary transition-colors duration-200">
                            Mag-login dito
                        </a>
                    </p>
                </div>
            </form>

            <!-- Information Box -->
            <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 class="text-sm font-medium text-blue-800 mb-2">Important Information:</h3>
                <ul class="text-xs text-blue-700 space-y-1">
                    <li>• This registration is for Caloocan City residents only</li>
                    <li>• All fields marked with * are required</li>
                    <li>• Your information will be kept secure and confidential</li>
                    <li>• Login credentials will be automatically generated and sent to your email</li>
                    <li>• You can change your password after your first login</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Terms and Conditions Modal -->
    <div id="termsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="bg-primary p-6 rounded-t-lg flex justify-between items-center">
                <h2 class="text-2xl font-bold text-white">Mga Tuntunin at Kondisyon</h2>
                <button onclick="closeTermsModal()" class="text-white hover:text-gray-200 text-2xl font-bold">
                    ×
                </button>
            </div>
            
            <!-- Content -->
            <div class="p-6 space-y-6">
                <div class="prose max-w-none">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">1. Panimula</h3>
                    <p class="text-gray-700 mb-4">
                        Ang dokumentong ito ay naglalaman ng mga patakaran at regulasyon para sa paggamit ng Caloocan City Social Services Management System (CCSSMS). Sa pag-access at paggamit ng system, sumasang-ayon ka na sundin ang lahat ng mga tuntunin na nakasaad dito. Ang CCSSMS ay isang digital platform para sa social services, aid distribution, at queue management para sa mga residente ng Caloocan City.
                    </p>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">2. Pagpaparehistro ng User</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>2.1 Eligibility:</strong> Ang mga residente ng Caloocan City na may edad 13 pataas ay maaaring magparehistro.</p>
                        <p class="text-gray-700"><strong>2.2 Accuracy ng Information:</strong> Lahat ng impormasyon sa pagpaparehistro ay dapat na tama at totoo.</p>
                        <p class="text-gray-700"><strong>2.3 Account Security:</strong> Responsable ka sa pagprotekta ng iyong username at password.</p>
                        <p class="text-gray-700"><strong>2.4 Single Account:</strong> Isang account lamang ang pinapayagan bawat tao.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">3. Katanggap-tanggap na Paggamit</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>3.1 Legal Use:</strong> Ang system ay dapat gamitin lamang para sa mga legal at intended na layunin.</p>
                        <p class="text-gray-700"><strong>3.2 Prohibited Activities:</strong> Hindi pinapayagan ang mga sumusunod:</p>
                        <ul class="ml-6 text-gray-700 space-y-1">
                            <li>• Unauthorized access sa mga account</li>
                            <li>• Pagkalat ng maling impormasyon</li>
                            <li>• Pag-abuso sa system resources</li>
                            <li>• Pagtatangkang i-hack o i-compromise ang system</li>
                        </ul>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">4. Privacy at Proteksyon ng Data</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>4.1 Data Collection:</strong> Ang system ay kumokolekta ng personal na impormasyon para sa pagbibigay ng serbisyo.</p>
                        <p class="text-gray-700"><strong>4.2 Data Security:</strong> Lahat ng data ay naka-encrypt at protektado sa ilalim ng Data Privacy Act of 2012.</p>
                        <p class="text-gray-700"><strong>4.3 Data Sharing:</strong> Ang personal na impormasyon ay hindi ibinabahagi sa third parties nang walang pahintulot ng user.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">5. Mga Responsibilidad ng User</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>5.1 Account Maintenance:</strong> Dapat mong i-update ang impormasyon, i-report ang mga suspicious na aktibidad, i-secure ang login credentials, at palaging mag-logout.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">6. Availability ng System</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>6.1 Maintenance:</strong> Ang scheduled maintenance ay maaaring magdulot ng pansamantalang hindi paggamit.</p>
                        <p class="text-gray-700"><strong>6.2 Technical Issues:</strong> Walang garantiya na walang technical issues.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">7. Intellectual Property</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>7.1 Ownership:</strong> Ang CCSSMS at ang content nito ay pagmamay-ari ng Caloocan City Government.</p>
                        <p class="text-gray-700"><strong>7.2 Usage Rights:</strong> Ang mga user ay may limited license para sa personal na paggamit ng system.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">8. Limitasyon ng Liability</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>8.1 No Warranty:</strong> Ang system ay ibinibigay "as is" nang walang warranty.</p>
                        <p class="text-gray-700"><strong>8.2 Limitation:</strong> Ang Caloocan City Government ay hindi responsable para sa indirect, incidental, o consequential damages.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">9. Pagbabago sa mga Tuntunin</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>9.1 Right to Modify:</strong> Ang Caloocan City Government ay maaaring baguhin ang mga tuntunin anumang oras.</p>
                        <p class="text-gray-700"><strong>9.2 Notification:</strong> Ang mga user ay mabibigyan ng notification ng mga pagbabago sa pamamagitan ng system notification o email.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">10. Governing Law</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>10.1 Philippine Law:</strong> Ang mga tuntunin ay pinamumunuan ng mga batas ng Pilipinas.</p>
                        <p class="text-gray-700"><strong>10.2 Jurisdiction:</strong> Ang mga dispute ay dapat na resolbahin sa mga korte ng Caloocan City.</p>
                    </div>
                </div>

                <!-- Acknowledgement Box -->
                <div class="bg-gray-100 p-4 rounded-lg">
                    <p class="text-sm text-gray-700 mb-3">
                        <strong>Pagkilala:</strong> Sa pag-click ng "Sumasang-ayon ako" sa registration form, kinikilala mo na:
                    </p>
                    <ul class="text-sm text-gray-700 space-y-1 ml-4">
                        <li>• Nabasa at naintindihan mo ang mga tuntunin na ito</li>
                        <li>• Sumasang-ayon ka na sundin ang lahat ng mga tuntunin</li>
                        <li>• Responsable ka sa lahat ng mga aksyon na ginagawa gamit ang iyong account</li>
                        <li>• Ang Caloocan City Government ay may karapatan na baguhin ang mga tuntunin</li>
                    </ul>
                </div>
            </div>

            <!-- Footer Buttons -->
            <div class="bg-gray-50 p-6 rounded-b-lg flex justify-end space-x-3">
                <button onclick="closeTermsModal()" class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                    Sarado
                </button>
                <button onclick="closeTermsModal()" class="bg-primary hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                    Sumasang-ayon Ako
                </button>
            </div>
        </div>
    </div>

    <!-- Privacy Policy Modal -->
    <div id="privacyModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="bg-primary p-6 rounded-t-lg flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-white">Privacy Policy</h2>
                </div>
                <button onclick="closePrivacyModal()" class="text-white hover:text-gray-200 text-2xl font-bold">
                    ×
                </button>
            </div>
            
            <!-- Content -->
            <div class="p-6 space-y-6">
                <div class="prose max-w-none">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">1. Panimula</h3>
                    <p class="text-gray-700 mb-4">
                        Ang Privacy Policy na ito ay naglalarawan kung paano kinokolekta, ginagamit, at pinoprotektahan ang personal na impormasyon ng Caloocan City Social Services Management System (CCSSMS). Ang Caloocan City Government ay nakatuon sa privacy at data security ng lahat ng mga user.
                    </p>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">2. Impormasyong Kinokolekta Namin</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>2.1 Personal Information:</strong></p>
                        <ul class="ml-6 text-gray-700 space-y-1">
                            <li>• Pangalan (First Name at Last Name)</li>
                            <li>• Email address</li>
                            <li>• Phone number</li>
                            <li>• Date of birth</li>
                            <li>• Username at password</li>
                        </ul>
                        <p class="text-gray-700 mt-2"><strong>2.2 Usage Information:</strong></p>
                        <ul class="ml-6 text-gray-700 space-y-1">
                            <li>• Login at logout times</li>
                            <li>• Mga serbisyong na-access</li>
                            <li>• System interactions</li>
                        </ul>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">3. Paano Namin Ginagamit ang Impormasyon</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>3.1 Primary Purposes:</strong></p>
                        <ul class="ml-6 text-gray-700 space-y-1">
                            <li>• Pagbibigay ng social services</li>
                            <li>• Account management at security</li>
                            <li>• Communication sa mga user</li>
                            <li>• System improvement</li>
                        </ul>
                        <p class="text-gray-700 mt-2"><strong>3.2 Legal Basis:</strong> Ang data collection ay batay sa Data Privacy Act of 2012 at iba pang applicable na batas.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">4. Proteksyon ng Data</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>4.1 Security Measures:</strong></p>
                        <ul class="ml-6 text-gray-700 space-y-1">
                            <li>• Encryption ng data (AES-256)</li>
                            <li>• Secure HTTPS connection</li>
                            <li>• Access controls at authentication</li>
                            <li>• Regular security audits</li>
                        </ul>
                        <p class="text-gray-700 mt-2"><strong>4.2 Data Retention:</strong> Ang data ay pinapanatili hangga't kinakailangan para sa mga layunin na nakasaad sa policy.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">5. Pagbabahagi ng Data</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>5.1 No Unauthorized Sharing:</strong> Ang personal na impormasyon ay hindi ibinabahagi sa third parties nang walang pahintulot.</p>
                        <p class="text-gray-700"><strong>5.2 Legal Requirements:</strong> Ang data ay maaaring ibahagi kung kinakailangan ng batas o para sa public safety.</p>
                        <p class="text-gray-700"><strong>5.3 Service Providers:</strong> Ang mga trusted service providers na sumusunod sa privacy standards ay maaaring gamitin.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">6. Iyong mga Karapatan</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>6.1 Access:</strong> Karapatan mong makita ang personal data na naka-store sa system.</p>
                        <p class="text-gray-700"><strong>6.2 Correction:</strong> Karapatan mong i-update o i-correct ang maling impormasyon.</p>
                        <p class="text-gray-700"><strong>6.3 Deletion:</strong> Karapatan mong humiling ng deletion ng data (subject sa legal requirements).</p>
                        <p class="text-gray-700"><strong>6.4 Portability:</strong> Karapatan mong makakuha ng copy ng data sa electronic format.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">7. Cookies at Tracking</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>7.1 Essential Cookies:</strong> Ang mga essential cookies ay ginagamit para sa system functionality at security.</p>
                        <p class="text-gray-700"><strong>7.2 No Third-Party Tracking:</strong> Walang third-party tracking o advertising cookies na ginagamit.</p>
                        <p class="text-gray-700"><strong>7.3 Cookie Management:</strong> Ang mga user ay maaaring pamahalaan ang cookie preferences sa kanilang browser settings.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">8. Privacy ng mga Bata</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>8.1 Age Requirement:</strong> Ang system ay para sa mga user na may edad 13 pataas.</p>
                        <p class="text-gray-700"><strong>8.2 Parental Consent:</strong> Ang parental consent ay kinakailangan para sa mga user na may edad 13-17.</p>
                        <p class="text-gray-700"><strong>8.3 Protection:</strong> Ang personal data ng mga menor de edad ay may karagdagang proteksyon.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">9. Pagbabago sa Privacy Policy</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>9.1 Notification:</strong> Ang mga user ay mabibigyan ng notification ng anumang pagbabago sa privacy policy.</p>
                        <p class="text-gray-700"><strong>9.2 Continued Use:</strong> Ang patuloy na paggamit ng system ay nangangahulugan ng pagsang-ayon sa mga pagbabago.</p>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-3">10. Contact Information</h3>
                    <div class="ml-4 space-y-2">
                        <p class="text-gray-700"><strong>10.1 Data Protection Officer:</strong></p>
                        <ul class="ml-6 text-gray-700 space-y-1">
                            <li>• Email: dpo@caloocancity.gov.ph</li>
                            <li>• Phone: +63 2 8xxx xxxxx</li>
                            <li>• Address: Caloocan City Hall, Caloocan City</li>
                        </ul>
                        <p class="text-gray-700 mt-2"><strong>10.2 Complaints:</strong> Para sa mga reklamo o concern tungkol sa privacy, makipag-ugnayan sa Data Protection Officer.</p>
                    </div>
                </div>

                <!-- Acknowledgement Box -->
                <div class="bg-blue-100 p-4 rounded-lg">
                    <p class="text-sm text-gray-700 mb-3">
                        <strong>Pagkilala:</strong> Sa pag-click ng "Sumasang-ayon ako" sa registration form, kinikilala mo na:
                    </p>
                    <ul class="text-sm text-gray-700 space-y-1 ml-4">
                        <li>• Nabasa at naintindihan mo ang privacy policy na ito</li>
                        <li>• Sumasang-ayon ka sa pagkokolekta at paggamit ng iyong data</li>
                        <li>• Naiintindihan mo ang iyong mga karapatan sa privacy</li>
                        <li>• Sumasang-ayon ka sa mga security measures na ginagamit namin</li>
                    </ul>
                </div>
            </div>

            <!-- Footer Buttons -->
            <div class="bg-gray-50 p-6 rounded-b-lg flex justify-end space-x-3">
                <button onclick="closePrivacyModal()" class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                    Sarado
                </button>
                <button onclick="closePrivacyModal()" class="bg-primary hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                    Sumasang-ayon Ako
                </button>
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
        // Add input focus effects
        document.addEventListener('DOMContentLoaded', function() {
            const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.classList.add('ring-2', 'ring-primary', 'ring-opacity-20');
                });
                
                input.addEventListener('blur', function() {
                    this.classList.remove('ring-2', 'ring-primary', 'ring-opacity-20');
                });
            });
        });

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

        // Modal Functions
        function showTermsModal() {
            document.getElementById('termsModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeTermsModal() {
            document.getElementById('termsModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        function showPrivacyModal() {
            document.getElementById('privacyModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closePrivacyModal() {
            document.getElementById('privacyModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        // Close modals when clicking outside
        document.addEventListener('DOMContentLoaded', function() {
            const termsModal = document.getElementById('termsModal');
            const privacyModal = document.getElementById('privacyModal');

            termsModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeTermsModal();
                }
            });

            privacyModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closePrivacyModal();
                }
            });

            // Close modals with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeTermsModal();
                    closePrivacyModal();
                }
            });
        });
    </script>
</body>
</html>
