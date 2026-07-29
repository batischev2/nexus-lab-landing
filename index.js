(function () {
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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
    var map = { turnkey: "turnkey", funnel: "funnel", bot: "bot", site: "site", direct: "direct" };
    if (map[offer]) select.value = map[offer];
  }

  // Lead form — local success + Telegram deep link helper
  var form = document.getElementById("lead-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var name = form.name.value.trim();
    var contact = form.contact.value.trim();
    var pack = form.package.options[form.package.selectedIndex].text;
    var task = form.task.value.trim();

    // Goal hook for Yandex Metrika (replace XXXXXXX with counter id)
    if (typeof window.ym === "function") {
      window.ym(window.NEXUS_METRIKA_ID || 0, "reachGoal", "lead_submit");
    }

    var text = [
      "Заявка с лендинга Веб-Кузницы",
      "Имя: " + name,
      "Контакт: " + contact,
      "Интересует: " + pack,
      task ? "Задача: " + task : ""
    ].filter(Boolean).join("\n");

    form.classList.add("is-success");

    // Open Telegram with prefilled message (user can send)
    var tg = "https://t.me/n9dmitry?text=" + encodeURIComponent(text);
    window.open(tg, "_blank", "noopener,noreferrer");
  });

  // Goal clicks
  document.querySelectorAll("[data-goal]").forEach(function (el) {
    el.addEventListener("click", function () {
      var goal = el.getAttribute("data-goal");
      if (goal && typeof window.ym === "function" && window.NEXUS_METRIKA_ID) {
        window.ym(window.NEXUS_METRIKA_ID, "reachGoal", goal);
      }
    });
  });

  // --- Yandex Metrika placeholder ---
  // window.NEXUS_METRIKA_ID = 00000000;
  // (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  // m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0];
  // k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  // ym(window.NEXUS_METRIKA_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
})();
  
