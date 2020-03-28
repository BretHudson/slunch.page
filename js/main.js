Element.prototype.on = function(type, func, options) {
	type.split(' ').forEach(t => this.addEventListener(t, func, options));
};
document.on = Element.prototype.on;
window.on = Element.prototype.on;

Array.prototype.remove = function(item) {
	this.splice(this.indexOf(item), 1);
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
	
	static getSide(a, b, point) {
		return (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
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
		if (Math.abs(rad) < 0.00001) return this;
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
	
	compareAnglesDeg(other) {
		return this.compareAngles(other) * 180 / Math.PI;
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

V2.zero = new V2();
V2.one = new V2(1, 1);

const _rectTempPos = new V2();
const _rectTempPos2 = new V2();
class Rect {
	constructor(x = 0, y = 0, w = 0, h = 0) {
		this.pos = new V2();
		this.size = new V2();
		this.angle = 0;
		
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	
	containsV2(v) {
		const point = _rectTempPos.setV2(this.pos).subtractV2(v).rotateDeg(-this.angle).addV2(this.pos);
		const isInside = ((point.x >= this.left) && (point.y >= this.top) && (point.x <= this.right) && (point.y <= this.bottom));
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
	
	set x(val) { this.pos.x = val; }
	set y(val) { this.pos.y = val; }
	set w(val) { this.size.x = val; }
	set h(val) { this.size.y = val; }
	set angle(val) { this._angle = val; }
	
	get x() { return this.pos.x; }
	get y() { return this.pos.y; }
	get w() { return this.size.x; }
	get h() { return this.size.y; }
	get angle() { return this._angle; }
	
	get left() { return this.pos.x - (this.w >> 1); }
	get top() { return this.pos.y - (this.h >> 1); }
	get right() { return this.pos.x + (this.w >> 1); }
	get bottom() { return this.pos.y + (this.h >> 1); }
};

const Draw = {
	tempPos: new V2(),
	centerPos: new V2(),
	drawPos: new V2(),
	line: (x, y, x2, y2, color = 'magenta', lineWidth = 1) => {
		ctx.save();
		ctx.translate(canvasCenter.x, canvasCenter.y);
		
		ctx.setLineDash([5, 15]);
		ctx.strokeStyle = color;
		ctx.lineWidth  = lineWidth;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		
		ctx.restore();
	},
	rect: (x, y, w, h, color = 'magenta', options = {}) => {
		const { centered } = options;
		const angle = options.angle || 0;
		const absolute = options.absolute || false;
		const stroke = options.stroke || 0;
		
		const offset = Draw.tempPos.set(w >> 1, h >> 1);
		const centerPos = Draw.centerPos.set(x, y);
		const drawPos = Draw.drawPos.setV2(centerPos);
		if (centered === true)
			drawPos.subtractV2(offset);
		
		ctx.save();
		if (absolute !== true)
			ctx.translate(canvasCenter.x, canvasCenter.y);
		
		if (angle !== 0) {
			ctx.translate(centerPos.x, centerPos.y);
			ctx.rotate(angle * Math.PI / 180);
			ctx.translate(-centerPos.x, -centerPos.y);
		}
		
		if (stroke > 0) {
			ctx.lineWidth = stroke;
			ctx.strokeStyle = color;
			// const size = 1;
			// ctx.setLineDash([size * stroke, size * 3 * stroke]);
			ctx.strokeRect(drawPos.x, drawPos.y, w, h);
		} else {
			ctx.fillStyle = color;
			ctx.fillRect(drawPos.x, drawPos.y, w, h);
		}
		
		ctx.restore();
	},
	circle: (x, y, radius, color = 'magenta', options = {}) => {
		const stroke = options.stroke || 0;
		
		ctx.fillStyle = color;
		
		ctx.save();
		ctx.translate(canvasCenter.x, canvasCenter.y);
		
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 360);
		
		if (stroke > 0) {
			ctx.lineWidth = stroke;
			ctx.strokeStyle = color;
			ctx.stroke();
		} else {
			ctx.fill();
		}
		
		ctx.restore();
	},
	text: (x, y, size, str, color = 'magenta', options = {}) => {
		ctx.font = getFont(size);
		
		const stroke = options.stroke || 0;
		const angle = options.angle || 0;
		
		ctx.save();
		ctx.translate(canvasCenter.x, canvasCenter.y);
		
		if (angle !== 0) {
			ctx.translate(x, y);
			ctx.rotate(angle * Math.PI / 180);
			ctx.translate(-x, -y);
		}
		
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

const CORNERS = [
	{ x: 1, y: -1 },
	{ x: 1, y: 1 },
	{ x: -1, y: 1 },
	{ x: -1, y: -1 }
];

const strArrToObj = arr => arr.reduce((acc, str, index) => {
	acc[str.toUpperCase()] = index;
	return acc;
}, {});

const APP_STATES = strArrToObj([
	'NONE',
	'ITEM_SELECTED',
	
	'NUM'
]);

const ITEM_STATES = strArrToObj([
	'NONE',
	'SELECTED',
	'MOVING',
	'ROTATING',
	'RESIZING',
	
	'NUM'
]);

const ITEMS = {
	TEXT: 'text'
};

let customText;
let selectedItem = null;
const itemsInScene = [];
const itemPool = {};
Object.values(ITEMS).forEach(type => itemPool[type] = []);

let appState = APP_STATES.NONE;

let mainElem;
let uploadForm;
let image, background;
let inputText;
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
	
	const setTouchPosRaw = e => {
		const touch = e.touches[0];
		mouse.posRaw.set(touch.clientX, touch.clientY).subtractV2(canvasScreenPos);
	};
	
	canvas.on('mousedown', e => {
		mouse.state = 3;
		setMousePosRaw(e);
	});
	
	canvas.on('touchstart', e => {
		mouse.state = 3;
		setTouchPosRaw(e);
	}, {
		passive: true
	});
	
	document.on('mousemove', setMousePosRaw);
	
	document.on('touchmove', setTouchPosRaw);
	
	document.on('mouseup', e => {
		mouse.state = 1;
		setMousePosRaw(e);
	});
	
	document.on('touchend', e => {
		mouse.state = 1;
	});
	
	document.on('keydown', e => {
		switch (e.keyCode) {
			case 37:
			case 38:
			case 39:
			case 40: {
				if (inputText === document.activeElement) {
					e.preventDefault();
					return false;
				}
			} break;
		}
	});
	
	inputText.on('focus', e => {
		if (selectedItem !== null) {
			switch (selectedItem.type) {
				case ITEMS.TEXT: {
					
				} break;
				
				default: {
					inputText.blur();
				} break;
			}
		}
	});
	
	inputText.on('input change', e => {
		selectedItem.str = inputText.value;
	});
	
	inputText.on('blur', e => {
		if (selectedItem !== null) {
			switch (selectedItem.type) {
				case ITEMS.TEXT: {
					inputText.focus();
				} break;
			}
		}
	});
};

const getFont = size => ctx.font = `${size}pt "Bubblegum Sans"`;

const drawTextWithShadow = (str, x, y, size, angle) => {
	const offset = tempPos.set(size / 12, size / 12).rotateDeg(angle);
	const options = { angle };
	Draw.text(x + offset.x, y + offset.y, size, str, '#C5C5C5', options);
	Draw.text(x, y, size, str, '#fff', options);
}

const drawTextWithOutline = (str, x, y, size, angle) => {
	const options = { angle, stroke: size / 8 };
	Draw.text(x, y, size, str, '#000', options);
	delete options.stroke;
	Draw.text(x, y, size, str, '#ff0', options);
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
	
	mouse.posRaw.setV2(canvasCenter).divideScalar(canvasRatio);
};

const resize = e => {
	setCanvasSize(canvas.width, canvas.height);
};

const drawTextItem = textObj => {
	const { str, transform } = textObj;
	const { pos, rect, size, width, height, angle } = transform;
	
	const drawWidth = Math.max(width, size * 0.25);
	
	if (textObj.attr.hover) {
		Draw.rect(pos.x, pos.y, drawWidth, height, 'rgba(255, 255, 255, 0.25)', {
			centered: true,
			angle
		});
		Draw.rect(pos.x, pos.y, drawWidth, height, 'white', {
			centered: true,
			angle,
			stroke: 3
		});
	}
	
	if (textObj.state === ITEM_STATES.SELECTED) {
		Draw.rect(pos.x, pos.y, drawWidth, height, 'rgba(255, 255, 255, 0.25)', {
			centered: true,
			angle
		});
		Draw.rect(pos.x, pos.y, drawWidth, height, 'white', {
			centered: true,
			angle,
			stroke: 3
		});
	}
	
	switch (textObj.state) {
		case ITEM_STATES.SELECTED:
		case ITEM_STATES.ROTATING: {
			const offset = tempPos.setV2(rect.size).divideScalar(2);
			const corner = tempPos2;
			const color = textObj.attr.hoverResize ? 'magenta' : 'white';
			CORNERS.forEach(c => {
				corner.setV2(offset);
				corner.x *= c.x;
				corner.y *= c.y;
				corner.rotateDeg(angle).addV2(pos);
				Draw.circle(corner.x, corner.y, 15, color, {
					stroke: 4
				});
			});
		}
	}
	
	// drawTextWithShadow(str, pos.x, pos.y, size, angle);
	drawTextWithOutline(str, pos.x, pos.y, size, angle);
	
	switch (textObj.state) {
		case ITEM_STATES.SELECTED:
		case ITEM_STATES.ROTATING: {
			const offset = tempPos.set(0, -((rect.h * 0.5) + 50)).rotateDeg(angle);
			const circlePos = tempPos2.setV2(pos).addV2(offset);
			
			const color = (textObj.attr.hoverRotate) ? 'lime' : 'grey';
			Draw.circle(circlePos.x, circlePos.y, 30, 'white');
			Draw.circle(circlePos.x, circlePos.y, 25, color);
		} break;
	}
};

const getSizeOfStr = (str, size) => {
	if (str.length > 0) {
		measureDiv.textContent = str;
		measureDiv.style.font = getFont(size);
		
		const rect = measureDiv.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height
		};
	} else {
		measureDiv.textContent = 'a';
		measureDiv.style.font = getFont(size);
		
		const rect = measureDiv.getBoundingClientRect();
		return {
			width: 0,
			height: rect.height
		};
	}
};

const HEIGHT_TO_SIZE = 1 / 1.54;
const _createText = (str, x, y, size) => {
	const text = {
		type: ITEMS.TEXT,
		_str: str,
		get str() {
			return this._str;
		},
		set str(value) {
			this._str = value.replace(/\t|\r\n|\n|\r/g, ' ');
			this.transform._resize();
		},
		state: ITEM_STATES.NONE,
		attr: {
			hover: false,
			hoverRotate: false,
			hoverResize: false
		},
		transform: {
			parent: null,
			_temp: new V2(),
			rect: new Rect(x, y, 100, 100),
			delta: {
				transform: null,
				pos: new V2(),
				startAngle: 0,
				angle: 0,
				beginRotate: function(angle) {
					this.angle = angle;
					this.startAngle = angle;
				}
			},
			_size: 0,
			endDrag() {
				this.rect.pos.addV2(this.delta.pos);
				this.delta.pos.set(0, 0);
				
				this.rect.angle += this.delta.angle - this.delta.startAngle;
				this.delta.angle = this.delta.startAngle = 0;
			},
			_resize() {
				const { width, height } = getSizeOfStr(this.parent.str, this.size);
				this.rect.setSize(width, height);
			},
			get width() {
				return this.rect.w;
			},
			get height() {
				return this.rect.h;
			},
			get size() {
				return this._size;
			},
			set size(val) {
				this._size = val;
				this._resize();
			},
			get pos() {
				return this._temp.setV2(this.rect.pos).addV2(this.delta.pos);
			},
			get angle() {
				return this.rect.angle + this.delta.angle - this.delta.startAngle;
			},
			set angle(val) {
				this.rect.angle = val;
			}
		}
	};
	
	const { transform } = text;
	const { delta } = transform;
	
	transform.parent = text;
	transform.size = size;
	delta.transform = transform;
	
	delta.beginRotate = delta.beginRotate.bind(delta);
	
	return text;
};

const createText = (str, x, y, size) => {
	const text = itemPool[ITEMS.TEXT].pop() || _createText(str, x, y, size);
	
	const { transform } = text;
	
	transform.rect.x = x;
	transform.rect.y = y;
	transform.size = size;
	
	text.str = str;
	
	return text;
};

const addToScene = item => {
	itemsInScene.push(item);
};

const removeFromScene = item => {
	itemsInScene.remove(item);
	
	itemPool[item.type].push(item);
};

const selectItem = item => {
	selectedItem = item;
	
	switch (selectedItem.type) {
		case ITEMS.TEXT: {
			inputText.focus();
			inputText.value = selectedItem.str;
		} break;
	}
	
	selectedItem.state = ITEM_STATES.SELECTED;
	
	appState = APP_STATES.ITEM_SELECTED;
};

const deselectItem = () => {
	appState = APP_STATES.NONE;
	
	selectedItem.state = ITEM_STATES.NONE;
	
	switch (selectedItem.type) {
		case ITEMS.TEXT: {
			if (selectedItem.str.length === 0) {
				removeFromScene(selectedItem);
			}
		} break;
	}
	
	selectedItem = null;
};

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

const updateStateNone = dt => {
	for (let i = itemsInScene.length; i--; ) {
		const { attr } = itemsInScene[i];
		attr.hover = false;
		attr.hoverResize = false;
		attr.hoverRotate = false;
	}
	
	let hoveredItem = null;
	for (let i = itemsInScene.length; i--; ) {
		const { attr, transform } = itemsInScene[i];
		const { rect } = transform;
		if (attr.hover = rect.containsV2(mouse.pos)) {
			hoveredItem = itemsInScene[i];
			break;
		}
	}
	
	if (mouse.pressed) {
		if (hoveredItem !== null) {
			selectItem(hoveredItem);
		}
	}
};

const resizeItem = item => {
	const transform = item.transform;
	
	{
		Draw.rect(transform.pos.x, transform.pos.y, transform.width, transform.height, '#ccc', {
			angle: selectedItem.transform.angle,
			centered: true,
			stroke: Math.max(5, selectedItem.transform.size / 75)
		});
		
		tempPos.setV2(mouse.pos).subtractV2(selectedItem.transform.delta.pos);
		const isInside = transform.rect.containsV2(tempPos);
		const color = (isInside) ? 'green' : 'red';
		Draw.circle(transform.pos.x, transform.pos.y, 20, color);
	}
	
	Draw.circle(mouse.pos.x, mouse.pos.y, 15, 'blue');
	Draw.circle(mouse.pos.x, mouse.pos.y, 10, 'white');
	Draw.circle(mouse.pos.x, mouse.pos.y, 5, 'blue');
	
	// if (draggingRect === true)
	{
		const drawPos = tempPos3.setV2(transform.pos);
		
		const centerToMouse = tempPos.setV2(mouse.pos).subtractV2(transform.pos).rotateDeg(-transform.angle);
		const centerToCorner = tempPos2.setV2(transform.rect.size).multiplyScalar(0.5);
		
		centerToCorner.x = centerToCorner.x * Math.sign(centerToMouse.x);
		centerToCorner.y = centerToCorner.y * Math.sign(centerToMouse.y);
		
		const mouseIsRightOfLine = V2.getSide(V2.zero, centerToCorner, centerToMouse) > 0;
		const mouseIsRightOfLineColor = mouseIsRightOfLine ? 'cyan' : 'magenta';
		
		centerToCorner.rotateDeg(transform.angle);
		Draw.line(drawPos.x, drawPos.y, mouse.pos.x, mouse.pos.y, 'white', 4);
		Draw.line(drawPos.x, drawPos.y, drawPos.x + centerToCorner.x, drawPos.y + centerToCorner.y, mouseIsRightOfLineColor, 8);
		
		const sign = Math.sign(centerToMouse.x * centerToMouse.y);
		let useHeight;
		if (sign === 1) {
			useHeight = mouseIsRightOfLine;
		} else {
			useHeight = !mouseIsRightOfLine;
		}
		
		let newHeight;
		if (useHeight) {
			newHeight = Math.abs(centerToMouse.y) * 2;
		} else {
			const width = Math.abs(centerToMouse.x) * 2;
			newHeight = width * transform.height / transform.width;
		}
		newHeight = Math.max(newHeight, 50);
		selectedItem.transform.size = newHeight * HEIGHT_TO_SIZE;
	}
}

const updateStateItemSelected = dt => {
	for (let i = itemsInScene.length; i--; ) {
		const { attr } = itemsInScene[i];
		attr.hover = false;
		attr.hoverResize = false;
		attr.hoverRotate = false;
	}
	
	const selectedTransform = selectedItem.transform;
	
	const { transform } = selectedItem;
	const { pos, rect, size, angle } = transform;
	
	{
		const offset = tempPos.set(0, -((rect.h * 0.5) + 50)).rotateDeg(angle);
		const circlePos = tempPos2.setV2(pos).addV2(offset);
		
		selectedItem.attr.hoverRotate =
			(circlePos.compareDistance(mouse.pos) < 30);
	}
	
	{
		const offset = tempPos.setV2(rect.size).divideScalar(2);
		const corner = tempPos2;
		for (let c = 0; c < 4; ++c) {
			corner.setV2(offset);
			corner.x *= CORNERS[c].x;
			corner.y *= CORNERS[c].y;
			corner.rotateDeg(angle).addV2(pos);
			if (corner.compareDistance(mouse.pos) < 18) {
				selectedItem.attr.hoverResize = true;
				break;
			}
		}
	}
	
	if (mouse.pressed === true) {
		// TODO(bret): What kind of press?
		
		if (false) {
			
		} else if (selectedItem.attr.hoverResize) {
			selectedItem.state = ITEM_STATES.RESIZING;
		} else if (selectedItem.attr.hoverRotate) {
			selectedItem.state = ITEM_STATES.ROTATING;
			const startAngle = selectedItem.transform.rect.pos.compareAnglesDeg(mouse.pos);
			selectedTransform.delta.beginRotate(startAngle);
		} else if (selectedTransform.rect.containsV2(mouse.pos)) {
			selectedItem.state = ITEM_STATES.MOVING;
		} else {
			deselectItem();
			return;
		}
	}
	
	if (selectedItem.state === ITEM_STATES.NONE)
		return;
	
	if (mouse.held === true) {
		switch (selectedItem.state) {
			case ITEM_STATES.SELECTED: {
				// NOTE(bret): Do nothing
			} break;
			
			case ITEM_STATES.MOVING: {
				selectedTransform.delta.pos.setV2(mouse.drag);
			} break;
			
			case ITEM_STATES.ROTATING: {
				// TODO(bret): Should we snap to 90 angles?
				selectedTransform.delta.angle = selectedItem.transform.rect.pos.compareAnglesDeg(mouse.pos);
			} break;
			
			case ITEM_STATES.RESIZING: {
				resizeItem(selectedItem);
			} break;
		}
	}
	
	if (mouse.released === true) {
		switch (selectedItem.state) {
			case ITEM_STATES.MOVING:
			case ITEM_STATES.ROTATING: {
				selectedTransform.endDrag();
			} break;
		}
		
		selectedItem.state = ITEM_STATES.SELECTED;
	}
};

const update = dt => {
	switch (appState) {
		case APP_STATES.NONE: {
			updateStateNone(dt);
		} break;
		
		case APP_STATES.ITEM_SELECTED: {
			updateStateItemSelected(dt);
		} break;
	}
};

const updateEnd = dt => {
	mouse.state &= ~1;
};

const DEBUG_RENDER_IMAGES = false;
const DEBUG_RENDER_PROJECTION = false;
const render = dt => {
	Draw.rect(0, 0, canvasSize.x, canvasSize.y, 'black', {
		absolute: true
	});
	
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	
	if (DEBUG_RENDER_IMAGES) {
		drawBackground();
		drawImage();
	}
	
	if (DEBUG_RENDER_PROJECTION) {
		const line = new V2(500, 150);
		const proj = V2.project(mouse.pos, line);
		
		const mouseIsRightOfLine = V2.getSide(V2.zero, line, mouse.pos) > 0;
		
		Draw.line(0, 0, mouse.pos.x, mouse.pos.y, (mouseIsRightOfLine) ? 'green' : 'blue', 5);
		Draw.line(0, 0, line.x, line.y, 'pink', 5);
		Draw.line(0, 0, proj.x, proj.y, 'red', 5);
	}
	
	if (false) {
		const { str, transform } = selectedItem;
		const { pos, delta, size, angle, width, height } = transform;
		
		Draw.rect(pos.x, pos.y, width, height, 'red', {
			centered: true,
			angle: transform.angle
		});
	}
	
	for (let i = itemsInScene.length; i--; ) {
		drawTextItem(itemsInScene[i]);
	}
	
	return;
	
	const transform = selectedItem.transform;
	
	{
		Draw.rect(transform.pos.x, transform.pos.y, transform.width, transform.height, '#ccc', {
			angle: selectedItem.transform.angle,
			centered: true,
			stroke: Math.max(5, selectedItem.transform.size / 75)
		});
		
		tempPos.setV2(mouse.pos).subtractV2(selectedItem.transform.delta.pos);
		const isInside = transform.rect.containsV2(tempPos);
		const color = (isInside) ? 'green' : 'red';
		Draw.circle(transform.pos.x, transform.pos.y, 20, color);
	}
	
	Draw.circle(mouse.pos.x, mouse.pos.y, 15, 'blue');
	Draw.circle(mouse.pos.x, mouse.pos.y, 10, 'white');
	Draw.circle(mouse.pos.x, mouse.pos.y, 5, 'blue');
	
	{
		const drawPos = tempPos3.setV2(transform.pos);
		
		const centerToMouse = tempPos.setV2(mouse.pos).subtractV2(transform.pos).rotateDeg(-transform.angle);
		const centerToCorner = tempPos2.setV2(transform.rect.size).multiplyScalar(0.5);
		
		centerToCorner.x = centerToCorner.x * Math.sign(centerToMouse.x);
		centerToCorner.y = centerToCorner.y * Math.sign(centerToMouse.y);
		
		const mouseIsRightOfLine = V2.getSide(V2.zero, centerToCorner, centerToMouse) > 0;
		const mouseIsRightOfLineColor = mouseIsRightOfLine ? 'cyan' : 'magenta';
		
		centerToCorner.rotateDeg(transform.angle);
		Draw.line(drawPos.x, drawPos.y, mouse.pos.x, mouse.pos.y, 'white', 4);
		Draw.line(drawPos.x, drawPos.y, drawPos.x + centerToCorner.x, drawPos.y + centerToCorner.y, mouseIsRightOfLineColor, 8);
		
		const sign = Math.sign(centerToMouse.x * centerToMouse.y);
		let useHeight;
		if (sign === 1) {
			useHeight = mouseIsRightOfLine;
		} else {
			useHeight = !mouseIsRightOfLine;
		}
		
		let newHeight;
		if (useHeight) {
			newHeight = Math.max(Math.abs(centerToMouse.y) * 2, 100);
		} else {
			const width = Math.max(Math.abs(centerToMouse.x) * 2, 100);
			newHeight = width * transform.height / transform.width;
		}
		selectedItem.transform.size = newHeight * HEIGHT_TO_SIZE;
	}
};

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

window.on('DOMContentLoaded', e => {
	hue = (new Date() / 10);
	window.requestAnimationFrame(change);
	
	mainElem = document.querySelector('main');
	
	uploadForm = document.querySelector('label[for="image-upload"]');
	
	const measureDivParent = document.createElement('div');
	measureDivParent.classList.add('measureDivParent');
	mainElem.appendChild(measureDivParent);
	
	measureDiv.style.visibility = 'hidden';
	measureDiv.style.position = 'absolute';
	measureDiv.style.left = 0;
	measureDiv.style.top = 0;
	measureDiv.style.whiteSpace = 'pre';
	measureDiv.style.float = 'left';
	measureDivParent.appendChild(measureDiv);
	
	inputText = document.querySelector('input[name=text-input]');
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	addCanvasEvents();
	
	// NOTE(bret): Need to wait for the actual canvas to show up
	window.requestAnimationFrame(() => {
		setCanvasSize(INIT_WIDTH, INIT_HEIGHT);
	});
	
	const imageUpload = document.getElementById('image-upload');
	imageUpload.on('change', e => readFile(e.target.files[0]), false);
	
	const button = document.querySelector('button');
	button.on('click', e => {
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
	
	customText = createText('Yay', 0, 0, 100);
	customText.transform.angle = 0;
	
	// addToScene(text1, text2, customText);
	// addToScene(text1, text2);
	// addToScene(text1);
	addToScene(customText);
	
	selectItem(customText);
	
	window.requestAnimationFrame(loop);
});

const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

const emojiStr = 'a 😭 l';


window.on('resize', resize);