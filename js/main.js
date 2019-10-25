let main;

let uploadForm;

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

let image;
let canvas, ctx;
const readFile = file => {
	const reader = new FileReader();
	reader.onload = e => {
		image = new Image();
		image.onload = drawImage;
		image.src = event.target.result;
		main.classList.remove('state-upload');
		main.classList.add('state-edit');
	};
	reader.readAsDataURL(file);
};

/*
drag
dragstart
dragend
dragover
dragenter
dragleave
drop
*/

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
});

const renderCanvas = t => {
	window.requestAnimationFrame(renderCanvas);
};
window.requestAnimationFrame(renderCanvas);
