// ---------------------------------------------------------------------------
// Content
// Each entry is one page of the left panel. "blocks" are rendered in order:
//   { type: "text", text }                 full-width paragraph
//   { type: "text-image", text, img }      paragraph with an image on the right
//   { type: "image-text", text, img }      image on the left, text beside it
// "img" is the image path; leave it empty ("") for an empty placeholder.
// ---------------------------------------------------------------------------

const LOREM_LONG =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tincidunt sem vel tempus iaculis. " +
  "Morbi nec mauris eu metus efficitur tristique. Mauris ultrices libero et ligula mattis, sit amet " +
  "sodales lectus pretium. Duis id lorem orci. Aenean felis lacus, ullamcorper non gravida quis, volutpat " +
  "fringilla dui. Morbi cursus scelerisque semper. Suspendisse tempor posuere nulla, non dignissim eros " +
  "suscipit lobortis. Praesent placerat, augue a fringilla sollicitudin, orci felis convallis felis, quis " +
  "laoreet est enim ac lacus. Integer sed lorem porta, fringilla urna a, hendrerit odio. Aliquam varius, " +
  "magna nec scelerisque vestibulum, augue elit ultricies odio, ac semper justo dolor vitae lectus.";

const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tincidunt sem vel tempus iaculis. " +
  "Morbi nec mauris eu metus efficitur tristique.";

const OVERVIEW = {
  kicker: "Project Journey",
  title: "Project Title",
  subtitle: "A short line about what this journey is",
  blocks: [
    { type: "text", text: LOREM_LONG },
    { type: "text-image", text: LOREM_LONG, img: "" },
    { type: "image-text", text: LOREM_SHORT, img: "" },
  ],
  hint: "Choose a bar on the right to walk through the project step by step.",
};

const STEPS = {
  1: {
    title: "AI and TEXT",
    subtitle: "The basics – everyone knows them",
    blocks: [
      { type: "text", text: LOREM_LONG },
      { type: "text-image", text: LOREM_LONG, img: "" },
      { type: "image-text", text: LOREM_SHORT, img: "" },
    ],
  },
  2: {
    title: "Step Title",
    subtitle: "Subtitle of step two",
    blocks: [
      { type: "text", text: LOREM_LONG },
      { type: "text-image", text: LOREM_LONG, img: "" },
      { type: "image-text", text: LOREM_SHORT, img: "" },
    ],
  },
  3: {
    title: "Step Title",
    subtitle: "Subtitle of step three",
    blocks: [
      { type: "text", text: LOREM_LONG },
      { type: "text-image", text: LOREM_LONG, img: "" },
      { type: "image-text", text: LOREM_SHORT, img: "" },
    ],
  },
};

// One bar per step, listed from the bottom up. "notch" is where the white
// notch sits along the bar (% of its width).
const BARS = [
  { notch: 37 },
  { notch: 56 },
  { notch: 80 },
  { notch: 56 },
  { notch: 37 },
  { notch: 11.5 },
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const contentEl = document.getElementById("content");
const barsEl = document.getElementById("bars");
let selected = null;

const imageSlot = (src) =>
  src
    ? `<figure class="img-slot"><img src="${src}" alt=""></figure>`
    : `<figure class="img-slot" aria-hidden="true"></figure>`;

function renderBlock(block) {
  switch (block.type) {
    case "text":
      return `<p class="block">${block.text}</p>`;
    case "text-image":
      return `<div class="block block--text-image"><p>${block.text}</p>${imageSlot(block.img)}</div>`;
    case "image-text":
      return `<div class="block block--image-text">${imageSlot(block.img)}<p>${block.text}</p></div>`;
    default:
      return "";
  }
}

function renderContent(step) {
  const page = step ? STEPS[step] : OVERVIEW;
  const kicker = step ? `Step ${step}` : page.kicker;

  contentEl.innerHTML = `
    <article class="page${step ? "" : " page--overview"}">
      <header class="page-head">
        <p class="page-kicker">${kicker}</p>
        <h1 class="page-title">${page.title}</h1>
        <p class="page-subtitle">${page.subtitle}</p>
      </header>
      ${page.blocks.map(renderBlock).join("")}
      ${page.hint ? `<p class="page-hint">${page.hint}</p>` : ""}
      ${step ? `<button class="back-link" type="button">← Back to overview</button>` : ""}
    </article>`;

  contentEl.scrollTop = 0;
  contentEl.querySelector(".back-link")?.addEventListener("click", () => select(null));
}

function select(step) {
  selected = step;
  barsEl.querySelectorAll(".bar-item").forEach((item) => {
    const isSel = Number(item.dataset.step) === step;
    item.classList.toggle("is-selected", isSel);
    const btn = item.querySelector(".bar");
    if (!btn.disabled) btn.setAttribute("aria-expanded", isSel);
  });

  contentEl.classList.add("is-switching");
  setTimeout(() => {
    renderContent(step);
    contentEl.classList.remove("is-switching");
  }, 180);
}

function buildBars() {
  BARS.forEach((bar, i) => {
    const n = i + 1;
    const item = document.createElement("li");
    item.className = "bar-item";
    item.dataset.step = n;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bar";
    btn.style.setProperty("--notch", bar.notch + "%");
    if (STEPS[n]) {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", `Step ${n}: ${STEPS[n].title}`);
      btn.addEventListener("click", () => select(selected === n ? null : n));
    } else {
      btn.disabled = true;
      btn.setAttribute("aria-label", `Step ${n} (coming soon)`);
    }

    const panel = document.createElement("div");
    panel.className = "bar-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `<div><span class="bar-label">Step ${n}</span></div>`;

    item.append(btn, panel);
    barsEl.append(item);
  });
}

buildBars();
renderContent(null);
