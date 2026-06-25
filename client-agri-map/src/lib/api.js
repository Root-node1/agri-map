// Dashboard-only API client, scoped to the Django "core intelligence" backend
// described in the AgriMap docs. Mapping/Soil/Finance pages have their own
// deeper endpoints -- this file only covers what the Dashboard overview needs.

const DJANGO_BASE_URL =
  import.meta.env.VITE_AGRIMAP_DJANGO_URL || "http://localhost:8000/api";

function authHeaders() {
  const token = localStorage.getItem("agrimap.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getJSON(path) {
  const res = await fetch(`${DJANGO_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error(`AgriMap API ${path} failed: ${res.status}`);
  }
  return res.json();
}

export const agrimapApi = {
  // GET /farmers/me -- logged-in farmer's profile (used for the greeting)
  getFarmerProfile: () => getJSON("/farmers/me"),

  // GET /fields -- list of fields for the logged-in cooperative/farmer
  getFields: () => getJSON("/fields"),

  // GET /analysis/soil/:field_id -- { nitrogen_proxy, moisture_index, degradation_risk }
  getSoilHealth: (fieldId) => getJSON(`/analysis/soil/${fieldId}`),

  // GET /analysis/vegetation/:field_id -- NDVI/EVI indices
  getVegetation: (fieldId) => getJSON(`/analysis/vegetation/${fieldId}`),

  // GET /carbon/:field_id -- { carbon_tons, confidence_score, methodology }
  getCarbon: (fieldId) => getJSON(`/carbon/${fieldId}`),

  // GET /reports/field/:field_id -- combined crop/soil/carbon/risk report
  getFieldReport: (fieldId) => getJSON(`/reports/field/${fieldId}`),
};

export { DJANGO_BASE_URL };