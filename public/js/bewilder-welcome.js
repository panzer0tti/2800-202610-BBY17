document.addEventListener('DOMContentLoaded', () => {
  // Initialize intersection observer to reveal elements as they scroll into view
  const revealItems = document.querySelectorAll('.reveal, .bw-card, .step-card, .stat-mini');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach((item) => observer.observe(item));

  // Attach a click event listener to buttons to create a material ripple effect
  document.querySelectorAll('.btn, .pixel-btn').forEach((button) => {
    button.classList.add('ripple-btn');
    button.addEventListener('click', (event) => {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Apply an interactive 3D tilt effect to cards based on mouse cursor position
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Enable smooth scrolling behavior for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Stagger the floating animation start times for map pins
  document.querySelectorAll('.map-pin').forEach((pin, index) => {
    pin.style.animation = `floaty ${3 + index * .4}s ease-in-out infinite`;
  });
});
