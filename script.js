/* ==========================================================
   Interactive micro-3D + scroll experience
   - Reveal on scroll (IntersectionObserver)
   - Scroll progress bar
   - Section "stamp" that updates while scrolling
   - Subtle parallax for background orbs
   - Scroll-based 3D tilt on panels
   - Pointer tilt + spotlight on key cards
   - Contact form validation + POST to Spring backend
   ========================================================== */

(() => {
  const root = document.documentElement;
  root.classList.add("js");

  // ---------------------------
  // Helpers
  // ---------------------------
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // ---------------------------
  // Footer year
  // ---------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------------------------
  // Theme toggle (light/dark)
  // ---------------------------
  const THEME_KEY = "qa-portfolio-theme";
  const themeToggle = document.getElementById("themeToggle");

  const applyTheme = (theme) => {
    if (!theme) {
      root.removeAttribute("data-theme");
      return;
    }
    root.setAttribute("data-theme", theme);
  };

  const initTheme = () => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      return;
    }
    // Default to system preference.
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  };

  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  // ---------------------------
  // Mobile nav
  // ---------------------------
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");

  const closeNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeNav());
    });

    document.addEventListener("click", (e) => {
      if (window.innerWidth > 980) return;
      if (!nav.classList.contains("is-open")) return;
      const target = e.target;
      if (!target) return;
      if (nav.contains(target) || navToggle.contains(target)) return;
      closeNav();
    });
  }

  // ---------------------------
  // Reveal on scroll
  // ---------------------------
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (!reduceMotion && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    // If reduced motion: just show everything.
    reveals.forEach((el) => el.classList.add("in-view"));
  }

  // ---------------------------
  // Scroll progress + stamp + to-top
  // ---------------------------
  const stamp = document.querySelector(".stamp");
  const stampText = document.getElementById("stampText");
  const toTop = document.getElementById("toTop");

  const updateScrollUI = () => {
    const y = window.scrollY || 0;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? y / max : 0;

    root.style.setProperty("--scrollP", `${(p * 100).toFixed(2)}%`);

    if (stamp) {
      if (y > 140) stamp.classList.add("is-on");
      else stamp.classList.remove("is-on");
    }

    if (toTop) {
      if (y > 700) toTop.classList.add("is-on");
      else toTop.classList.remove("is-on");
    }
  };

  let rafScroll = 0;
  const onScroll = () => {
    if (rafScroll) return;
    rafScroll = requestAnimationFrame(() => {
      updateScrollUI();
      rafScroll = 0;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateScrollUI();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // Update "stamp" text based on section in the middle of viewport.
  const stampedSections = Array.from(document.querySelectorAll("section[data-stamp]"));
  if (stamp && stampText && stampedSections.length) {
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const next = entry.target.getAttribute("data-stamp") || "";
          if (!next) return;

          if (stampText.textContent !== next) {
            stampText.textContent = next;
            stamp.classList.remove("pop");
            // trigger reflow to restart animation
            void stamp.offsetWidth;
            stamp.classList.add("pop");
          }
        });
      },
      // Intersection around the center of the screen
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    stampedSections.forEach((sec) => so.observe(sec));
  }

  // ---------------------------
  // Active nav link (highlights current section)
  // ---------------------------
  if (nav) {
    const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const sections = navLinks
      .map((a) => {
        const href = a.getAttribute("href");
        return href ? document.querySelector(href) : null;
      })
      .filter((el) => el && el.tagName === "SECTION");

    const setActive = (id) => {
      navLinks.forEach((a) => {
        const href = a.getAttribute("href") || "";
        a.classList.toggle("active", href === `#${id}`);
      });
    };

    if (sections.length) {
      const no = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            if (!entry.target.id) return;
            setActive(entry.target.id);
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );

      sections.forEach((sec) => no.observe(sec));
      setActive("home");
    }
  }


  // ---------------------------
  // Parallax orbs (subtle)
  // ---------------------------
  const orb1 = document.querySelector(".orb-1");
  const orb2 = document.querySelector(".orb-2");
  const orb3 = document.querySelector(".orb-3");

  let pointerX = 0;
  let pointerY = 0;

  window.addEventListener(
    "pointermove",
    (e) => {
      // Normalize [-0.5..0.5]
      pointerX = e.clientX / window.innerWidth - 0.5;
      pointerY = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true }
  );

  // ---------------------------
  // Scroll-based subtle 3D on panels
  // (writes CSS vars --ty and --rx used in styles.css)
  // ---------------------------
  const scroll3dEls = Array.from(document.querySelectorAll("[data-scroll3d]"));

  const tick3D = () => {
    if (!reduceMotion) {
      const vh = window.innerHeight;

      scroll3dEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = (center - vh / 2) / (vh / 2); // -1..1 around viewport center

        const ty = clamp(dist * 16, -16, 16);
        const rx = clamp(dist * -2.2, -2.2, 2.2);

        el.style.setProperty("--ty", `${ty.toFixed(2)}px`);
        el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      });

      // Background orbs parallax (tiny movement)
      const s = window.scrollY || 0;
      if (orb1) orb1.style.transform = `translate3d(${pointerX * 20 + s * -0.02}px, ${pointerY * 18 + s * 0.01}px, 0)`;
      if (orb2) orb2.style.transform = `translate3d(${pointerX * -22 + s * 0.015}px, ${pointerY * 16 + s * -0.01}px, 0)`;
      if (orb3) orb3.style.transform = `translate3d(${pointerX * 16 + s * -0.01}px, ${pointerY * -18 + s * 0.02}px, 0)`;
    }

    requestAnimationFrame(tick3D);
  };

  requestAnimationFrame(tick3D);

  // ---------------------------
  // Pointer tilt + spotlight (cards / projects / hero stack)
  // ---------------------------
  const setSpot = (el, e) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  // Spotlight for all cards/projects
  document.querySelectorAll(".card, .project-card").forEach((el) => {
    el.addEventListener("pointermove", (e) => setSpot(el, e), { passive: true });
  });

  // Tilt for elements with data-tilt
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = parseFloat(el.getAttribute("data-tilt-max") || "10");

    const reset = () => {
      el.style.setProperty("--tiltX", "0deg");
      el.style.setProperty("--tiltY", "0deg");
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };

    if (reduceMotion) {
      reset();
      return;
    }

    el.addEventListener(
      "pointermove",
      (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;  // -0.5..0.5
        const py = (e.clientY - r.top) / r.height - 0.5;

        const tiltY = clamp(px * max, -max, max);
        const tiltX = clamp(-py * max, -max, max);

        el.style.setProperty("--tiltX", `${tiltX.toFixed(2)}deg`);
        el.style.setProperty("--tiltY", `${tiltY.toFixed(2)}deg`);
        setSpot(el, e);
      },
      { passive: true }
    );

    el.addEventListener("pointerleave", reset);
    reset();
  });

  
  // ---------------------------
  // Hero stack: click-to-rotate + quick jumps
  // ---------------------------
  const heroStack = document.querySelector('[data-stack="hero"]');
  const flashSection = (section) => {
    section.classList.add("section-flash");
    window.setTimeout(() => section.classList.remove("section-flash"), 900);
  };

  if (heroStack && !reduceMotion) {
    let cards = Array.from(heroStack.querySelectorAll(".stack__card"));

    const roles = ["stack__card--front", "stack__card--mid", "stack__card--back"];

    const applyRoles = () => {
      cards.forEach((card, i) => {
        roles.forEach((c) => card.classList.remove(c));
        card.classList.add(roles[Math.min(i, 2)]);
      });
    };

    const rotate = () => {
      cards.push(cards.shift());
      applyRoles();
    };

    // Allow keyboard rotation on focused card
    heroStack.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        rotate();
      }
    });

    heroStack.addEventListener("click", (e) => {
      // If user clicked a quick-jump button, scroll instead of rotating
      const jump = e.target.closest("[data-scroll-to]");
      if (jump) {
        e.stopPropagation();
        const sel = jump.getAttribute("data-scroll-to");
        const target = sel ? document.querySelector(sel) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          flashSection(target);
        }
        return;
      }

      const card = e.target.closest(".stack__card");
      if (card) rotate();
    });

    applyRoles();
  } else if (heroStack) {
    // Reduced motion: keep jump buttons working, disable rotate
    heroStack.addEventListener("click", (e) => {
      const jump = e.target.closest("[data-scroll-to]");
      if (!jump) return;
      const sel = jump.getAttribute("data-scroll-to");
      const target = sel ? document.querySelector(sel) : null;
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        flashSection(target);
      }
    });
  }


// ---------------------------



// Contact form (client-side validation + "no-setup" FormSubmit)
// ---------------------------
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const sendBtn = document.getElementById("sendBtn");
const nextEl = document.getElementById("formNext");

const setStatus = (msg) => {
  if (statusEl) statusEl.textContent = msg || "";
};

const setError = (name, msg) => {
  const el = document.querySelector(`[data-error-for="${name}"]`);
  const input = document.getElementById(name);
  if (el) el.textContent = msg || "";
  if (input) input.classList.toggle("invalid", Boolean(msg));
};

const getVal = (id) => {
  const el = document.getElementById(id);
  return el ? (el.value || "").trim() : "";
};

// Set FormSubmit redirect back to this page (works on localhost and any domain)
// Set FormSubmit redirect back to THIS page (works on localhost + GitHub Pages project path)
//if (nextEl) {
//  const base = window.location.href.split("?")[0].split("#")[0];//
 // nextEl.value = `${base}?sent=1#contact`;//
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // <-- это главное: убирает переходы/редиректы

  triedSubmit = true;
  const res = validate();
  updateButton();

  if (!res.ok) return;

  sendBtn.disabled = true;
  formStatus.textContent = "Sending…";

  try {
    const fd = new FormData(form);

    const r = await fetch(form.action, {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" }
    });

    if (r.ok) {
      formStatus.textContent = "Sent! Thanks, I’ll reply as soon as I can.";
      form.reset();
      updateButton();
    } else {
      formStatus.textContent = "Oops. Something went wrong. Try again.";
      sendBtn.disabled = false;
    }
  } catch (err) {
    formStatus.textContent = "Network error. Please try again.";
    sendBtn.disabled = false;
  }
});


let triedSubmit = false;

const validate = () => {
  const name = getVal("name");
  const emailEl = document.getElementById("email");
  const email = getVal("email");
  const company = getVal("company");
  const message = getVal("message");
  const honeypot = getVal("website");

  let ok = true;

  // Honeypot: if filled, it's almost certainly a bot.
  if (honeypot) return { ok: false, isBot: true };

  if (!name) { setError("name", "Please enter your name."); ok = false; } else setError("name", "");
  if (!email) { setError("email", "Please enter your email."); ok = false; }
  else if (emailEl && !emailEl.checkValidity()) { setError("email", "Please enter a valid email."); ok = false; }
  else setError("email", "");

  if (!company) { setError("company", "Please enter your company."); ok = false; } else setError("company", "");
  if (!message) { setError("message", "Please type a message."); ok = false; } else setError("message", "");

  return { ok, isBot: false };
};

const updateButton = () => {
  if (!sendBtn) return;
  const { ok } = validate();
  // Keep the button clickable, but give subtle visual cue when form isn't ready.
  sendBtn.classList.toggle("btn--disabled", !ok);

  // When user hasn't tried submit yet, don't show errors aggressively.
  if (!triedSubmit) {
    ["name","email","company","message"].forEach((k) => setError(k, ""));
  }
};

if (form) {
  // Enable/disable send button live
  ["name","email","company","message"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      if (triedSubmit) validate();
      updateButton();
    });
    el.addEventListener("blur", () => {
      if (triedSubmit) validate();
      updateButton();
    });
  });

  // Initial state
  updateButton();

  form.addEventListener("submit", (e) => {
    triedSubmit = true;
    const res = validate();

    // Bot: pretend success and reset silently
    if (res.isBot) {
      e.preventDefault();
      setStatus("Sent! Thanks.");
      form.reset();
      updateButton();
      return;
    }

    if (!res.ok) {
      e.preventDefault();
      setStatus("Please fill in all fields.");
      // Focus first invalid field
      const firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Valid: let the browser submit to FormSubmit.
    setStatus("Sending...");
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = "Sending...";
    }

    // Safety: re-enable if navigation doesn’t happen (offline, blocked request, etc.)
    window.setTimeout(() => {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send Message";
        updateButton();
      }
    }, 8000);
  });

  // Show success message after redirect from FormSubmit (?sent=1)
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("sent") === "1") {
      setStatus("Sent! Thanks, I’ll reply as soon as I can.");
      const contact = document.getElementById("contact");
      if (contact) {
        contact.scrollIntoView({ behavior: "smooth", block: "start" });
        flashSection(contact);
      }
      // Clean the URL (remove ?sent=1)
      url.searchParams.delete("sent");
      window.history.replaceState({}, "", url.toString());
    }
  } catch (_) {}
}

})();
