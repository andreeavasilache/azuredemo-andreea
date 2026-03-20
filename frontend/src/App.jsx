import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function StatusBadge({ status }) {
  return (
    <span className={`badge ${status === "healthy" ? "badge-ok" : "badge-err"}`}>
      {status === "healthy" ? "● LIVE" : "● DOWN"}
    </span>
  );
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [info, setInfo] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/health")
      .then(setHealth)
      .catch(() => setHealth({ status: "unreachable" }));
    apiFetch("/api/info").then(setInfo).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      setResult(data);
    } catch (err) {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">AzureStack</span>
          </div>
          {health && <StatusBadge status={health.status} />}
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="hero-label">Full-Stack Template</p>
          <h1 className="hero-title">
            React&nbsp;+&nbsp;FastAPI
            <br />
            on&nbsp;Azure
          </h1>
          <p className="hero-sub">
            A minimal, production-ready starting point for deploying a Vite
            frontend and Python backend to Azure App Service.
          </p>
        </section>

        <div className="grid">
          {/* Stack info card */}
          <div className="card card--info">
            <h2 className="card-title">Stack</h2>
            {info ? (
              <ul className="stack-list">
                {Object.entries(info).map(([k, v]) => (
                  <li key={k}>
                    <span className="stack-key">{k}</span>
                    <span className="stack-val">{v}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Loading…</p>
            )}
          </div>

          {/* Health card */}
          <div className="card card--health">
            <h2 className="card-title">Backend Health</h2>
            {health ? (
              <ul className="stack-list">
                {Object.entries(health).map(([k, v]) => (
                  <li key={k}>
                    <span className="stack-key">{k}</span>
                    <span className="stack-val">{String(v)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Checking…</p>
            )}
          </div>

          {/* API demo card */}
          <div className="card card--demo">
            <h2 className="card-title">API Demo — String Reverser</h2>
            <p className="card-desc">
              Send any text to the backend and watch it come back reversed.
            </p>
            <form className="demo-form" onSubmit={handleSubmit}>
              <input
                className="demo-input"
                type="text"
                placeholder="Type something…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="demo-btn" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send →"}
              </button>
            </form>

            {error && <p className="error-msg">{error}</p>}

            {result && (
              <div className="result-box">
                <div className="result-row">
                  <span className="result-label">Original</span>
                  <span className="result-val">{result.original}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Reversed</span>
                  <span className="result-val accent">{result.reversed}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Environment</span>
                  <span className="result-val">{result.environment}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Timestamp</span>
                  <span className="result-val mono">{result.timestamp}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <span>Built with React · FastAPI · Azure App Service test</span>
      </footer>
    </div>
  );
}
