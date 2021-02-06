import BaseComponent from '../primitives/util/base-component.js';
import PersistedStore from '../../services/PersistedStore.js';
import markup from './render-controls-2d.html';
import styles from './render-controls-2d.css';

const defaultModel = {
  canvasWidth: 4000,
  canvasHeight: 4000,
  canvasColor: '#FFFFFF',
  fillColor: '#FF0000',
  strokeColor: '#449944',
  strokeWidth: 2,
  shadowColor: null,
  shadowSpread: 0,
  jitter: 0,
  skipPoints: 0,
  renderPoint: false,
  renderLine: true,
  radius: 1,
};

const Constants = {
  STORE_KEY: 'RENDER_2D_OPTIONS',
};

export default class RenderControls2d extends BaseComponent {
  static get tag() {
    return 'render-controls-2d';
  }

  constructor() {
    super(styles, markup, Object.keys(defaultModel));
    this.persistedStore = new PersistedStore();
    const persistedModel = this.persistedStore.getObjectFromStorage(Constants.STORE_KEY);
    this.model = Object.keys(persistedModel).length ? persistedModel : { ...defaultModel, };
  }

  connectedCallback() {
    Object.keys(this.model).forEach(key => {
      const value = this.model[key];
      this.dom[key].setAttribute('value', value);
    });
  }

  getRenderOptions() {
    return this.model;
  } 

  setModelProperty(key, value) {
    this.model[key] = value;
    this.persistedStore.storeObject(Constants.STORE_KEY, this.model);
  }

  handleWidthChange(event) {
    const width = parseInt(event.target.value, 10);
    this.setModelProperty('canvasWidth', width);
  }

  handleHeightChange(event) {
    const height = parseInt(event.target.value, 10);
    this.setModelProperty('canvasHeight', height);
  }

  handleCanvasColorChange(event) {
    this.setModelProperty('canvasColor', event.target.value);
  }

  handleStrokeWidthChange(event) {
    const strokeWidth = parseFloat(event.target.value, 10);
    this.setModelProperty('strokeWidth', strokeWidth);
  }

  handleShadowSpreadChange(event) {
    const shadowSpread = parseFloat(event.target.value, 10);
    this.setModelProperty('shadowSpread', shadowSpread);
  }

  handleJitterChange(event) {
    const jitter = parseFloat(event.target.value, 10);
    this.setModelProperty('jitter', jitter);
  }

  handleSkipPointChange(event) {
    const skipPoints = parseInt(event.target.value, 10);
    this.setModelProperty('skipPoints', skipPoints);
  }

  handleRadiusChange(event) {
    const radius = parseFloat(event.target.value, 10);
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
    this.setModelProperty('renderPoint', event.target.value);
  }

  handleRenderLineToggle(event) {
    this.setModelProperty('renderLine', event.target.value);
  }
}
