# 🌾 AgriMap API Documentation (v2)

## 🧭 Overview

**AgriMap** is an AI-powered agricultural mapping and soil intelligence platform designed to help **smallholder farmers and cooperatives access climate intelligence and green financing**.

The platform transforms **free Sentinel-2 satellite imagery** into:

* 🌱 Crop detection & classification
* 📊 Vegetation health monitoring (NDVI, EVI)
* 🧪 Soil proxy insights (moisture, nitrogen)
* 🌍 Environmental degradation tracking
* 🌿 Verified carbon sequestration data

---

## 🏗️ System Architecture

AgriMap follows a **dual-backend architecture**:

### 🛰️ Django Backend (Primary — Geospatial Intelligence)

Responsible for **all AI, geospatial, and scientific computation**.

Handles:

* Satellite imagery ingestion (Sentinel-2)
* NDVI/EVI calculations
* Crop classification models
* Soil proxy analysis
* Carbon sequestration estimation
* Farmer & cooperative data
* Report generation

---

### 💰 Node.js Backend (Secondary — Finance & Monetization)

Responsible for **turning insights into financial value**.

Handles:

* Loan systems
* Carbon credit monetization
* Wallet & transactions
* Payments & disbursement
* Audit logging

---

## 🔗 Base URLs

### Django (Core AI API)

* Dev: `http://localhost:8000/api`
* Prod: `https://agrimap-django.onrender.com/api`

### Node.js (Finance API)

* Dev: `http://localhost:5000/api`
* Prod: `https://agrimap-node.onrender.com/api`

---

## 🔐 Authentication

* JWT issued by Django
* Node validates JWT tokens

```
Authorization: Bearer <token>
```

---

# 🛰️ DJANGO BACKEND (CORE INTELLIGENCE)

## 👤 Farmers & Cooperatives

### Register Farmer

`POST /farmers/register`

### Get Farmer Profile

`GET /farmers/me`

---

### Register Cooperative

`POST /cooperatives`

### Get Cooperative Details

`GET /cooperatives/:id`

---

## 🗺️ Farm Mapping

### Upload Field Boundary (GeoJSON)

`POST /fields`

```json
{
  "name": "Maize Plot A",
  "geometry": { "type": "Polygon", "coordinates": [...] }
}
```

---

### Get Fields

`GET /fields`

### Get Field Details

`GET /fields/:id`

---

## 🛰️ Satellite Processing

### Fetch Sentinel-2 Imagery

`POST /satellite/fetch`

```json
{
  "field_id": "123",
  "date_range": ["2026-01-01", "2026-03-01"]
}
```

---

### Process Imagery

`POST /satellite/process`

Processes:

* Cloud masking
* Band extraction
* Feature engineering

---

## 🌱 Vegetation & Crop Intelligence

### Get Vegetation Indices

`GET /analysis/vegetation/:field_id`

Returns NDVI, EVI values

---

### Predict Crop Type

`GET /analysis/crop-type/:field_id`

---

### Detect Crop Boundaries

`GET /analysis/boundaries/:field_id`

---

## 🧪 Soil Intelligence

### Get Soil Health Map

`GET /analysis/soil/:field_id`

```json
{
  "nitrogen_proxy": 0.62,
  "moisture_index": 0.48,
  "degradation_risk": "moderate"
}
```

---

## 🌍 Environmental Monitoring

### Vegetation Trends

`GET /analysis/trends/:field_id`

### Land Degradation Detection

`GET /analysis/degradation/:field_id`

---

## 🌿 Carbon Sequestration

### Calculate Carbon

`GET /carbon/:field_id`

```json
{
  "carbon_tons": 2.3,
  "confidence_score": 0.87,
  "methodology": "NDVI-based estimation"
}
```

---

## 📊 Reports

### Generate Field Report

`GET /reports/field/:field_id`

Includes:

* Crop type
* Soil health
* Carbon data
* Risk insights

---

# 💰 NODE.JS BACKEND (FINANCE & MONETIZATION)

## 🧠 Core Principle

> Node.js does NOT compute AI — it **consumes AI outputs from Django and monetizes them**

---

## 🏦 Loans

### Apply for Loan

`POST /loans/apply`

```json
{
  "cooperative_id": "coop_123",
  "amount": 5000,
  "purpose": "Irrigation upgrade"
}
```

---

### Get Loan Status

`GET /loans/:id`

---

## 🌿 Carbon Credit Marketplace

### List Credits

`GET /carbon-credits`

---

### Tokenize Carbon Credits

`POST /carbon-credits/tokenize`

```json
{
  "field_id": "123"
}
```

🔹 Internally:

* Calls Django `/carbon/:field_id`
* Converts `carbon_tons` → credits
* Assigns market value

---

### Sell Carbon Credits

`POST /carbon-credits/sell`

---

## 💳 Payments

### Disburse Loan

`POST /payments/disburse`

### Repay Loan

`POST /payments/repay`

---

## 💼 Wallet

### Get Balance

`GET /wallet`

### Transactions

`GET /wallet/transactions`

---

## 📊 Logging & Audit Trail

All financial and environmental actions are logged:

* Carbon calculations
* Loan approvals
* Payments
* Credit sales

Purpose:

* Transparency
* Investor trust
* Compliance

---

# 🔄 Backend Interaction Flow

## 🔗 End-to-End Flow

1. Farmer maps field → Django
2. Django processes satellite data
3. AI generates:

   * Soil insights
   * Crop data
   * Carbon metrics
4. Node fetches carbon data
5. Node:

   * Tokenizes credits
   * Enables financing
6. Funds/credits returned to farmer

---

## 🔧 Integration Example

### Node calling Django:

```js
const res = await fetch(
  "http://localhost:8000/api/carbon/123"
);
const data = await res.json();
```

---

# 🔗 Internal Integration

* Django = **source of truth (AI + geospatial)**
* Node = **financial execution layer**

### Communication:

* REST APIs
* Future: Webhooks (`/webhooks/carbon-verified`)

---

# ⚠️ Frontend Integration Rules

### Use Django for:

* Mapping
* Satellite insights
* Crop & soil data
* Carbon analytics

### Use Node for:

* Loans
* Payments
* Wallet
* Carbon credits

---

# 🚀 Future Enhancements

* Real-time satellite ingestion
* AI yield prediction
* M-Pesa integration
* Blockchain carbon registry
* Offline-first mobile support
* Voice-based farmer interaction (Kiswahili/Sheng)

---

# 🧪 Health Checks

### Django

`GET /health`

### Node

`GET /health`

---

# 📌 Summary

| Feature              | Backend |
| -------------------- | ------- |
| Satellite Processing | Django  |
| Crop Detection       | Django  |
| Soil Intelligence    | Django  |
| Carbon Calculation   | Django  |
| Farmers/Coops        | Django  |
| Loans                | Node    |
| Payments             | Node    |
| Carbon Credits       | Node    |
| Wallet               | Node    |

---

## 🎯 Final Positioning

**AgriMap is not just an AI platform — it is a financial bridge powered by geospatial intelligence.**

It converts:
👉 Satellite data → Insights → Financial opportunity
