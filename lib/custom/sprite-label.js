import {
	Sprite,
	SpriteMaterial,
	Texture,
	LinearFilter
} from 'three';

export default class extends Sprite {
	constructor(text = '', textHeight = 10, color = 'rgba(255, 255, 255, 1)') {
		super(new SpriteMaterial({ map: new Texture() }));

		this._text = text;
		this._textHeight = textHeight;
		this._color = color;

		this._fontFace = 'Arial';
		this._fontSize = 90; // defines text resolution

		this._canvas = document.createElement('canvas');
		this._texture = this.material.map;
		this._texture.minFilter = LinearFilter;

		this._genCanvas();
	}

	get text() { return this._text; }
	set text(text) { this._text = text; this._genCanvas(); }
	get textHeight() { return this._textHeight; }
	set textHeight(textHeight) { this._textHeight = textHeight; this._genCanvas(); }
	get color() { return this._color; }
	set color(color) { this._color = color; this._genCanvas(); }
	get fontFace() { return this._fontFace; }
	set fontFace(fontFace) { this._fontFace = fontFace; this._genCanvas(); }
	get fontSize() { return this._fontSize; }
	set fontSize(fontSize) { this._fontSize = fontSize; this._genCanvas(); }

	_genCanvas() {
		const canvas = this._canvas;
		const ctx = canvas.getContext('2d');

		const font = `normal ${this.fontSize}px ${this.fontFace}`;

		ctx.font = font;
		const textWidth = ctx.measureText(this.text).width;
		canvas.width = textWidth;
		canvas.height = this.fontSize;

		ctx.font = font;
		ctx.fillStyle = this.color;
		ctx.textBaseline = 'bottom';
		ctx.fillText(this.text, 0, canvas.height);

		// Inject canvas into sprite
		this._texture.image = canvas;
		this._texture.needsUpdate = true;

		this.scale.set(this.textHeight * canvas.width / canvas.height, this.textHeight);
	}

	clone() {
		return new this.constructor(this.text, this.textHeight, this.color).copy(this);
	}

	copy(source) {
		Sprite.prototype.copy.call(this, source);

		this.color = source.color;
		this.fontFace = source.fontFace;
		this.fontSize = source.fontSize;

		return this;
	}
}