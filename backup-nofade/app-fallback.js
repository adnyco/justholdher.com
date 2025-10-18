(() => {
	'use strict';

	const hero = document.querySelector('.hero');
	const s2 = document.querySelector('.section.s2');
	if (!hero || !s2) return;

	// Feature detect scroll-driven animations
	const supports = CSS && ('animationTimeline' in document.body.style || 'viewTimeline' in document.documentElement.style);
	if (supports) return;

	const viewportH = () => window.innerHeight || document.documentElement.clientHeight;

	let ticking = false;
	function onScroll() {
		if (!ticking) {
			requestAnimationFrame(update);
			ticking = true;
		}
	}
	function update() {
		ticking = false;
		const rect = hero.getBoundingClientRect();
		const start = 0;
		const end = viewportH();
		const progress = Math.min(1, Math.max(0, (viewportH() - rect.bottom) / (end - start)));
		hero.style.setProperty('--hero-fade', String(progress));
		s2.style.opacity = String(progress);
	}
	// Hook CSS var (safe if rule is absent)
	const style = document.createElement('style');
	style.textContent = '.hero::after{opacity:var(--hero-fade,0);}';
	document.head.appendChild(style);

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	onScroll();
})();