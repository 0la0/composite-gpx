import GraphicsScene from './GraphicsScene.js';
import BaseComponent from '../primitives/util/base-component.js';
import PointRenderer from './PointRenderer.js';
import markup from './activity-renderer-3d.html';
import styles from './activity-renderer-3d.css';

const UI_STATE = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  ANIMATING: 'ANIMATING',
};

export default class ActivityRenderer3d extends BaseComponent {
  static get tag() {
    return 'activity-renderer-3d';
  }

  constructor() {
    super(styles, markup, [ 'animatebutton', 'graphicscontainer', 'rendercontrols', 'profileselector', ]);
    this.lastRenderTime = 0;
    this.state = UI_STATE.IDLE;
    this.stopAnimation = false;
    this.handleResize = () => this.graphicsScene?.handleResize();
  }

  connectedCallback() {
    window.addEventListener('resize', this.handleResize);
    this.graphicsScene = new GraphicsScene(this.dom.graphicscontainer);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    this.stopAnimation = true;
    this.graphicsScene?.dispose();
    this.pointRenderer?.dispose();
  }

  handleAnimateButtonClick() {
    if (this.state === UI_STATE.LOADING) {
      return;
    }
    if (this.state === UI_STATE.ANIMATING) {
      this.state = UI_STATE.IDLE;
      this.dom.animatebutton.setAttribute('label', 'Start');
      return;
    }
    this.state = UI_STATE.LOADING;
    this.dom.animatebutton.setAttribute('label', 'Loading');
    const renderOptions = this.dom.rendercontrols.getRenderOptions();
    this.graphicsScene.remove(this.pointRenderer?.getMesh());
    this.pointRenderer?.dispose();
    this.graphicsScene.setRenderOptions(renderOptions);
    this.dom.profileselector.getProfileData()
      .then(profileData => this.initializeGeometry(profileData, renderOptions))
      .catch(error => {
        this.state = UI_STATE.IDLE;
        this.dom.animatebutton.setAttribute('label', 'Start');
        console.log(error);
      });
  }

  initializeGeometry(profileData, renderOptions) {
    this.pointRenderer = new PointRenderer(profileData, renderOptions);
    this.graphicsScene.add(this.pointRenderer.getMesh());
    this.lastRenderTime = performance.now();
    this.state = UI_STATE.ANIMATING;
    this.dom.animatebutton.setAttribute('label', 'Pause');
    this.animate();
  }

  animate() {
    if (this.stopAnimation) {
      return;
    }
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    if (this.state === UI_STATE.ANIMATING) {
      const result = this.pointRenderer.update(elapsedTime);
      if (!result) {
        this.state = UI_STATE.IDLE;
        this.dom.animatebutton.setAttribute('label', 'Start');
      }
    }
    this.graphicsScene.update(elapsedTime);
    requestAnimationFrame(() => this.animate());
  }
}
