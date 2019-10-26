Element.prototype.on = function(type, func, capture) {
	type.split(' ').forEach(t => this.addEventListener(t, func, capture));
};

class V2 {
	constructor(x = 0, y = 0) {
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
	
	static project(v1, v2) {
		return V2.clone(v2).storeProjection(v1, v2);
	}
	
	static getSide(start, end, point) {
		return ((end.x - start.x) * (point.y - start.y) - (end.y - start.y) * (point.x - start.x));
	}
	
	storeProjection(v1, v2) {
		const dot = V2.dot(v1, v2);
		const magSq = v2.magnitudeSq;
		return this.setV2(v2).multiplyScalar(dot / magSq);
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
		// console.log('in set', { x, y });
		this.x = x;
		this.y = y;
		return this;
	}
	
	setV2(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	}
	
	invert() {
		this.x = -this.x;
		this.y = -this.y;
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
	
	rotateRad(rad) {
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		const x = this.x * cos - this.y * sin;
		this.y = this.x * sin + this.y * cos;
		this.x = x;
		return this;
	}
	
	rotateDeg(deg) {
		return this.rotateRad(deg * Math.PI / 180);
	}
	
	compareAngles(other) {
		return Math.atan2(other.y - this.y, other.x - this.x);
	}
	
	compareDistance(other) {
		return Math.sqrt(((other.x - this.x) * (other.x - this.x)) + ((other.y - this.y) * (other.y - this.y)));
	}
	
	get magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	
	get magnitudeSq() {
		return this.x * this.x + this.y * this.y;
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

const getMethods = (obj) => {
	const properties = new Set();
	let currentObj = obj;
	do {
		Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
	} while ((currentObj = Object.getPrototypeOf(currentObj)));
	return [...properties.keys()].filter(item => typeof obj[item] === 'function');
}

const _rectTempPos = new V2();
const _rectTempPos2 = new V2()
class Rect {
	constructor(x = 0, y = 0, w = 0, h = 0) {
		this.pos = new V2();
		this.size = new V2();
		
		const vectors = [ this.pos, this.size ];
		vectors.forEach(obj => {
			getMethods(obj)
				.slice(1, -6)
				.forEach(m => {
					const func = obj[m].bind(obj);
					obj[m] = (...args) => {
						func(...args);
						this.recalculatePoints();
					};
				});
		});
		
		this.corners = Array.from({ length: 4 }).map(v => new V2());
		this.topLeft = this.corners[0];
		this.topRight = this.corners[1];
		this.bottomRight = this.corners[2];
		this.bottomLeft = this.corners[3];
		
		this.angle = 0;
		
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	
	recalculatePoints() {
		const baseOffset = _rectTempPos.set(this.w >> 1, this.h >> 1);
		const offset = _rectTempPos2.setV2(baseOffset);
		this.topLeft.set(-offset.x, -offset.y);
		this.topRight.set(offset.x, -offset.y);
		this.bottomRight.set(offset.x, offset.y);
		this.bottomLeft.set(-offset.x, offset.y);
		for (let i = 0; i < 4; ++i) {
			if (this.angle !== 0) {
				this.corners[i].rotateDeg(this.angle);
			}
			this.corners[i].addV2(this.pos);
		}
	}
	
	containsV2(v) {
		let isInside = true;
		for (let i = 0; i < 4; ++i) {
			if (V2.getSide(testRect.corners[i], testRect.corners[(i + 1) % 4], v) < 0) {
				isInside = false;
				break;
			}
		}
		return isInside;
	}
	
	rotate(deg) {
		this.angle += deg;
	}
	
	setPos(x, y) {
		this.x = x;
		this.y = y;
	}
	
	setSize(w, h) {
		this.w = w;
		this.h = h;
	}
	
	set(x, y, w, h) {
		this.setPos(x, y);
		this.setSize(w, h);
	}
	
	move(x, y) {
		this.x += x;
		this.y += y;
	}
	
	moveV2(v) {
		this.move(v.x, v.y);
	}
	
	set x(val) {
		this.pos.x = val;
		this.recalculatePoints();
	}
	
	set y(val) {
		this.pos.y = val;
		this.recalculatePoints();
	}
	
	set w(val) {
		this.size.x = val;
		this.recalculatePoints();
	}
	
	set h(val) {
		this.size.y = val;
		this.recalculatePoints();
	}
	
	set angle(val) {
		this._angle = val;
		this.recalculatePoints();
	}
	
	get x() { return this.pos.x; }
	get y() { return this.pos.y; }
	get w() { return this.size.x; }
	get h() { return this.size.y; }
	get angle() { return this._angle; }
	
	get left() { return this.topLeft.x; }
	get top() { return this.topLeft.y; }
	get right() { return this.bottomRight.x; }
	get bottom() { return this.bottomRight.y; }
};

const Draw = {
	tempPos: new V2(),
	centerPos: new V2(),
	drawPos: new V2(),
	line: (x, y, x2, y2, color = 'magenta', lineWidth = 1) => {
		
		ctx.save();
		
		ctx.translate(canvasCenter.x, canvasCenter.y);
		
		ctx.strokeStyle = color;
		ctx.lineWidth  = lineWidth;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		
		ctx.restore();
	},
	rect: (x, y, w, h, color = 'magenta', fill = true, options = {}) => {
		const { centered } = options;
		const angle = options.angle || 0;
		const absolute = options.absolute || false;
		
		const offset = Draw.tempPos.set(w >> 1, h >> 1);
		const centerPos = Draw.centerPos.set(x, y);
		const drawPos = Draw.drawPos.setV2(centerPos);
		if (centered === true)
			drawPos.subtractV2(offset);
		
		ctx.save();
		
		if (angle !== 0) {
			ctx.translate(centerPos.x, centerPos.y);
			ctx.rotate(angle * Math.PI / 180);
			ctx.translate(-centerPos.x, -centerPos.y);
		}
		
		if (absolute !== true)
			ctx.translate(canvasCenter.x, canvasCenter.y);
		
		if (fill === true) {
			ctx.fillStyle = color;
			ctx.fillRect(drawPos.x, drawPos.y, w, h);
		} else {
			ctx.strokeStyle = color;
			ctx.strokeRect(drawPos.x, drawPos.y, w, h);
		}
		
		ctx.restore();
	},
	circle: (x, y, radius, color = 'magenta') => {
		ctx.fillStyle = color;
		
		ctx.save();
		
		ctx.translate(canvasCenter.x, canvasCenter.y);
		
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 360);
		ctx.fill();
		
		ctx.restore();
	},
	text: (x, y, size, str, color = 'magenta', options = {}) => {
		ctx.font = getFont(size);
		
		const stroke = options.stroke || 0;
		const angle = options.angle || 0;
		
		ctx.save();
		
		if (angle !== 0) {
			ctx.translate(x, y);
			ctx.rotate(angle * Math.PI / 180);
			ctx.translate(-x, -y);
		}
		
		ctx.translate(canvasCenter.x, canvasCenter.y);
		
		if (stroke > 0) {
			ctx.lineWidth = stroke;
			ctx.strokeStyle = color;
			ctx.strokeText(str, x, y);
		} else {
			ctx.fillStyle = color;
			ctx.fillText(str, x, y);
		}
		
		ctx.restore();
	}
};

let mainElem;
let uploadForm;
let image, background;
let canvas, ctx;
let canvasScreenPos = new V2();
let canvasScreenSize = new V2();

const tempPos = new V2();
const tempPos2 = new V2();
const tempPos3 = new V2();

const measureDiv = document.createElement('span');

let page;
let hue, last = null;
const change = timestamp => {
	if (last === null)
		last = timestamp;
	const dt = timestamp - last;
	last = timestamp;
	hue += dt / 10;
	hue -= Math.floor(hue / 360) * 360;
	document.body.style.setProperty('--color', `hsl(${Math.round(hue)}, 100%, 40%)`);
	window.requestAnimationFrame(change);
};

//const [ INIT_WIDTH, INIT_HEIGHT ] = [ 960, 540 ];
const [ INIT_WIDTH, INIT_HEIGHT ] = [ 1300, 974 ];
const defaultAspectRatio = 16 / 9;
const drawBackground = () => {
	if (background) {
		ctx.drawImage(background, 0, 0, canvasSize.x, canvasSize.y);
	}
};

const drawImage = () => {
	if (image) {
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
	}
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
	posRaw: new V2(),
	startRaw: new V2(),
	dragRaw: new V2(),
	pos: new V2(),
	start: new V2(),
	drag: new V2(),
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

const getFont = size => ctx.font = `${size}pt "Bubblegum Sans"`;

const drawTextWithShadow = (str, x, y, size, angle) => {
	const offset = tempPos.set(size / 12, size / 12);
	
	if (angle !== 0)
		offset.rotateDeg(angle);
	
	const options = { angle };
	Draw.text(x + offset.x, y + offset.y, size, str, '#C5C5C5', options);
	Draw.text(x, y, size, str, '#fff', options);
}

const canvasSize = new V2();
const canvasCenter = new V2();
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

const resize = e => {
	setCanvasSize(canvas.width, canvas.height);
};

const drawTextItem = textObj => {
	const { str, transform } = textObj;
	const { pos, drag, size, angle } = transform;
	
	const drawPos = tempPos.setV2(pos).addV2(drag);
	drawTextWithShadow(str, drawPos.x, drawPos.y, size, angle);
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
			rect: new Rect(x, y, 100, 100),
			drag: new V2(),
			_size: 0,
			_width: 0,
			_height: 0,
			get size() {
				return this._size;
			},
			set size(val) {
				this._size = val;
				
				measureDiv.textContent = str;
				measureDiv.style.font = getFont(val);
				
				const rect = measureDiv.getBoundingClientRect();
				this._width = rect.width;
				this._height = rect.height;
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
	text.transform.pos = text.transform.rect.pos;
	
	return text;
};

let customText;
let selectedItem = customText;
const itemsInScene = [];

let lastRender;
const updateBegin = dt => {
	mouse.pos.setV2(mouse.posRaw).multiplyScalar(canvasRatio).subtractV2(canvasCenter);
	
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
	
	const text1 = document.querySelector('input[name=text-top]').value;
	const text2 = document.querySelector('input[name=text-bottom]').value;
	itemsInScene[0].str = text1;
	itemsInScene[1].str = text2;
	
	if (mouse.released === true) {
		selectedTransform.pos.addV2(mouse.drag);
		selectedTransform.drag.set(0, 0);
	}
	
	const testRect = customText.transform.rect;
	if (mouse.pressed) {
		if (testRect.containsV2(mouse.pos)) {
			draggingRect = true;
		}
	}
	
	if (draggingRect === true) {
		const centerToMouse = tempPos.set(mouse.pos).subtractV2(testRect.pos);
		Draw.line(testRect.x, testRect.y, centerToMouse.x, centerToMouse.y, 'purple');
	}
};

const updateEnd = dt => {
	mouse.state &= ~1;
};

const DEBUG_RENDER_IMAGES = false;
const DEBUG_RENDER_PROJECTION = false;
const render = dt => {
	Draw.rect(0, 0, canvasSize.x, canvasSize.y, 'black', true, {
		absolute: true
	});
	
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	
	if (DEBUG_RENDER_IMAGES) {
		drawBackground();
		drawImage();
	}
	
	if (DEBUG_RENDER_PROJECTION) {
		const A = V2.clone(mouse.pos);
		const B = new V2(500, 150);
		const C = V2.project(A, B);
		
		Draw.line(0, 0, A.x, A.y, 'blue', 5);
		Draw.line(0, 0, B.x, B.y, 'pink', 5);
		Draw.line(0, 0, C.x, C.y, 'red', 5);
	}
	
	{
		const { str, transform } = selectedItem;
		const { pos, drag, size, angle, width, height } = transform;
		
		tempPos.setV2(pos).addV2(drag);
		
		Draw.rect(tempPos.x, tempPos.y, width, height, 'red', true, {
			centered: true
		});
	}
	
	for (let i = itemsInScene.length; i--; ) {
		drawTextItem(itemsInScene[i]);
	}
	
	const testRect = customText.transform.rect;
	
	{
		const { topLeft, topRight, bottomRight, bottomLeft } = testRect;
		const x1 = testRect.topLeft.x;
		const y1 = testRect.topLeft.y;
		const x2 = testRect.bottomRight.x;
		const y2 = testRect.bottomRight.y;
		Draw.line(topLeft.x, topLeft.y, topRight.x, topRight.y, 'purple', 5);
		Draw.line(topRight.x, topRight.y, bottomRight.x, bottomRight.y, 'orange', 5);
		Draw.line(bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y, 'blue', 5);
		Draw.line(bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y, 'green', 5);
		
		const isInside = testRect.containsV2(mouse.pos);
		const color = (isInside) ? 'green' : 'red';
		Draw.circle(testRect.x, testRect.y, 20, color);
	}
	
	
	Draw.circle(mouse.pos.x, mouse.pos.y, 15, 'blue');
	Draw.circle(mouse.pos.x, mouse.pos.y, 10, 'white');
	Draw.circle(mouse.pos.x, mouse.pos.y, 5, 'blue');
	
	// if (draggingRect === true)
	{
		const centerToMouse = tempPos.setV2(mouse.pos).subtractV2(testRect.pos);
		const centerToCorner = tempPos2.setV2(testRect.size).multiplyScalar(0.5).rotateDeg(testRect.angle).subtractV2(testRect.pos);
		
		const drawPos = tempPos3.setV2(testRect);
		
		Draw.line(drawPos.x, drawPos.y, mouse.pos.x, mouse.pos.y, 'white', 4);
		
		Draw.line(drawPos.x, drawPos.y, drawPos.x + centerToCorner.x, drawPos.y + centerToCorner.y, 'white', 8);
		
		const C = V2.project(centerToMouse, centerToCorner);
		C.x = Math.abs(C.x);
		C.y = Math.abs(C.y);
		
		const mag = C.magnitude;
		if (mag < 100)
			C.normalize().multiplyScalar(100);
		
		const D = V2.clone(C);
		Draw.line(drawPos.x, drawPos.y, D.x, D.y, 'pink', 4);
		
		
		C.multiplyScalar(2);
		C.rotateDeg(-testRect.angle);
		// testRect.setSize(C.x, C.y);
	}
};

let draggingRect = false;
const testRect = new Rect(800, 200, 200, 100);
testRect.rotate(15);

const loop = t => {
	if (lastRender === undefined)
		lastRender = t;
	
	const dt = (t - lastRender) * 0.001;
	lastRender = t;
	
	updateBegin(dt);
	update(dt);
	updateEnd(dt);
	
	render(dt);
	
	window.requestAnimationFrame(loop);
};

window.addEventListener('DOMContentLoaded', e => {
	measureDiv.style.visibility = 'hidden';
	measureDiv.style.whiteSpace = 'nowrap';
	measureDiv.style.float = 'left';
	document.body.appendChild(measureDiv);
	
	hue = (new Date() / 10);
	window.requestAnimationFrame(change);
	
	mainElem = document.querySelector('main');
	
	uploadForm = document.querySelector('label[for="image-upload"]');
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	// NOTE(bret): Otherwise the mouse position is a bit off... :/
	window.requestAnimationFrame(() => {
		setCanvasSize(INIT_WIDTH, INIT_HEIGHT);
	});
	
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
	
	background = loadImage('img/background.jpg');
	loadLunchImage('img/slunch.jpg');
	
	addDragDropEvents();
	
	const angle = 10;
	
	const text1 = createText('SLUNCH', -300, -160, 100);
	text1.transform.angle = -angle;
	
	const text2 = createText('is served', 300, 190, 50);
	text2.transform.angle = angle;
	
	customText = createText('Yxy', 0, 0, 100);
	customText = createText('Yxy', 250, -100, 100);
	customText.transform.angle = 0;
	
	itemsInScene.push(text1, text2, customText);
	
	selectedItem = customText;
	
	window.requestAnimationFrame(loop);
});

window.addEventListener('resize', resize);