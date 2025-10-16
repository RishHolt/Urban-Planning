<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            switch ($action) {
                case 'categories':
                    getServiceCategories();
                    break;
                case 'services':
                    getServices();
                    break;
                case 'service-details':
                    getServiceDetails();
                    break;
                case 'announcements':
                    getAnnouncements();
                    break;
                case 'user-applications':
                    getUserApplications();
                    break;
                default:
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid action']);
            }
            break;
            
        case 'POST':
            switch ($action) {
                case 'apply':
                    submitApplication();
                    break;
                case 'upload-document':
                    uploadDocument();
                    break;
                default:
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid action']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function getServiceCategories() {
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            SELECT id, name, description, icon, color, status, created_at
            FROM service_categories 
            WHERE status = 'active'
            ORDER BY name
        ");
        $stmt->execute();
        $categories = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'categories' => $categories
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch service categories']);
    }
}

function getServices() {
    $categoryId = $_GET['category_id'] ?? null;
    
    try {
        $pdo = getDBConnection();
        
        if ($categoryId) {
            $stmt = $pdo->prepare("
                SELECT s.*, sc.name as category_name, sc.color as category_color
                FROM services s
                JOIN service_categories sc ON s.category_id = sc.id
                WHERE s.category_id = ? AND s.status = 'active'
                ORDER BY s.name
            ");
            $stmt->execute([$categoryId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT s.*, sc.name as category_name, sc.color as category_color
                FROM services s
                JOIN service_categories sc ON s.category_id = sc.id
                WHERE s.status = 'active'
                ORDER BY sc.name, s.name
            ");
            $stmt->execute();
        }
        
        $services = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'services' => $services
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch services']);
    }
}

function getServiceDetails() {
    $serviceId = $_GET['service_id'] ?? null;
    
    if (!$serviceId) {
        http_response_code(400);
        echo json_encode(['error' => 'Service ID is required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            SELECT s.*, sc.name as category_name, sc.description as category_description, sc.color as category_color
            FROM services s
            JOIN service_categories sc ON s.category_id = sc.id
            WHERE s.id = ? AND s.status = 'active'
        ");
        $stmt->execute([$serviceId]);
        $service = $stmt->fetch();
        
        if (!$service) {
            http_response_code(404);
            echo json_encode(['error' => 'Service not found']);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'service' => $service
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch service details']);
    }
}

function getAnnouncements() {
    $type = $_GET['type'] ?? 'all';
    $limit = $_GET['limit'] ?? 10;
    
    try {
        $pdo = getDBConnection();
        
        if ($type === 'all') {
            $stmt = $pdo->prepare("
                SELECT a.*, u.first_name, u.last_name
                FROM announcements a
                JOIN users u ON a.created_by = u.id
                WHERE a.is_active = 1 AND (a.end_date IS NULL OR a.end_date >= CURDATE())
                ORDER BY a.priority DESC, a.created_at DESC
                LIMIT ?
            ");
            $stmt->execute([$limit]);
        } else {
            $stmt = $pdo->prepare("
                SELECT a.*, u.first_name, u.last_name
                FROM announcements a
                JOIN users u ON a.created_by = u.id
                WHERE a.is_active = 1 AND a.announcement_type = ? 
                AND (a.end_date IS NULL OR a.end_date >= CURDATE())
                ORDER BY a.priority DESC, a.created_at DESC
                LIMIT ?
            ");
            $stmt->execute([$type, $limit]);
        }
        
        $announcements = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'announcements' => $announcements
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch announcements']);
    }
}

function getUserApplications() {
    // Verify session first
    $headers = getallheaders();
    $sessionToken = $headers['Authorization'] ?? '';
    
    if (empty($sessionToken)) {
        http_response_code(401);
        echo json_encode(['error' => 'Session token required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Get user ID from session
        $stmt = $pdo->prepare("
            SELECT user_id FROM user_sessions 
            WHERE session_token = ? AND is_active = 1 AND expires_at > NOW()
        ");
        $stmt->execute([$sessionToken]);
        $session = $stmt->fetch();
        
        if (!$session) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid session']);
            return;
        }
        
        $userId = $session['user_id'];
        
        // Get user's applications
        $stmt = $pdo->prepare("
            SELECT sa.*, s.name as service_name, s.description as service_description,
                   sc.name as category_name, sc.color as category_color
            FROM service_applications sa
            JOIN services s ON sa.service_id = s.id
            JOIN service_categories sc ON s.category_id = sc.id
            WHERE sa.user_id = ?
            ORDER BY sa.application_date DESC
        ");
        $stmt->execute([$userId]);
        $applications = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'applications' => $applications
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch user applications']);
    }
}

function submitApplication() {
    // Verify session first
    $headers = getallheaders();
    $sessionToken = $headers['Authorization'] ?? '';
    
    if (empty($sessionToken)) {
        http_response_code(401);
        echo json_encode(['error' => 'Session token required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['service_id']) || !isset($input['notes'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Service ID and notes are required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Get user ID from session
        $stmt = $pdo->prepare("
            SELECT user_id FROM user_sessions 
            WHERE session_token = ? AND is_active = 1 AND expires_at > NOW()
        ");
        $stmt->execute([$sessionToken]);
        $session = $stmt->fetch();
        
        if (!$session) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid session']);
            return;
        }
        
        $userId = $session['user_id'];
        $serviceId = $input['service_id'];
        $notes = trim($input['notes']);
        
        // Verify service exists and is active
        $stmt = $pdo->prepare("SELECT id FROM services WHERE id = ? AND status = 'active'");
        $stmt->execute([$serviceId]);
        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid service']);
            return;
        }
        
        // Check if user already has a pending application for this service
        $stmt = $pdo->prepare("
            SELECT id FROM service_applications 
            WHERE user_id = ? AND service_id = ? AND status IN ('pending', 'under_review')
        ");
        $stmt->execute([$userId, $serviceId]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'You already have a pending application for this service']);
            return;
        }
        
        // Generate application number
        $applicationNumber = 'APP-' . date('Y') . '-' . str_pad($userId, 4, '0', STR_PAD_LEFT) . '-' . time();
        
        // Insert application
        $stmt = $pdo->prepare("
            INSERT INTO service_applications (user_id, service_id, application_number, notes, status)
            VALUES (?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([$userId, $serviceId, $applicationNumber, $notes]);
        
        $applicationId = $pdo->lastInsertId();
        
        // Log audit
        logAudit($userId, 'application_submitted', 'service_applications', $applicationId, null, [
            'service_id' => $serviceId,
            'application_number' => $applicationNumber
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Application submitted successfully',
            'application_id' => $applicationId,
            'application_number' => $applicationNumber
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to submit application']);
    }
}

function uploadDocument() {
    // Verify session first
    $headers = getallheaders();
    $sessionToken = $headers['Authorization'] ?? '';
    
    if (empty($sessionToken)) {
        http_response_code(401);
        echo json_encode(['error' => 'Session token required']);
        return;
    }
    
    if (!isset($_FILES['document']) || !isset($_POST['application_id']) || !isset($_POST['document_type'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Document file, application ID, and document type are required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Get user ID from session
        $stmt = $pdo->prepare("
            SELECT user_id FROM user_sessions 
            WHERE session_token = ? AND is_active = 1 AND expires_at > NOW()
        ");
        $stmt->execute([$sessionToken]);
        $session = $stmt->fetch();
        
        if (!$session) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid session']);
            return;
        }
        
        $userId = $session['user_id'];
        $applicationId = $_POST['application_id'];
        $documentType = $_POST['document_type'];
        
        // Verify application belongs to user
        $stmt = $pdo->prepare("
            SELECT id FROM service_applications 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$applicationId, $userId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied to this application']);
            return;
        }
        
        $file = $_FILES['document'];
        
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'File upload failed']);
            return;
        }
        
        // Check file size (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'File size too large. Maximum 5MB allowed.']);
            return;
        }
        
        // Check file type
        $allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExtension, $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'File type not allowed. Allowed types: ' . implode(', ', $allowedTypes)]);
            return;
        }
        
        // Create upload directory if it doesn't exist
        $uploadDir = '../uploads/documents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $fileName = uniqid() . '_' . time() . '.' . $fileExtension;
        $filePath = $uploadDir . $fileName;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
            return;
        }
        
        // Save document record to database
        $stmt = $pdo->prepare("
            INSERT INTO application_documents (application_id, document_type, file_name, file_path, file_size, mime_type)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $applicationId,
            $documentType,
            $file['name'],
            $filePath,
            $file['size'],
            $file['type']
        ]);
        
        $documentId = $pdo->lastInsertId();
        
        // Log audit
        logAudit($userId, 'document_uploaded', 'application_documents', $documentId, null, [
            'application_id' => $applicationId,
            'document_type' => $documentType,
            'file_name' => $file['name']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'document_id' => $documentId,
            'file_name' => $file['name']
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload document']);
    }
}

function logAudit($userId, $action, $tableName, $recordId, $oldValues, $newValues) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("
            INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $action,
            $tableName,
            $recordId,
            $oldValues ? json_encode($oldValues) : null,
            $newValues ? json_encode($newValues) : null,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (Exception $e) {
        // Log audit failure silently to avoid breaking main functionality
        error_log("Audit log failed: " . $e->getMessage());
    }
}
?>
