import BaseComponent from '../util/base-component';
import { buildAttributeCallback, } from '../util/dom';
import style from './color-input.css';
import markup from './color-input.html';

export default class ColorInput extends BaseComponent {
  static get tag() {
    return 'color-input';
  }

  static get observedAttributes() {
    return [ 'value', 'id', ];
  }

  constructor() {
    super(style, markup, [ 'colorinput', 'deselect', ]);
    this.value = null;
    this.dom.colorinput.addEventListener('change', (event) => {
      this.value = event.target.value;
      this.onChange(event);
    });
    this.dom.deselect.addEventListener('click', () => {
      if (this.value) {
        this.value = null;
        this.dom.deselect.classList.add('deselect-active');
        this.dom.colorinput.setAttribute('disabled', true);
      } else {
        this._setValue('#000000');
        this.dom.deselect.classList.remove('deselect-active');
        this.dom.colorinput.removeAttribute('disabled');
      }
      this.onChange({ target: { value: this.value, }});
    });
  }

  _setValue(value) {
    this.value = value;
    this.dom.colorinput.setAttribute('value', this.value);
  }

  connectedCallback() {
    this._setValue(this.getAttribute('value'));
    this.onChange = buildAttributeCallback(this, 'change');
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'value') {
      this._setValue(newVal);
    } else {
      this.dom.colorinput.setAttribute(attrName, newVal);
    }
  }
}
