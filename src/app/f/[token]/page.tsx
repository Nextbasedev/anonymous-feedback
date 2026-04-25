import { validateToken, burnToken } from "@/lib/db";
import { getFormEmbedUrl } from "@/lib/google-forms";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const tokenRow = await validateToken(token);
  const formUrl = getFormEmbedUrl();

  if (!tokenRow) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <h1 style={{ marginBottom: "8px" }}>Invalid Link</h1>
        <p>This feedback link doesn&apos;t exist. Please check the URL or contact the person who shared it.</p>
      </div>
    );
  }

  if (tokenRow.used) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <h1 style={{ marginBottom: "8px" }}>Already Submitted</h1>
        <p>This link has already been used. Each person can only submit feedback once.</p>
      </div>
    );
  }

  if (!formUrl) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h1 style={{ marginBottom: "8px" }}>Form Not Configured</h1>
        <p>The feedback form hasn&apos;t been set up yet. Please contact the administrator.</p>
      </div>
    );
  }

  // Burn the token on access — they get one chance
  await burnToken(token);

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ marginBottom: "8px" }}>Share Your Feedback</h1>
        <p>Help Nextbase Solutions improve by sharing your honest experience.</p>
      </div>

      <div className="trust-banner">
        <div className="trust-banner-icon">🔒</div>
        <div className="trust-banner-text">
          <strong>This form is 100% anonymous.</strong> Your identity is not connected to your 
          answers. The form is hosted by Google — Nextbase cannot see who submitted what. 
          Your link has been deactivated to prevent duplicate submissions.
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <iframe
          src={formUrl + "?embedded=true"}
          width="100%"
          height="1000"
          frameBorder={0}
          style={{ border: "none", display: "block" }}
          title="Feedback Form"
        >
          Loading form…
        </iframe>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p style={{ fontSize: "13px", color: "var(--ink-tertiary)" }}>
          🔒 Powered by Google Forms · Responses are stored by Google, not by Nextbase directly
        </p>
      </div>
    </div>
  );
}
