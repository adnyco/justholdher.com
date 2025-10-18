(() => {
	'use strict';

	// Fallback to drive only the hero shroud when scroll-driven animations aren't supported
	const hero = document.querySelector('.hero');
	if (!hero) return;

	const supportsRanges = CSS && CSS.supports && CSS.supports('animation-range: exit 0% exit 100%');
	const supportsTimeline = CSS && CSS.supports && CSS.supports('animation-timeline: --hero');
	const nativeOK = !!(supportsRanges && supportsTimeline);
	if (nativeOK) return; // CSS handles the fade natively

	const vh = () => window.innerHeight || document.documentElement.clientHeight;

	let ticking = false;
	function onScroll(){
		if (!ticking) {
			requestAnimationFrame(update);
			ticking = true;
		}
	}
	function update(){
		ticking = false;
		const rect = hero.getBoundingClientRect();
		const progress = Math.min(1, Math.max(0, (vh() - rect.bottom) / vh())); // 0→1 over hero exit
		hero.style.setProperty('--hero-fade', String(progress));
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	onScroll();
})();