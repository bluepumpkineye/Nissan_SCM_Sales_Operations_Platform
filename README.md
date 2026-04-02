# Nissan Europe — SCM & Sales Operations Platform

A comprehensive, interactive web application simulating the Supply Chain Management and Sales Operations systems used at Nissan Europe's EMEA Regional Office. Built from 8 years of hands-on operational experience managing end-to-end vehicle flow across 6 global factories, 10 regional markets, and 18 vehicle models.

> **⚠️ Disclaimer**: This is a portfolio demonstration and prototype application. It is not affiliated with, endorsed by, or connected to Nissan Motor Co., Ltd. or any of its subsidiaries. All data shown is illustrative and does not represent actual Nissan business data. Nissan brand references are used solely for contextual accuracy in describing professional experience.

---

## 🎯 Purpose

This application serves two objectives:

1. **Professional Portfolio** — A tangible demonstration of deep supply chain expertise, replacing traditional CV descriptions with an interactive, explorable system that mirrors real operational tools and processes.

2. **SaaS Prototype** — A proof-of-concept for a purpose-built SCM operations platform designed for automotive manufacturers and multi-market distribution businesses managing complex production-to-dealer vehicle pipelines.

---

## 🏗️ What It Covers

### Executive Overview
Enterprise-grade sales and operations dashboard with KPI selectors (Wholesale, Retail, Stock, Market Share, Order Bank), regional filtering across European RBUs, and target comparison toggles (MSR / Business Plan / Last Year). Inspired by real automotive OEM executive reporting tools.

### Inventory Management
Lead-time-based stock targeting system. Stock coverage targets (2.5 months of forward sales) are derived from weighted logistic lead times across supply sources — from 22-day UK-sourced routes to 70-day Japan-sourced ocean freight. Interactive configuration of factory lead time parameters with real-time stock target recalculation.

### Pipeline System
Vehicle pipeline management at End Item specification level (18-digit codes covering model, engine, drivetrain, transmission, trim, colour, and destination). Operates across three forecast horizons:
- **6-Month View** — Monthly volume buckets for strategic planning
- **4-Week View** — Weekly scheduling alignment
- **5-Day View** — Daily production slots approaching build

Includes Order Bank, In-Transit, and Compound Stock views with vehicle detail panels showing decoded specifications and pipeline stage tracking.

### Monthly Production Cycle (S&OP)
Complete simulation of the monthly S&OP cadence — a structured 16-working-day cycle including:
- **Volume Request** — RBU demand aggregation and plant submission
- **SRVC Meeting** — Sales Review & Volume Confirmation with factory capacity negotiation
- **Forecast Confirmation** — End Item mix forecasting (Provisional → Confirmation stages)
- **OCF/CCF Constraints** — Order Control Frame and Colour Control Frame management with breach resolution workflows

Features an interactive Gantt-style job schedule, pipeline horizon visualization (monthly → weekly → daily bucket decomposition), and legacy terminal system simulation.

### Process Optimization
Interactive case study demonstrating end-to-end pipeline acceleration for a fleet delivery scenario. Walks through 8 steps covering:
- Pipeline analysis and gap identification
- Monthly cycle engagement at SRVC stage
- Japan factory coordination for production pull-forward
- OCF constraint validation
- Alternative logistics routing through European compound network
- Financial ownership control (physical movement vs. invoice timing)

### Operations Dashboard
Operational monitoring with European stock breakdown by pipeline status, RBU-level stock vs target comparison, 12-month stock evolution trends, wholesale achievement heatmap (Model × Region), factory capacity utilization, and distribution action panels (Launch, Phase-Out, Fleet, Order Bank).

### Stock Reconciliation
Physical-to-financial inventory reconciliation module covering:
- **Ownership & Invoice Flow** — NISA (Nissan International SA) trading entity model with SCOPE status code lifecycle (Status 18–90)
- **Route Schematics** — Interactive logistics route explorer for 9 RBUs showing compounds, transit points, and financial checkpoints
- **Discrepancy Analysis** — Root cause breakdown (status code timing, transit lag, local system offsets, independent market invoicing)
- **Independent Markets** — Special handling for factory gate-out invoicing (Croatia, Malta, Turkey, etc.)

### Strategic Initiatives
ABC Category Project — Pareto-based End Item classification with automatic Day-3 (BBSS) spec reallocation. C-category slow movers without confirmed orders are converted to A-category fast-moving specifications before production, reducing aged stock risk by 62%.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 with TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Routing** | React Router |
| **Build** | Vite |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/[your-username]/nissan-europe-scm.git

# Navigate to the project directory
cd nissan-europe-scm

# Install dependencies
npm install

# Start the development server
npm run dev
