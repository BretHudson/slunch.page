let main;

let uploadForm;

let image, background;

let page;
let hue, last = null;
const change = timestamp => {
	if (last === null)
		last = timestamp;
	const dt = timestamp - last;
	last = timestamp;
	hue += dt / 10;
	document.body.style.setProperty('--color', `hsl(${Math.round(hue)}, 100%, 50%)`);
	window.requestAnimationFrame(change);
};

const WIDTH = 960;
const HEIGHT = 540;
const defaultAspectRatio = 16 / 9;
const drawImage = () => {
	const aspectRatio = image.width / image.height;
	let x, y, w, h;
	if (aspectRatio > defaultAspectRatio) {
		w = WIDTH;
		h = WIDTH / aspectRatio;
		x = 0;
		y = (HEIGHT - h) >> 1;
	} else {
		w = HEIGHT * aspectRatio;
		h = HEIGHT;
		x = (WIDTH - w) >> 1;
		y = 0;
	}
	ctx.drawImage(image, x, y, w, h);
};

const loadImage = (src, onload) => {
	const image = new Image();
	if (onload !== undefined)
		image.onload = onload;
	image.src = src;
	return image;
};

const loadLunchImage = src => {
	image = loadImage(src, drawImage);
	main.classList.remove('state-upload');
	main.classList.add('state-edit');
};

let canvas, ctx;
const readFile = file => {
	const reader = new FileReader();
	reader.onload = e => {
		loadLunchImage(e.target.result);
	};
	reader.readAsDataURL(file);
};

const noDefault = e => {
	e.preventDefault();
	e.stopPropagation();
};

const dragEnter = e => {
	uploadForm.classList.add('drag');
};

const dragLeave = e => {
	uploadForm.classList.remove('drag');
};

const dropImage = e => {
	readFile(e.dataTransfer.files[0]);
};

window.addEventListener('DOMContentLoaded', e => {
	hue = (new Date() / 10);
	window.requestAnimationFrame(change);
	
	main = document.querySelector('main');
	
	uploadForm = document.querySelector('label[for="image-upload"]');
	
	background = loadImage('img/background.jpg');
	// loadLunchImage('img/slunch.jpg');
	
	// Override defaults
	document.body.addEventListener('drag', noDefault);
	document.body.addEventListener('dragstart', noDefault);
	document.body.addEventListener('dragend', noDefault);
	document.body.addEventListener('dragover', noDefault);
	document.body.addEventListener('dragenter', noDefault);
	document.body.addEventListener('dragleave', noDefault);
	document.body.addEventListener('drop', noDefault);
	
	// Add class
	document.body.addEventListener('dragover', dragEnter);
	document.body.addEventListener('dragenter', dragEnter);
	
	// Remove class
	document.body.addEventListener('dragleave', dragLeave);
	document.body.addEventListener('dragend', dragLeave);
	
	// Drop
	document.body.addEventListener('drop', dropImage);
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	
	const imageUpload = document.getElementById('image-upload');
	imageUpload.addEventListener('change', e => readFile(e.target.files[0]), false);
	
	const button = document.querySelector('button');
	button.addEventListener('click', e => {
		const link = document.createElement('a');
		link.download = 'slunch.jpg';
		link.href = canvas.toDataURL("image/jpeg");
		link.click();
	});
});

const drawTextWithShadow = (str, x, y, size, angle) => {
	const offset = size / 12;
	
	ctx.font = `${size}px "Bubblegum Sans"`;
	
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle * Math.PI / 180);
	ctx.translate(-x, -y);
		
	ctx.fillStyle = '#C5C5C5';
	ctx.fillText(str, x + offset, y + offset);
	
	ctx.fillStyle = 'white';
	ctx.fillText(str, x, y);
	
	ctx.restore();
}

let lastRender;
const renderCanvas = t => {
	if (lastRender === undefined)
		lastRender = t;
	
	const dt = t - lastRender;
	lastRender = t;
	
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	
	if (background) {
		ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
	}
	
	if (image)
		drawImage();
	
	// Draw text
	const text1 = document.querySelector('input[name=text-top]').value;
	const text2 = document.querySelector('input[name=text-bottom]').value;
	
	const CX = WIDTH >> 1;
	const CY = HEIGHT >> 1;
	
	const angle = 10;
	drawTextWithShadow(text1, CX - 230, CY - 120, 100, -angle);
	drawTextWithShadow(text2, CX + 230, CY + 140, 50, angle);
	
	
	window.requestAnimationFrame(renderCanvas);
};
window.requestAnimationFrame(renderCanvas);
