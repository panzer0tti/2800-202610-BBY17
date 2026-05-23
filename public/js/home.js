const FIRST_TIME_KEY = "bewilderFirstTimeMode";
const TOUR_SEEN_KEY = "bewilderHomeTourSeen";

// Retrieve the user's first-time guidance preference from local storage
const getFirstTimeMode = () => {
  const storedPreference = localStorage.getItem(FIRST_TIME_KEY);

  if (storedPreference === null) {
    return true;
  }

  return storedPreference === "true";
};

// Save the user's first-time guidance preference and toggle the corresponding UI class
const setFirstTimeMode = (isEnabled) => {
  localStorage.setItem(FIRST_TIME_KEY, String(isEnabled));
  document.body.classList.toggle("guidance-off", !isEnabled);
};

// Synchronize the first-time mode toggle switch with the stored user preference
const syncFirstTimeToggle = () => {
  const toggle = document.querySelector("#first-time-toggle");

  if (!toggle) {
    setFirstTimeMode(getFirstTimeMode());
    return;
  }

  toggle.checked = getFirstTimeMode();
  setFirstTimeMode(toggle.checked);

  toggle.addEventListener("change", () => {
    setFirstTimeMode(toggle.checked);
  });
};

// Display the introductory home tour modal if the user hasn't seen it yet
const showHomeTourIfNeeded = () => {
  const modal = document.querySelector("#tour-modal");
  const startButton = document.querySelector("#start-tour");
  const skipButton = document.querySelector("#skip-tour");

  if (!modal || localStorage.getItem(TOUR_SEEN_KEY) === "true") {
    return;
  }

  modal.hidden = false;

  startButton.addEventListener("click", () => {
    setFirstTimeMode(true);
    localStorage.setItem(TOUR_SEEN_KEY, "true");
    modal.hidden = true;
  });

  skipButton.addEventListener("click", () => {
    setFirstTimeMode(false);
    localStorage.setItem(TOUR_SEEN_KEY, "true");
    modal.hidden = true;
  });
};

// Briefly highlight the first tooltip target to draw the user's attention
const pulseFirstTooltip = () => {
  if (!getFirstTimeMode()) {
    return;
  }

  const firstTip = document.querySelector(".tooltip-target");

  if (!firstTip) {
    return;
  }

  firstTip.classList.add("show-tip");

  setTimeout(() => {
    firstTip.classList.remove("show-tip");
  }, 2500);
};

const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

syncFirstTimeToggle();
showHomeTourIfNeeded();
pulseFirstTooltip();
