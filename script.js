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
siteNavigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    siteNavigation.classList.remove("is-open");
  });
});

// Offer a quick way to leave the page. The destination is a neutral weather page.
document.querySelector("#quick-exit").addEventListener("click", () => {
  window.location.replace("https://www.bbc.com/weather");
});

// A one-tap check-in only changes this page; answers are never stored or sent.
const moodReflections = {
  "Holding on fine": "It’s okay to have an ordinary week. Keep the small things that help you feel steady.",
  "Exam pressure": "KCSE pressure can feel heavy. Try one short break, then choose just one next revision step.",
  "Feeling isolated": "You deserve company with this. Could you sit with a trusted friend or say hello to someone kind today?",
  "Completely burnt out": "Your body may be asking for rest. If you can, tell a trusted adult or teacher how worn out you feel."
};
const moodButtons = document.querySelectorAll(".mood-button");
const checkinResponse = document.querySelector("#checkin-response span");

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moodButtons.forEach((otherButton) => otherButton.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    checkinResponse.textContent = moodReflections[button.dataset.mood];
  });
});

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
