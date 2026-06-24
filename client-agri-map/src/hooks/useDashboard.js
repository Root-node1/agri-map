import { useCallback, useEffect, useState } from "react";
import { agrimapApi } from "../lib/api";
import { useSettings } from "../contexts/SettingsContext";

const RISK_TAG_KEY = {
  low: "optimalNitrogen",
  moderate: "monitoringPest",
  high: "soilActionNeeded",
};

const RISK_PENALTY = { low: 0, moderate: 0.25, high: 0.55 };

// Shown only if the API can't be reached, so the dashboard still demos cleanly.
const DEMO_FIELDS = [
  { id: "demo-1", name: "North Field", cropType: "maize", soil: { nitrogen_proxy: 0.92, moisture_index: 0.7, degradation_risk: "low" }, carbon: { confidence_score: 0.91 }, vegetation: { ndvi: 0.81, evi: 0.74 } },
  { id: "demo-2", name: "East Slope", cropType: "coffee", soil: { nitrogen_proxy: 0.84, moisture_index: 0.6, degradation_risk: "moderate" }, carbon: { confidence_score: 0.83 }, vegetation: { ndvi: 0.7, evi: 0.62 } },
  { id: "demo-3", name: "River Plot", cropType: "beans", soil: { nitrogen_proxy: 0.5, moisture_index: 0.4, degradation_risk: "high" }, carbon: { confidence_score: 0.6 }, vegetation: { ndvi: 0.42, evi: 0.38 } },
];

function fieldHealthScore(soil) {
  const risk = RISK_PENALTY[soil?.degradation_risk] ?? RISK_PENALTY.low;
  const base = ((soil?.nitrogen_proxy ?? 0) + (soil?.moisture_index ?? 0)) / 2;
  return Math.max(0, Math.min(1, base - risk + 0.3));
}

export function useDashboard() {
  const { t } = useSettings();
  const [state, setState] = useState({
    loading: true,
    error: null,
    isDemoData: false,
    farmerName: "",
    fields: [],
    carbonTotal: 0,
    ndvi: 0,
    evi: 0,
    ndviTrend: "flat",
    soil: { nitrogenProxy: 0, moistureIndex: 0, degradationRisk: "low" },
    carbonConfidence: { score: 0, methodology: "" },
    financeReadiness: { score: 0, status: "notReady", checks: { carbonVerified: false, soilRiskOk: false, reportsComplete: false } },
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const [profile, fieldList] = await Promise.all([
        agrimapApi.getFarmerProfile(),
        agrimapApi.getFields(),
      ]);

      const [reports, vegetation] = await Promise.all([
        Promise.all(fieldList.map((f) => agrimapApi.getFieldReport(f.id).catch(() => null))),
        Promise.all(fieldList.map((f) => agrimapApi.getVegetation(f.id).catch(() => null))),
      ]);

      const enriched = fieldList.map((f, i) => ({ ...f, report: reports[i], vegetation: vegetation[i] }));
      setState((s) => ({ ...s, ...aggregate(enriched, profile?.name, t), isDemoData: false, loading: false }));
    } catch {
      // Backend unreachable -- fall back to demo data, clearly flagged.
      const demoEnriched = DEMO_FIELDS.map((f) => ({
        ...f,
        report: { soil: f.soil, carbon: f.carbon },
        vegetation: f.vegetation,
      }));
      setState((s) => ({ ...s, ...aggregate(demoEnriched, "Juma", t), isDemoData: true, loading: false }));
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

function aggregate(enrichedFields, farmerName, t) {
  const count = enrichedFields.length || 1;

  const fields = enrichedFields.map((f) => {
    const soil = f.report?.soil ?? {};
    const health = fieldHealthScore(soil);
    return {
      id: f.id,
      name: f.name,
      cropType: f.cropType ?? f.crop_type ?? "default",
      healthScore: health,
      degradationRisk: soil.degradation_risk ?? "low",
      tag: t(RISK_TAG_KEY[soil.degradation_risk] ?? "optimalNitrogen"),
    };
  });

  const avgNitrogen = avg(enrichedFields.map((f) => f.report?.soil?.nitrogen_proxy ?? 0));
  const avgMoisture = avg(enrichedFields.map((f) => f.report?.soil?.moisture_index ?? 0));
  const avgNdvi = avg(enrichedFields.map((f) => f.vegetation?.ndvi ?? 0));
  const avgEvi = avg(enrichedFields.map((f) => f.vegetation?.evi ?? 0));
  const avgConfidence = avg(enrichedFields.map((f) => f.report?.carbon?.confidence_score ?? 0));
  const carbonTotal = sum(enrichedFields.map((f) => f.report?.carbon?.carbon_tons ?? 0));
  const worstRisk = enrichedFields.some((f) => f.report?.soil?.degradation_risk === "high")
    ? "high"
    : enrichedFields.some((f) => f.report?.soil?.degradation_risk === "moderate")
    ? "moderate"
    : "low";

  const checks = {
    carbonVerified: avgConfidence >= 0.75,
    soilRiskOk: worstRisk !== "high",
    reportsComplete: enrichedFields.every((f) => f.report),
  };
  const passCount = Object.values(checks).filter(Boolean).length;
  const readinessScore = (avgConfidence * 0.4) + ((worstRisk === "low" ? 1 : worstRisk === "moderate" ? 0.6 : 0.2) * 0.3) + ((passCount / 3) * 0.3);
  const status = readinessScore >= 0.75 ? "ready" : readinessScore >= 0.5 ? "needsData" : "notReady";

  return {
    farmerName: farmerName || "Juma",
    fields,
    carbonTotal,
    ndvi: avgNdvi,
    evi: avgEvi,
    ndviTrend: worstRisk === "high" ? "down" : worstRisk === "moderate" ? "flat" : "up",
    soil: { nitrogenProxy: avgNitrogen, moistureIndex: avgMoisture, degradationRisk: worstRisk },
    carbonConfidence: { score: avgConfidence, methodology: "NDVI-based estimation" },
    financeReadiness: { score: readinessScore, status, checks },
  };
}

function avg(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
function sum(nums) {
  return nums.reduce((a, b) => a + b, 0);
}