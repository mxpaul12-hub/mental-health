// Small, self-contained interactions for the Sema Nasi landing page.

const menuButton = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector("#site-navigation");

// Open and close the mobile navigation menu.
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  siteNavigation.classList.toggle("is-open", !isOpen);
});

// Close the mobile menu after choosing a destination.
const navigationLinks = siteNavigation.querySelectorAll("a");
navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    siteNavigation.classList.remove("is-open");
  });
});

function updateActiveNavigation() {
  const activeHash = window.location.hash || "#top";
  navigationLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === activeHash);
  });
}

window.addEventListener("hashchange", updateActiveNavigation);
updateActiveNavigation();

// Offer a quick way to leave the page. The destination is a neutral weather page.
document.querySelector("#quick-exit").addEventListener("click", () => {
  window.location.replace("https://www.bbc.com/weather");
});

// The check-in is intentionally temporary: no answers leave the browser.
const moodReflections = {
  "Holding on fine": "It’s okay to have an ordinary week. Keep the small things that help you feel steady.",
  "Exam pressure": "KCSE pressure can feel heavy. You don’t have to solve the whole term today.",
  "Feeling isolated": "Feeling left out can sting. You deserve company and support with this.",
  "Completely burnt out": "Your body may be asking for rest. You deserve support, not more pressure."
};
const moodNextSteps = {
  "Holding on fine": {
    pause: "Take one slow breath and notice one thing that helped you get through today.",
    talk: "A quick check-in with a friend can still feel good, even when nothing is wrong.",
    plan: "Pick one small thing you want to make time for this week."
  },
  "Exam pressure": {
    pause: "Step away from your books for two minutes, stretch, and take a few slow breaths.",
    talk: "Try: “Niko stressed na exams. Can you sit with me for a bit?”",
    plan: "Choose one topic and one 20-minute revision block. That’s enough for a start."
  },
  "Feeling isolated": {
    pause: "Find a spot that feels a little calmer and give yourself a moment to reset.",
    talk: "Try a low-pressure hello to someone kind, or message a person you trust.",
    plan: "Think of one safe person you could spend a little time with today."
  },
  "Completely burnt out": {
    pause: "If you can, take a proper break, drink some water, and let your body rest.",
    talk: "Tell a trusted adult or teacher: “I’m exhausted and I need some help.”",
    plan: "Pick one thing you can pause or ask someone to help you with today."
  }
};
const moodButtons = document.querySelectorAll(".mood-button");
const checkinResponse = document.querySelector("#checkin-response span");
const moodFollowup = document.querySelector("#mood-followup");
const moodHelpButtons = document.querySelectorAll(".mood-help-button");
const moodNextStep = document.querySelector("#mood-next-step");
let selectedMood = "";

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moodButtons.forEach((otherButton) => otherButton.setAttribute("aria-pressed", "false"));
    moodHelpButtons.forEach((helpButton) => helpButton.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    selectedMood = button.dataset.mood;
    checkinResponse.textContent = moodReflections[selectedMood];
    moodNextStep.textContent = "";
    moodFollowup.hidden = false;
  });
});

moodHelpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moodHelpButtons.forEach((otherButton) => otherButton.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    moodNextStep.textContent = moodNextSteps[selectedMood][button.dataset.need];
  });
});

const characterProfiles = {
  nia: {
    name: "Nia",
    greeting: "Hey, I’m Nia. You can just say what’s up — no need to make it sound polished. What’s been on your mind lately?"
  },
  kito: {
    name: "Kito",
    greeting: "Sasa, I’m Kito. Exam stress can feel like a lot, but we can take it one step at a time. What’s the main thing on your mind?"
  },
  zuri: {
    name: "Zuri",
    greeting: "Hey, I’m Zuri. I’m here to listen without judging. You can start wherever feels easiest — what’s going on?"
  }
};
const characterButtons = document.querySelectorAll(".character-button");
const activeCharacterName = document.querySelector("#active-character-name");
const chatMessages = document.querySelector("#chat-messages");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatSend = document.querySelector("#chat-send");
const chatReset = document.querySelector("#chat-reset");
let activeCharacter = "nia";
let chatHistory = [];
let chatIsBusy = false;

function appendChatMessage(text, role) {
  const message = document.createElement("p");
  message.className = `chat-bubble ${role === "user" ? "user-bubble" : "assistant-bubble"}`;
  message.textContent = text;
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

function resetChat() {
  chatHistory = [];
  chatMessages.replaceChildren();
  appendChatMessage(characterProfiles[activeCharacter].greeting, "assistant");
}

function setChatBusy(isBusy) {
  chatIsBusy = isBusy;
  chatMessages.setAttribute("aria-busy", String(isBusy));
  chatSend.disabled = isBusy;
  chatInput.disabled = isBusy;
  chatReset.disabled = isBusy;
  characterButtons.forEach((button) => { button.disabled = isBusy; });
  chatSend.textContent = isBusy ? "Sending…" : "Send";
}

characterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (chatIsBusy) return;
    characterButtons.forEach((otherButton) => {
      const isSelected = otherButton === button;
      otherButton.setAttribute("aria-pressed", String(isSelected));
      otherButton.classList.toggle("is-selected", isSelected);
    });
    activeCharacter = button.dataset.character;
    activeCharacterName.textContent = characterProfiles[activeCharacter].name;
    resetChat();
  });
});

document.querySelectorAll("[data-chat-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    chatInput.value = button.dataset.chatPrompt;
    chatInput.focus();
  });
});

chatInput.addEventListener("keydown", (event) => {
  if (event.isComposing || event.keyCode === 229) return;
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (chatIsBusy) return;
  const message = chatInput.value.trim();
  if (!message) return;

  chatHistory.push({ role: "user", content: message });
  if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
  appendChatMessage(message, "user");
  chatInput.value = "";
  const pendingMessage = appendChatMessage(`${characterProfiles[activeCharacter].name} is typing…`, "assistant");
  pendingMessage.classList.add("chat-pending");
  setChatBusy(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character: activeCharacter, messages: chatHistory })
    });
    const data = await response.json();
    pendingMessage.remove();
    if (!response.ok) {
      appendChatMessage(
        data.code === "AI_GATEWAY_BILLING_REQUIRED"
          ? data.error
          : "The chat’s having a moment. Try again in a little bit, or reach out to someone you trust.",
        "assistant"
      );
      return;
    }
    if (typeof data.message !== "string") {
      throw new Error("The chat is unavailable right now.");
    }
    chatHistory.push({ role: "assistant", content: data.message });
    appendChatMessage(data.message, "assistant");
  } catch {
    pendingMessage.remove();
    appendChatMessage("The chat’s having a moment. Try again in a little bit, or reach out to someone you trust.", "assistant");
  } finally {
    setChatBusy(false);
    chatInput.focus();
  }
});

chatReset.addEventListener("click", resetChat);

// Add a few sample stories when the reader asks to see more.
const additionalStories = [
  { name: "Brian T.", school: "County Day School", location: "Kisumu", form: "Form 1 · Day School", quote: "“I was scared to ask for help with the new school routine. Starting with one small question made everything feel less big.”" },
  { name: "Faith N.", school: "Girls’ Boarding School", location: "Nyeri", form: "Form 3 · Boarding", quote: "“I thought I had to keep every worry to myself. Talking with my auntie helped me see I didn’t have to figure it all out alone.”" },
  { name: "Sam M.", school: "Mixed Sub-County School", location: "Mombasa", form: "Form 2 · Day School", quote: "“Some days are tougher than others. Having words for what I was feeling helped me explain it to a friend.”" }
];
const extraStories = document.querySelector("#extra-stories");
const storiesToggle = document.querySelector("#stories-toggle");
let storiesAreVisible = false;

function createStoryCard(story) {
  const article = document.createElement("article");
  article.className = "student-story";

  const meta = document.createElement("div");
  meta.className = "story-meta";
  const tag = document.createElement("span");
  tag.className = "tag mint-tag";
  tag.textContent = story.form;
  const location = document.createElement("span");
  location.textContent = story.location;
  meta.append(tag, location);

  const quote = document.createElement("blockquote");
  quote.textContent = story.quote;

  const byline = document.createElement("div");
  byline.className = "student-byline";
  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = story.name.charAt(0);
  const details = document.createElement("span");
  const name = document.createElement("b");
  name.textContent = story.name;
  const school = document.createElement("small");
  school.textContent = story.school;
  details.append(name, school);
  byline.append(avatar, details);

  article.append(meta, quote, byline);
  return article;
}

storiesToggle.addEventListener("click", () => {
  storiesAreVisible = !storiesAreVisible;
  if (storiesAreVisible && extraStories.childElementCount === 0) {
    additionalStories.forEach((story) => extraStories.append(createStoryCard(story)));
  }
  extraStories.hidden = !storiesAreVisible;
  storiesToggle.setAttribute("aria-expanded", String(storiesAreVisible));
  storiesToggle.querySelector("span").textContent = storiesAreVisible ? "↑" : "→";
  storiesToggle.firstChild.textContent = storiesAreVisible ? "Hide Extra Stories " : "Read All Student Stories ";
});
