import BaseComponent from '../primitives/util/base-component.js';
import PersistedStore from '../../services/PersistedStore.js';
import markup from './render-controls-2d.html';
import styles from './render-controls-2d.css';

const defaultModel = {
  canvasSize: {
    type: 'number',
    value: 4000,
  },
  canvasColor: {
    type: 'string',
    value: '#FFFFFF',
  },
  fillColor: {
    type: 'string',
    value: '#FF0000',
  },
  fillAlpha: {
    type: 'number',
    value: 1,
  },
  strokeColor: {
    type: 'string',
    value: '#000000',
  },
  strokeAlpha: {
    type: 'number',
    value: 1,
  },
  strokeWidth: {
    type: 'number',
    value: 2,
  },
  shadowColor: {
    type: 'string',
    value: '#000000',
  },
  shadowAlpha: {
    type: 'number',
    value: 1,
  },
  shadowSpread: {
    type: 'number',
    value: 0,
  },
  jitter: {
    type: 'number',
    value: 0,
  },
  skipPoints: {
    type: 'number',
    value: 0,
  },
  renderPoint: {
    type: 'boolean',
    value: false,
  },
  renderLine: {
    type: 'boolean',
    value: true,
  },
  radius: {
    type: 'number',
    value: 1,
  },
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
      const property = this.model[key];
      this.dom[key]?.setAttribute('value', property.value);
    });
  }

  getRenderOptions() {
    return this.model;
  }

  setModelProperty(event) {
    const id = event.target.id;
    const value = event.target.value;
    if (this.model[id]?.type === 'number') {
      const parsedValue = parseFloat(value, 10);
      this.model[id].value = parsedValue;
    } else {
      this.model[id].value = value;
    }
    this.persistedStore.storeObject(Constants.STORE_KEY, this.model);
  }
}
