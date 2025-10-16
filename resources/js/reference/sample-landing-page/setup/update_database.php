<?php
/**
 * Database Update Script
 * Adds barangay field to existing users table
 */

require_once '../config/database.php';

try {
    $pdo = getDBConnection();
    
    echo "🔄 Starting database update...\n";
    
    // Check if barangay column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'barangay'");
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        echo "📝 Adding barangay column to users table...\n";
        
        // Add barangay column
        $pdo->exec("ALTER TABLE users ADD COLUMN barangay VARCHAR(20) AFTER birth_date");
        
        // Add index for better performance
        $pdo->exec("CREATE INDEX idx_barangay ON users(barangay)");
        
        echo "✅ Barangay column added successfully!\n";
    } else {
        echo "ℹ️  Barangay column already exists.\n";
    }
    
    // Check if service_categories table has the correct AICS entry
    echo "🔍 Checking service categories...\n";
    
    $stmt = $pdo->query("SELECT * FROM service_categories WHERE name = 'AICS'");
    $aicsCategory = $stmt->fetch();
    
    if ($aicsCategory) {
        echo "ℹ️  AICS category already exists.\n";
    } else {
        echo "📝 Adding AICS service category...\n";
        
        $stmt = $pdo->prepare("INSERT INTO service_categories (name, description, icon, color) VALUES (?, ?, ?, ?)");
        $stmt->execute(['AICS', 'Assistance to Individuals in Crisis Situation', 'users', '#a5c90f']);
        
        echo "✅ AICS category added successfully!\n";
    }
    
    echo "\n🎉 Database update completed successfully!\n";
    echo "📋 Summary of changes:\n";
    echo "   • Added barangay field to users table (if not exists)\n";
    echo "   • Added barangay index for better performance\n";
    echo "   • Verified AICS service category\n";
    echo "\n💡 You can now use the registration form with all 188 barangays!\n";
    
} catch (Exception $e) {
    echo "❌ Error updating database: " . $e->getMessage() . "\n";
    echo "🔧 Please check your database connection and try again.\n";
}
?>
