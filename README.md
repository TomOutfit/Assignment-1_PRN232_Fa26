# TaskTrack - PRN232 Assignment 1

[![Continuous Integration](https://github.com/TomOutfit/Assignment-1_PRN232_Fa26/actions/workflows/ci.yml/badge.svg)](https://github.com/TomOutfit/Assignment-1_PRN232_Fa26/actions/workflows/ci.yml)

Task & Team Management Web Application built with **ASP.NET Core Web API**, **PostgreSQL** (EF Core DB-First), and **React + TypeScript + Vite**.

---

## 🌐 Live Links

- **GitHub Repository**: [https://github.com/TomOutfit/Assignment-1_PRN232_Fa26](https://github.com/TomOutfit/Assignment-1_PRN232_Fa26)
- **Frontend (Vercel)**: [https://qe190061-prn232-ass1-fe.vercel.app](https://qe190061-prn232-ass1-fe.vercel.app)
- **Backend API (Render)**: [https://qe190061-prn232-ass1-be.onrender.com](https://qe190061-prn232-ass1-be.onrender.com)
- **Swagger Documentation**: [https://qe190061-prn232-ass1-be.onrender.com/swagger](https://qe190061-prn232-ass1-be.onrender.com/swagger)

---

## 📊 Database Schema (Entity-Relationship Diagram)

Below is the Entity-Relationship Diagram (ERD) based on [`TaskManagementDB_Postgres (1).sql`](./TaskManagementDB_Postgres%20(1).sql):

```mermaid
erDiagram
    Department ||--o{ Project : "has"
    Project ||--o{ Task : "contains"
    Task ||--o{ TaskTag : "assigned"
    Tag ||--o{ TaskTag : "belongs to"

    Department {
        int DepartmentID PK "SERIAL"
        varchar(100) DepartmentName "NOT NULL"
        varchar(300) DepartmentDescription "NOT NULL"
        boolean IsActive "DEFAULT TRUE"
    }

    Project {
        int ProjectID PK "SERIAL"
        varchar(200) ProjectName "NOT NULL"
        text Description "NULL"
        date StartDate "NOT NULL"
        date EndDate "NULL"
        smallint Status "0=Not Started, 1=In Progress, 2=Completed, 3=On Hold"
        int DepartmentID FK "REFERENCES Department(DepartmentID)"
        boolean IsActive "DEFAULT TRUE"
        timestamp CreatedDate "DEFAULT CURRENT_TIMESTAMP"
    }

    Task {
        int TaskID PK "SERIAL"
        varchar(300) Title "NOT NULL"
        text Description "NULL"
        smallint Status "0=To Do, 1=In Progress, 2=Done, 3=Cancelled"
        smallint Priority "0=Low, 1=Medium, 2=High, 3=Critical"
        date DueDate "NULL"
        int ProjectID FK "REFERENCES Project(ProjectID)"
        boolean IsActive "DEFAULT TRUE"
        timestamp CreatedDate "DEFAULT CURRENT_TIMESTAMP"
        timestamp ModifiedDate "NULL"
    }

    Tag {
        int TagID PK "SERIAL"
        varchar(50) TagName "NOT NULL UNIQUE"
        varchar(7) Color "Hex code e.g. #3B82F6"
    }

    TaskTag {
        int TaskID PK,FK "REFERENCES Task(TaskID)"
        int TagID PK,FK "REFERENCES Tag(TagID)"
    }
```

---

## 🛠 Tech Stack & Architecture

- **Backend**:
  - ASP.NET Core 10 Web API
  - Entity Framework Core 10 (Npgsql PostgreSQL Provider)
  - 3-Tier Layered Architecture: **API** (Controllers) ➔ **Service** (Business Logic & DTOs) ➔ **Repo** (EF Core Repositories & Entities)
  - API Documentation: Swagger / OpenAPI UI at `/swagger`
  - CORS: Configured for full cross-origin compatibility
- **Frontend**:
  - React 19 + TypeScript
  - Vite build tool & development server
  - React Router v7 SPA with rewrite fallback configuration
  - Axios HTTP Client
  - Quick Status Filter Pills (`All`, `To Do`, `In Progress`, `Done`, `Cancelled`) + Multi-attribute filtering (Priority, Project, Tag, Search)
- **CI/CD & Deployment**:
  - **GitHub Actions**: Automated CI running backend build + frontend lint (`oxlint`) and TypeScript build (`tsc -b && vite build`) on every push/PR.
  - **Render**: ASP.NET Core Backend hosted as a Dockerized Web Service + Managed PostgreSQL database.
  - **Vercel**: React SPA Frontend hosted on Vercel with automatic edge deployments.

---

## 🚀 Deployment Guide

### 1. Backend on Render
- **Service Type**: Web Service (Docker runtime)
- **Root Directory**: `QE190061_PRN232_Ass1_BE`
- **Environment Variables**:
  - `DATABASE_URL`: Connection string to PostgreSQL instance (`postgresql://user:pass@host:port/db`)
  - `ASPNETCORE_ENVIRONMENT`: `Production`

### 2. Frontend on Vercel
- **Framework Preset**: `Vite`
- **Root Directory**: `QE190061_PRN232_Ass1_FE`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://qe190061-prn232-ass1-be.onrender.com/api`

---

## 🧪 Local Development

### Backend (.NET API)
```bash
cd QE190061_PRN232_Ass1_BE
dotnet restore
dotnet run --project TaskTrack.API
```
API runs locally at `http://localhost:5000` (Swagger UI at `http://localhost:5000/swagger`).

### Frontend (React + Vite)
```bash
cd QE190061_PRN232_Ass1_FE
npm install
npm run dev
```
Frontend runs locally at `http://localhost:5173`.
