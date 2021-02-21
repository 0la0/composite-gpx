import BaseComponent from '../primitives/util/base-component.js';
import PersistedStore from '../../services/PersistedStore.js';
import markup from './render-controls-3d.html';
import styles from './render-controls-3d.css';

const defaultModel = {
  mapSize: {
    type: 'number',
    value: 3,
  },
  pointSize: {
    type: 'number',
    value: 0.005,
  },
  skipPoints: {
    type: 'number',
    value: 0,
  },
  backgroundColor: {
    type: 'string',
    value: '#FFFFFF',
  },
  pointColor: {
    type: 'string',
    value: '#FFFFFF',
  },
  toggleElevation: {
    type: 'boolean',
    value: true,
  },
  elevationMin: {
    type: 'number',
    value: 780,
  },
  elevationMax: {
    type: 'number',
    value: 1200,
  },
  elevationColorToggle: {
    type: 'boolean',
    value: true,
  },
  centerX: {
    type: 'number',
    value: 0,
  },
  centerY: {
    type: 'number',
    value: 0,
  },
  animationSpeed: {
    type: 'number',
    value: 1,
  },
  glowExposure: {
    type: 'number',
    value: 1.7,
  },
  glowThreshold: {
    type: 'number',
    value: 0.1,
  },
  glowStrength: {
    type: 'number',
    value: 1.5,
  },
  glowRadius: {
    type: 'number',
    value: 1,
  },
};

const Constants = {
  STORE_KEY: 'RENDER_3D_OPTIONS',
};

export default class RenderControls3d extends BaseComponent {
  static get tag() {
    return 'render-controls-3d';
  }

  constructor() {
    super(styles, markup, Object.keys(defaultModel).concat([ 'elevationContainer', ]));
    this.persistedStore = new PersistedStore();
    const persistedModel = this.persistedStore.getObjectFromStorage(Constants.STORE_KEY);
    this.model = {
      ...defaultModel,
      ...persistedModel,
    };
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
