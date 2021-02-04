import BaseComponent from '../primitives/util/base-component.js';
import markup from './render-controls-2d.html';
import styles from './render-controls-2d.css';

export default class RenderControls2d extends BaseComponent {
  static get tag() {
    return 'render-controls-2d';
  }

  constructor() {
    super(styles, markup, []);
  }

  handleWidthChange(event) {
    const width = parseInt(event.target.value, 10);
    console.log('width', width);
  }

  handleHeightChange(event) {
    const height = parseInt(event.target.value, 10);
    console.log('height', height);
  }

  handleStrokeWidthChange(event) {
    const strokeWidth = parseInt(event.target.value, 10);
    console.log('strokeWidth', strokeWidth);
  }

  handleShadowSpreadChange(event) {
    const shadowSpread = parseInt(event.target.value, 10);
    console.log('shadowSpread', shadowSpread);
  }

  handleJitterChange(event) {
    const jitter = parseInt(event.target.value, 10);
    console.log('jitter', jitter);
  }

  handleSkipPointChange(event) {
    const skipPoints = parseInt(event.target.value, 10);
    console.log('skipPoints', skipPoints);
  }

  handleRadiusChange(event) {
    const radius = parseInt(event.target.value, 10);
    console.log('radius', radius);
  }

  handleFillColorChange(event) {
    console.log(event);
  }
}
