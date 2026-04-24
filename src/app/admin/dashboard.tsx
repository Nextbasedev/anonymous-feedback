"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Token {
  id: number;
  token: string;
  email: string;
  used: boolean;
  created_at: string;
  used_at: string | null;
}

interface Stats {
  total: number;
  used: number;
  pending: number;
}

export function AdminDashboard({ tokens, stats }: { tokens: Token[]; stats: Stats }) {
  const [emails, setEmails] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);

    await fetch("/api/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });

    setEmails("");
    setGenerating(false);
    router.refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this invite link?")) return;
    await fetch("/api/tokens", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  function copyLink(token: string) {
    const link = `${window.location.origin}/f/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAllLinks() {
    const unused = tokens.filter(t => !t.used);
    const links = unused.map(t => `${t.email}: ${window.location.origin}/f/${t.token}`).join("\n");
    navigator.clipboard.writeText(links);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="container-wide">
      <div className="header">
        <div>
          <h1>📋 Feedback Dashboard</h1>
          <p style={{ marginTop: "2px" }}>Manage invite links and view anonymous responses</p>
        </div>
        <div className="header-actions">
          <a href="/admin/responses" className="btn btn-secondary">📊 Responses</a>
          <a href="/admin/logout" className="btn btn-secondary btn-sm">Logout</a>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Links Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.used}</div>
          <div className="stat-label">Links Used</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "4px" }}>Generate Invite Links</h2>
        <p style={{ marginBottom: "20px" }}>
          Enter email addresses to create one-time feedback links. Each person gets a unique URL.
        </p>

        <form onSubmit={handleGenerate}>
          <div className="field">
            <label htmlFor="emails">Email Addresses</label>
            <textarea
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder={"one@example.com\ntwo@example.com\nthree@example.com"}
              style={{ minHeight: "120px" }}
            />
            <div className="field-hint">One email per line, or comma-separated.</div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={generating}>
            {generating ? "Generating…" : "Generate Links"}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Invite Links</h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {tokens.filter(t => !t.used).length > 0 && (
              <button onClick={copyAllLinks} className="btn btn-secondary btn-sm">
                {copied === "all" ? "✓ Copied!" : "Copy All Pending"}
              </button>
            )}
            <span className="badge badge-neutral">{tokens.length} total</span>
          </div>
        </div>

        {tokens.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No links generated yet</div>
            <p style={{ marginTop: "4px", fontSize: "14px" }}>Add email addresses above to create invite links.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Link</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, color: "var(--ink)" }}>{t.email}</td>
                    <td>
                      <button
                        onClick={() => copyLink(t.token)}
                        className="copy-btn"
                        title="Click to copy full link"
                      >
                        {copied === t.token ? "✓ Copied!" : `/f/${t.token.slice(0, 8)}…`}
                      </button>
                    </td>
                    <td>
                      {t.used ? (
                        <span className="badge badge-success">Used</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "13px" }}>
                      {new Date(t.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short"
                      })}
                    </td>
                    <td>
                      {!t.used && (
                        <button onClick={() => handleDelete(t.id)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
