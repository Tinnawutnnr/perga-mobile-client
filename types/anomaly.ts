export interface AnomalyLog {
    anomaly_id: string;
    window_id: string;
    patient_id: number;
    timestamp: string; // ISO 8601 format
    anomaly_score: number | null;
    root_cause_feature: string | null;
    z_score: number | null;
    current_val: number | null;
    normal_ref: number | null;
}

export type AnomalyLogSchema = AnomalyLog[];