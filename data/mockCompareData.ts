import { MetricCompareResponse, CompareRange, MetricInfo } from "@/types/metric";

// ─── Metric info (defined once, reused across all ranges) ─────────────────────

const METRIC_INFO: Record<string, MetricInfo> = {
  cadence: {
    name: "cadence",
    display_name: "Cadence",
    unit: "steps/min",
    description: "How many steps you take per minute. A higher number means you walk more efficiently.",
  },
  total_steps: {
    name: "total_steps",
    display_name: "Total Steps",
    unit: "steps",
    description: "Total number of steps you walked in a day. Aim for at least 6,000 steps daily.",
  },
  total_calories: {
    name: "total_calories",
    display_name: "Calories",
    unit: "kcal",
    description: "Calories burned from walking. More steps and faster pace means more calories burned.",
  },
  avg_max_gyr_ms: {
    name: "avg_max_gyr_ms",
    display_name: "Swing Speed",
    unit: "deg/s",
    description: "How fast your leg moves forward when you take a step. Higher means a stronger, more confident stride.",
  },
  avg_val_gyr_hs: {
    name: "avg_val_gyr_hs",
    display_name: "Heel Impact",
    unit: "rad/s",
    description: "The force when your heel hits the ground. Lower is better — it means you are walking more gently and safely.",
  },
  avg_step_duration: {
    name: "avg_step_duration",
    display_name: "Step Duration",
    unit: "s",
    description: "How long it takes to complete one full step. Lower means a quicker, more efficient walking pace.",
  },
  avg_swing_time: {
    name: "avg_swing_time",
    display_name: "Swing Time",
    unit: "s",
    description: "How long your foot is in the air during a step. A balanced swing time helps maintain a steady walking rhythm.",
  },
  avg_stride_cv: {
    name: "avg_stride_cv",
    display_name: "Stability",
    unit: "%",
    description: "How consistent your walking rhythm is. Higher means your steps are more even and balanced.",
  },
};

// ─── Structure ────────────────────────────────────────────────────────────────
// mockCompareData[metricName][range] → MetricCompareResponse
//
// Each range returns a different history array:
//   day   → 7 entries  (last 7 days: Mar 5–11 2026)
//   week  → 4 entries  (last 4 weeks: W8–W11 2026)
//   month → 6 entries  (last 6 months: Oct 2025–Mar 2026)
//   year  → 4 entries  (last 4 years: 2023–2026)
//
// History reflects the post-fall recovery story:
//   Feb 15 fall → degraded values → gradual recovery through Mar 2026

export const mockCompareData: Record<
  string,
  Record<CompareRange, MetricCompareResponse>
> = {

  // ── Cadence ────────────────────────────────────────────────────────────────
  cadence: {
    day: {
      status: "success",
      metric_info: METRIC_INFO.cadence,
      comparison: {
        patient_current_avg: 106,
        peer_group_avg: 92,
        percentile: 74,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-03-05", value: 101 },
        { date: "2026-03-06", value: 103 },
        { date: "2026-03-07", value: 104 },
        { date: "2026-03-08", value: 102 },
        { date: "2026-03-09", value: 107 },
        { date: "2026-03-10", value: 109 },
        { date: "2026-03-11", value: 108 },
      ],
    },
    week: {
      status: "success",
      metric_info: METRIC_INFO.cadence,
      comparison: {
        patient_current_avg: 106,
        peer_group_avg: 92,
        percentile: 74,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-02-16", value: 78 },  // W8 — just after fall
        { date: "2026-02-23", value: 89 },  // W9 — early recovery
        { date: "2026-03-02", value: 98 },  // W10 — mid recovery
        { date: "2026-03-09", value: 106 }, // W11 — near full recovery
      ],
    },
    month: {
      status: "success",
      metric_info: METRIC_INFO.cadence,
      comparison: {
        patient_current_avg: 106,
        peer_group_avg: 92,
        percentile: 74,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2025-10-01", value: 108 },
        { date: "2025-11-01", value: 109 },
        { date: "2025-12-01", value: 107 },
        { date: "2026-01-01", value: 110 },
        { date: "2026-02-01", value: 88 },  // fall month
        { date: "2026-03-01", value: 106 },
      ],
    },
    year: {
      status: "success",
      metric_info: METRIC_INFO.cadence,
      comparison: {
        patient_current_avg: 106,
        peer_group_avg: 92,
        percentile: 74,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2023-01-01", value: 98 },
        { date: "2024-01-01", value: 103 },
        { date: "2025-01-01", value: 108 },
        { date: "2026-01-01", value: 106 },
      ],
    },
  },

  // ── Total Steps ────────────────────────────────────────────────────────────
  total_steps: {
    day: {
      status: "success",
      metric_info: METRIC_INFO.total_steps,
      comparison: {
        patient_current_avg: 5550,
        peer_group_avg: 4600,
        percentile: 70,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-03-05", value: 5200 },
        { date: "2026-03-06", value: 5400 },
        { date: "2026-03-07", value: 5500 },
        { date: "2026-03-08", value: 5350 },
        { date: "2026-03-09", value: 5600 },
        { date: "2026-03-10", value: 5800 },
        { date: "2026-03-11", value: 6000 },
      ],
    },
    week: {
      status: "success",
      metric_info: METRIC_INFO.total_steps,
      comparison: {
        patient_current_avg: 5550,
        peer_group_avg: 4600,
        percentile: 70,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-02-16", value: 2800 },
        { date: "2026-02-23", value: 3900 },
        { date: "2026-03-02", value: 4800 },
        { date: "2026-03-09", value: 5550 },
      ],
    },
    month: {
      status: "success",
      metric_info: METRIC_INFO.total_steps,
      comparison: {
        patient_current_avg: 5550,
        peer_group_avg: 4600,
        percentile: 70,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2025-10-01", value: 6100 },
        { date: "2025-11-01", value: 6200 },
        { date: "2025-12-01", value: 5900 },
        { date: "2026-01-01", value: 6300 },
        { date: "2026-02-01", value: 3800 }, // fall month
        { date: "2026-03-01", value: 5550 },
      ],
    },
    year: {
      status: "success",
      metric_info: METRIC_INFO.total_steps,
      comparison: {
        patient_current_avg: 5550,
        peer_group_avg: 4600,
        percentile: 70,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2023-01-01", value: 5100 },
        { date: "2024-01-01", value: 5600 },
        { date: "2025-01-01", value: 6100 },
        { date: "2026-01-01", value: 5550 },
      ],
    },
  },

  // ── Calories ───────────────────────────────────────────────────────────────
  total_calories: {
    day: {
      status: "success",
      metric_info: METRIC_INFO.total_calories,
      comparison: {
        patient_current_avg: 277,
        peer_group_avg: 230,
        percentile: 66,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-03-05", value: 260 },
        { date: "2026-03-06", value: 270 },
        { date: "2026-03-07", value: 275 },
        { date: "2026-03-08", value: 268 },
        { date: "2026-03-09", value: 280 },
        { date: "2026-03-10", value: 290 },
        { date: "2026-03-11", value: 300 },
      ],
    },
    week: {
      status: "success",
      metric_info: METRIC_INFO.total_calories,
      comparison: {
        patient_current_avg: 277,
        peer_group_avg: 230,
        percentile: 66,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-02-16", value: 140 },
        { date: "2026-02-23", value: 195 },
        { date: "2026-03-02", value: 240 },
        { date: "2026-03-09", value: 277 },
      ],
    },
    month: {
      status: "success",
      metric_info: METRIC_INFO.total_calories,
      comparison: {
        patient_current_avg: 277,
        peer_group_avg: 230,
        percentile: 66,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2025-10-01", value: 305 },
        { date: "2025-11-01", value: 310 },
        { date: "2025-12-01", value: 290 },
        { date: "2026-01-01", value: 315 },
        { date: "2026-02-01", value: 190 }, // fall month
        { date: "2026-03-01", value: 277 },
      ],
    },
    year: {
      status: "success",
      metric_info: METRIC_INFO.total_calories,
      comparison: {
        patient_current_avg: 277,
        peer_group_avg: 230,
        percentile: 66,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2023-01-01", value: 245 },
        { date: "2024-01-01", value: 268 },
        { date: "2025-01-01", value: 305 },
        { date: "2026-01-01", value: 277 },
      ],
    },
  },

  // ── Swing Speed ────────────────────────────────────────────────────────────
  avg_max_gyr_ms: {
    day: {
      status: "success",
      metric_info: METRIC_INFO.avg_max_gyr_ms,
      comparison: {
        patient_current_avg: 271,
        peer_group_avg: 245,
        percentile: 69,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-03-05", value: 260 },
        { date: "2026-03-06", value: 265 },
        { date: "2026-03-07", value: 268 },
        { date: "2026-03-08", value: 262 },
        { date: "2026-03-09", value: 270 },
        { date: "2026-03-10", value: 275 },
        { date: "2026-03-11", value: 282 },
      ],
    },
    week: {
      status: "success",
      metric_info: METRIC_INFO.avg_max_gyr_ms,
      comparison: {
        patient_current_avg: 271,
        peer_group_avg: 245,
        percentile: 69,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-02-16", value: 198 },
        { date: "2026-02-23", value: 228 },
        { date: "2026-03-02", value: 252 },
        { date: "2026-03-09", value: 271 },
      ],
    },
    month: {
      status: "success",
      metric_info: METRIC_INFO.avg_max_gyr_ms,
      comparison: {
        patient_current_avg: 271,
        peer_group_avg: 245,
        percentile: 69,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2025-10-01", value: 278 },
        { date: "2025-11-01", value: 280 },
        { date: "2025-12-01", value: 275 },
        { date: "2026-01-01", value: 282 },
        { date: "2026-02-01", value: 218 }, // fall month
        { date: "2026-03-01", value: 271 },
      ],
    },
    year: {
      status: "success",
      metric_info: METRIC_INFO.avg_max_gyr_ms,
      comparison: {
        patient_current_avg: 271,
        peer_group_avg: 245,
        percentile: 69,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2023-01-01", value: 248 },
        { date: "2024-01-01", value: 260 },
        { date: "2025-01-01", value: 278 },
        { date: "2026-01-01", value: 271 },
      ],
    },
  },

  // ── Heel Impact ────────────────────────────────────────────────────────────
  avg_val_gyr_hs: {
    day: {
      status: "success",
      metric_info: METRIC_INFO.avg_val_gyr_hs,
      comparison: {
        patient_current_avg: 2.2,
        peer_group_avg: 2.8,
        percentile: 62,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-03-05", value: 2.3 },
        { date: "2026-03-06", value: 2.2 },
        { date: "2026-03-07", value: 2.2 },
        { date: "2026-03-08", value: 2.3 },
        { date: "2026-03-09", value: 2.1 },
        { date: "2026-03-10", value: 2.1 },
        { date: "2026-03-11", value: 2.0 },
      ],
    },
    week: {
      status: "success",
      metric_info: METRIC_INFO.avg_val_gyr_hs,
      comparison: {
        patient_current_avg: 2.2,
        peer_group_avg: 2.8,
        percentile: 62,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-02-16", value: 3.4 },
        { date: "2026-02-23", value: 3.0 },
        { date: "2026-03-02", value: 2.6 },
        { date: "2026-03-09", value: 2.2 },
      ],
    },
    month: {
      status: "success",
      metric_info: METRIC_INFO.avg_val_gyr_hs,
      comparison: {
        patient_current_avg: 2.2,
        peer_group_avg: 2.8,
        percentile: 62,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2025-10-01", value: 2.1 },
        { date: "2025-11-01", value: 2.0 },
        { date: "2025-12-01", value: 2.2 },
        { date: "2026-01-01", value: 2.0 },
        { date: "2026-02-01", value: 3.2 }, // fall month
        { date: "2026-03-01", value: 2.2 },
      ],
    },
    year: {
      status: "success",
      metric_info: METRIC_INFO.avg_val_gyr_hs,
      comparison: {
        patient_current_avg: 2.2,
        peer_group_avg: 2.8,
        percentile: 62,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2023-01-01", value: 2.6 },
        { date: "2024-01-01", value: 2.4 },
        { date: "2025-01-01", value: 2.1 },
        { date: "2026-01-01", value: 2.2 },
      ],
    },
  },

  // ── Step Duration ──────────────────────────────────────────────────────────
  avg_step_duration: {
    day: {
      status: "success",
      metric_info: METRIC_INFO.avg_step_duration,
      comparison: {
        patient_current_avg: 1.04,
        peer_group_avg: 1.18,
        percentile: 71,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-03-05", value: 1.08 },
        { date: "2026-03-06", value: 1.06 },
        { date: "2026-03-07", value: 1.05 },
        { date: "2026-03-08", value: 1.07 },
        { date: "2026-03-09", value: 1.04 },
        { date: "2026-03-10", value: 1.03 },
        { date: "2026-03-11", value: 1.02 },
      ],
    },
    week: {
      status: "success",
      metric_info: METRIC_INFO.avg_step_duration,
      comparison: {
        patient_current_avg: 1.04,
        peer_group_avg: 1.18,
        percentile: 71,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-02-16", value: 1.42 },
        { date: "2026-02-23", value: 1.28 },
        { date: "2026-03-02", value: 1.14 },
        { date: "2026-03-09", value: 1.04 },
      ],
    },
    month: {
      status: "success",
      metric_info: METRIC_INFO.avg_step_duration,
      comparison: {
        patient_current_avg: 1.04,
        peer_group_avg: 1.18,
        percentile: 71,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2025-10-01", value: 1.02 },
        { date: "2025-11-01", value: 1.01 },
        { date: "2025-12-01", value: 1.03 },
        { date: "2026-01-01", value: 1.00 },
        { date: "2026-02-01", value: 1.35 }, // fall month
        { date: "2026-03-01", value: 1.04 },
      ],
    },
    year: {
      status: "success",
      metric_info: METRIC_INFO.avg_step_duration,
      comparison: {
        patient_current_avg: 1.04,
        peer_group_avg: 1.18,
        percentile: 71,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2023-01-01", value: 1.14 },
        { date: "2024-01-01", value: 1.09 },
        { date: "2025-01-01", value: 1.02 },
        { date: "2026-01-01", value: 1.04 },
      ],
    },
  },

  // ── Stability ──────────────────────────────────────────────────────────────
  avg_stride_cv: {
    day: {
      status: "success",
      metric_info: METRIC_INFO.avg_stride_cv,
      comparison: {
        patient_current_avg: 97,
        peer_group_avg: 86,
        percentile: 82,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-03-05", value: 92 },
        { date: "2026-03-06", value: 93 },
        { date: "2026-03-07", value: 94 },
        { date: "2026-03-08", value: 95 },
        { date: "2026-03-09", value: 96 },
        { date: "2026-03-10", value: 97 },
        { date: "2026-03-11", value: 97 },
      ],
    },
    week: {
      status: "success",
      metric_info: METRIC_INFO.avg_stride_cv,
      comparison: {
        patient_current_avg: 97,
        peer_group_avg: 86,
        percentile: 82,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2026-02-16", value: 62 },
        { date: "2026-02-23", value: 74 },
        { date: "2026-03-02", value: 86 },
        { date: "2026-03-09", value: 97 },
      ],
    },
    month: {
      status: "success",
      metric_info: METRIC_INFO.avg_stride_cv,
      comparison: {
        patient_current_avg: 97,
        peer_group_avg: 86,
        percentile: 82,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2025-10-01", value: 95 },
        { date: "2025-11-01", value: 96 },
        { date: "2025-12-01", value: 94 },
        { date: "2026-01-01", value: 97 },
        { date: "2026-02-01", value: 68 }, // fall month
        { date: "2026-03-01", value: 97 },
      ],
    },
    year: {
      status: "success",
      metric_info: METRIC_INFO.avg_stride_cv,
      comparison: {
        patient_current_avg: 97,
        peer_group_avg: 86,
        percentile: 82,
        peer_group_label: "60-65 years old",
      },
      history: [
        { date: "2023-01-01", value: 88 },
        { date: "2024-01-01", value: 92 },
        { date: "2025-01-01", value: 96 },
        { date: "2026-01-01", value: 97 },
      ],
    },
  },
};