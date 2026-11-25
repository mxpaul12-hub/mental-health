import { generateText } from "ai";

const characters = {
  nia: "You are Nia, a warm, chill, supportive AI friend. Listen first and validate feelings without being overly formal.",
  kito: "You are Kito, a friendly study-stress sidekick. Help make school pressure feel more manageable with small, realistic next steps.",
  zuri: "You are Zuri, a calm, patient, non-judgmental AI listener. Give the student room to explain things at their own pace."
};

const crisisPattern = /suicid|kill(?:ing)? myself|hurt(?:ing)? myself|self[- ]?harm|want to die|end my life|don't want to live|dont want to live|not want to live|sitaki kuishi|nataka kujiumiza|nimechoka kuishi/i;
const crisisReply = "I’m really glad you told me. You deserve support from a real person right now. If you’re in Kenya, call Childline free on 116, or go to a trusted adult, teacher, school counsellor, or clinic and tell them you need help staying safe. If you might hurt yourself right now, move near a safe person and contact local emergency services. You don’t have to handle this alone.";

const instructions = `You are an AI support companion for a Kenyan secondary-school student, not a human friend, therapist, doctor, or emergency service.
Speak in a warm, casual, current Gen Z voice: natural and relaxed, never forced, cringe, or overloaded with slang. A little Sheng or Kiswahili is okay only when it fits naturally. Never dismiss, shame, diagnose, or give medical instructions. Keep replies short (1–4 sentences): acknowledge what they said, then ask one gentle question or offer one realistic next step. Do not pressure the student to share identifying details. Do not promise secrecy or claim the chat is confidential. For ongoing or serious concerns, encourage a trusted adult or school counsellor. If the student mentions self-harm, suicide, abuse, or immediate danger, respond compassionately and directly; encourage them to contact a trusted adult now and, in Kenya, Childline 116. Never suggest that chatting with you replaces real-world support.`;

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Use POST to send a message." });
  }

  const body = request.body && typeof request.body === "object" ? request.body : {};
  const { character, messages } = body;

  if (!Object.hasOwn(characters, character) || !Array.isArray(messages) || messages.length < 1 || messages.length > 12) {
    return response.status(400).json({ error: "Choose a chat friend and send a short message." });
  }

  const cleanMessages = [];
  let totalCharacters = 0;

  for (const message of messages) {
    if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string") {
      return response.status(400).json({ error: "That message could not be sent." });
    }

    const content = message.content.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    if (!content || content.length > 700) {
      return response.status(400).json({ error: "Messages need to be under 700 characters." });
    }

    totalCharacters += content.length;
    cleanMessages.push({ role: message.role, content });
  }

  if (totalCharacters > 4500 || cleanMessages.at(-1).role !== "user") {
    return response.status(400).json({ error: "Please send a shorter message." });
  }

  const latestUserMessage = [...cleanMessages].reverse().find((message) => message.role === "user");
  if (crisisPattern.test(latestUserMessage.content)) {
    return response.status(200).json({ message: crisisReply });
  }

  try {
    const { text } = await generateText({
      model: "google/gemini-3.5-flash",
      instructions: `${characters[character]} ${instructions}`,
      messages: cleanMessages.slice(-10),
      maxOutputTokens: 180,
      maxRetries: 0,
      timeout: { totalMs: 25000 },
      telemetry: { isEnabled: false }
    });

    return response.status(200).json({ message: text.trim() });
  } catch (error) {
    if (typeof error?.message === "string" && error.message.includes("valid credit card on file")) {
      return response.status(503).json({
        code: "AI_GATEWAY_BILLING_REQUIRED",
        error: "AI replies need Vercel AI Gateway billing enabled before they can run. The mood check-in and support directory still work."
      });
    }

    return response.status(502).json({ error: "The AI friend is unavailable right now. Please try again in a little bit." });
  }
}
