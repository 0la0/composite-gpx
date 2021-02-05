import BaseComponent from '../primitives/util/base-component.js';
import markup from './render-controls-2d.html';
import styles from './render-controls-2d.css';

const defaultModel = {
  canvasWidth: 500,
  canvasHeight: 500,
  fillColor: null,
  strokeColor: null,
  strokeWidth: 0,
  shadowColor: null,
  shadowSpread: 0,
  jitter: 0,
  skipPoints: 0,
  renderPoint: false,
  renderLine: false,
  radius: 1,
};

export default class RenderControls2d extends BaseComponent {
  static get tag() {
    return 'render-controls-2d';
  }

  constructor() {
    super(styles, markup, Object.keys(defaultModel));
    this.model = { ...defaultModel, };
  }

  getRenderOptions() {
    return this.model;
  }

  setModelProperty(key, value) {
    this.model[key] = value;
  }

  handleWidthChange(event) {
    const width = parseInt(event.target.value, 10);
    this.setModelProperty('width', width);
  }

  handleHeightChange(event) {
    const height = parseInt(event.target.value, 10);
    this.setModelProperty('height', height);
  }

  handleStrokeWidthChange(event) {
    const strokeWidth = parseInt(event.target.value, 10);
    this.setModelProperty('strokeWidth', strokeWidth);
  }

  handleShadowSpreadChange(event) {
    const shadowSpread = parseInt(event.target.value, 10);
    this.setModelProperty('shadowSpread', shadowSpread);
  }

  handleJitterChange(event) {
    const jitter = parseInt(event.target.value, 10);
    this.setModelProperty('jitter', jitter);
  }

  handleSkipPointChange(event) {
    const skipPoints = parseInt(event.target.value, 10);
    this.setModelProperty('skipPoints', skipPoints);
  }

  handleRadiusChange(event) {
    const radius = parseInt(event.target.value, 10);
    this.setModelProperty('radius', radius);
  }

  handleFillColorChange(event) {
    this.setModelProperty('fillColor', event.target.value);
  }

  handleStrokeColorChange(event) {
    this.setModelProperty('strokeColor', event.target.value);
  }

  handleShadowColorChange(event) {
    this.setModelProperty('shadowColor', event.target.value);
  }

  handleRenderPointToggle(event) {
    this.setModelProperty('point', event.target.value);
  }

  handleRenderLineToggle(event) {
    this.setModelProperty('line', event.target.value);
  }
}
