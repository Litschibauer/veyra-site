// VEYRA – Startseite (ADR 0083): Countdown zum nächsten Brief (werktags 7:30 New York) und ein Lichtfleck, der dem
// Zeiger über die Kanäle folgt. Ohne fremde Quellen, ohne Cookies.

const NY = "America/New_York";
const parts = new Intl.DateTimeFormat("en-US", { timeZone: NY, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Wochentag (0 = Sonntag) und Minute des Tages in New York */
function ny(t) {
  const p = {};
  for (const x of parts.formatToParts(t)) p[x.type] = x.value;
  return { day: DAYS.indexOf(p.weekday), min: Number(p.hour) * 60 + Number(p.minute) };
}

const BRIEF = 7 * 60 + 30;

/** nächster Werktag um 7:30 New York (minutengenau, in Viertelstunden gesucht – die Zeit liegt auf einer) */
function nextBrief(now) {
  const start = Math.ceil(now / 900_000) * 900_000;
  for (let t = start; t < now + 8 * 86_400_000; t += 900_000) {
    const { day, min } = ny(t);
    if (day >= 1 && day <= 5 && min === BRIEF) return t;
  }
  return null;
}

function render() {
  const el = document.getElementById("next");
  if (!el) return;
  const now = Date.now();
  const { day, min } = ny(now);
  // die ersten 90 Minuten nach 7:30: der heutige Brief ist da
  if (day >= 1 && day <= 5 && min >= BRIEF && min < BRIEF + 90) {
    el.innerHTML = "<b>Today's brief is out</b> · watch on YouTube or TikTok";
    return;
  }
  const t = nextBrief(now);
  if (!t) return;
  const left = Math.max(0, Math.round((t - now) / 60_000));
  const h = Math.floor(left / 60);
  const m = left % 60;
  const when = h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m} min`;
  el.innerHTML = `Next brief in <b>${when}</b> · weekdays 7:30 AM NY`;
}

render();
setInterval(render, 30_000);

// Lichtfleck folgt dem Zeiger
for (const a of document.querySelectorAll(".link, .live")) {
  a.addEventListener("pointermove", (ev) => {
    const r = a.getBoundingClientRect();
    a.style.setProperty("--x", `${ev.clientX - r.left}px`);
    a.style.setProperty("--y", `${ev.clientY - r.top}px`);
  });
}
