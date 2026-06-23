# 🌾 AgriMap API Documentation

## 🧭 Overview

**AgriMap** is an AI-powered agricultural mapping and soil intelligence platform designed to help **smallholder farming cooperatives access green financing**.

The system leverages **Sentinel-2 satellite imagery** to:

* Detect crop boundaries
* Predict crop types
* Monitor vegetation health
* Estimate soil mineral proxies (nitrogen, moisture)
* Track environmental degradation
* Calculate verifiable carbon sequestration metrics

---

## 🏗️ System Architecture

### 🛰️ Django Backend (Primary - Geospatial Intelligence)

Handles:

* Satellite imagery ingestion (Sentinel-2)
* Field boundary detection
* Crop classification (ML models)
* Vegetation indices (NDVI, EVI)
* Soil proxy analysis
* Carbon sequestration calculations
* Farmer/cooperative data

---

### 💰 Node.js Backend (Secondary - Finance Layer)

Handles:

* Cooperative financing
* Loan applications
* Carbon credit monetization
* Payments & disbursements
* Wallets & transactions

---

## 🔗 Base URLs

### Django (Core API)

* Dev: `http://localhost:8000/api`
* Prod: `https://agrimap-django.onrender.com/api`

### Node.js (Finance API)

* Dev: `http://localhost:5000/api`
* Prod: `https://agrimap-node.onrender.com/api`

---

## 🔐 Authentication

* JWT issued by Django
* Node validates Django tokens

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

---

### Get Cooperative Details

`GET /cooperatives/:id`

---

## 🗺️ Farm Mapping

### Upload Field Boundary (GeoJSON)

`POST /fields`

**Body:**

```json
{
  "name": "Maize Plot A",
  "geometry": { "type": "Polygon", "coordinates": [...] }
}
```

---

### Get Fields

`GET /fields`

---

### Get Field Details

`GET /fields/:id`

---

## 🛰️ Satellite Processing

### Fetch Sentinel-2 Imagery

`POST /satellite/fetch`

**Body:**

```json
{
  "field_id": "123",
  "date_range": ["2026-01-01", "2026-03-01"]
}
```

---

### Process Imagery

`POST /satellite/process`

* Runs:

  * Cloud masking
  * Band extraction
  * Feature engineering

---

## 🌱 Vegetation & Crop Intelligence

### Get Vegetation Indices (NDVI/EVI)

`GET /analysis/vegetation/:field_id`

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

**Response:**

```json
{
  "nitrogen_proxy": 0.62,
  "moisture_index": 0.48,
  "degradation_risk": "moderate"
}
```

---

## 🌍 Environmental Monitoring

### Get Vegetation Health Trends

`GET /analysis/trends/:field_id`

---

### Detect Land Degradation

`GET /analysis/degradation/:field_id`

---

## 🌿 Carbon Sequestration

### Calculate Carbon Sequestration

`GET /carbon/:field_id`

**Response:**

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

## 🏦 Cooperative Financing

### Apply for Loan

`POST /loans/apply`

**Body:**

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

### List Verified Credits

`GET /carbon-credits`

---

### Tokenize Carbon Credits

`POST /carbon-credits/tokenize`

---

### Sell Carbon Credits

`POST /carbon-credits/sell`

---

## 💳 Payments

### Initiate Disbursement

`POST /payments/disburse`

---

### Repayment

`POST /payments/repay`

---

## 💼 Wallet

### Get Balance

`GET /wallet`

---

### Transactions

`GET /wallet/transactions`

---

# 🔄 Backend Interaction Flow

### Example Flow:

1. Farmer maps field → Django
2. Django processes satellite data
3. System calculates:

   * Soil health
   * Crop type
   * Carbon sequestration
4. Cooperative applies for financing → Node
5. Node evaluates using Django insights
6. Loan issued / carbon credits sold

---

# 🔗 Internal Integration

* Django = **source of truth (geospatial + science)**
* Node = **financial execution layer**

### Integration Methods:

* REST API calls
* Webhooks (e.g., `/webhooks/carbon-verified`)

---

# ⚠️ Frontend Rules

### Use Django for:

* Mapping
* Satellite data
* Crop & soil insights
* Carbon analytics

### Use Node for:

* Loans
* Payments
* Carbon credit sales
* Wallet

---

# 🚀 Future Enhancements

* Integration with European Space Agency APIs for real-time satellite feeds
* AI-driven yield prediction
* M-Pesa integration for rural payments
* Blockchain carbon credit registry
* Offline-first mobile support for farmers

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

**AgriMap = Geospatial Intelligence + Climate Finance for Smallholder Farmers**
