# TaskTrack - PRN232 Assignment 1

Task & Team Management Web Application built with **ASP.NET Core Web API**, **PostgreSQL** (EF Core DB-First), and **React + TypeScript + Vite**.

## 🌐 Live Links

- **Repository**: [https://github.com/TomOutfit/Assignment-1_PRN232_Fa26](https://github.com/TomOutfit/Assignment-1_PRN232_Fa26)
- **Frontend (Vercel)**: [https://qe190061-prn232-ass1-fe.vercel.app](https://qe190061-prn232-ass1-fe.vercel.app)
- **Backend (Render)**: [https://qe190061-prn232-ass1-be.onrender.com](https://qe190061-prn232-ass1-be.onrender.com)
- **Swagger Documentation**: [https://qe190061-prn232-ass1-be.onrender.com/swagger](https://qe190061-prn232-ass1-be.onrender.com/swagger)

---

## 🛠 Tech Stack

- **Backend**: ASP.NET Core 10, Entity Framework Core (Npgsql), Repository & Service Pattern
- **Database**: PostgreSQL
- **Frontend**: React 19, TypeScript, Vite, React Router, Axios, TailwindCSS/Vanilla CSS
- **Deployment**: Render (Backend Web Service + PostgreSQL) & Vercel (Frontend SPA)

---

## 🚀 Deployment Guide

### 1. Backend on Render
- **Service Type**: Web Service (Docker runtime)
- **Root Directory**: `QE190061_PRN232_Ass1_BE`
- **Environment Variables**:
  - `DATABASE_URL`: Connection string to PostgreSQL instance
  - `ASPNETCORE_ENVIRONMENT`: `Production`

### 2. Frontend on Vercel
- **Framework Preset**: `Vite`
- **Root Directory**: `QE190061_PRN232_Ass1_FE`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://qe190061-prn232-ass1-be.onrender.com/api`
