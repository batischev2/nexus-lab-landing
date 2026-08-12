(function () {
  var root = document.documentElement;
  var themeMeta = document.getElementById("theme-color");

  var applyTheme = function (theme) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", theme === "light" ? "#f3f6f9" : "#0a0d11");
    var t = window.LIDO_I18N && window.LIDO_I18N.t;
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var label;
      if (t) label = theme === "light" ? t("theme.toDark") : t("theme.toLight");
      else label = theme === "light" ? "Включить тёмную тему" : "Включить светлую тему";
      btn.setAttribute("aria-label", label);
    });
  };

  var currentTheme = function () {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  };

  if (!root.getAttribute("data-theme")) {
    var stored;
    try { stored = localStorage.getItem("theme"); } catch (e) { stored = null; }
    var initial = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    applyTheme(initial);
  } else {
    applyTheme(currentTheme());
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      try { localStorage.setItem("theme", next); } catch (e) {}
      applyTheme(next);
    });
  });

  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 24) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Scroll reveal
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Prefill package from hash / query for Direct A/B
  var params = new URLSearchParams(window.location.search);
  var offer = params.get("offer") || (location.hash === "#packages" ? "turnkey" : null);
  var select = document.getElementById("package");
  if (offer && select) {
    var map = {
      turnkey: "turnkey",
      funnel: "funnel",
      growth: "growth",
      audit: "audit",
      bot: "bot",
      site: "site",
      direct: "direct",
      other: "other"
    };
    if (map[offer]) select.value = map[offer];
  }

  // Lead form — local success + Telegram deep link helper
  var form = document.getElementById("lead-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var name = form.name.value.trim();
      var contact = form.contact.value.trim();
      var pack = form.package.options[form.package.selectedIndex].text;

      if (typeof window.ym === "function" && window.NEXUS_METRIKA_ID) {
        window.ym(window.NEXUS_METRIKA_ID, "reachGoal", "lead_submit");
      }

      var text = [
        (window.LIDO_I18N && window.LIDO_I18N.t ? window.LIDO_I18N.t("tg.lead") : "Заявка с лендинга Лидогенераторной"),
        (window.LIDO_I18N && window.LIDO_I18N.t ? window.LIDO_I18N.t("tg.name") : "Имя: ") + name,
        (window.LIDO_I18N && window.LIDO_I18N.t ? window.LIDO_I18N.t("tg.contact") : "Контакт: ") + contact,
        (window.LIDO_I18N && window.LIDO_I18N.t ? window.LIDO_I18N.t("tg.pack") : "Интересует: ") + pack
      ].join("\n");

      form.classList.add("is-success");

      var tg = "https://t.me/batischev97?text=" + encodeURIComponent(text);
      window.open(tg, "_blank", "noopener,noreferrer");
    });
  }

  // Goal clicks
  document.querySelectorAll("[data-goal]").forEach(function (el) {
    el.addEventListener("click", function () {
      var goal = el.getAttribute("data-goal");
      if (goal && typeof window.ym === "function" && window.NEXUS_METRIKA_ID) {
        window.ym(window.NEXUS_METRIKA_ID, "reachGoal", goal);
      }
    });
  });

  // Sticky mobile CTA: show after hero, hide over lead form
  var sticky = document.getElementById("sticky-cta");
  var hero = document.querySelector(".hero");
  var lead = document.getElementById("lead");
  if (sticky && hero && lead && "IntersectionObserver" in window) {
    var heroVisible = true;
    var leadVisible = false;
    var syncSticky = function () {
      var show = !heroVisible && !leadVisible && window.matchMedia("(max-width: 700px)").matches;
      sticky.hidden = !show;
      document.body.classList.toggle("has-sticky-cta", show);
    };
    var heroIo = new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      syncSticky();
    }, { threshold: 0.15 });
    var leadIo = new IntersectionObserver(function (entries) {
      leadVisible = entries[0].isIntersecting;
      syncSticky();
    }, { threshold: 0.2 });
    heroIo.observe(hero);
    leadIo.observe(lead);
    window.addEventListener("resize", syncSticky, { passive: true });
    syncSticky();
  }

  // --- Yandex Metrika ---
  // Раскомментируйте и подставьте ID счётчика:
  // window.NEXUS_METRIKA_ID = 00000000;
  // (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  // m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0];
  // k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  // ym(window.NEXUS_METRIKA_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
})();
