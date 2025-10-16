<?php
/**
 * Database Setup Script for Caloocan City Social Services Management System
 * 
 * This script will:
 * 1. Create the database if it doesn't exist
 * 2. Create all necessary tables
 * 3. Insert default data
 * 4. Set up initial admin user
 * 
 * Usage: Run this script in your browser or via command line
 */

// Database connection parameters
$host = 'localhost';
$port = '3307';
$username = 'root';
$password = '';

try {
    // Connect to MySQL without specifying database
    $pdo = new PDO("mysql:host=$host;port=$port", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>Database Setup for Caloocan City Social Services Management System</h2>\n";
    echo "<pre>\n";
    
    // Step 1: Create database
    echo "Step 1: Creating database...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS caloocan_social_services CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✓ Database 'caloocan_social_services' created successfully\n";
    
    // Step 2: Select the database
    $pdo->exec("USE caloocan_social_services");
    echo "✓ Database selected\n";
    
    // Step 3: Create tables
    echo "\nStep 2: Creating tables...\n";
    
    // Users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            phone VARCHAR(20),
            birth_date DATE,
            barangay VARCHAR(20),
            user_type ENUM('resident', 'staff', 'admin') DEFAULT 'resident',
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            email_verified BOOLEAN DEFAULT FALSE,
            phone_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            login_attempts INT DEFAULT 0,
            locked_until TIMESTAMP NULL,
            INDEX idx_username (username),
            INDEX idx_email (email),
            INDEX idx_status (status),
            INDEX idx_barangay (barangay)
        )
    ");
    echo "✓ Users table created\n";
    
    // User sessions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_session_token (session_token),
            INDEX idx_user_id (user_id),
            INDEX idx_expires_at (expires_at)
        )
    ");
    echo "✓ User sessions table created\n";
    
    // Service categories table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS service_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            icon VARCHAR(100),
            color VARCHAR(7),
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "✓ Service categories table created\n";
    
    // Services table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            requirements TEXT,
            eligibility_criteria TEXT,
            processing_time VARCHAR(50),
            status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES service_categories(id),
            INDEX idx_category_id (category_id),
            INDEX idx_status (status)
        )
    ");
    echo "✓ Services table created\n";
    
    // Service applications table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS service_applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            service_id INT NOT NULL,
            application_number VARCHAR(50) UNIQUE NOT NULL,
            status ENUM('pending', 'under_review', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
            application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            review_date TIMESTAMP NULL,
            completion_date TIMESTAMP NULL,
            notes TEXT,
            staff_notes TEXT,
            rejection_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (service_id) REFERENCES services(id),
            INDEX idx_user_id (user_id),
            INDEX idx_service_id (service_id),
            INDEX idx_status (status),
            INDEX idx_application_number (application_number)
        )
    ");
    echo "✓ Service applications table created\n";
    
    // Application documents table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS application_documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            application_id INT NOT NULL,
            document_type VARCHAR(100) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size INT,
            mime_type VARCHAR(100),
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            staff_notes TEXT,
            FOREIGN KEY (application_id) REFERENCES service_applications(id) ON DELETE CASCADE,
            INDEX idx_application_id (application_id),
            INDEX idx_document_type (document_type)
        )
    ");
    echo "✓ Application documents table created\n";
    
    // Announcements table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS announcements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            announcement_type ENUM('general', 'service_update', 'maintenance', 'emergency') DEFAULT 'general',
            priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
            target_audience ENUM('all', 'residents', 'staff', 'specific_service') DEFAULT 'all',
            service_id INT NULL,
            start_date DATE NOT NULL,
            end_date DATE NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            INDEX idx_announcement_type (announcement_type),
            INDEX idx_priority (priority),
            INDEX idx_is_active (is_active),
            INDEX idx_start_date (start_date)
        )
    ");
    echo "✓ Announcements table created\n";
    
    // User notifications table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            notification_type ENUM('application_update', 'announcement', 'reminder', 'system') DEFAULT 'system',
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read_at TIMESTAMP NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_is_read (is_read),
            INDEX idx_created_at (created_at)
        )
    ");
    echo "✓ User notifications table created\n";
    
    // Audit log table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS audit_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            action VARCHAR(100) NOT NULL,
            table_name VARCHAR(100),
            record_id INT,
            old_values JSON,
            new_values JSON,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            INDEX idx_user_id (user_id),
            INDEX idx_action (action),
            INDEX idx_table_name (table_name),
            INDEX idx_created_at (created_at)
        )
    ");
    echo "✓ Audit log table created\n";
    
    // Step 4: Insert default data
    echo "\nStep 3: Inserting default data...\n";
    
    // Insert service categories
    $categories = [
        ['AICS', 'Assistance to Individuals in Crisis Situation', 'users', '#a5c90f'],
        ['PDAO', 'Persons with Disability Affairs Office', 'user', '#ff8829'],
        ['OSCA', 'Office for Senior Citizens Affairs', 'heart', '#ffb366'],
        ['Livelihood & Training', 'Employment and Skills Development', 'briefcase', '#6f9c3d']
    ];
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO service_categories (name, description, icon, color) VALUES (?, ?, ?, ?)");
    foreach ($categories as $category) {
        $stmt->execute($category);
    }
    echo "✓ Service categories inserted\n";
    
    // Insert services
    $services = [
        [1, 'Family Assistance Program (FAP)', 'Comprehensive family support and assistance programs', 'Valid ID, Certificate of Indigency, Proof of Income', 'Residents of Caloocan City with low income', '3-5 working days'],
        [1, 'Child Protection Services', 'Services for child welfare and protection', 'Barangay Certificate, Birth Certificate, Valid ID', 'Children and families in need of protection', '2-3 working days'],
        [2, 'PWD ID Application', 'Application for Persons with Disability ID', 'Medical Certificate, 2x2 ID Picture, Barangay Certificate', 'Persons with disabilities', '5-7 working days'],
        [3, 'Senior Citizen ID', 'Application for Senior Citizen ID', 'Birth Certificate, 2x2 ID Picture, Barangay Certificate', '60 years old and above', '3-5 working days'],
        [4, 'Medical Assistance', 'Financial assistance for medical expenses', 'Medical Certificate, Hospital Bills, Valid ID', 'Residents facing medical crisis', '7-10 working days'],
        [5, 'Skills Training Program', 'Professional development and skills training', 'Barangay Certificate, Valid ID, Letter of Intent', 'Residents seeking employment', '2-3 working days']
    ];
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO services (category_id, name, description, requirements, eligibility_criteria, processing_time) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($services as $service) {
        $stmt->execute($service);
    }
    echo "✓ Services inserted\n";
    
         // Note: No default admin user created for security
     // Staff/Admin users should be created manually by authorized personnel
     echo "✓ No default admin user created (security best practice)\n";
    
    // Step 5: Create additional indexes
    echo "\nStep 4: Creating performance indexes...\n";
    
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_service_applications_application_date ON service_applications(application_date)",
        "CREATE INDEX IF NOT EXISTS idx_announcements_end_date ON announcements(end_date)",
        "CREATE INDEX IF NOT EXISTS idx_user_notifications_notification_type ON user_notifications(notification_type)"
    ];
    
    foreach ($indexes as $index) {
        $pdo->exec($index);
    }
    echo "✓ Performance indexes created\n";
    
    // Step 6: Create uploads directory
    echo "\nStep 5: Creating uploads directory...\n";
    $uploadDir = '../uploads/documents/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        echo "✓ Uploads directory created\n";
    } else {
        echo "✓ Uploads directory already exists\n";
    }
    
         echo "\n🎉 Database setup completed successfully!\n";
     echo "\nSecurity Note:\n";
     echo "✓ No default admin user created\n";
     echo "✓ Staff/Admin accounts must be created manually\n";
     echo "✓ Residents can register through the public registration form\n";
     echo "\nNext Steps:\n";
     echo "1. Create staff/admin accounts manually in the database\n";
     echo "2. Test resident registration and login\n";
     echo "3. Configure system settings as needed\n";
    
} catch (PDOException $e) {
    echo "<h2>Database Setup Failed</h2>\n";
    echo "<pre>\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. MySQL server is running\n";
    echo "2. Port 3307 is correct\n";
    echo "3. Username and password are correct\n";
    echo "4. MySQL user has CREATE privileges\n";
    echo "</pre>\n";
} catch (Exception $e) {
    echo "<h2>Setup Failed</h2>\n";
    echo "<pre>\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "</pre>\n";
}

echo "</pre>\n";
?>
