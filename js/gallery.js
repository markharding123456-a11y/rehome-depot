/* ============================================================
   Rehome Depot — Front-end script
   Footer year, mobile nav, gallery rendering, filters, lightbox
   Works on every page — features no-op when their elements are absent
   ============================================================ */

(function () {
    "use strict";

    var FEATURED_COUNT = 3;
    var currentFilter = "all";

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        setFooterYear();
        wireMobileNav();

        var inventory = window.INVENTORY || [];

        if (document.getElementById("featuredGrid")) {
            renderFeatured(inventory);
        }
        if (document.getElementById("galleryGrid")) {
            renderGallery(inventory);
            wireFilters(inventory);
        }
        if (document.getElementById("lightbox")) {
            wireLightbox();
        }
    }

    /* -------- Footer year -------- */

    function setFooterYear() {
        var el = document.getElementById("footerYear");
        if (el) el.textContent = String(new Date().getFullYear());
    }

    /* -------- Mobile nav -------- */

    function wireMobileNav() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".main-nav");
        if (!toggle || !nav) return;

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* -------- Featured grid (home page) -------- */

    function renderFeatured(items) {
        var grid = document.getElementById("featuredGrid");
        if (!grid) return;

        var available = items.filter(function (i) { return i.status === "available"; });
        var pick = (available.length ? available : items).slice(0, FEATURED_COUNT);

        if (pick.length === 0) {
            grid.innerHTML = '<p class="gallery-empty">Inventory is being updated &mdash; check back soon.</p>';
            return;
        }

        grid.innerHTML = pick.map(cardHtml).join("");
        wireCardClicks(grid, items);
    }

    /* -------- Full gallery + filter (gallery page) -------- */

    function renderGallery(items) {
        var grid = document.getElementById("galleryGrid");
        if (!grid) return;

        var visible = items.filter(function (item) {
            return currentFilter === "all" || item.category === currentFilter;
        });

        if (visible.length === 0) {
            grid.innerHTML = '<p class="gallery-empty">No items in this category right now &mdash; check back soon.</p>';
            return;
        }

        grid.innerHTML = visible.map(cardHtml).join("");
        wireCardClicks(grid, items);
    }

    function wireFilters(items) {
        var bar = document.getElementById("galleryFilters");
        if (!bar) return;

        bar.addEventListener("click", function (e) {
            var btn = e.target.closest(".filter-btn");
            if (!btn) return;

            bar.querySelectorAll(".filter-btn").forEach(function (b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");

            currentFilter = btn.getAttribute("data-filter") || "all";
            renderGallery(items);
        });
    }

    function wireCardClicks(grid, items) {
        grid.querySelectorAll(".gallery-card").forEach(function (card) {
            card.addEventListener("click", function () {
                var id = Number(card.getAttribute("data-id"));
                var item = items.find(function (i) { return i.id === id; });
                if (item) openLightbox(item);
            });
        });
    }

    function cardHtml(item) {
        var priceLabel = formatPrice(item.price);
        var badge = "";
        if (item.status === "sold") {
            badge = '<span class="gallery-badge sold">Sold</span>';
        } else if (item.status === "hold") {
            badge = '<span class="gallery-badge hold">On Hold</span>';
        }

        return [
            '<article class="gallery-card" data-id="' + item.id + '">',
            '  <div class="gallery-card-image">',
            '    <img src="images/gallery/' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '    ' + badge,
            '  </div>',
            '  <div class="gallery-card-body">',
            '    <h3 class="gallery-card-title">' + escapeHtml(item.title) + '</h3>',
            '    <p class="gallery-card-price">' + priceLabel + '</p>',
            '    <p class="gallery-card-desc">' + escapeHtml(truncate(item.description, 90)) + '</p>',
            '  </div>',
            '</article>'
        ].join("");
    }

    /* -------- Lightbox -------- */

    function wireLightbox() {
        var lightbox = document.getElementById("lightbox");
        if (!lightbox) return;

        var closeBtn = lightbox.querySelector(".lightbox-close");
        if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

        lightbox.addEventListener("click", function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !lightbox.hasAttribute("hidden")) {
                closeLightbox();
            }
        });
    }

    function openLightbox(item) {
        var lightbox = document.getElementById("lightbox");
        if (!lightbox) return;

        document.getElementById("lightboxImage").src = "images/gallery/" + item.image;
        document.getElementById("lightboxImage").alt = item.title;
        document.getElementById("lightboxTitle").textContent = item.title;
        document.getElementById("lightboxPrice").textContent = formatPrice(item.price);
        document.getElementById("lightboxDescription").textContent = item.description;

        var statusEl = document.getElementById("lightboxStatus");
        statusEl.className = "lightbox-status " + item.status;
        if (item.status === "sold") {
            statusEl.textContent = "Sold — no longer available";
        } else if (item.status === "hold") {
            statusEl.textContent = "On hold for another customer";
        } else {
            statusEl.textContent = "Available — call or visit to purchase";
        }

        lightbox.removeAttribute("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        var lightbox = document.getElementById("lightbox");
        if (!lightbox) return;
        lightbox.setAttribute("hidden", "");
        document.body.style.overflow = "";
    }

    /* -------- Helpers -------- */

    function formatPrice(price) {
        if (typeof price === "number") return "$" + price.toLocaleString();
        return String(price);
    }

    function truncate(s, max) {
        if (!s) return "";
        return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
}());
