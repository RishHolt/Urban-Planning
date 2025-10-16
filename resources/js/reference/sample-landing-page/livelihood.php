<?php
session_start();
require_once 'config/database.php';

// Check if user is already logged in
$isLoggedIn = isset($_SESSION['user_id']);
$user = null;

if ($isLoggedIn) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND status = 'active'");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            session_destroy();
            $isLoggedIn = false;
            $user = null;
        }
    } catch (Exception $e) {
        session_destroy();
        $isLoggedIn = false;
        $user = null;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Livelihood & Trainings - Employment & Skills Development | Caloocan City</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
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
                    }
                }
            }
        }
    </script>
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
                        <h1 class="text-sm sm:text-lg md:text-xl font-bold text-white">Caloocan City</h1>
                        <p class="text-xs sm:text-sm text-white opacity-90">Social Services</p>
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
                        <?php if ($isLoggedIn): ?>
                        <a href="dashboard.php" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Dashboard</a>
                        <?php endif; ?>
                    </div>

                    <!-- Authentication Buttons -->
                    <div class="flex items-center space-x-2 lg:space-x-4">
                        <?php if ($isLoggedIn): ?>
                            <!-- User is logged in -->
                            <div class="flex items-center space-x-3">
                                <span class="text-white text-sm">
                                    Welcome, <?php echo htmlspecialchars($user['first_name']); ?>!
                                </span>
                                <a href="dashboard.php" class="bg-white hover:bg-gray-100 text-primary px-3 lg:px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-block text-sm lg:text-base">
                                    Dashboard
                                </a>
                                <a href="logout.php" class="bg-red-600 hover:bg-red-700 text-white px-3 lg:px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-block text-sm lg:text-base">
                                    Logout
                                </a>
                            </div>
                        <?php else: ?>
                            <!-- User is not logged in -->
                            <a href="login.php" class="bg-white hover:bg-gray-100 text-primary px-3 lg:px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-block text-sm lg:text-base">
                                Mag-login
                            </a>
                            <a href="register.php" class="bg-green-600 hover:bg-green-700 text-white px-3 lg:px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-block text-sm lg:text-base">
                                Mag-register
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div id="mobile-menu" class="md:hidden hidden bg-primary">
                <div class="px-2 pt-2 pb-3 space-y-1">
                    <a href="index.php" class="block px-3 py-2 text-white hover:text-gray-200 font-medium">Home</a>
                    <a href="index.php#services" class="block px-3 py-2 text-white hover:text-gray-200 font-medium">Our Services</a>
                    <?php if ($isLoggedIn): ?>
                    <a href="dashboard.php" class="block px-3 py-2 text-white hover:text-gray-200 font-medium">Dashboard</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex justify-center mb-6">
                <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div class="flex space-x-1">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>
            <h1 class="text-4xl font-bold mb-4">Livelihood & Trainings</h1>
            <p class="text-xl mb-6">Employment & Skills Development</p>
            <p class="text-lg opacity-90 max-w-3xl mx-auto">
                Support programs para sa sustainable livelihood at economic empowerment. Professional development at skills training para sa lahat ng ages.
            </p>
        </div>
    </section>

    <!-- Main Content -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Livelihood Programs -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Livelihood Programs</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Small Business Development</h3>
                        <p class="text-gray-600 mb-4">
                            Support para sa mga residents na gustong mag-start ng small business. May business planning, financial assistance, at mentoring programs.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Business planning workshops</li>
                            <li>• Financial assistance</li>
                            <li>• Mentoring programs</li>
                            <li>• Market access support</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Agricultural Livelihood</h3>
                        <p class="text-gray-600 mb-4">
                            Programs para sa urban farming at agricultural activities. May vegetable gardening, poultry raising, at fish farming projects.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Urban farming projects</li>
                            <li>• Vegetable gardening</li>
                            <li>• Poultry raising</li>
                            <li>• Fish farming</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Handicraft Production</h3>
                        <p class="text-gray-600 mb-4">
                            Skills development para sa handicraft making at product development. May weaving, pottery, jewelry making, at other creative crafts.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Weaving techniques</li>
                            <li>• Pottery making</li>
                            <li>• Jewelry crafting</li>
                            <li>• Product design</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Training Programs -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Training Programs</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Computer Skills Training</h3>
                        <p class="text-gray-600 mb-4">
                            Basic to advanced computer skills training para sa lahat ng ages. May Microsoft Office, internet usage, at basic programming.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Microsoft Office Suite</li>
                            <li>• Internet & email usage</li>
                            <li>• Basic programming</li>
                            <li>• Digital marketing</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Technical Skills</h3>
                        <p class="text-gray-600 mb-4">
                            Technical skills training para sa various industries. May electrical, plumbing, automotive, at construction skills.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Electrical installation</li>
                            <li>• Plumbing skills</li>
                            <li>• Automotive repair</li>
                            <li>• Construction skills</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Soft Skills Development</h3>
                        <p class="text-gray-600 mb-4">
                            Communication, leadership, at customer service skills training. Para sa better job opportunities at career advancement.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Communication skills</li>
                            <li>• Leadership training</li>
                            <li>• Customer service</li>
                            <li>• Team building</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Job Placement Services -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Job Placement Services</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Job Matching</h3>
                        <p class="text-gray-600 mb-4">
                            Job matching services para sa mga trained individuals. May job fairs, employer connections, at career counseling.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Job fairs</li>
                            <li>• Employer connections</li>
                            <li>• Career counseling</li>
                            <li>• Resume writing</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Internship Programs</h3>
                        <p class="text-gray-600 mb-4">
                            Internship opportunities para sa practical experience. May partnerships with local businesses at government offices.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Local business partnerships</li>
                            <li>• Government office internships</li>
                            <li>• Practical experience</li>
                            <li>• Skill application</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Financial Support -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Financial Support Programs</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Startup Capital</h3>
                        <p class="text-gray-600 mb-4">
                            Financial assistance para sa business startup. May low-interest loans, grants, at seed funding para sa qualified applicants.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Low-interest loans</li>
                            <li>• Business grants</li>
                            <li>• Seed funding</li>
                            <li>• Equipment financing</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Training Scholarships</h3>
                        <p class="text-gray-600 mb-4">
                            Free training programs at scholarships para sa skills development. May full coverage ng training fees at materials.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Free training programs</li>
                            <li>• Training materials</li>
                            <li>• Certification fees</li>
                            <li>• Transportation allowance</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Market Access Support</h3>
                        <p class="text-gray-600 mb-4">
                            Support para sa market access at product promotion. May trade fairs, online marketing, at business networking events.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Trade fairs</li>
                            <li>• Online marketing</li>
                            <li>• Business networking</li>
                            <li>• Market research</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- How to Apply Section -->
            <div class="bg-indigo-50 p-8 rounded-lg">
                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Paano Mag-apply sa Livelihood & Training Programs?</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Requirements:</h3>
                        <ul class="text-gray-600 space-y-2">
                            <li>• Valid government ID</li>
                            <li>• Barangay clearance</li>
                            <li>• Proof of income</li>
                            <li>• Recent 2x2 photo</li>
                            <li>• Letter of intent</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Application Process:</h3>
                        <ol class="text-gray-600 space-y-2">
                            <li>1. Visit Livelihood office sa City Hall</li>
                            <li>2. Submit requirements at application form</li>
                            <li>3. Undergo interview at assessment</li>
                            <li>4. Wait for approval notification</li>
                            <li>5. Start training or receive assistance</li>
                        </ol>
                    </div>
                </div>
                <div class="text-center mt-8">
                    <a href="index.php" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                        Bumalik sa Home
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div>
                <h3 class="text-xl font-bold text-white mb-4">Caloocan City Social Services</h3>
                <p class="text-gray-400 leading-relaxed">
                    Providing essential social services to the residents of Caloocan City.
                </p>
            </div>
            <div>
                <h3 class="text-xl font-bold text-white mb-4">Quick Links</h3>
                <ul class="space-y-3">
                    <li><a href="index.php" class="text-gray-400 hover:text-white transition-colors duration-200">Home</a></li>
                    <li><a href="index.php#services" class="text-gray-400 hover:text-white transition-colors duration-200">Our Services</a></li>
                    <li><a href="about.php" class="text-gray-400 hover:text-white transition-colors duration-200">About Us</a></li>
                    <li><a href="contact.php" class="text-gray-400 hover:text-white transition-colors duration-200">Contact</a></li>
                </ul>
            </div>
            <div>
                <h3 class="text-xl font-bold text-white mb-4">Contact Us</h3>
                <ul class="space-y-3">
                    <li class="flex items-start"><span class="text-gray-400 mr-3">📍</span>Caloocan City Hall, 123 Main St.</li>
                    <li class="flex items-center"><span class="text-gray-400 mr-3">📞</span>Tel: (02) 123-4567</li>
                    <li class="flex items-center"><span class="text-gray-400 mr-3">📧</span>Email: info@caloocancity.gov.ph</li>
                </ul>
            </div>
        </div>
        <div class="mt-12 text-center text-gray-500 text-sm">
            &copy; <?php echo date('Y'); ?> Caloocan City Social Services Management System. All rights reserved.
        </div>
    </footer>

    <script>
        // JavaScript for mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    </script>
</body>
</html>
