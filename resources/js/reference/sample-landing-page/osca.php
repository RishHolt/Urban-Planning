
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSCA - Office for Senior Citizens Affairs | Caloocan City</title>
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

                    </div>

                    <!-- Authentication Buttons -->
                    <div class="flex items-center space-x-2 lg:space-x-4">
                        <!-- Always show Login and Register buttons -->
                        <a href="login.php" class="bg-white hover:bg-gray-100 text-primary px-3 lg:px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-block text-sm lg:text-base">
                            Login
                            </a>
                        <a href="register.php" class="border-2 border-white text-white hover:bg-white hover:text-primary px-3 lg:px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-block text-sm lg:text-base">
                            Register
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
                    <?php if ($isLoggedIn): ?>
                    <a href="dashboard.php" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Dashboard</a>
                    <div class="flex flex-col space-y-2">
                        <a href="dashboard.php" class="bg-white hover:bg-gray-100 text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Dashboard
                        </a>
                        <a href="logout.php" class="border-2 border-white text-white hover:bg-white hover:text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Logout
                        </a>
                    </div>
                    <?php else: ?>
                    <div class="flex flex-col space-y-2">
                        <a href="login.php" class="bg-white hover:bg-gray-100 text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Login
                        </a>
                        <a href="register.php" class="border-2 border-white text-white hover:bg-white hover:text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Register
                        </a>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex justify-center mb-6">
                <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                    </svg>
                </div>
            </div>
            <h1 class="text-4xl font-bold mb-4">OSCA</h1>
            <p class="text-xl mb-6">Office for Senior Citizens Affairs</p>
            <p class="text-lg opacity-90 max-w-3xl mx-auto">
                Dedicated services at programs para sa mga senior citizens at elderly care. Honoring our elders, building stronger communities.
            </p>
        </div>
    </section>

    <!-- Main Content -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Healthcare Assistance -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Healthcare Assistance</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Free Medical Check-ups</h3>
                        <p class="text-gray-600 mb-4">
                            Regular health check-ups para sa mga senior citizens. May blood pressure monitoring, blood sugar testing, at general health assessment.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Monthly health check-ups</li>
                            <li>• Blood pressure monitoring</li>
                            <li>• Blood sugar testing</li>
                            <li>• Health consultation</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Medicine Assistance</h3>
                        <p class="text-gray-600 mb-4">
                            Free medicines para sa common ailments ng mga seniors. May maintenance medicines para sa hypertension, diabetes, at arthritis.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Maintenance medicines</li>
                            <li>• Pain relievers</li>
                            <li>• Vitamins at supplements</li>
                            <li>• Emergency medicines</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Home Healthcare Services</h3>
                        <p class="text-gray-600 mb-4">
                            Home visits ng healthcare workers para sa mga seniors na hindi makapunta sa health center. May nursing care at health monitoring.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Home health visits</li>
                            <li>• Nursing care</li>
                            <li>• Health monitoring</li>
                            <li>• Family caregiver training</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Social Activities -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Social Activities & Recreation</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Senior Citizens Club</h3>
                        <p class="text-gray-600 mb-4">
                            Regular meetings at activities para sa mga senior citizens. May exercise classes, games, at social gatherings para ma-maintain ang social connections.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Weekly meetings</li>
                            <li>• Exercise classes</li>
                            <li>• Board games at card games</li>
                            <li>• Birthday celebrations</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Recreational Trips</h3>
                        <p class="text-gray-600 mb-4">
                            Educational trips at outings para sa mga seniors. May visits sa historical sites, parks, at other interesting places sa Metro Manila.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Historical site visits</li>
                            <li>• Park outings</li>
                            <li>• Museum tours</li>
                            <li>• Shopping trips</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Financial Support -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Financial Support Programs</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Social Pension</h3>
                        <p class="text-gray-600 mb-4">
                            Monthly pension para sa mga indigent senior citizens. May P500 monthly allowance para sa daily needs at medicines.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• P500 monthly pension</li>
                            <li>• For 60+ years old</li>
                            <li>• No other pension sources</li>
                            <li>• Quarterly distribution</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Emergency Assistance</h3>
                        <p class="text-gray-600 mb-4">
                            Financial assistance para sa mga emergency situations. May medical emergency assistance, funeral assistance, at other urgent needs.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Medical emergency assistance</li>
                            <li>• Funeral assistance</li>
                            <li>• Hospital bills support</li>
                            <li>• Emergency food assistance</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Livelihood Support</h3>
                        <p class="text-gray-600 mb-4">
                            Support para sa mga seniors na gustong mag-work pa rin. May small business assistance, skills training, at income-generating projects.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Small business assistance</li>
                            <li>• Skills training</li>
                            <li>• Income-generating projects</li>
                            <li>• Market access support</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Legal & Advocacy -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Legal & Advocacy Services</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Legal Assistance</h3>
                        <p class="text-gray-600 mb-4">
                            Free legal consultation at assistance para sa mga seniors. May help sa pension claims, property rights, at other legal concerns.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Legal consultation</li>
                            <li>• Pension claims assistance</li>
                            <li>• Property rights protection</li>
                            <li>• Document preparation</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Rights Advocacy</h3>
                        <p class="text-gray-600 mb-4">
                            Advocacy para sa rights at welfare ng mga senior citizens. May information campaigns, seminars, at community education programs.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Rights awareness campaigns</li>
                            <li>• Educational seminars</li>
                            <li>• Community outreach</li>
                            <li>• Policy recommendations</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- How to Apply Section -->
            <div class="bg-pink-50 p-8 rounded-lg">
                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Paano Mag-apply sa OSCA Services?</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Requirements:</h3>
                        <ul class="text-gray-600 space-y-2">
                            <li>• Senior Citizen ID or birth certificate</li>
                            <li>• Valid government ID</li>
                            <li>• Barangay clearance</li>
                            <li>• Recent 2x2 photo</li>
                            <li>• Proof of income (if applicable)</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Application Process:</h3>
                        <ol class="text-gray-600 space-y-2">
                            <li>1. Visit OSCA office sa City Hall</li>
                            <li>2. Submit requirements at application form</li>
                            <li>3. Undergo interview at assessment</li>
                            <li>4. Wait for approval notification</li>
                            <li>5. Start receiving services</li>
                        </ol>
                    </div>
                </div>
                <div class="text-center mt-8">
                    <a href="index.php" class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
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
    </script>
</body>
</html>
