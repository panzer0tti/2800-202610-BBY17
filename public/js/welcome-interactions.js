/*
 * BeeWilder Welcome Page Interactions
 * Works across all 16 welcome page experiments.
 * Requires no build step and does not change page content.
 */
(function () {
    "use strict";

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const SELECTORS = {
        animatedCards: [
            ".bw-card",
            ".field-card",
            ".info-card",
            ".stat-tile",
            ".atlas-panel",
            ".timeline-card",
            ".timeline-item",
            ".step-card",
            ".quest-card",
            ".pixel-screen",
            ".pixel-book",
            ".bw-pixel-card",
            ".bw-map-panel",
            ".bw-phone",
            ".accordion",
            ".list-group-item",
            ".metric"
        ].join(","),
        buttons: [
            ".btn",
            "button",
            ".nav-link",
            ".list-group-item-action"
        ].join(",")
    };

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }

        fn();
    }

    function enhanceBodyLoad() {
        document.body.classList.add("bw-js-enabled");

        requestAnimationFrame(function () {
            document.body.classList.add("bw-page-ready");
        });
    }

    function enhanceScrollReveal() {
        const targets = Array.from(
            document.querySelectorAll(SELECTORS.animatedCards)
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
                threshold: 0.16,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        targets.forEach(function (target) {
            observer.observe(target);
        });
    }

    function enhanceButtons() {
        const buttons = Array.from(document.querySelectorAll(SELECTORS.buttons));

        buttons.forEach(function (button) {
            button.classList.add("bw-interactive");

            button.addEventListener("pointermove", function (event) {
                const rect = button.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                button.style.setProperty("--bw-x", `${x}px`);
                button.style.setProperty("--bw-y", `${y}px`);
            });

            button.addEventListener("click", function (event) {
                if (prefersReducedMotion) {
                    return;
                }

                const ripple = document.createElement("span");
                const rect = button.getBoundingClientRect();
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

    function enhancePageTransitions() {
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
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                    return;
                }

                if (prefersReducedMotion) {
                    return;
                }

                event.preventDefault();
                document.body.classList.remove("bw-page-ready");
                document.body.classList.add("bw-page-leaving");

                window.setTimeout(function () {
                    window.location.href = href;
                }, 230);
            });
        });
    }

    function enhanceTiltCards() {
        const tiltTargets = Array.from(
            document.querySelectorAll(
                ".bw-card, .field-card, .atlas-panel, .pixel-screen, .bw-phone, .bw-pixel-card"
            )
        );

        if (prefersReducedMotion) {
            return;
        }

        tiltTargets.forEach(function (card) {
            card.classList.add("bw-tilt-ready");

            card.addEventListener("pointermove", function (event) {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const rotateX = ((event.clientY - centerY) / rect.height) * -5;
                const rotateY = ((event.clientX - centerX) / rect.width) * 5;

                card.style.setProperty("--bw-tilt-x", `${rotateX}deg`);
                card.style.setProperty("--bw-tilt-y", `${rotateY}deg`);
            });

            card.addEventListener("pointerleave", function () {
                card.style.setProperty("--bw-tilt-x", "0deg");
                card.style.setProperty("--bw-tilt-y", "0deg");
            });
        });
    }

    function enhanceTabs() {
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

    function enhanceAccordion() {
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

    function enhanceMapPins() {
        const pins = Array.from(document.querySelectorAll(".pin, .bw-map-pin"));
        const listItems = Array.from(document.querySelectorAll(".list-group-item-action"));

        pins.forEach(function (pin, index) {
            pin.style.setProperty("--bw-pin-delay", `${index * 180}ms`);
            pin.classList.add("bw-pin-live");
        });

        listItems.forEach(function (item, index) {
            item.addEventListener("pointerenter", function () {
                pins.forEach(function (pin) {
                    pin.classList.remove("bw-pin-focus");
                });

                if (pins[index]) {
                    pins[index].classList.add("bw-pin-focus");
                }
            });

            item.addEventListener("pointerleave", function () {
                pins.forEach(function (pin) {
                    pin.classList.remove("bw-pin-focus");
                });
            });
        });
    }

    function enhancePixelMode() {
        const pixelPages = document.querySelectorAll(
            ".v7-pixel-camp, .v8-pixel-fieldbook, .bw-pixel-page"
        );

        if (!pixelPages.length || prefersReducedMotion) {
            return;
        }

        const sparkleLayer = document.createElement("div");
        sparkleLayer.className = "bw-sparkle-layer";
        document.body.appendChild(sparkleLayer);

        for (let index = 0; index < 24; index += 1) {
            const sparkle = document.createElement("span");
            sparkle.className = "bw-pixel-sparkle";
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animationDelay = `${Math.random() * 5}s`;
            sparkleLayer.appendChild(sparkle);
        }
    }

    function enhanceCounters() {
        const numbers = Array.from(
            document.querySelectorAll("strong, .metric, .stat-tile")
        ).filter(function (element) {
            return /\d+/.test(element.textContent || "");
        });

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

        numbers.forEach(function (number) {
            observer.observe(number);
        });
    }

    ready(function () {
        enhanceBodyLoad();
        enhanceScrollReveal();
        enhanceButtons();
        enhancePageTransitions();
        enhanceTiltCards();
        enhanceTabs();
        enhanceAccordion();
        enhanceMapPins();
        enhancePixelMode();
        enhanceCounters();
    });
}());
