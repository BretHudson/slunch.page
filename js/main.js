Element.prototype.on = function(type, func, capture) {
	type.split(' ').forEach(t => this.addEventListener(t, func, capture));
};

let mainElem;
let uploadForm;
let image, background;
let canvas, ctx;
let canvasX, canvasY, canvasW, canvasH;

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

//const [ WIDTH, HEIGHT ] = [ 960, 540 ];
const [ WIDTH, HEIGHT ] = [ 1300, 974 ];
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
	mainElem.classList.remove('state-upload');
	mainElem.classList.add('state-edit');
};

const readFile = file => {
	const reader = new FileReader();
	reader.onload = e => {
		loadLunchImage(e.target.result);
	};
	reader.readAsDataURL(file);
};

const addDragDropEvents = () => {
	document.body.on('drag dragstart dragend dragover dragenter dragleave drop', e => e.preventDefault() && e.stopPropagation());
	document.body.on('dragover dragenter', e => uploadForm.classList.add('drag'));
	document.body.on('dragleave dragend', e => uploadForm.classList.remove('drag'));
	document.body.on('drop', e => readFile(e.dataTransfer.files[0]));
};

let mouse = {
	xRaw: 0, yRaw: 0,
	xStartRaw: 0, yStartRaw: 0,
	xDragRaw: 0, yDragRaw: 0,
	x: 0, y: 0,
	xStart: 0, yStart: 0,
	xDrag: 0, yDrag: 0,
	state: 0,
	get pressed() { return this.state === 3; },
	get held() { return (this.state & 2) !== 0; },
	get released() { return this.state === 1; }
};

const addCanvasEvents = () => {
	canvas.on('mousedown', e => {
		mouse.state = 3;
		mouse.xRaw = e.clientX - canvasX;
		mouse.yRaw = e.clientY - canvasY;
	});
	
	canvas.on('mousemove', e => {
		mouse.xRaw = e.clientX - canvasX;
		mouse.yRaw = e.clientY - canvasY;
	});
	
	canvas.on('mouseup', e => {
		mouse.state = 1;
		mouse.xRaw = e.clientX - canvasX;
		mouse.yRaw = e.clientY - canvasY;
	});
};

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
let drag = { x: 0, y: 0 };
const updateBegin = dt => {
	mouse.x = mouse.xRaw * canvasRatio;
	mouse.y = mouse.yRaw * canvasRatio;
	
	if (mouse.pressed === true) {
		mouse.xStartRaw = mouse.xRaw;
		mouse.yStartRaw = mouse.yRaw;
		mouse.xStart = mouse.x;
		mouse.yStart = mouse.y;
	}
	
	if (mouse.state !== 0) {
		mouse.xDragRaw = mouse.xRaw - mouse.xStartRaw;
		mouse.yDragRaw = mouse.yRaw - mouse.yStartRaw;
		
		mouse.xDrag = mouse.x - mouse.xStart;
		mouse.yDrag = mouse.y - mouse.yStart;
	} else {
		mouse.xDragRaw = mouse.yDragRaw = 0;
		mouse.xDrag = mouse.yDrag = 0;
	}
};

const update = dt => {
	if (mouse.released === true) {
		drag.x += mouse.xDrag;
		drag.y += mouse.yDrag;
	}
};

const updateEnd = dt => {
	mouse.state &= ~1;
};

const render = dt => {
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
	
	const CX = drag.x + (WIDTH >> 1) + ((mouse.held === true) ? mouse.xDrag : 0);
	const CY = drag.y + (HEIGHT >> 1) + ((mouse.held === true) ? mouse.yDrag : 0);
	
	const angle = 10;
	drawTextWithShadow(text1, CX - 230, CY - 120, 100, -angle);
	drawTextWithShadow(text2, CX + 230, CY + 140, 50, angle);
};

const loop = t => {
	if (lastRender === undefined)
		lastRender = t;
	
	const dt = t - lastRender;
	lastRender = t;
	
	updateBegin(dt);
	update(dt);
	updateEnd(dt);
	
	render(dt);
	
	window.requestAnimationFrame(loop);
};

window.addEventListener('DOMContentLoaded', e => {
	hue = (new Date() / 10);
	window.requestAnimationFrame(change);
	
	mainElem = document.querySelector('main');
	
	uploadForm = document.querySelector('label[for="image-upload"]');
	
	background = loadImage('img/background.jpg');
	loadLunchImage('img/slunch.jpg');
	
	addDragDropEvents();
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	
	let canvasRect = canvas.getBoundingClientRect();
	canvasX = canvasRect.x;
	canvasY = canvasRect.y;
	canvasW = canvasRect.width;
	canvasH = canvasRect.height;
	canvasRatio = WIDTH / canvasW;
	console.log(canvasRatio);
	
	addCanvasEvents();
	
	const imageUpload = document.getElementById('image-upload');
	imageUpload.addEventListener('change', e => readFile(e.target.files[0]), false);
	
	const button = document.querySelector('button');
	button.addEventListener('click', e => {
		const link = document.createElement('a');
		link.download = 'slunch.jpg';
		link.href = canvas.toDataURL("image/jpeg");
		link.click();
	});
	
	window.requestAnimationFrame(loop);
});