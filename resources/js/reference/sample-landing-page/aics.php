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
    <title>AICS - Assistance to Individuals in Crisis Situation | Caloocan City</title>
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
    <section class="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex justify-center mb-6">
                <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                    </svg>
                </div>
            </div>
            <h1 class="text-4xl font-bold mb-4">AICS</h1>
            <p class="text-xl mb-6">Assistance to Individuals in Crisis Situation</p>
            <p class="text-lg opacity-90 max-w-3xl mx-auto">
                Emergency financial assistance para sa mga individuals at families na may crisis situations. Providing hope and support during difficult times.
            </p>
        </div>
    </section>

    <!-- Main Content -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Medical Expenses Assistance -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Medical Expenses Assistance</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Hospital Bills Support</h3>
                        <p class="text-gray-600 mb-4">
                            Financial assistance para sa hospital bills, medical procedures, at laboratory tests. Para sa mga patients na walang health insurance o insufficient coverage.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Hospital confinement fees</li>
                            <li>• Medical procedures</li>
                            <li>• Laboratory tests</li>
                            <li>• Medicine costs</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Emergency Medical Care</h3>
                        <p class="text-gray-600 mb-4">
                            Immediate financial support para sa emergency medical situations. May assistance para sa accidents, sudden illnesses, at critical health conditions.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Emergency room fees</li>
                            <li>• Critical care expenses</li>
                            <li>• Emergency surgeries</li>
                            <li>• Ambulance services</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Medical Equipment</h3>
                        <p class="text-gray-600 mb-4">
                            Assistance para sa medical equipment at devices na kailangan ng patients. May wheelchairs, oxygen tanks, at other medical supplies.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Wheelchairs</li>
                            <li>• Oxygen tanks</li>
                            <li>• Medical supplies</li>
                            <li>• Assistive devices</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Funeral Assistance -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Funeral Assistance</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Burial Expenses</h3>
                        <p class="text-gray-600 mb-4">
                            Financial assistance para sa burial expenses ng deceased family members. May support para sa casket, burial plot, at funeral services.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Casket costs</li>
                            <li>• Burial plot fees</li>
                            <li>• Funeral services</li>
                            <li>• Transportation costs</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Cremation Services</h3>
                        <p class="text-gray-600 mb-4">
                            Alternative assistance para sa cremation services. May support para sa cremation fees, urn costs, at memorial services.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Cremation fees</li>
                            <li>• Urn costs</li>
                            <li>• Memorial services</li>
                            <li>• Documentation fees</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Transportation Assistance -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Transportation Assistance</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1l3.5 3.5a1 1 0 001.5 0L12 15H17a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Medical Transportation</h3>
                        <p class="text-gray-600 mb-4">
                            Transportation assistance para sa medical appointments, hospital visits, at emergency medical situations. May fuel assistance at fare support.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Medical appointment transport</li>
                            <li>• Hospital visits</li>
                            <li>• Emergency transport</li>
                            <li>• Fuel assistance</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Relocation Support</h3>
                        <p class="text-gray-600 mb-4">
                            Transportation assistance para sa families na kailangan mag-relocate due to disasters, eviction, o other emergency situations.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Disaster relocation</li>
                            <li>• Eviction assistance</li>
                            <li>• Moving costs</li>
                            <li>• Temporary shelter transport</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Job Search Transport</h3>
                        <p class="text-gray-600 mb-4">
                            Transportation assistance para sa job hunting activities. May support para sa job interviews, training programs, at employment-related travel.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Job interview transport</li>
                            <li>• Training program travel</li>
                            <li>• Employment-related trips</li>
                            <li>• Job fair attendance</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Other Crisis Situations -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Other Crisis Situations</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Natural Disasters</h3>
                        <p class="text-gray-600 mb-4">
                            Emergency assistance para sa families na affected ng natural disasters. May food assistance, temporary shelter, at basic needs support.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Food assistance</li>
                            <li>• Temporary shelter</li>
                            <li>• Basic needs support</li>
                            <li>• Recovery assistance</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Family Emergencies</h3>
                        <p class="text-gray-600 mb-4">
                            Support para sa family emergencies like domestic violence, child abandonment, at other family crisis situations. May counseling at temporary support.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Domestic violence support</li>
                            <li>• Child protection assistance</li>
                            <li>• Family counseling</li>
                            <li>• Temporary shelter</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- How to Apply Section -->
            <div class="bg-red-50 p-8 rounded-lg">
                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Paano Mag-apply sa AICS?</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Requirements:</h3>
                        <ul class="text-gray-600 space-y-2">
                            <li>• Valid government ID</li>
                            <li>• Barangay clearance</li>
                            <li>• Proof of crisis situation</li>
                            <li>• Medical certificate (if medical)</li>
                            <li>• Death certificate (if funeral)</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Application Process:</h3>
                        <ol class="text-gray-600 space-y-2">
                            <li>1. Visit AICS office sa City Hall</li>
                            <li>2. Submit requirements at application form</li>
                            <li>3. Undergo interview at assessment</li>
                            <li>4. Wait for approval notification</li>
                            <li>5. Receive financial assistance</li>
                        </ol>
                    </div>
                </div>
                <div class="text-center mt-8">
                    <a href="index.php" class="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
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
