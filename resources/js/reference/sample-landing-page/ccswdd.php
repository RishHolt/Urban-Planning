
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
                    <div class="flex flex-col space-y-2">
                        <a href="login.php" class="bg-white hover:bg-gray-100 text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Login
                        </a>
                        <a href="register.php" class="border-2 border-white text-white hover:bg-white hover:text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Register
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="text-gray-800 py-16" style="background-color: #3e9b0a80;">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex justify-center mb-6">
                <div class="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                    <img src="image/ccswdd.jpg" alt="AICS Logo" class="w-24 h-24 object-cover rounded-full">
                </div>
            </div>
            <h1 class="text-4xl font-bold mb-4">Assistance to Individuals in Crisis Situation (AICS)</h1>
        </div>
    </section>

    <!-- Main Content -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- AICS - Assistance to Individuals in Crisis Situation -->
            <div class="mb-16">
                
                <p class="text-center text-gray-600 mb-8 max-w-4xl mx-auto">
                    Financial assistance para sa mga indigent residents na nasa extremely difficult circumstances tulad ng medical emergencies, burial expenses, educational needs, at transportation assistance.
                </p>
                
                                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                     <!-- Medical Assistance -->
                     <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 ease-in-out transform">
                         <div class="bg-green-100 p-4 flex justify-center">
                         </div>
                         <div class="p-6 flex flex-col flex-grow">
                             <h3 class="text-xl font-bold text-gray-800 mb-2">Medical Assistance</h3>
                             <div class="flex-grow">
                                 <h4 class="font-semibold text-gray-700 mb-2 text-sm">Requirements:</h4>
                                 <ul class="text-xs text-gray-600 space-y-1">
                                     <li>• Barangay Indigency Certificate</li>
                                     <li>• Medical Abstract from Hospital</li>
                                     <li>• Hospital Bill</li>
                                     <li>• Hospital Request Slip Form</li>
                                     <li>• Personal Letter from Client</li>
                                     <li>• Latest Medical Prescription</li>
                                     <li>• Any valid government issued ID</li>
                                 </ul>
                             </div>
                             <div class="mt-auto flex justify-end">
                                 <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                 </svg>
                             </div>
                         </div>
                     </div>

                     <!-- Burial Assistance -->
                     <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 ease-in-out transform">
                         <div class="bg-green-100 p-4 flex justify-center">
                         </div>
                         <div class="p-6 flex flex-col flex-grow">
                             <h3 class="text-xl font-bold text-gray-800 mb-2">Burial Assistance</h3>
                             <div class="flex-grow">
                                 <h4 class="font-semibold text-gray-700 mb-2 text-sm">Requirements:</h4>
                                 <ul class="text-xs text-gray-600 space-y-1">
                                     <li>• Death Certificate with Registry Number</li>
                                     <li>• Barangay Indigency Certificate</li>
                                     <li>• Funeral Contract</li>
                                     <li>• Any valid government issued ID</li>
                                 </ul>
                             </div>
                             <div class="mt-auto flex justify-end">
                                 <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                 </svg>
                             </div>
                         </div>
                     </div>

                     <!-- Educational Assistance -->
                     <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 ease-in-out transform">
                         <div class="bg-green-100 p-4 flex justify-center">
                         </div>
                         <div class="p-6 flex flex-col flex-grow">
                             <h3 class="text-xl font-bold text-gray-800 mb-2">Educational Assistance</h3>
                             <div class="flex-grow">
                                 <h4 class="font-semibold text-gray-700 mb-2 text-sm">Requirements:</h4>
                                 <ul class="text-xs text-gray-600 space-y-1">
                                     <li>• Barangay Certificate of Indigency</li>
                                     <li>• Personal/Request Letter</li>
                                     <li>• Form 137 or Class Card/Registration Form</li>
                                     <li>• Any valid government issued ID</li>
                                 </ul>
                             </div>
                             <div class="mt-auto flex justify-end">
                                 <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                 </svg>
                             </div>
                         </div>
                     </div>

                     <!-- Transportation Assistance -->
                     <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 ease-in-out transform">
                         <div class="bg-green-100 p-4 flex justify-center">
                         </div>
                         <div class="p-6 flex flex-col flex-grow">
                             <h3 class="text-xl font-bold text-gray-800 mb-2">Transportation Assistance / Balik Probinsya Program</h3>
                             <div class="flex-grow">
                                 <h4 class="font-semibold text-gray-700 mb-2 text-sm">Requirements:</h4>
                                 <ul class="text-xs text-gray-600 space-y-1">
                                     <li>• Barangay Indigency Certificate</li>
                                     <li>• Any valid government issued ID</li>
                                 </ul>
                             </div>
                             <div class="mt-auto flex justify-end">
                                 <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                 </svg>
                             </div>
                         </div>
                     </div>
                 </div>






            <!-- Case Management Process for Special Cases -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Case Management Process for Special Cases</h2>
                <p class="text-center text-gray-600 mb-8 max-w-4xl mx-auto">
                    Conduct case planning and management para sa mga reported Child in Need of Special Protection (CNSP), Violence Against Women and Children (VAWC) victims/survivors, Children in Conflict with the Law (CICL), Drug Dependents, at Abandoned Elderly.
                </p>
                
                                 <div class="grid grid-cols-1 gap-8 mb-12">
                     <!-- Combined Case Management Card -->
                     <div class="bg-white p-8 rounded-lg shadow-md border-l-4 border-purple-500 max-w-4xl mx-auto">
                         <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                             <svg class="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                 <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                             </svg>
                         </div>
                         <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Case Management for Special Cases</h3>
                         
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <!-- Requirements Section -->
                             <div>
                                 <h4 class="text-lg font-bold text-gray-800 mb-3 text-purple-600">Requirements:</h4>
                                 <ul class="text-sm text-gray-600 space-y-2">
                                     <li>• Report through telephone or referral letter</li>
                                     <li>• Police report (Caloocan PNP)</li>
                                     <li>• Barangay blotter (Barangay)</li>
                                     <li>• Birth certificate and other documents</li>
                                     <li>• Medical Certificate (If available)</li>
                                 </ul>
                             </div>
                             
                             <!-- Cases Covered Section -->
                             <div>
                                 <h4 class="text-lg font-bold text-gray-800 mb-3 text-indigo-600">Special Cases Covered:</h4>
                                 <ul class="text-sm text-gray-600 space-y-2">
                                     <li>• Child in Need of Special Protection (CNSP)</li>
                                     <li>• Violence Against Women and Children (VAWC)</li>
                                     <li>• Physically, Sexually and Emotionally Abused</li>
                                     <li>• Children in Conflict with the Law (CICL)</li>
                                     <li>• Drug Dependents – Child and Adults</li>
                                     <li>• Abandoned Elderly</li>
                                 </ul>
                             </div>
                         </div>
                         
                         <div class="mt-8 text-center">
                             <button onclick="showApplyModal('Case Management for Special Cases')" class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200">
                                 Mag-apply
                             </button>
                         </div>
                     </div>
                 </div>

                <div class="bg-purple-50 p-8 rounded-lg">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Case Management Process</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-white font-bold text-xl">1</span>
                            </div>
                            <h4 class="font-bold text-gray-800 mb-2">Initial Assessment</h4>
                            <p class="text-gray-600 text-sm">Receive and evaluate reports, conduct initial interviews, and assess immediate needs</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-white font-bold text-xl">2</span>
                            </div>
                            <h4 class="font-bold text-gray-800 mb-2">Case Planning</h4>
                            <p class="text-gray-600 text-sm">Develop comprehensive case plan, coordinate with relevant agencies, and establish intervention strategies</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-white font-bold text-xl">3</span>
                            </div>
                            <h4 class="font-bold text-gray-800 mb-2">Implementation & Monitoring</h4>
                            <p class="text-gray-600 text-sm">Execute case plan, provide ongoing support, and monitor progress towards goals</p>
                        </div>
                    </div>
                </div>
            </div>

                         <!-- Office Information -->
             <div class="bg-gray-50 p-8 rounded-lg">
                 <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">AICS Office Information</h2>
                 <div class="text-center space-y-6">
                     <div>
                         <h3 class="text-lg font-bold text-gray-800 mb-3">Office Location</h3>
                         <div class="space-y-2">
                             <div>
                                 <h4 class="font-semibold text-gray-700 text-sm">Unit 1:</h4>
                                 <p class="text-gray-600 text-sm">AICS Office, Caloocan City Hall Main (Barangays 1–35, 73, 80)</p>
                             </div>
                             <div>
                                 <h4 class="font-semibold text-gray-700 text-sm">Unit 2:</h4>
                                 <p class="text-gray-600 text-sm">AICS Office, Caloocan City Hall Main (Barangays 36–72, 74–79 and 86–131)</p>
                             </div>
                         </div>
                     </div>
                     <div>
                         <h3 class="text-lg font-bold text-gray-800 mb-3">Contact Information</h3>
                         <div class="space-y-2">
                             <div class="flex items-center justify-center">
                                 <span class="text-gray-400 mr-2">📍</span>
                                 <span class="text-sm">Caloocan City Hall, Main Building</span>
                             </div>
                             <div class="flex items-center justify-center">
                                 <span class="text-gray-400 mr-2">📞</span>
                                 <span class="text-sm">Tel: (02) 123-4567</span>
                             </div>
                             <div class="flex items-center justify-center">
                                 <span class="text-gray-400 mr-2">📧</span>
                                 <span class="text-sm">Email: cswdd@caloocancity.gov.ph</span>
                             </div>
                         </div>
                     </div>
                 </div>
                 <div class="text-center mt-8">
                     <a href="index.php" class="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                         Bumalik sa Home
                     </a>
                 </div>
                          </div>
         </div>
     </section>

     <!-- Apply Modal -->
     <div id="applyModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50 flex items-center justify-center">
         <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
             <div class="text-center">
                 <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                         <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                     </svg>
                 </div>
                 <h3 class="text-xl font-bold text-gray-800 mb-2">Mag-apply para sa <span id="serviceName" class="text-primary"></span></h3>
                 <p class="text-gray-600 mb-6">Ikaw ba ay may account na?</p>
                 
                 <div class="flex flex-col space-y-3">
                     <a href="login.php" class="bg-primary hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                         Mag-login
                     </a>
                     <a href="register.php" class="border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                         Gumawa ng Account
                     </a>
                     <button onclick="closeApplyModal()" class="text-gray-500 hover:text-gray-700 font-medium py-2">
                         Cancel
                     </button>
                 </div>
             </div>
         </div>
     </div>

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

         // Apply Modal Functions
         function showApplyModal(serviceName) {
             document.getElementById('serviceName').textContent = serviceName;
             document.getElementById('applyModal').classList.remove('hidden');
         }

         function closeApplyModal() {
             document.getElementById('applyModal').classList.add('hidden');
         }

         // Close modal when clicking outside
         document.getElementById('applyModal').addEventListener('click', function(e) {
             if (e.target === this) {
                 closeApplyModal();
             }
         });
     </script>
</body>
</html>
