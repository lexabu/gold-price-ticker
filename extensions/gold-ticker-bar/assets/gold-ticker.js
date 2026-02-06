(function () {
  "use strict";

  var ticker = document.getElementById("gold-ticker-bar");
  if (!ticker) return;

  var proxyUrl = ticker.dataset.proxyUrl;
  var speed = parseInt(ticker.dataset.speed) || 50;
  var track = ticker.querySelector(".gold-ticker__track");
  var REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  function fetchPrices() {
    return fetch(proxyUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function (err) {
        console.warn("[Gold Ticker] Fetch failed:", err.message);
        return null;
      });
  }

  function buildItem(karat, price, symbol) {
    return (
      '<span class="gold-ticker__item" aria-label="' +
      karat +
      " gold: " +
      symbol +
      price.pricePerGram.toFixed(2) +
      ' per gram">' +
      '<span class="gold-ticker__karat">' +
      karat +
      "</span>" +
      '<span class="gold-ticker__price">' +
      symbol +
      price.pricePerGram.toFixed(2) +
      "</span>" +
      '<span class="gold-ticker__unit">/g</span>' +
      "</span>"
    );
  }

  function renderPrices(data) {
    if (!data || !data.prices) {
      ticker.classList.add("gold-ticker--hidden");
      return;
    }

    if (data.settings && !data.settings.isActive) {
      ticker.classList.add("gold-ticker--hidden");
      return;
    }

    ticker.classList.remove("gold-ticker--hidden");

    // Apply server-side color settings if present
    if (data.settings) {
      ticker.style.setProperty("--ticker-bg", data.settings.bgColor);
      ticker.style.setProperty("--ticker-text", data.settings.textColor);
    }

    var symbol = (data.settings && data.settings.currencySymbol) || "$";

    // Sort karats highest first
    var karats = Object.keys(data.prices).sort(function (a, b) {
      return parseInt(b) - parseInt(a);
    });

    if (karats.length === 0) {
      ticker.classList.add("gold-ticker--hidden");
      return;
    }

    // Build the item HTML
    var items = karats
      .map(function (k) {
        return buildItem(k, data.prices[k], symbol);
      })
      .join('<span class="gold-ticker__separator">\u00b7</span>');

    var timestamp = new Date(data.fetchedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    var content =
      items +
      '<span class="gold-ticker__timestamp">Updated ' +
      timestamp +
      "</span>";

    // Duplicate content for seamless infinite scroll
    track.innerHTML = content + content;

    // Wait for layout, then decide scroll vs static
    requestAnimationFrame(function () {
      var contentWidth = track.scrollWidth / 2;
      var containerWidth = ticker.querySelector(
        ".gold-ticker__container",
      ).offsetWidth;

      if (contentWidth <= containerWidth) {
        // Fits without scrolling
        track.innerHTML = content;
        track.classList.add("gold-ticker__track--static");
        track.classList.remove("gold-ticker__track--animate");
      } else {
        // Needs scrolling
        var duration = contentWidth / speed;
        track.style.setProperty("--ticker-duration", duration + "s");
        track.classList.add("gold-ticker__track--animate");
        track.classList.remove("gold-ticker__track--static");
      }
    });
  }

  // Initial fetch
  fetchPrices().then(renderPrices);

  // Auto-refresh every 5 minutes
  setInterval(function () {
    fetchPrices().then(renderPrices);
  }, REFRESH_INTERVAL);
})();
