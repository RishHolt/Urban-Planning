<?php

namespace App\Controllers;

use App\ML\SocialServicesML;
use PDO;

class MLController
{
    private $mlService;
    private $pdo;

    public function __construct(PDO $pdo)
    {
        $this->mlService = new SocialServicesML();
        $this->pdo = $pdo;
    }

    /**
     * Get eligibility prediction for a user
     */
    public function getEligibilityPrediction(int $userId): array
    {
        try {
            $userData = $this->getUserData($userId);
            $prediction = $this->mlService->predictEligibility($userData);
            
            // Store prediction in database
            $this->storePrediction($userId, 'eligibility', $prediction);
            
            return [
                'success' => true,
                'data' => $prediction,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get processing time prediction for an application
     */
    public function getProcessingTimePrediction(int $applicationId): array
    {
        try {
            $applicationData = $this->getApplicationData($applicationId);
            $prediction = $this->mlService->predictProcessingTime($applicationData);
            
            // Store prediction
            $this->storePrediction($applicationId, 'processing_time', $prediction);
            
            return [
                'success' => true,
                'data' => $prediction,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get fraud risk assessment for an application
     */
    public function getFraudRiskAssessment(int $applicationId): array
    {
        try {
            $applicationData = $this->getApplicationData($applicationId);
            $riskAssessment = $this->mlService->detectFraudRisk($applicationData);
            
            // Store risk assessment
            $this->storePrediction($applicationId, 'fraud_risk', $riskAssessment);
            
            return [
                'success' => true,
                'data' => $riskAssessment,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get resource demand prediction
     */
    public function getResourceDemandPrediction(): array
    {
        try {
            $historicalData = $this->getHistoricalServiceData();
            $predictions = $this->mlService->predictResourceDemand($historicalData);
            
            return [
                'success' => true,
                'data' => $predictions,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get beneficiary clustering analysis
     */
    public function getBeneficiaryClustering(): array
    {
        try {
            $beneficiaries = $this->getAllBeneficiaries();
            $clusters = $this->mlService->clusterBeneficiaries($beneficiaries);
            
            return [
                'success' => true,
                'data' => $clusters,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get comprehensive ML insights dashboard
     */
    public function getMLDashboard(): array
    {
        try {
            $dashboard = [
                'eligibility_trends' => $this->getEligibilityTrends(),
                'processing_efficiency' => $this->getProcessingEfficiency(),
                'fraud_detection_stats' => $this->getFraudDetectionStats(),
                'resource_optimization' => $this->getResourceOptimization(),
                'beneficiary_insights' => $this->getBeneficiaryInsights()
            ];
            
            return [
                'success' => true,
                'data' => $dashboard,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get user data for ML processing
     */
    private function getUserData(int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                u.age,
                u.monthly_income,
                u.family_size,
                u.employment_status,
                u.disability_status,
                u.education_level,
                u.housing_condition,
                u.medical_conditions
            FROM users u 
            WHERE u.id = ?
        ");
        $stmt->execute([$userId]);
        
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Convert to numerical values for ML
        return [
            'age' => (int)($userData['age'] ?? 0),
            'monthly_income' => (float)($userData['monthly_income'] ?? 0),
            'family_size' => (int)($userData['family_size'] ?? 1),
            'employment_status' => $this->encodeEmploymentStatus($userData['employment_status'] ?? 'unemployed'),
            'disability_status' => $this->encodeDisabilityStatus($userData['disability_status'] ?? 'none'),
            'education_level' => $this->encodeEducationLevel($userData['education_level'] ?? 'none'),
            'housing_condition' => $this->encodeHousingCondition($userData['housing_condition'] ?? 'poor'),
            'medical_conditions' => $this->encodeMedicalConditions($userData['medical_conditions'] ?? 'none')
        ];
    }

    /**
     * Get application data for ML processing
     */
    private function getApplicationData(int $applicationId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                a.service_type,
                a.document_completeness,
                u.age as applicant_age,
                u.family_size,
                a.urgency_level,
                a.income_discrepancy,
                a.document_authenticity,
                a.application_frequency,
                a.address_verification,
                a.employment_verification
            FROM applications a
            JOIN users u ON a.user_id = u.id
            WHERE a.id = ?
        ");
        $stmt->execute([$applicationId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Get historical service data for demand prediction
     */
    private function getHistoricalServiceData(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                service_type,
                DATE(created_at) as date,
                COUNT(*) as applications
            FROM applications 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY service_type, DATE(created_at)
            ORDER BY service_type, date
        ");
        $stmt->execute();
        
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Organize by service type
        $organized = [];
        foreach ($data as $row) {
            $service = $row['service_type'];
            if (!isset($organized[$service])) {
                $organized[$service] = [];
            }
            $organized[$service][$row['date']] = (int)$row['applications'];
        }
        
        return $organized;
    }

    /**
     * Get all beneficiaries for clustering
     */
    private function getAllBeneficiaries(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                id,
                age,
                monthly_income,
                family_size,
                disability_status,
                education_level,
                service_needs
            FROM users 
            WHERE user_type = 'resident' 
            AND status = 'active'
        ");
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Store ML prediction in database
     */
    private function storePrediction(int $entityId, string $predictionType, array $prediction): void
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO ml_predictions (entity_id, entity_type, prediction_type, prediction_data, created_at)
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            prediction_data = VALUES(prediction_data),
            updated_at = NOW()
        ");
        
        $stmt->execute([
            $entityId,
            $this->getEntityType($entityId),
            $predictionType,
            json_encode($prediction)
        ]);
    }

    /**
     * Get entity type for ML predictions
     */
    private function getEntityType(int $entityId): string
    {
        // Check if it's a user or application
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM users WHERE id = ?");
        $stmt->execute([$entityId]);
        
        return $stmt->fetchColumn() > 0 ? 'user' : 'application';
    }

    /**
     * Encode employment status for ML
     */
    private function encodeEmploymentStatus(string $status): int
    {
        $encodings = [
            'employed' => 1,
            'unemployed' => 0,
            'self_employed' => 2,
            'part_time' => 3,
            'student' => 4
        ];
        
        return $encodings[$status] ?? 0;
    }

    /**
     * Encode disability status for ML
     */
    private function encodeDisabilityStatus(string $status): int
    {
        $encodings = [
            'none' => 0,
            'physical' => 1,
            'visual' => 2,
            'hearing' => 3,
            'intellectual' => 4,
            'multiple' => 5
        ];
        
        return $encodings[$status] ?? 0;
    }

    /**
     * Encode education level for ML
     */
    private function encodeEducationLevel(string $level): int
    {
        $encodings = [
            'none' => 0,
            'elementary' => 1,
            'high_school' => 2,
            'college' => 3,
            'post_graduate' => 4
        ];
        
        return $encodings[$level] ?? 0;
    }

    /**
     * Encode housing condition for ML
     */
    private function encodeHousingCondition(string $condition): int
    {
        $encodings = [
            'excellent' => 5,
            'good' => 4,
            'fair' => 3,
            'poor' => 2,
            'critical' => 1
        ];
        
        return $encodings[$condition] ?? 3;
    }

    /**
     * Encode medical conditions for ML
     */
    private function encodeMedicalConditions(string $conditions): int
    {
        if (empty($conditions) || $conditions === 'none') {
            return 0;
        }
        
        // Count number of conditions
        $conditionCount = count(array_filter(explode(',', $conditions)));
        return min($conditionCount, 5); // Cap at 5
    }

    /**
     * Get eligibility trends for dashboard
     */
    private function getEligibilityTrends(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                DATE(created_at) as date,
                AVG(JSON_EXTRACT(prediction_data, '$.eligibility_score')) as avg_score,
                COUNT(*) as total_applications
            FROM ml_predictions 
            WHERE prediction_type = 'eligibility'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date
        ");
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get processing efficiency for dashboard
     */
    private function getProcessingEfficiency(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                service_type,
                AVG(JSON_EXTRACT(prediction_data, '$.estimated_days')) as avg_processing_days,
                COUNT(*) as total_applications
            FROM ml_predictions mp
            JOIN applications a ON mp.entity_id = a.id
            WHERE mp.prediction_type = 'processing_time'
            GROUP BY service_type
        ");
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get fraud detection stats for dashboard
     */
    private function getFraudDetectionStats(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                JSON_EXTRACT(prediction_data, '$.risk_level') as risk_level,
                COUNT(*) as count,
                AVG(JSON_EXTRACT(prediction_data, '$.risk_score')) as avg_risk_score
            FROM ml_predictions 
            WHERE prediction_type = 'fraud_risk'
            GROUP BY risk_level
        ");
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get resource optimization data for dashboard
     */
    private function getResourceOptimization(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                service_type,
                AVG(JSON_EXTRACT(prediction_data, '$.predicted_demand')) as predicted_demand,
                AVG(JSON_EXTRACT(prediction_data, '$.confidence')) as confidence
            FROM ml_predictions 
            WHERE prediction_type = 'resource_demand'
            GROUP BY service_type
        ");
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get beneficiary insights for dashboard
     */
    private function getBeneficiaryInsights(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                cluster_id,
                COUNT(*) as cluster_size,
                AVG(JSON_EXTRACT(prediction_data, '$.average_age')) as avg_age,
                AVG(JSON_EXTRACT(prediction_data, '$.average_income')) as avg_income
            FROM ml_predictions 
            WHERE prediction_type = 'beneficiary_clustering'
            GROUP BY cluster_id
        ");
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
