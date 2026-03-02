(() => {
	'use strict';

	const hero = document.querySelector('.hero');
	const s2 = document.querySelector('.section.s2');
	if (!hero || !s2) return;

	// Detect native scroll-driven animations (CSS view timelines)
	const supports = CSS && ('animationTimeline' in document.body.style || 'viewTimeline' in document.documentElement.style);
	if (supports) return; // CSS handles it natively

	const vh = () => window.innerHeight || document.documentElement.clientHeight;

	function hexToRgb(hex) {
		const m = hex.replace('#','').match(/.{1,2}/g).map(x => parseInt(x,16));
		return { r:m[0], g:m[1], b:m[2] };
	}
	function rgbToHex({r,g,b}) {
		return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
	}
	function lerp(a,b,t){ return a + (b-a)*t; }
	function lerpColor(h1,h2,t){
		const a = hexToRgb(h1), b = hexToRgb(h2);
		return rgbToHex({ r:Math.round(lerp(a.r,b.r,t)), g:Math.round(lerp(a.g,b.g,t)), b:Math.round(lerp(a.b,b.b,t)) });
	}

	const cream = '#b28547';
	const black = '#000000';
	const textDark = '#111111';
	const computed = getComputedStyle(document.documentElement);
	const textLight = (computed.getPropertyValue('--fg-dark') || '#f3f3f3').trim();

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
		// progress: hero exit 0% → 100%
		const progress = Math.min(1, Math.max(0, (vh() - rect.bottom) / vh()));

		// Crossfade opacity for Section 2
		s2.style.opacity = String(progress);

		// Warm → Black background color
		s2.style.backgroundColor = lerpColor(cream, black, progress);

		// Flip text to light near the end for contrast
		s2.style.color = (progress < 0.65) ? textDark : textLight;

		// Drive hero shroud opacity (CSS will ignore if using native animations)
		hero.style.setProperty('--hero-fade', String(progress));
	}

	// Fallback CSS var hook for hero shroud
	const style = document.createElement('style');
	style.textContent = '.hero::after{opacity:var(--hero-fade,0) !important;}';
	document.head.appendChild(style);

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	onScroll();
})();