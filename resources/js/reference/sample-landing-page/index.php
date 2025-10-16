<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Government Service Portal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="website icon" type="png" href="image/govserve.png">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#4CAF50',
                        secondary: '#4A90E2',
                        accent: '#FDA811',
                        success: '#4CAF50',
                        dark: '#2d3748'
                    },
                    fontFamily: {
                        'sans': ['Poppins', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        /* Custom scrollbar for chat messages */
        #chatMessages::-webkit-scrollbar {
            width: 8px;
        }
        
        #chatMessages::-webkit-scrollbar-track {
            background: #f9fafb;
            border-radius: 4px;
        }
        
        #chatMessages::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
        }
        
        #chatMessages::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
        
        /* Ensure messages are visible */
        #chatMessages .flex {
            display: flex !important;
        }
        
        #chatMessages .bg-white {
            background-color: white !important;
            border: 1px solid #e5e7eb !important;
        }
        
        /* Force initial message to stay visible */
        #initialMessage {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
        }
        
        #initialMessage .bg-white {
            background-color: white !important;
            border: 1px solid #e5e7eb !important;
        }
        
        #initialMessage p {
            color: #374151 !important;
        }
        
        /* Ensure proper spacing between header and messages */
        #chatMessages {
            padding-top: 6rem !important;
        }
        
        /* Prevent header overlap */
        #chatWindow .bg-primary {
            position: sticky !important;
            top: 0 !important;
            z-index: 50 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        
        /* Ensure messages are below header */
        #chatMessages {
            margin-top: 0 !important;
            position: relative !important;
            z-index: 10 !important;
        }
        
        /* Force initial message to be visible and properly positioned */
        #initialMessage {
            margin-top: 4rem !important;
            padding-top: 0 !important;
            position: relative !important;
            z-index: 10 !important;
        }
        
        /* Prevent scroll overlap */
        #chatMessages::-webkit-scrollbar {
            width: 8px;
        }
        
        #chatMessages::-webkit-scrollbar-track {
            background: #f9fafb;
            border-radius: 4px;
        }
        
        #chatMessages::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
        }
        
        #chatMessages::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
        
        /* Ensure header stays above all content */
        #chatWindow .bg-primary {
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
            background-color: #4CAF50 !important;
        }
        
        /* Ensure messages don't overlap header */
        #chatMessages {
            position: relative !important;
            z-index: 1 !important;
        }
    </style>
</head>
<body class="bg-[#fbfbfb] font-sans">
    <!-- Navigation Bar -->
    <nav class="bg-primary shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo and City Name -->
                <div class="flex items-center space-x-2 sm:space-x-3">
                    <img src="image/city.png" alt="Caloocan City Seal" class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain">
                    <div>
                        <h1 class="text-sm sm:text-lg md:text-xl font-bold text-white">Caloocan City</h1>
                        <p class="text-xs sm:text-sm text-white opacity-90">Government Service Management</p>
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
                        <a href="#" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Home</a>
                        <a href="#services" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Services</a>
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
                    <a href="#" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Home</a>
                    <a href="#services" class="text-white hover:text-gray-200 font-medium transition-colors duration-200">Our Services</a>
                    <div class="flex flex-col space-y-2">
                        <a href="login.php" class="bg-white hover:bg-gray-100 text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Login
                        </a>
                        <a href="register.php" class="border-2 border-white text-white hover:bg-white hover:text-primary px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center">
                            Register
                        </a>
                    </div>
                    <div class="text-center text-white">
                        <div id="mobile-time" class="text-lg font-semibold"></div>
                        <div id="mobile-date" class="text-sm opacity-90"></div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="hero-section relative bg-cover bg-center bg-no-repeat min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]" style="background-image: url('banner.jpg'); background-color: #4CAF50;">
        <div class="absolute inset-0 bg-black bg-opacity-20"></div>
    </div>

    <!-- Services Section -->
    <section id="services" class="py-12 sm:py-16 md:py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
                Our Services
            </h2>
            
            <!-- Service Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <!-- Barangay Certificate and ID Issuance Card -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 ease-in-out transform" onclick="openBarangayModal()">
                    <div class="p-6 flex flex-col items-center flex-grow">
                        <img src="image/bcid.png" alt="Barangay Certificate and ID Issuance" class="w-24 h-24 mb-4 object-contain">
                        <h3 class="text-xl font-bold text-gray-800 text-center">Barangay Certificate and ID Issuance</h3>
                    </div>
                </div>

                <!-- Feedback and Grievance Portal Card -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 ease-in-out transform" onclick="openFeedbackModal()">
                    <div class="p-6 flex flex-col items-center flex-grow">
                        <img src="image/fgp.png" alt="Feedback and Grievance Portal" class="w-24 h-24 mb-4 object-contain">
                        <h3 class="text-xl font-bold text-gray-800 text-center">Feedback and Grievance Portal</h3>
                    </div>
                </div>

                <!-- Public Consultation and Survey Tools Card -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 ease-in-out transform" onclick="openConsultationModal()">
                    <div class="p-6 flex flex-col items-center flex-grow">
                        <img src="image/pcst.png" alt="Public Consultation and Survey tools" class="w-24 h-24 mb-4 object-contain">
                        <h3 class="text-xl font-bold text-gray-800 text-center">Public Consultation and Survey Tools</h3>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Barangay Certificate and ID Issuance Modal -->
    <div id="barangayModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="bg-primary p-6 border-b sticky top-0 z-10">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-white">Barangay Certificate and ID Issuance</h2>
                                <p class="text-white opacity-90">Official documents and identification services</p>
                            </div>
                        </div>
                        <button onclick="closeBarangayModal()" class="text-white hover:text-gray-200 text-2xl font-bold">
                            &times;
                        </button>
                    </div>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6">
                    <!-- Program Overview -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h3 class="text-xl font-bold text-blue-800 mb-4">Service Overview</h3>
                        <p class="text-gray-700 mb-3">Obtain official barangay certificates and identification cards for various purposes including residency verification, business permits, and personal identification needs.</p>
                        <h4 class="font-bold text-blue-800 mb-2">Who can avail?</h4>
                        <p class="text-gray-700">All registered residents of Caloocan City who need official documentation from their barangay.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <!-- Barangay Certificate -->
                        <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div class="bg-green-100 p-4 border-b border-gray-200">
                                <h3 class="text-xl font-bold text-gray-800 text-center">Barangay Certificate</h3>
                            </div>
                            <div class="p-6">
                                <h4 class="font-semibold text-gray-700 mb-3 text-lg">Requirements:</h4>
                                <div class="space-y-2">
                                    <div class="accordion-item border border-gray-200 rounded-lg">
                                        <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('certificate-1')">
                                            <span class="font-semibold text-gray-800">Proof of Residency</span>
                                            <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="certificate-1-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        <div class="accordion-content hidden p-3 bg-white" id="certificate-1-content">
                                            <p class="text-gray-700">Utility bills, lease agreement, or any document proving your residence in the barangay for at least 6 months.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="accordion-item border border-gray-200 rounded-lg">
                                        <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('certificate-2')">
                                            <span class="font-semibold text-gray-800">Valid ID</span>
                                            <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="certificate-2-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        <div class="accordion-content hidden p-3 bg-white" id="certificate-2-content">
                                            <p class="text-gray-700">Any government-issued identification card (e.g., driver's license, passport, voter's ID).</p>
                                        </div>
                                    </div>
                                    
                                    <div class="accordion-item border border-gray-200 rounded-lg">
                                        <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('certificate-3')">
                                            <span class="font-semibold text-gray-800">Application Form</span>
                                            <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="certificate-3-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        <div class="accordion-content hidden p-3 bg-white" id="certificate-3-content">
                                            <p class="text-gray-700">Complete the barangay certificate application form available at the barangay hall.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Barangay ID -->
                        <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div class="bg-green-100 p-4 border-b border-gray-200">
                                <h3 class="text-xl font-bold text-gray-800 text-center">Barangay ID</h3>
                            </div>
                            <div class="p-6">
                                <h4 class="font-semibold text-gray-700 mb-3 text-lg">Requirements:</h4>
                                <div class="space-y-2">
                                    <div class="accordion-item border border-gray-200 rounded-lg">
                                        <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('id-1')">
                                            <span class="font-semibold text-gray-800">Proof of Residency</span>
                                            <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="id-1-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        <div class="accordion-content hidden p-3 bg-white" id="id-1-content">
                                            <p class="text-gray-700">Utility bills or any document proving your residence in the barangay for at least 1 year.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="accordion-item border border-gray-200 rounded-lg">
                                        <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('id-2')">
                                            <span class="font-semibold text-gray-800">Birth Certificate</span>
                                            <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="id-2-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        <div class="accordion-content hidden p-3 bg-white" id="id-2-content">
                                            <p class="text-gray-700">PSA-authenticated birth certificate for identity verification.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="accordion-item border border-gray-200 rounded-lg">
                                        <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('id-3')">
                                            <span class="font-semibold text-gray-800">2x2 ID Photo</span>
                                            <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="id-3-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        <div class="accordion-content hidden p-3 bg-white" id="id-3-content">
                                            <p class="text-gray-700">Recent 2x2 colored photograph with white background.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
                        <a href="login.php" class="bg-primary hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center">
                            Apply Now
                        </a>
                        <button onclick="closeBarangayModal()" class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                            Other Services
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Feedback and Grievance Portal Modal -->
    <div id="feedbackModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="bg-secondary p-6 border-b sticky top-0 z-10">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-white">Feedback and Grievance Portal</h2>
                                <p class="text-white opacity-90">Share your concerns and suggestions</p>
                            </div>
                        </div>
                        <button onclick="closeFeedbackModal()" class="text-white hover:text-gray-200 text-2xl font-bold">
                            &times;
                        </button>
                    </div>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6">
                    <!-- Program Overview -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h3 class="text-xl font-bold text-blue-800 mb-4">Portal Overview</h3>
                        <p class="text-gray-700 mb-3">Provide feedback, report concerns, or file grievances regarding city services. Your input helps us improve our services for all residents.</p>
                        <h4 class="font-bold text-blue-800 mb-2">Who can use this service?</h4>
                        <p class="text-gray-700">All residents, business owners, and visitors of Caloocan City can submit feedback or file grievances.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <!-- Submit Feedback -->
                        <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div class="bg-green-100 p-4 border-b border-gray-200">
                                <h3 class="text-xl font-bold text-gray-800 text-center">Submit Feedback</h3>
                            </div>
                            <div class="p-6">
                                <h4 class="font-semibold text-gray-700 mb-3 text-lg">Process:</h4>
                                <div class="space-y-2">
                                    <div class="accordion-item border border-gray-200 rounded-lg">
                                        <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('feedback-1')">
                                            <span class="font-semibold text-gray-800">Online Submission</span>
                                            <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="feedback-1-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        <div class="accordion-content hidden p-3 bg-white" id="feedback-1-content">
                                            <p class="text-gray-700">Fill out the online feedback form with your comments, suggestions, or compliments about city services.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="accordion-item border border-gray-200 rounded-lg">
                                        <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('feedback-2')">
                                            <span class="font-semibold text-gray-800">In-Person</span>
                                            <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="feedback-2-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin-round stroke-width="2" d="M19 9l-7 7-7-7"></path>
</svg>
</button>
<div class="accordion-content hidden p-3 bg-white" id="feedback-2-content">
<p class="text-gray-700">Visit the City Hall or your local barangay office to submit feedback in person.</p>
</div>
</div>
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('feedback-3')">
                                        <span class="font-semibold text-gray-800">Hotline</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="feedback-3-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="feedback-3-content">
                                        <p class="text-gray-700">Call our hotline to provide feedback or report concerns directly to our customer service representatives.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- File a Grievance -->
                    <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div class="bg-green-100 p-4 border-b border-gray-200">
                            <h3 class="text-xl font-bold text-gray-800 text-center">File a Grievance</h3>
                        </div>
                        <div class="p-6">
                            <h4 class="font-semibold text-gray-700 mb-3 text-lg">Process:</h4>
                            <div class="space-y-2">
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('grievance-1')">
                                        <span class="font-semibold text-gray-800">Online Form</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="grievance-1-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="grievance-1-content">
                                        <p class="text-gray-700">Complete the online grievance form with detailed information about your concern.</p>
                                    </div>
                                </div>
                                
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('grievance-2')">
                                        <span class="font-semibold text-gray-800">Documentation</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="grievance-2-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="grievance-2-content">
                                        <p class="text-gray-700">Provide supporting documents or evidence related to your grievance.</p>
                                    </div>
                                </div>
                                
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('grievance-3')">
                                        <span class="font-semibold text-gray-800">Follow-up</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="grievance-3-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="grievance-3-content">
                                        <p class="text-gray-700">Track the status of your grievance and receive updates on the resolution process.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
                    <a href="login.php" class="bg-secondary hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center">
                        Submit Feedback
                    </a>
                    <button onclick="closeFeedbackModal()" class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                        Other Services
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Public Consultation and Survey Tools Modal -->
<div id="consultationModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
    <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="bg-accent p-6 border-b sticky top-0 z-10">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-white">Public Consultation and Survey Tools</h2>
                            <p class="text-white opacity-90">Participate in city planning and decision-making</p>
                        </div>
                    </div>
                    <button onclick="closeConsultationModal()" class="text-white hover:text-gray-200 text-2xl font-bold">
                        &times;
                    </button>
                </div>
            </div>
            
            <!-- Modal Content -->
            <div class="p-6">
                <!-- Program Overview -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h3 class="text-xl font-bold text-blue-800 mb-4">Service Overview</h3>
                    <p class="text-gray-700 mb-3">Participate in public consultations, surveys, and polls to help shape city policies, programs, and development projects. Your voice matters in community decision-making.</p>
                    <h4 class="font-bold text-blue-800 mb-2">Who can participate?</h4>
                    <p class="text-gray-700">All residents, business owners, and stakeholders of Caloocan City are encouraged to participate in public consultations and surveys.</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Public Consultations -->
                    <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div class="bg-green-100 p-4 border-b border-gray-200">
                            <h3 class="text-xl font-bold text-gray-800 text-center">Public Consultations</h3>
                        </div>
                        <div class="p-6">
                            <h4 class="font-semibold text-gray-700 mb-3 text-lg">Participation Options:</h4>
                            <div class="space-y-2">
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('consultation-1')">
                                        <span class="font-semibold text-gray-800">In-Person Meetings</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="consultation-1-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="consultation-1-content">
                                        <p class="text-gray-700">Attend scheduled public consultations at designated venues across the city.</p>
                                    </div>
                                </div>
                                
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('consultation-2')">
                                        <span class="font-semibold text-gray-800">Virtual Meetings</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="consultation-2-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="consultation-2-content">
                                        <p class="text-gray-700">Join online consultations via video conferencing platforms for remote participation.</p>
                                    </div>
                                </div>
                                
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('consultation-3')">
                                        <span class="font-semibold text-gray-800">Written Submissions</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="consultation-3-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="consultation-3-content">
                                        <p class="text-gray-700">Submit written comments, suggestions, or position papers on consultation topics.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Surveys and Polls -->
                    <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div class="bg-green-100 p-4 border-b border-gray-200">
                            <h3 class="text-xl font-bold text-gray-800 text-center">Surveys and Polls</h3>
                        </div>
                        <div class="p-6">
                            <h4 class="font-semibold text-gray-700 mb-3 text-lg">Available Tools:</h4>
                            <div class="space-y-2">
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('survey-1')">
                                        <span class="font-semibold text-gray-800">Online Surveys</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="survey-1-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="survey-1-content">
                                        <p class="text-gray-700">Participate in digital surveys on various city initiatives and services.</p>
                                    </div>
                                </div>
                                
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('survey-2')">
                                        <span class="font-semibold text-gray-800">Mobile App</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="survey-2-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="survey-2-content">
                                        <p class="text-gray-700">Use the city's mobile application to participate in quick polls and surveys.</p>
                                    </div>
                                </div>
                                
                                <div class="accordion-item border border-gray-200 rounded-lg">
                                    <button class="accordion-header w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center" onclick="toggleAccordion('survey-3')">
                                        <span class="font-semibold text-gray-800">Community Feedback</span>
                                        <svg class="w-5 h-5 text-gray-600 transform transition-transform duration-200" id="survey-3-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="accordion-content hidden p-3 bg-white" id="survey-3-content">
                                        <p class="text-gray-700">Provide input on community projects, public spaces, and local development plans.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
                    <a href="login.php" class="bg-accent hover:bg-orange-500 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center">
                        Participate Now
                    </a>
                    <button onclick="closeConsultationModal()" class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                        Other Services
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Footer -->
<footer class="bg-gray-900 text-gray-300 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <h3 class="text-lg font-bold text-white mb-4">Contact Us</h3>
            <div class="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-6">
                <div class="flex items-center"><span class="text-gray-400 mr-2">📍</span>Caloocan City Hall, 123 Main St.</div>
                <div class="flex items-center"><span class="text-gray-400 mr-2">📞</span>Tel: (02) 123-4567</div>
                <div class="flex items-center justify-center"><span class="text-gray-400 mr-3">✉️</span>Email: info@caloocancity.gov.ph</div>
            </div>
        </div>

        <!-- Language Toggle -->
        <div class="flex justify-center items-center space-x-3 mb-6">
            <span class="text-white text-xs font-medium">Language:</span>
            <button id="lang-en" class="px-3 py-1.5 bg-primary hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors duration-200 active">English</button>
            <button id="lang-fil" class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors duration-200">Filipino</button>
        </div>
        
        <div class="text-center text-gray-500 text-sm">
            &copy; 2025 Caloocan City | Citizen Information and Engagement System. All rights reserved.
        </div>
    </div>
</footer>

<script>
    // JavaScript for mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.hidden.md\\:flex.items-center.space-x-4.lg\\:space-x-6 a');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Update current time and date
    function updateDateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');

        const options = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        timeElement.textContent = now.toLocaleTimeString('en-US', options);

        const dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }

    // Modal functions for new services
    function openBarangayModal() {
        document.getElementById('barangayModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeBarangayModal() {
        document.getElementById('barangayModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    function openFeedbackModal() {
        document.getElementById('feedbackModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeFeedbackModal() {
        document.getElementById('feedbackModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    function openConsultationModal() {
        document.getElementById('consultationModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeConsultationModal() {
        document.getElementById('consultationModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Accordion function for all modals
    function toggleAccordion(id) {
        const content = document.getElementById(id + '-content');
        const icon = document.getElementById(id + '-icon');
        
        if (content.classList.contains('hidden')) {
            // Show content
            content.classList.remove('hidden');
            icon.style.transform = 'rotate(180deg)';
        } else {
            // Hide content
            content.classList.add('hidden');
            icon.style.transform = 'rotate(0deg)';
        }
    }

    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        const barangayModal = document.getElementById('barangayModal');
        const feedbackModal = document.getElementById('feedbackModal');
        const consultationModal = document.getElementById('consultationModal');
        
        if (event.target === barangayModal) {
            closeBarangayModal();
        }
        if (event.target === feedbackModal) {
            closeFeedbackModal();
        }
        if (event.target === consultationModal) {
            closeConsultationModal();
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeBarangayModal();
            closeFeedbackModal();
            closeConsultationModal();
        }
    });

    updateDateTime(); // Initial call
    setInterval(updateDateTime, 1000); // Update every second

    // Update mobile time and date
    function updateMobileDateTime() {
        const now = new Date();
        const mobileTimeElement = document.getElementById('mobile-time');
        const mobileDateElement = document.getElementById('mobile-date');

        const options = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        mobileTimeElement.textContent = now.toLocaleTimeString('en-US', options);

        const dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        mobileDateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }

    updateMobileDateTime(); // Initial call
    setInterval(updateMobileDateTime, 1000); // Update every second
</script>
</body>
</html>