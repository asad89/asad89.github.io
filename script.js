const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");
const parallaxItems = document.querySelectorAll("[data-parallax-speed]");
const kineticRows = document.querySelectorAll("[data-kinetic-speed]");
const scrollCards = document.querySelectorAll("[data-scroll-card]");
const principleRows = document.querySelectorAll("[data-principle]");
const spotlightCards = document.querySelectorAll("[data-spotlight-card]");
const documentRoot = document.documentElement;

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

if (!reduceMotion) {
  let ticking = false;

  const updateMotion = () => {
    const viewportHeight = window.innerHeight;
    const scrollableHeight = documentRoot.scrollHeight - viewportHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    documentRoot.style.setProperty("--scroll-progress", progress.toFixed(4));

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const speed = Number(item.dataset.parallaxSpeed || 0);
      const distanceFromCenter = rect.top + rect.height / 2 - viewportHeight / 2;
      const offset = Math.max(-90, Math.min(90, distanceFromCenter * speed));
      item.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    });

    kineticRows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      const speed = Number(row.dataset.kineticSpeed || 0);
      const localTravel = viewportHeight - rect.top;
      const shift = Math.max(-240, Math.min(240, localTravel * speed));
      row.style.setProperty("--kinetic-shift", `${shift.toFixed(2)}px`);
    });

    scrollCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const rawProgress = (viewportHeight * 0.92 - rect.top) / (viewportHeight * 0.72);
      const cardProgress = Math.max(0, Math.min(1, rawProgress));
      const direction = index % 2 === 0 ? 1 : -1;
      const lift = (1 - cardProgress) * 54;
      const rotation = (1 - cardProgress) * 2.2 * direction;
      const opacity = 0.58 + cardProgress * 0.42;

      card.style.setProperty("--card-y", `${lift.toFixed(2)}px`);
      card.style.setProperty("--card-rotate", `${rotation.toFixed(2)}deg`);
      card.style.setProperty("--card-opacity", opacity.toFixed(3));
    });

    principleRows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      const rawProgress = (viewportHeight * 0.86 - rect.top) / (viewportHeight * 0.54);
      const rowProgress = Math.max(0, Math.min(1, rawProgress));
      row.style.setProperty("--principle-progress", rowProgress.toFixed(3));
      row.style.setProperty("--principle-shift", `${((1 - rowProgress) * 48).toFixed(2)}px`);
      row.style.setProperty("--principle-opacity", (0.25 + rowProgress * 0.75).toFixed(3));
    });

    ticking = false;
  };

  const requestMotionUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateMotion);
      ticking = true;
    }
  };

  window.addEventListener("scroll", requestMotionUpdate, { passive: true });
  window.addEventListener("resize", requestMotionUpdate, { passive: true });
  requestMotionUpdate();

  if (window.matchMedia("(pointer: fine)").matches) {
    spotlightCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--spot-x", `${x.toFixed(1)}%`);
        card.style.setProperty("--spot-y", `${y.toFixed(1)}%`);
      });
    });
  }
} else {
  documentRoot.style.setProperty("--scroll-progress", "0");
}
