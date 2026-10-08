# Sanjivani BC Commission Analytics & Payout Portal

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

An enterprise-grade financial analytics and commission disbursement portal designed for **[Sanjivani Vikas Foundation](https://sanjivani.foundation/)** — powering Business Correspondent Agents (BCAs) across Indian nationalized banks (SBI, CBI, PNB, UBI, BOB, Canara Bank).

---

## 🏛️ Brand & UI Overview
- **Design System:** Corporate Indian Banking aesthetic matching [Sanjivani Foundation](https://sanjivani.foundation/).
- **Color Palette:**
  - `Deep Navy` (`#0f2942`) — Primary Header & Command UI
  - `Forest Emerald` (`#15803d` / `#166534`) — BCA Payout & Positive Accents
  - `Saffron / Amber` (`#d97706`) — National Banking Accents & District Highlighting
  - `Crisp Slate/White` (`#ffffff` / `#f8fafc`) — High-contrast financial registers

---

## 📊 Core Capabilities

1. **80 / 20 Statutory Commission Matrix:**
   - Automatic bifurcation of Net Commission into **80% BCA Agent Payout** and **20% Corporate Retention**.
   - Zero-discrepancy reconciliation with source bank statement datasets.

2. **Hierarchical Drill-Down:**
   - 3 Macro Hierarchy Action Cards: **Zone**, **State**, and **District**.
   - Cascading filter dropdowns (Month range, Zone, State, District, Base Branch, Search, Activity level).

3. **Social Security Schemes (SSS) Hub:**
   - Dedicated dashboard tracking **APY** (Atal Pension Yojana), **PMSBY** (Suraksha Bima Yojana), **PMJJBY** (Jeevan Jyoti Bima Yojana), and CASA enrollments.
   - Live 10% scheme bonus and incentive metrics.

4. **1-Click Regulatory Exports:**
   - **XLSX Master Export:** Full 33-column formatted Excel export with styling and totals.
   - **PDF Disbursement Slips:** 1-click printable disbursement vouchers and commission summary reports.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, SheetJS (`xlsx`), `jspdf`, `jspdf-autotable`.
- **Backend API:** FastAPI, SQLAlchemy, Pydantic, Python 3.10+, JWT Authentication, Role-based Access Control (Admin / Viewer).
- **Database:** Supabase PostgreSQL / SQLite dual-mode support.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or build & start production server
npm run build
npm start
```
Frontend runs at `http://localhost:3000`.

### 3. Backend Setup
```bash
# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib[bcrypt] openpyxl python-multipart

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8080 --reload
```
API Documentation available at `http://localhost:8080/docs`.

---

## 📄 License
Private & Confidential — Built for Sanjivani Vikas Foundation.
