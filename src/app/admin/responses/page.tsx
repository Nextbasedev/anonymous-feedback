import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/auth";
import { getFormResponses } from "@/lib/google-forms";

export const dynamic = "force-dynamic";

interface FormResponse {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers: Record<string, string>;
}

export default async function ResponsesPage() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) redirect("/admin/login");

  let responses: FormResponse[] = [];
  let error: string | null = null;

  try {
    responses = await getFormResponses() as FormResponse[];
  } catch (e) {
    error = "Could not fetch responses. Check Google Forms API configuration.";
    console.error(e);
  }

  return (
    <div className="container-wide">
      <div className="header">
        <div>
          <h1>📊 Anonymous Responses</h1>
          <p style={{ marginTop: "2px" }}>
            {responses.length} response{responses.length !== 1 ? "s" : ""} from Google Forms
          </p>
        </div>
        <div className="header-actions">
          <a href="/admin" className="btn btn-secondary">← Dashboard</a>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!error && responses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No responses yet</div>
            <p style={{ marginTop: "4px", fontSize: "14px" }}>
              {process.env.GOOGLE_FORM_ID
                ? "Share invite links to start collecting feedback."
                : "Configure GOOGLE_FORM_ID and GOOGLE_SERVICE_ACCOUNT_JSON to connect Google Forms."}
            </p>
          </div>
        </div>
      ) : (
        responses.map((r, i) => (
          <div key={r.responseId} className="response-card">
            <div className="response-card-header">
              <span style={{ fontWeight: 600, fontSize: "15px" }}>
                Response #{responses.length - i}
              </span>
              <span style={{ fontSize: "13px", color: "var(--ink-tertiary)" }}>
                {r.lastSubmittedTime
                  ? new Date(r.lastSubmittedTime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
            </div>

            <div className="response-grid">
              {Object.entries(r.answers).map(([question, answer]) => (
                <div key={question} className="response-field">
                  <div className="response-field-label">{question}</div>
                  <div className="response-field-value">{answer || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
