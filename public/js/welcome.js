/*
 * BeeWilder welcome page interactions.
 * Adds scroll reveals, gentle card tilt, button ripples,
 * tab motion, accordion pulse effects, and page transitions.
 */

(function () {
  "use strict";

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const prefersReducedMotion = reducedMotionQuery.matches;

  const animatedSelectors = [
    ".bw-card",
    ".bw-panel",
    ".bw-warning",
    ".bw-step",
    ".bw-notebook",
    ".bw-tab-shell",
    ".accordion-item",
    ".bw-metric"
  ].join(",");

  const interactiveSelectors = [
    ".btn",
    "button",
    ".nav-link",
    ".accordion-button"
  ].join(",");

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function setupPageLoad() {
    document.body.classList.add("bw-js-enabled");

    requestAnimationFrame(function () {
      document.body.classList.add("bw-page-ready");
    });
  }

  function setupScrollReveal() {
    const targets = Array.from(
      document.querySelectorAll(animatedSelectors)
    );

    targets.forEach(function (target, index) {
      target.classList.add("bw-reveal");
      target.style.setProperty("--bw-delay", `${Math.min(index * 45, 360)}ms`);
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (target) {
        target.classList.add("bw-revealed");
      });

      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("bw-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  function setupButtonRipples() {
    const buttons = Array.from(
      document.querySelectorAll(interactiveSelectors)
    );

    buttons.forEach(function (button) {
      button.classList.add("bw-interactive");

      button.addEventListener("click", function (event) {
        if (prefersReducedMotion) {
          return;
        }

        const rect = button.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);

        ripple.className = "bw-ripple";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        button.appendChild(ripple);

        window.setTimeout(function () {
          ripple.remove();
        }, 650);
      });
    });
  }

  function setupPageTransitions() {
    const links = Array.from(document.querySelectorAll("a[href]"));

    links.forEach(function (link) {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
        return;
      }

      if (link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      link.addEventListener("click", function (event) {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          prefersReducedMotion
        ) {
          return;
        }

        event.preventDefault();
        document.body.classList.remove("bw-page-ready");
        document.body.classList.add("bw-page-leaving");

        window.setTimeout(function () {
          window.location.href = href;
        }, 220);
      });
    });
  }

  function setupCardTilt() {
    const cards = Array.from(
      document.querySelectorAll(".bw-card, .bw-panel, .bw-step, .bw-notebook")
    );

    if (prefersReducedMotion) {
      return;
    }

    cards.forEach(function (card) {
      card.classList.add("bw-tilt-ready");

      card.addEventListener("pointermove", function (event) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateX = ((event.clientY - centerY) / rect.height) * -4;
        const rotateY = ((event.clientX - centerX) / rect.width) * 4;

        card.style.setProperty("--bw-tilt-x", `${rotateX}deg`);
        card.style.setProperty("--bw-tilt-y", `${rotateY}deg`);
      });

      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--bw-tilt-x", "0deg");
        card.style.setProperty("--bw-tilt-y", "0deg");
      });
    });
  }

  function setupTabs() {
    const tabButtons = Array.from(
      document.querySelectorAll('[data-bs-toggle="pill"], [data-bs-toggle="tab"]')
    );

    tabButtons.forEach(function (button) {
      button.addEventListener("shown.bs.tab", function (event) {
        const targetSelector = event.target.getAttribute("data-bs-target");
        const pane = document.querySelector(targetSelector);

        if (!pane) {
          return;
        }

        pane.classList.remove("bw-tab-pop");
        void pane.offsetWidth;
        pane.classList.add("bw-tab-pop");
      });
    });
  }

  function setupAccordionPulse() {
    const accordionButtons = Array.from(
      document.querySelectorAll(".accordion-button")
    );

    accordionButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        button.classList.add("bw-accordion-pulse");

        window.setTimeout(function () {
          button.classList.remove("bw-accordion-pulse");
        }, 420);
      });
    });
  }

  function setupNumberFlash() {
    const elements = Array.from(
      document.querySelectorAll(".bw-metric strong, .bw-icon")
    );

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("bw-number-flash");
        observer.unobserve(entry.target);
      });
    });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  onReady(function () {
    setupPageLoad();
    setupScrollReveal();
    setupButtonRipples();
    setupPageTransitions();
    setupCardTilt();
    setupTabs();
    setupAccordionPulse();
    setupNumberFlash();
  });
})();
