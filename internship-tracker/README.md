# Internship Tracker

A full-stack MERN application to track internship applications — statuses, deadlines, stipends, and notes — all in one dashboard.

**Stack:** MongoDB, Express, React (Vite), Node.js, Tailwind CSS, JWT Auth

---

## Features

- User authentication (register/login) with JWT
- Add, edit, delete internship applications
- Track status: Wishlist → Applied → OA → Interview → Offer / Rejected
- Search by company/role/location and filter by status
- Sort by deadline, application date, or company name
- Dashboard stats summary (counts per status)
- Upcoming deadline highlighting
- **AI Resume Tailor** — upload your resume (PDF/text) + a job description, and get back a formatted, ATS-optimized resume with tailoring notes
- Fully responsive, dark-themed Tailwind UI

---

## Project Structure

```
internship-tracker/
├── server/              # Express + MongoDB backend
│   ├── config/          # DB connection
│   ├── controllers/     # Route logic
│   ├── middleware/      # Auth + error handling
│   ├── models/          # Mongoose schemas (User, Internship)
│   ├── routes/          # API routes
│   ├── .env.example
│   └── server.js
├── client/               # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/          # Axios instance
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Login, Register, Dashboard
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env.example
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
- VS Code (recommended)

---

## Setup Instructions (VS Code)

### 1. Open the project

Open the `internship-tracker` folder in VS Code. Open **two terminals** (Terminal → Split Terminal) — one for the server, one for the client.

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/internship_tracker
JWT_SECRET=your_own_long_random_secret_string
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_free_gemini_api_key_here
```

> If using MongoDB Atlas, replace `MONGO_URI` with your connection string, e.g.
> `mongodb+srv://<user>:<password>@cluster0.mongodb.net/internship_tracker`

> For the **AI Resume Tailor** feature, you need a free Google Gemini API key. Get one at
> [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (sign in with any Google account,
> no credit card required) and paste it in as `GEMINI_API_KEY`.
> Without this key, the rest of the app works fine — only the AI Resume page will show an error.

Start the backend:

```bash
npm run dev
```

You should see `Server running on port 5000` and `MongoDB connected: ...`.

### 3. Frontend setup

In the second terminal:

```bash
cd client
npm install
cp .env.example .env
```

`client/.env` already points to `http://localhost:5000/api` — no changes needed for local dev.

Start the frontend:

```bash
npm run dev
```

Visit **http://localhost:5173** — register an account and start tracking!

---

## API Endpoints

| Method | Endpoint                       | Description                  | Auth |
|--------|---------------------------------|-------------------------------|------|
| POST   | `/api/auth/register`           | Register new user             | No   |
| POST   | `/api/auth/login`              | Login                         | No   |
| GET    | `/api/auth/me`                 | Get current user              | Yes  |
| GET    | `/api/internships`             | List internships (filters via `?status=&search=&sortBy=`) | Yes  |
| POST   | `/api/internships`             | Create internship             | Yes  |
| GET    | `/api/internships/:id`         | Get single internship         | Yes  |
| PUT    | `/api/internships/:id`         | Update internship             | Yes  |
| DELETE | `/api/internships/:id`         | Delete internship             | Yes  |
| GET    | `/api/internships/stats/summary` | Dashboard stats summary     | Yes  |
| POST   | `/api/resume/tailor`           | Generate a tailored resume from resume + job description (multipart form) | Yes  |

---

## Pushing to GitHub

From the root `internship-tracker` folder:

```bash
git init
git add .
git commit -m "Initial commit: MERN internship tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Both `server/.env` and `client/.env` are git-ignored — only the `.env.example` files get pushed, so your secrets stay local.

---

## Deployment Notes

- **Backend**: Render, Railway, or Fly.io work well for the Express server. Set the same env vars there.
- **Frontend**: Vercel or Netlify for the Vite build (`npm run build` → deploy `client/dist`). Set `VITE_API_URL` to your deployed backend URL.
- **Database**: MongoDB Atlas free tier is ideal for a hosted DB.

---

## License

MIT — free to use for your own portfolio/resume project.
