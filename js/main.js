let hue, last = null;
window.addEventListener('DOMContentLoaded', e => {
	hue = (new Date() / 10);
	
	const page = document.querySelector('header');
	const change = timestamp => {
		if (last === null)
			last = timestamp;
		const dt = timestamp - last;
		last = timestamp;
		hue += dt / 10;
		page.style.textShadow = `0.1em 0.1em 0.1em hsl(${Math.round(hue)}, 100%, 50%)`;
		window.requestAnimationFrame(change);
	}
	window.requestAnimationFrame(change);
});