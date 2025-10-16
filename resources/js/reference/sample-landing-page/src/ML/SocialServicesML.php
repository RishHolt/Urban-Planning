<?php

namespace App\ML;

use Phpml\Classification\SVC;
use Phpml\Classification\NaiveBayes;
use Phpml\Regression\LeastSquares;
use Phpml\Clustering\KMeans;
use Phpml\Preprocessing\Normalizer;
use Phpml\Math\Statistic\Mean;
use Phpml\Math\Statistic\StandardDeviation;

class SocialServicesML
{
    private $classifier;
    private $regressor;
    private $normalizer;
    private $trainingData = [];
    private $labels = [];

    public function __construct()
    {
        $this->classifier = new SVC();
        $this->regressor = new LeastSquares();
        $this->normalizer = new Normalizer();
    }

    /**
     * Predict eligibility for social services based on user data
     */
    public function predictEligibility(array $userData): array
    {
        // Features: age, income, family_size, employment_status, disability_status, etc.
        $features = $this->extractFeatures($userData);
        
        // Calculate eligibility score using simple rule-based approach (0-100)
        $eligibilityScore = $this->calculateEligibilityScore($features);
        
        // Predict service recommendations
        $serviceRecommendations = $this->classifyServiceNeeds($features);
        
        return [
            'eligibility_score' => round($eligibilityScore, 2),
            'recommended_services' => $serviceRecommendations,
            'confidence' => $this->calculateConfidence($userData),
            'priority_level' => $this->determinePriority($eligibilityScore)
        ];
    }

    /**
     * Analyze application patterns and predict processing time
     */
    public function predictProcessingTime(array $applicationData): array
    {
        $features = [
            'service_type' => $this->encodeServiceType($applicationData['service_type']),
            'document_completeness' => $applicationData['document_completeness'],
            'applicant_age' => $applicationData['applicant_age'],
            'family_size' => $applicationData['family_size'],
            'urgency_level' => $applicationData['urgency_level']
        ];

        // Predict processing time in days
        $processingDays = $this->regressor->predict(array_values($features));
        
        return [
            'estimated_days' => round($processingDays),
            'confidence_interval' => $this->calculateConfidenceInterval($processingDays),
            'risk_factors' => $this->identifyRiskFactors($features)
        ];
    }

    /**
     * Cluster beneficiaries for targeted service delivery
     */
    public function clusterBeneficiaries(array $beneficiaries): array
    {
        $kmeans = new KMeans(4); // 4 clusters: High, Medium, Low, Emergency
        
        $features = [];
        foreach ($beneficiaries as $beneficiary) {
            $features[] = [
                $beneficiary['age'],
                $beneficiary['income'],
                $beneficiary['family_size'],
                $beneficiary['disability_score'] ?? 0,
                $beneficiary['education_level'] ?? 0
            ];
        }

        $clusters = $kmeans->cluster($features);
        
        return $this->analyzeClusters($clusters, $beneficiaries);
    }

    /**
     * Predict fraud risk in applications
     */
    public function detectFraudRisk(array $applicationData): array
    {
        $riskFeatures = [
            'income_discrepancy' => $applicationData['income_discrepancy'] ?? 0,
            'document_authenticity' => $applicationData['document_authenticity'] ?? 0,
            'application_frequency' => $applicationData['application_frequency'] ?? 0,
            'address_verification' => $applicationData['address_verification'] ?? 0,
            'employment_verification' => $applicationData['employment_verification'] ?? 0
        ];

        $riskScore = $this->calculateRiskScore($riskFeatures);
        
        return [
            'risk_score' => $riskScore,
            'risk_level' => $this->categorizeRisk($riskScore),
            'red_flags' => $this->identifyRedFlags($riskFeatures),
            'recommended_actions' => $this->suggestActions($riskScore)
        ];
    }

    /**
     * Optimize resource allocation based on demand prediction
     */
    public function predictResourceDemand(array $historicalData): array
    {
        $demandPredictions = [];
        
        foreach ($historicalData as $service => $data) {
            $trend = $this->analyzeTrend($data);
            $seasonality = $this->detectSeasonality($data);
            $demand = $this->forecastDemand($trend, $seasonality);
            
            $demandPredictions[$service] = [
                'predicted_demand' => round($demand),
                'confidence' => $this->calculateForecastConfidence($data),
                'trend_direction' => $trend['direction'],
                'seasonal_factors' => $seasonality
            ];
        }
        
        return $demandPredictions;
    }

    /**
     * Calculate eligibility score using rule-based approach
     */
    private function calculateEligibilityScore(array $features): float
    {
        $score = 50; // Base score
        
        // Age factor (younger = higher score)
        if ($features[0] < 30) $score += 15;
        elseif ($features[0] < 50) $score += 10;
        elseif ($features[0] < 65) $score += 5;
        
        // Income factor (lower = higher score)
        if ($features[1] < 10000) $score += 20;
        elseif ($features[1] < 20000) $score += 15;
        elseif ($features[1] < 30000) $score += 10;
        
        // Family size factor (larger = higher score)
        if ($features[2] > 5) $score += 10;
        elseif ($features[2] > 3) $score += 5;
        
        // Employment status factor (unemployed = higher score)
        if ($features[3] == 0) $score += 15;
        elseif ($features[3] == 3) $score += 10; // part-time
        
        // Disability factor (disabled = higher score)
        if ($features[4] > 0) $score += 20;
        
        // Education factor (lower = higher score)
        if ($features[5] <= 1) $score += 10;
        
        // Housing condition factor (poorer = higher score)
        if ($features[6] <= 2) $score += 15;
        elseif ($features[6] <= 3) $score += 10;
        
        // Medical conditions factor (more = higher score)
        if ($features[7] > 2) $score += 15;
        elseif ($features[7] > 0) $score += 10;
        
        return min(100, max(0, $score));
    }

    /**
     * Extract numerical features from user data
     */
    private function extractFeatures(array $userData): array
    {
        return [
            (float)($userData['age'] ?? 0),
            (float)($userData['monthly_income'] ?? 0),
            (float)($userData['family_size'] ?? 1),
            (float)($userData['employment_status'] ?? 0),
            (float)($userData['disability_status'] ?? 0),
            (float)($userData['education_level'] ?? 0),
            (float)($userData['housing_condition'] ?? 0),
            (float)($userData['medical_conditions'] ?? 0)
        ];
    }

    /**
     * Classify service needs based on user characteristics
     */
    private function classifyServiceNeeds(array $features): array
    {
        $services = ['AICS', 'PDAO', 'OSCA', 'Solo_Parent', 'Livelihood', 'Financial_Aid'];
        $recommendations = [];
        
        // Simple rule-based classification (can be enhanced with trained models)
        if ($features[4] > 0) { // Disability status
            $recommendations[] = 'PDAO';
        }
        if ($features[0] >= 60) { // Age >= 60
            $recommendations[] = 'OSCA';
        }
        if ($features[1] < 15000) { // Low income
            $recommendations[] = 'AICS';
        }
        
        return $recommendations ?: ['AICS']; // Default recommendation
    }

    /**
     * Calculate confidence level based on data quality
     */
    private function calculateConfidence(array $userData): float
    {
        $dataQuality = 0;
        $totalFields = 8;
        
        foreach ($userData as $field => $value) {
            if (!empty($value) && $value !== null) {
                $dataQuality++;
            }
        }
        
        return round(($dataQuality / $totalFields) * 100, 2);
    }

    /**
     * Determine priority level based on eligibility score
     */
    private function determinePriority(float $score): string
    {
        if ($score >= 80) return 'High';
        if ($score >= 60) return 'Medium';
        if ($score >= 40) return 'Low';
        return 'Review Required';
    }

    /**
     * Calculate risk score for fraud detection
     */
    private function calculateRiskScore(array $features): float
    {
        $weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Feature weights
        $riskScore = 0;
        
        foreach (array_values($features) as $i => $value) {
            $riskScore += $value * $weights[$i];
        }
        
        return round($riskScore * 100, 2);
    }

    /**
     * Categorize risk level
     */
    private function categorizeRisk(float $riskScore): string
    {
        if ($riskScore >= 80) return 'High Risk';
        if ($riskScore >= 60) return 'Medium Risk';
        if ($riskScore >= 40) return 'Low Risk';
        return 'Minimal Risk';
    }

    /**
     * Identify red flags in application
     */
    private function identifyRedFlags(array $features): array
    {
        $redFlags = [];
        
        if ($features['income_discrepancy'] > 0.5) {
            $redFlags[] = 'Income discrepancy detected';
        }
        if ($features['document_authenticity'] < 0.7) {
            $redFlags[] = 'Document authenticity concerns';
        }
        if ($features['application_frequency'] > 3) {
            $redFlags[] = 'High application frequency';
        }
        
        return $redFlags;
    }

    /**
     * Suggest actions based on risk level
     */
    private function suggestActions(float $riskScore): array
    {
        if ($riskScore >= 80) {
            return ['Manual review required', 'Additional verification needed', 'Flag for investigation'];
        } elseif ($riskScore >= 60) {
            return ['Enhanced verification', 'Document review', 'Follow-up required'];
        } else {
            return ['Standard processing', 'Routine verification'];
        }
    }

    /**
     * Analyze trend in historical data
     */
    private function analyzeTrend(array $data): array
    {
        $values = array_values($data);
        $n = count($values);
        
        if ($n < 2) {
            return ['direction' => 'stable', 'slope' => 0];
        }
        
        $slope = ($values[$n-1] - $values[0]) / ($n - 1);
        
        return [
            'direction' => $slope > 0 ? 'increasing' : ($slope < 0 ? 'decreasing' : 'stable'),
            'slope' => $slope
        ];
    }

    /**
     * Detect seasonality in data
     */
    private function detectSeasonality(array $data): array
    {
        // Simple seasonality detection (can be enhanced)
        $values = array_values($data);
        $mean = Mean::arithmetic($values);
        $std = StandardDeviation::population($values);
        
        return [
            'has_seasonality' => $std > ($mean * 0.3),
            'variability' => round(($std / $mean) * 100, 2)
        ];
    }

    /**
     * Forecast demand based on trend and seasonality
     */
    private function forecastDemand(array $trend, array $seasonality): float
    {
        $baseDemand = 100; // Base demand
        
        // Apply trend
        $trendedDemand = $baseDemand * (1 + $trend['slope'] * 0.1);
        
        // Apply seasonality factor
        $seasonalFactor = $seasonality['has_seasonality'] ? 1.2 : 1.0;
        
        return $trendedDemand * $seasonalFactor;
    }

    /**
     * Calculate forecast confidence
     */
    private function calculateForecastConfidence(array $data): float
    {
        $n = count($data);
        if ($n < 3) return 50.0;
        
        $values = array_values($data);
        $std = StandardDeviation::population($values);
        $mean = Mean::arithmetic($values);
        
        $coefficientOfVariation = $std / $mean;
        $confidence = max(50, 100 - ($coefficientOfVariation * 100));
        
        return round($confidence, 2);
    }

    /**
     * Analyze clusters for insights
     */
    private function analyzeClusters(array $clusters, array $beneficiaries): array
    {
        $clusterAnalysis = [];
        
        foreach ($clusters as $clusterId => $cluster) {
            $clusterMembers = array_filter($beneficiaries, function($key) use ($cluster) {
                return in_array($key, $cluster);
            }, ARRAY_FILTER_USE_KEY);
            
            $clusterAnalysis[$clusterId] = [
                'size' => count($clusterMembers),
                'average_age' => $this->calculateAverage($clusterMembers, 'age'),
                'average_income' => $this->calculateAverage($clusterMembers, 'monthly_income'),
                'service_needs' => $this->identifyClusterServiceNeeds($clusterMembers)
            ];
        }
        
        return $clusterAnalysis;
    }

    /**
     * Calculate average for a specific field
     */
    private function calculateAverage(array $data, string $field): float
    {
        $values = array_filter(array_column($data, $field));
        return empty($values) ? 0 : array_sum($values) / count($values);
    }

    /**
     * Identify service needs for a cluster
     */
    private function identifyClusterServiceNeeds(array $members): array
    {
        $serviceCounts = [];
        
        foreach ($members as $member) {
            if (isset($member['service_needs'])) {
                foreach ($member['service_needs'] as $service) {
                    $serviceCounts[$service] = ($serviceCounts[$service] ?? 0) + 1;
                }
            }
        }
        
        arsort($serviceCounts);
        return array_keys(array_slice($serviceCounts, 0, 3));
    }

    /**
     * Encode service type for ML processing
     */
    private function encodeServiceType(string $serviceType): int
    {
        $encodings = [
            'AICS' => 1,
            'PDAO' => 2,
            'OSCA' => 3,
            'Solo_Parent' => 4,
            'Livelihood' => 5,
            'Financial_Aid' => 6
        ];
        
        return $encodings[$serviceType] ?? 0;
    }

    /**
     * Calculate confidence interval for processing time
     */
    private function calculateConfidenceInterval(float $processingDays): array
    {
        $margin = $processingDays * 0.2; // 20% margin
        return [
            'lower' => max(1, round($processingDays - $margin)),
            'upper' => round($processingDays + $margin)
        ];
    }

    /**
     * Identify risk factors for processing time
     */
    private function identifyRiskFactors(array $features): array
    {
        $riskFactors = [];
        
        if ($features['document_completeness'] < 0.8) {
            $riskFactors[] = 'Incomplete documentation';
        }
        if ($features['urgency_level'] > 0.7) {
            $riskFactors[] = 'High urgency may cause delays';
        }
        if ($features['family_size'] > 5) {
            $riskFactors[] = 'Large family size may require additional verification';
        }
        
        return $riskFactors;
    }
}
