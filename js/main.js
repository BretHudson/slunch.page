Element.prototype.on = function(type, func, capture) {
	type.split(' ').forEach(t => this.addEventListener(t, func, capture));
};

class V2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	
	static clone(v) {
		return new V2(v.x, v.y);
	}
	
	static dot(v1, v2) {
		return (v1.x * v2.x) + (v1.y * v2.y);
	}
	
	static add(v1, v2) {
		return new V2(v1.x + v2.x, v1.y + v2.y);
	}
	
	static subtract(v1, v2) {
		return new V2(v1.x - v2.x, v1.y - v2.y);
	}
	
	addV2(other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}
	
	subtractV2(other) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}
	
	set(x = 0, y = 0) {
		this.x = x;
		this.y = y;
		return this;
	}
	
	setV2(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	}
	
	normalize() {
		const invMag = 1 / this.magnitude;
		this.x *= invMag;
		this.y *= invMag;
		return this;
	}
	
	multiplyScalar(s) {
		this.x *= s;
		this.y *= s;
		return this;
	}
	
	divideScalar(s) {
		this.x /= s;
		this.y /= s;
		return this;
	}
	
	rotateDeg(deg) {
		const rad = deg * Math.PI / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		this.x = this.x * cos - this.y * sin;
		this.y = this.x * sin + this.y * cos;
		return this;
	}
	
	rotateRad(rad) {
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		this.x = this.x * cos - this.y * sin;
		this.y = this.x * sin + this.y * cos;
		return this;
	}
	
	compareAngles(other) {
		return Math.atan2(other.y - this.y, other.x - this.x);
	}
	
	compareDistance(other) {
		return Math.sqrt(((other.x - this.x) * (other.x - this.x)) + ((other.y - this.y) * (other.y - this.y)));
	}
	
	// TODO(bret): Might want to only calculate this when x/y are changed...
	get magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	
	get normalized() {
		const v = new V2(this.x, this.y);
		v.normalize();
		return v;
	}
	
	get angle() {
		return Math.atan2(this.y, this.x);
	}
}

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
	posRaw: new V2(0, 0),
	startRaw: new V2(0, 0),
	dragRaw: new V2(0, 0),
	pos: new V2(0, 0),
	start: new V2(0, 0),
	drag: new V2(0, 0),
	state: 0,
	get pressed() { return this.state === 3; },
	get held() { return (this.state & 2) !== 0; },
	get released() { return this.state === 1; }
};

const addCanvasEvents = () => {
	canvas.on('mousedown', e => {
		mouse.state = 3;
		mouse.posRaw.set(e.clientX - canvasX, e.clientY - canvasY);
	});
	
	canvas.on('mousemove', e => {
		mouse.posRaw.set(e.clientX - canvasX, e.clientY - canvasY);
	});
	
	canvas.on('mouseup', e => {
		mouse.state = 1;
		mouse.posRaw.set(e.clientX - canvasX, e.clientY - canvasY);
	});
};

const getFont = size => `${size}px "Bubblegum Sans"`;

const drawTextWithShadow = (str, x, y, size, angle) => {
	const offset = size / 12;
	
	ctx.font = getFont(size);
	
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle * Math.PI / 180);
	ctx.translate(-x, -y);
		
	// ctx.fillStyle = '#C5C5C5';
	// ctx.fillText(str, x + offset, y + offset);
	
	ctx.fillStyle = 'white';
	ctx.fillText(str, x, y);
	
	ctx.restore();
}

const _drawTextWithShadow = textObj => {
	const { str, transform } = textObj;
	const { x, y, xDrag, yDrag, size, angle } = transform;
	const [ CX, CY ] = [ WIDTH >> 1, HEIGHT >> 1 ]
	drawTextWithShadow(str, x + xDrag + CX, y + yDrag + CY, size, angle);
};

const ITEMS = {
	TEXT: 'text'
};

const createText = (str, x, y, size) => {
	const text = {
		type: ITEMS.TEXT,
		str: str,
		transform: {
			parent: null,
			x: 0,
			y: 0,
			xDrag: 0,
			yDrag: 0,
			_size: 0,
			_width: 0,
			_height: 0,
			get size() {
				return this._size;
			},
			set size(val) {
				this._size = val;
				ctx.font = getFont(val);
				const textMetrics = ctx.measureText(this.parent.str);
				this._width = textMetrics.width;
				this._height = textMetrics.actualBoundingBoxDescent + textMetrics.actualBoundingBoxAscent;
			},
			angle: 0,
			get width() {
				return this._width;
			},
			get height() {
				return this._height;
			}
		}
	};
	
	text.transform.parent = text;
	text.transform.size = size;
	
	text.transform.angle = 15;
	
	return text;
};

let customText;
let selectedItem = customText;

let lastRender;
let drag = { x: 0, y: 0 };
const updateBegin = dt => {
	mouse.pos.setV2(mouse.posRaw).multiplyScalar(canvasRatio);
	
	if (mouse.pressed === true) {
		mouse.startRaw.setV2(mouse.posRaw);
		mouse.start.setV2(mouse.pos);
	}
	
	if (mouse.state !== 0) {
		mouse.dragRaw.setV2(mouse.posRaw).subtractV2(mouse.startRaw);
		mouse.drag.setV2(mouse.pos).subtractV2(mouse.start);
	} else {
		mouse.dragRaw.set(0, 0);
		mouse.drag.set(0, 0);
	}
};

const update = dt => {
	const selectedTransform = selectedItem.transform;
	if (mouse.held === true) {
		selectedTransform.xDrag = mouse.drag.x;
		selectedTransform.yDrag = mouse.drag.y;
	}
	
	if (mouse.released === true) {
		selectedTransform.x += mouse.drag.x;
		selectedTransform.y += mouse.drag.y;
		selectedTransform.xDrag = selectedTransform.yDrag = 0;
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
	
	const CX = drag.x + (WIDTH >> 1);
	const CY = drag.y + (HEIGHT >> 1);
	
	const angle = 10;
	drawTextWithShadow(text1, CX - 230, CY - 120, 100, -angle);
	drawTextWithShadow(text2, CX + 230, CY + 140, 50, angle);
	
	{
		const { str, transform } = customText;
		const { x, y, xDrag, yDrag, size, angle, width, height } = transform;
		
		const centerX = x + xDrag + CX;
		const centerY = y + yDrag + CY;
		const drawX = centerX - (width >> 1);
		const drawY = centerY - (height >> 1);
		
		ctx.save();
		ctx.translate(centerX, centerY);
		ctx.rotate(angle * Math.PI / 180);
		ctx.translate(-centerX, -centerY);
		ctx.fillStyle = 'red';
		ctx.fillRect(drawX, drawY, width, height);
		ctx.restore();
	}
	
	ctx.fillStyle = 'black';
	ctx.beginPath();
	ctx.arc(mouse.pos.x, mouse.pos.y, 50, 0, 360);
	ctx.fill();
	
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.arc(mouse.pos.x, mouse.pos.y, 20, 0, 360);
	ctx.fill();
	
	_drawTextWithShadow(customText);
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
	
	customText = createText('customtexty', 0, 0, 100);
	selectedItem = customText;
	
	window.requestAnimationFrame(loop);
});