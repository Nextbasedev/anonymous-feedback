import { google } from "googleapis";

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/forms.body.readonly",
      "https://www.googleapis.com/auth/forms.responses.readonly",
    ],
  });
}

export async function getFormResponses() {
  const formId = process.env.GOOGLE_FORM_ID;
  if (!formId) return [];

  try {
    const auth = getAuth();
    const forms = google.forms({ version: "v1", auth });

    const res = await forms.forms.responses.list({ formId });
    const responses = res.data.responses || [];

    // Get form structure for question mapping
    const form = await forms.forms.get({ formId });
    const items = form.data.items || [];

    // Build question ID → title map
    const questionMap: Record<string, string> = {};
    for (const item of items) {
      if (item.questionItem?.question?.questionId && item.title) {
        questionMap[item.questionItem.question.questionId] = item.title;
      }
    }

    return responses.map((r) => {
      const answers: Record<string, string> = {};
      if (r.answers) {
        for (const [qId, answer] of Object.entries(r.answers)) {
          const title = questionMap[qId] || qId;
          const textAnswers = answer.textAnswers?.answers?.map((a) => a.value).join(", ") || "";
          answers[title] = textAnswers;
        }
      }
      return {
        responseId: r.responseId,
        createTime: r.createTime,
        lastSubmittedTime: r.lastSubmittedTime,
        answers,
      };
    });
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return [];
  }
}

export function getFormEmbedUrl() {
  const formId = process.env.GOOGLE_FORM_ID;
  if (!formId) return null;
  return `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;
}

export function getFormUrl() {
  const formId = process.env.GOOGLE_FORM_ID;
  if (!formId) return null;
  return `https://docs.google.com/forms/d/e/${formId}/viewform`;
}
