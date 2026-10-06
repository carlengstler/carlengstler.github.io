// ---------------------------------------------------------------------------
// Content
// Each entry is one card on the left:
//   kicker / title / subtitle   top-left cell (title gets an orange dot)
//   progress                    pie chart in the top-right cell (0-100)
//   lead                        larger first line of the text cell
//   text                        list of paragraphs below the lead
//   images                      image paths for the white panel ([] = empty)
//   summary                     short text in the strip under the step's bar
// ---------------------------------------------------------------------------

const LOREM_LONG =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tincidunt sem vel tempus iaculis. " +
  "Morbi nec mauris eu metus efficitur tristique. Mauris ultrices libero et ligula mattis, sit amet " +
  "sodales lectus pretium. Duis id lorem orci. Aenean felis lacus, ullamcorper non gravida quis, volutpat " +
  "fringilla dui. Morbi cursus scelerisque semper. Suspendisse tempor posuere nulla, non dignissim eros " +
  "suscipit lobortis. Praesent placerat, augue a fringilla sollicitudin, orci felis convallis felis, quis " +
  "laoreet est enim ac lacus.";

const LOREM_LEAD = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const LOREM_SUMMARY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tincidunt sem vel tempus iaculis.";

const OVERVIEW = {
  kicker: "Project Journey",
  title: "Project Title",
  subtitle: "A short line about what this journey is",
  progress: 72,
  lead: LOREM_LEAD,
  text: [LOREM_LONG, LOREM_LONG],
  images: [],
  hint: "Choose a step to begin",
};

const STEPS = {
  1: {
    title: "AI and TEXT",
    subtitle: "The basics – everyone knows them",
    progress: 72,
    lead: LOREM_LEAD,
    text: [LOREM_LONG, LOREM_LONG],
    images: [],
    summary: LOREM_SUMMARY,
  },
  2: {
    title: "Step Title",
    subtitle: "Subtitle of step two",
    progress: 72,
    lead: LOREM_LEAD,
    text: [LOREM_LONG, LOREM_LONG],
    images: [],
    summary: LOREM_SUMMARY,
  },
  3: {
    title: "Step Title",
    subtitle: "Subtitle of step three",
    progress: 72,
    lead: LOREM_LEAD,
    text: [LOREM_LONG, LOREM_LONG],
    images: [],
    summary: LOREM_SUMMARY,
  },
};

// One bar per step, listed from the bottom up. "notch" is where the glossy
// knob sits along the bar (% of its width).
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

function renderContent(step) {
  const page = step ? STEPS[step] : OVERVIEW;
  const kicker = step ? `Step ${step}` : page.kicker;
  const nav = step
    ? `<button class="back-link" type="button">← Overview</button>`
    : `<span>${page.hint}</span><span aria-hidden="true">→</span>`;

  contentEl.innerHTML = `
    <article class="card">
      <div class="card-top">
        <header class="cell cell--title">
          <p class="card-kicker">${kicker}</p>
          <h1 class="card-title">${page.title}<span class="dot">.</span></h1>
          <p class="card-subtitle">${page.subtitle}</p>
        </header>
        <div class="cell cell--chart" role="img" aria-label="${page.progress}%">
          <div class="pie" style="--value: ${page.progress}"></div>
          <span class="pie-label">${page.progress}%</span>
        </div>
      </div>
      <div class="card-bottom">
        <div class="cell cell--images">
          ${page.images.map((src) => `<img src="${src}" alt="">`).join("")}
        </div>
        <div class="cell cell--text">
          <div class="card-nav">${nav}</div>
          <div class="card-text">
            <p class="card-lead">${page.lead}</p>
            ${page.text.map((p) => `<p class="card-body">${p}</p>`).join("")}
          </div>
        </div>
      </div>
    </article>`;

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
    panel.innerHTML = `
      <div><div class="bar-info">
        <span class="bar-label">Step ${n}</span>
        ${STEPS[n] ? `<p class="bar-text">${STEPS[n].summary}</p>` : ""}
      </div></div>`;

    item.append(btn, panel);
    barsEl.append(item);
  });
}

// Light grey grain for the frosted bars: painted once into a small tile.
function makeGrain() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 190 + Math.random() * 65;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = Math.random() * 70;
  }
  ctx.putImageData(img, 0, 0);
  document.documentElement.style.setProperty("--grain", `url(${canvas.toDataURL()})`);
}

makeGrain();
buildBars();
renderContent(null);
