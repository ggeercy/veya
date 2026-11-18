/* Veya — vanilla interactions. No dependencies. Reduced-motion aware. */
(function () {
  "use strict";

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* Mobile nav toggle — Escape closes it and returns focus to the button */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    var setMenu = function (open, returnFocus) {
      document.body.classList.toggle("nav-open", open);
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true);
    });
  }

  /* Header shadow on scroll */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Reveal on scroll */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Booking dates can't be in the past */
  var today = new Date();
  var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach(function (d) { d.min = iso; });

  /* Why a field is invalid, or "" when it's fine */
  function problem(el) {
    var v = (el.value || "").trim();
    if (el.required && !v) return "required";
    if (el.type === "email" && v && !EMAIL.test(v)) return "email";
    if (el.type === "date" && v && v < iso) return "past";
    return "";
  }

  /* Demo forms — validate, then show a friendly inline note */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.noValidate = true;
    var note = form.querySelector(".form-note");
    if (!note) {
      note = document.createElement("p");
      note.className = "form-note";
      // the newsletter form is a pill — keep the note outside it
      if (form.classList.contains("news-form")) form.insertAdjacentElement("afterend", note);
      else form.appendChild(note);
    }
    note.setAttribute("role", "status");
    note.setAttribute("aria-live", "polite");

    var fields = form.querySelectorAll("input, select, textarea");
    fields.forEach(function (el) {
      el.addEventListener("input", function () {
        if (el.getAttribute("aria-invalid") === "true" && !problem(el)) el.setAttribute("aria-invalid", "false");
      });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var first = null, reason = "";
      fields.forEach(function (el) {
        var p = problem(el);
        el.setAttribute("aria-invalid", p ? "true" : "false");
        if (p && !first) { first = el; reason = p; }
      });
      if (first) {
        note.className = "form-note is-err";
        note.textContent = reason === "email" ? "Please enter a valid email address."
          : reason === "past" ? "Please choose a date from today onwards."
          : "Please fill in the highlighted fields.";
        first.focus();
        return;
      }
      note.className = "form-note";
      note.textContent = form.classList.contains("news-form")
        ? "✓ You're subscribed. This is a demo form — connect it to your email tool."
        : "✓ Thanks! This is a demo form — connect it to your booking system to go live.";
      form.reset();
    });
  });

  /* Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
