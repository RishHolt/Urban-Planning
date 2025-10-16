
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDAO - Persons with Disability Affairs Office | Caloocan City</title>
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
    <section class="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex justify-center mb-6">
                <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                    </svg>
                </div>
            </div>
            <h1 class="text-4xl font-bold mb-4">PDAO</h1>
            <p class="text-xl mb-6">Persons with Disability Affairs Office</p>
            <p class="text-lg opacity-90 max-w-3xl mx-auto">
                Specialized services at support para sa mga persons with disabilities sa ating community. Empowering lives, building inclusive communities.
            </p>
        </div>
    </section>

    <!-- Main Content -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Accessibility Assistance -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Accessibility Assistance</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Home Accessibility Modifications</h3>
                        <p class="text-gray-600 mb-4">
                            Free home modifications para sa mga PWDs na nangangailangan ng accessibility improvements. May ramps, grab bars, at bathroom modifications.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Wheelchair ramps installation</li>
                            <li>• Grab bars at handrails</li>
                            <li>• Bathroom accessibility</li>
                            <li>• Door widening</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Public Space Accessibility</h3>
                        <p class="text-gray-600 mb-4">
                            Working with local businesses at government offices para ma-improve ang accessibility ng public spaces. May accessibility audits at recommendations.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Accessibility audits</li>
                            <li>• Ramp installations</li>
                            <li>• Signage improvements</li>
                            <li>• Parking space allocation</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1l3.5 3.5a1 1 0 001.5 0L12 15H17a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Transportation Assistance</h3>
                        <p class="text-gray-600 mb-4">
                            Special transportation services para sa mga PWDs na may difficulty sa pag-commute. May wheelchair-accessible vehicles at escort services.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Wheelchair-accessible vehicles</li>
                            <li>• Escort services</li>
                            <li>• Medical appointment transport</li>
                            <li>• Shopping assistance</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Mobility Aids -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Mobility Aids & Equipment</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Wheelchair Distribution</h3>
                        <p class="text-gray-600 mb-4">
                            Free wheelchairs para sa mga PWDs na nangangailangan. May different types: manual, electric, at specialized wheelchairs para sa specific needs.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Manual wheelchairs</li>
                            <li>• Electric wheelchairs</li>
                            <li>• Specialized wheelchairs</li>
                            <li>• Maintenance services</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Assistive Devices</h3>
                        <p class="text-gray-600 mb-4">
                            Various assistive devices para sa daily activities. May walking canes, crutches, hearing aids, at visual aids para sa mga may hearing at vision impairments.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Walking canes at crutches</li>
                            <li>• Hearing aids</li>
                            <li>• Visual aids</li>
                            <li>• Daily living aids</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Educational Support -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Educational Support</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Special Education Support</h3>
                        <p class="text-gray-600 mb-4">
                            Educational assistance para sa mga PWD students. May special education programs, learning materials, at teacher training para sa inclusive education.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Special education programs</li>
                            <li>• Learning materials</li>
                            <li>• Teacher training</li>
                            <li>• Individualized education plans</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Skills Training Programs</h3>
                        <p class="text-gray-600 mb-4">
                            Vocational training at skills development para sa mga PWDs. May computer training, handicraft making, at other income-generating skills.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Computer training</li>
                            <li>• Handicraft making</li>
                            <li>• Business skills</li>
                            <li>• Job placement assistance</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Parent Support Groups</h3>
                        <p class="text-gray-600 mb-4">
                            Support groups para sa mga parents ng PWD children. May counseling, information sharing, at emotional support para sa family members.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Monthly meetings</li>
                            <li>• Counseling services</li>
                            <li>• Information sharing</li>
                            <li>• Family activities</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Employment Support -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Employment Support</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Job Placement Services</h3>
                        <p class="text-gray-600 mb-4">
                            Job placement assistance para sa mga PWDs na gustong mag-work. May job matching, interview preparation, at workplace accommodation support.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Job matching services</li>
                            <li>• Interview preparation</li>
                            <li>• Workplace accommodation</li>
                            <li>• Employer education</li>
                        </ul>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Entrepreneurship Support</h3>
                        <p class="text-gray-600 mb-4">
                            Support para sa mga PWDs na gustong mag-business. May business planning, financial assistance, at mentoring programs.
                        </p>
                        <ul class="text-sm text-gray-600 space-y-2">
                            <li>• Business planning</li>
                            <li>• Financial assistance</li>
                            <li>• Mentoring programs</li>
                            <li>• Market access support</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- How to Apply Section -->
            <div class="bg-blue-50 p-8 rounded-lg">
                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Paano Mag-apply sa PDAO Services?</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Requirements:</h3>
                        <ul class="text-gray-600 space-y-2">
                            <li>• PWD ID or medical certificate</li>
                            <li>• Valid government ID</li>
                            <li>• Barangay clearance</li>
                            <li>• Recent 2x2 photo</li>
                            <li>• Proof of income (if applicable)</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Application Process:</h3>
                        <ol class="text-gray-600 space-y-2">
                            <li>1. Visit PDAO office sa City Hall</li>
                            <li>2. Submit requirements at application form</li>
                            <li>3. Undergo assessment at interview</li>
                            <li>4. Wait for approval notification</li>
                            <li>5. Receive services or equipment</li>
                        </ol>
                    </div>
                </div>
                <div class="text-center mt-8">
                    <a href="index.php" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
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
