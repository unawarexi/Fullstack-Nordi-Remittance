// ============================================================================
// ML SERVICE CLIENT — HTTP client to the Python FastAPI ML microservice
// ============================================================================
import axios, { type AxiosInstance } from 'axios';
import { env } from '../config/env.config.js';
import logger from '../logs/logger.js';

// ============================================================================
// TYPES
// ============================================================================

export interface FraudPrediction {
  transaction_id: string;
  fraud_probability: number;
  is_fraudulent: boolean;
  risk_factors: string[];
  model_version: string;
  confidence: number;
}

export interface RiskScore {
  user_id: string;
  risk_score: number;
  risk_tier: 'minimal' | 'low' | 'elevated' | 'high' | 'severe';
  recommended_action: string;
  factor_breakdown: Record<string, number>;
  model_version: string;
}

export interface AnomalyResult {
  user_id: string;
  anomaly_score: number;
  is_anomalous: boolean;
  anomaly_type: string | null;
  explanation: string;
  model_version: string;
}

// ============================================================================
// ML SERVICE CLIENT
// ============================================================================

class MLServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.ML_SERVICE_URL,
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async predictFraud(data: {
    transaction_id: string;
    user_id: string;
    amount: number;
    currency: string;
    transaction_type: string;
    recipient_country?: string;
    channel?: string;
    is_international?: boolean;
    hour_of_day?: number;
    day_of_week?: number;
    user_account_age_days?: number;
    user_transaction_count_30d?: number;
    user_avg_transaction_amount?: number;
  }): Promise<FraudPrediction | null> {
    try {
      const response = await this.client.post('/api/v1/ml/fraud/predict', data);
      return response.data;
    } catch (err: any) {
      logger.warn('[MLService] Fraud prediction failed, using backend fallback', { error: err.message });
      return null;
    }
  }

  async scoreRisk(data: {
    user_id: string;
    amount: number;
    currency: string;
    recipient_country?: string;
    transaction_type: string;
    kyc_level?: string;
    account_age_days?: number;
    historical_fraud_signals?: number;
    velocity_score?: number;
  }): Promise<RiskScore | null> {
    try {
      const response = await this.client.post('/api/v1/ml/risk/score', data);
      return response.data;
    } catch (err: any) {
      logger.warn('[MLService] Risk scoring failed, using backend fallback', { error: err.message });
      return null;
    }
  }

  async detectAnomaly(data: {
    user_id: string;
    transactions: Array<Record<string, unknown>>;
    current_transaction: Record<string, unknown>;
  }): Promise<AnomalyResult | null> {
    try {
      const response = await this.client.post('/api/v1/ml/anomaly/detect', data);
      return response.data;
    } catch (err: any) {
      logger.warn('[MLService] Anomaly detection failed, using backend fallback', { error: err.message });
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data?.status === 'healthy';
    } catch {
      return false;
    }
  }
}

// Singleton
export const mlService = new MLServiceClient();
