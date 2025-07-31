# 🚢 Cargo Stowage Management System — PHYDRA

Welcome aboard _PHYDRA_ — an end-to-end, multi-language _Cargo Stowage Management System_ built with love 💙 for the _ISS Hackathon_. Designed to smartly and efficiently organize cargo using powerful algorithms and a seamless interface!

---

## 🌟 Tech Highlights

- 🧠⚙️ _C++ meets FastAPI_ — Experience lightning-fast cargo arrangement powered by C++ logic, wrapped beautifully with a Python FastAPI backend to offer both brains and brawn in one smooth API layer!
- 🌐 _Modern Frontend_ — Interactive, responsive, and intuitive UI to visualize and interact with the system like a pro.
- 🐳 _Dockerized Deployment_ — Ship it anywhere with Docker — portable, efficient, and reliable.
- 🛢️ _Prisma (Python)_ — Elegant database modeling and ORM for seamless data flow and management.

---

## 📁 Project Structure

```bash
PHYDRA/
├── .gitignore                 # Keeps your commits clean and tidy
├── Dockerfile                 # Backend Docker image blueprint
├── README.md                  # You're reading it 😊
├── backend/                   # Backend logic and API magic
│   ├── csv_data/              # Sample input CSV files
│   ├── final_cpp_codes/       # 🚀 Core C++ algorithms for cargo stowage
│   ├── main.py                # FastAPI app entry point
│   └── requirements.txt       # Python dependencies
├── frontend/                  # 🌐 Modern UI code
├── prisma/
│   └── schema.prisma          # Prisma schema for database structure
```

---

## 🚀 Getting Started

### 🔁 Clone the Repository (Shallow Clone Recommended)

> The `.git` file is too large, so it's recommended to clone only the latest version with depth.

```bash
git clone --depth 1 https://github.com/Mantissagithub/PHYDRA.git
cd PHYDRA
```

---

## 🐳 Backend Setup with Docker

### 1️⃣ Build the Docker Image

```bash
sudo docker build -t phydra .
```

### 2️⃣ Run the Backend Container

```bash
sudo docker run -d -p 8000:8000 --name phydra-backend phydra
```

🎯 Your backend is now live at: [http://localhost:8000](http://localhost:8000)

---

## 🛢️ Database Setup with Prisma (Python)

> Make sure your `MONGODB_URI` is set in the `.env` file.

### 1️⃣ Create the `.env` File

Navigate to the `prisma` directory and create a `.env` file with the following content:

```bash
cd prisma
nano .env
```

Add the following sample data to the `.env` file:

```env
MONGODB_URI=<your_mongob_uri>
```

### 2️⃣ Generate Prisma Client

```bash
prisma generate
```

🎉 Database schema is now synced and ready to go!

---

## 🌐 Frontend Setup

### 1️⃣ Navigate to Frontend

```bash
cd frontend/
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Launch Dev Server

```bash
npm run dev
```

✨ Access the frontend at: [http://localhost:5173](http://localhost:5173)

---

## ✅ Project Status

- 🧠 High-performance stowage logic — ✅
- 🔌 Backend API — ✅
- 🎨 Frontend UI — ✅
- 🐳 Docker Deployment — ✅
- 🛢️ Prisma DB Integration — ✅

---

## 🤝 Built With Team Spirit

Crafted during the _ISS Hackathon_ to solve real-world challenges with innovation, collaboration, and joy!  
We believe in building not just solutions — but delightful experiences.

## 👥 Contributors

1. Pradheep - [GitHub](https://github.com/Mantissagithub/)
2. Harish - [GitHub](https://github.com/HARISH20205)
3. Yuvanesh - [GitHub](https://github.com/YuvaneshSankar)
4. Keerthan - [GitHub](https://github.com/Keerthansaai)
---
