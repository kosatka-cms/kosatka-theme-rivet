// The rivet theme's script (linked deferred in footer.html, after the
// engine's app.js).
//
// rivetSlider - a behavior: a View rendered with the "slider" template
// (views/slider.html, [data-r-slider]) shows one slide at a time. The
// arrows ([data-r-slider-prev], [data-r-slider-next]) step back and
// forth, round the end; a tab ([data-r-slider-tab], the slide's number)
// goes to its slide; the left and right keys do it on the tabs, a swipe
// on a touch screen. There is no autoplay: a slide changes only when the
// visitor asks. The current slide and tab carry .is-current, the tabs
// say which is selected (aria-selected). The slides lie one over another
// (rivet.css), the current one fading in; the others are inert - out of
// the reading order and the keyboard's way.
(function () {
    'use strict';

    Kosatka.behaviors = Kosatka.behaviors || {};

    Kosatka.behaviors.rivetSlider = {
        attach: function (context) {
            Kosatka.once('rivet-slider', '[data-r-slider]', context).forEach(function (slider) {
                var slides = Array.prototype.slice.call(slider.querySelectorAll('.r-slide'));
                var tabs = Array.prototype.slice.call(slider.querySelectorAll('[data-r-slider-tab]'));
                if (slides.length < 2) return;
                var current = 0;

                function show(i, focusTab) {
                    current = (i + slides.length) % slides.length;
                    slides.forEach(function (s, k) {
                        var on = k === current;
                        s.classList.toggle('is-current', on);
                        s.hidden = false;
                        s.inert = !on;
                        s.setAttribute('aria-hidden', on ? 'false' : 'true');
                    });
                    tabs.forEach(function (t, k) {
                        var on = k === current;
                        t.classList.toggle('is-current', on);
                        t.setAttribute('aria-selected', on ? 'true' : 'false');
                        t.tabIndex = on ? 0 : -1;
                        if (on && focusTab) t.focus();
                    });
                }

                var prev = slider.querySelector('[data-r-slider-prev]');
                var next = slider.querySelector('[data-r-slider-next]');
                if (prev) prev.addEventListener('click', function () { show(current - 1); });
                if (next) next.addEventListener('click', function () { show(current + 1); });
                tabs.forEach(function (t, k) {
                    t.addEventListener('click', function () { show(k); });
                    t.addEventListener('keydown', function (e) {
                        if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, true); }
                        if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1, true); }
                    });
                });

                // A swipe: a horizontal move of 50 pixels or more, more
                // across than down.
                var x0 = null, y0 = null;
                slider.addEventListener('touchstart', function (e) {
                    x0 = e.touches[0].clientX;
                    y0 = e.touches[0].clientY;
                }, {passive: true});
                slider.addEventListener('touchend', function (e) {
                    if (x0 === null) return;
                    var dx = e.changedTouches[0].clientX - x0;
                    var dy = e.changedTouches[0].clientY - y0;
                    x0 = null;
                    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
                }, {passive: true});

                show(0);
                slider.classList.add('is-ready');
            });
        }
    };
})();
