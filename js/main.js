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
let canvasScreenPos = new V2(0, 0);
let canvasScreenSize = new V2(0, 0);

const tempPos = new V2(0, 0);
const tempPos2 = new V2(0, 0);
const drawPos = new V2(0, 0);

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

//const [ INIT_WIDTH, INIT_HEIGHT ] = [ 960, 540 ];
const [ INIT_WIDTH, INIT_HEIGHT ] = [ 1300, 974 ];
const defaultAspectRatio = 16 / 9;
const drawImage = () => {
	const aspectRatio = image.width / image.height;
	let x, y, w, h;
	if (aspectRatio > defaultAspectRatio) {
		w = canvasSize.x;
		h = canvasSize.x / aspectRatio;
		x = 0;
		y = (canvasSize.y - h) >> 1;
	} else {
		w = canvasSize.y * aspectRatio;
		h = canvasSize.y;
		x = (canvasSize.x - w) >> 1;
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
	const setMousePosRaw = e => {
		mouse.posRaw.set(e.clientX, e.clientY).subtractV2(canvasScreenPos);
	};
	
	canvas.on('mousedown', e => {
		mouse.state = 3;
		setMousePosRaw(e);
	});
	
	canvas.on('mousemove', setMousePosRaw);
	
	canvas.on('mouseup', e => {
		mouse.state = 1;
		setMousePosRaw(e);
	});
};

const setFont = size => ctx.font = `${size}px "Bubblegum Sans"`;

const drawTextWithShadow = (str, x, y, size, angle) => {
	const offset = size / 12;
	
	setFont(size);
	
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

const canvasSize = new V2(0, 0);
const canvasCenter = new V2(0, 0);
const setCanvasSize = (w, h) => {
	canvas.width = w;
	canvas.height = h;
	
	let canvasRect = canvas.getBoundingClientRect();
	canvasScreenPos.set(canvasRect.x, canvasRect.y);
	canvasScreenSize.set(canvasRect.width, canvasRect.height);
	canvasRatio = w / canvasScreenSize.x;
	
	canvasSize.set(w, h);
	canvasCenter.set(w >> 1, h >> 1);
};

const _drawTextWithShadow = textObj => {
	const { str, transform } = textObj;
	const { pos, drag, size, angle } = transform;
	
	tempPos.setV2(pos).addV2(drag).addV2(canvasCenter);
	drawTextWithShadow(str, tempPos.x, tempPos.y, size, angle);
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
			pos: new V2(x, y),
			drag: new V2(0, 0),
			_size: 0,
			_width: 0,
			_height: 0,
			get size() {
				return this._size;
			},
			set size(val) {
				this._size = val;
				setFont(val);
				const textMetrics = ctx.measureText(this.parent.str);
				this._width = textMetrics.width;
				this._height = textMetrics.actualBoundingBoxDescent + textMetrics.actualBoundingBoxAscent;
				// this._height *= 2.0;
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
		selectedTransform.drag.setV2(mouse.drag);
	}
	
	if (mouse.released === true) {
		selectedTransform.pos.addV2(mouse.drag);
		selectedTransform.drag.set(0, 0);
	}
};

const updateEnd = dt => {
	mouse.state &= ~1;
};

const render = dt => {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvasSize.x, canvasSize.y);
	
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	
	if (background) {
		ctx.drawImage(background, 0, 0, canvasSize.x, canvasSize.y);
	}
	
	if (image)
		drawImage();
	
	// Draw text
	const text1 = document.querySelector('input[name=text-top]').value;
	const text2 = document.querySelector('input[name=text-bottom]').value;
	
	const angle = 10;
	drawTextWithShadow(text1, canvasCenter.x - 230, canvasCenter.y - 120, 100, -angle);
	drawTextWithShadow(text2, canvasCenter.x + 230, canvasCenter.y + 140, 50, angle);
	
	{
		const { str, transform } = customText;
		const { pos, drag, size, angle, width, height } = transform;
		
		const offset = tempPos;
		const centerPos = tempPos2;
		
		offset.set(width >> 1, height >> 1);
		centerPos.setV2(canvasCenter).addV2(pos).addV2(drag);
		drawPos.setV2(centerPos).subtractV2(offset);
		
		ctx.save();
		ctx.translate(centerPos.x, centerPos.y);
		ctx.rotate(angle * Math.PI / 180);
		ctx.translate(-centerPos.x, -centerPos.y);
		ctx.fillStyle = 'red';
		ctx.fillRect(drawPos.x, drawPos.y, width, height);
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
	
	setCanvasSize(INIT_WIDTH, INIT_HEIGHT);
	
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
	
	customText = createText('x', 0, 0, 100);
	selectedItem = customText;
	
	window.requestAnimationFrame(loop);
});