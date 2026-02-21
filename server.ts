import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("resumes.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    candidate_name TEXT,
    content TEXT,
    score INTEGER,
    analysis TEXT,
    job_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/resumes", (req, res) => {
    const resumes = db.prepare("SELECT * FROM resumes ORDER BY score DESC").all();
    res.json(resumes);
  });

  app.post("/api/resumes", (req, res) => {
    const { id, candidate_name, content, score, analysis, job_id } = req.body;
    const stmt = db.prepare(`
      INSERT INTO resumes (id, candidate_name, content, score, analysis, job_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, candidate_name, content, score, JSON.stringify(analysis), job_id);
    res.json({ success: true });
  });

  app.delete("/api/resumes/:id", (req, res) => {
    db.prepare("DELETE FROM resumes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();
    res.json(jobs);
  });

  app.post("/api/jobs", (req, res) => {
    const { id, title, description } = req.body;
    const stmt = db.prepare("INSERT INTO jobs (id, title, description) VALUES (?, ?, ?)");
    stmt.run(id, title, description);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
