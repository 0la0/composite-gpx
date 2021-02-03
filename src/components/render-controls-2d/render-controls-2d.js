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
}
