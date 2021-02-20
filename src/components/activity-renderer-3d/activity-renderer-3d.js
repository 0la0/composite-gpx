import GraphicsScene from './GraphicsScene.js';
import BaseComponent from '../primitives/util/base-component.js';
import PointRenderer from './PointRenderer.js';
import markup from './activity-renderer-3d.html';
import styles from './activity-renderer-3d.css';

// TODO:
//  - create render options UI

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
    super(styles, markup, [ 'animatebutton', 'graphicscontainer', 'profileselector', ]);
    this.lastRenderTime = 0;
    this.state = UI_STATE.IDLE;
  }

  connectedCallback() {
    this.graphicsScene = new GraphicsScene(this.dom.graphicscontainer);
  }

  handleAnimateButtonClick() {
    if (this.state === UI_STATE.LOADING) {
      return;
    }
    if (this.state === UI_STATE.ANIMATING) {
      this.state = UI_STATE.IDLE;
      return;
    }
    this.state = UI_STATE.LOADING;
    this.dom.animatebutton.setAttribute('label', 'Loading');
    this.dom.profileselector.getProfileData()
      .then(profileData => this.startAnimation(profileData))
      .catch(error => {
        this.state = UI_STATE.IDLE;
        this.dom.animatebutton.setAttribute('label', 'Start');
        console.log(error);
      });
  }

  startAnimation(profileData) {
    this.graphicsScene.remove(this.pointRenderer?.getMesh());
    this.pointRenderer?.dispose();
    this.pointRenderer = new PointRenderer(profileData);
    this.graphicsScene.add(this.pointRenderer.getMesh());
    this.lastRenderTime = performance.now();
    this.state = UI_STATE.ANIMATING;
    this.dom.animatebutton.setAttribute('label', 'Pause');
    this.animate();
  }

  animate() {
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    if (this.state === UI_STATE.ANIMATING) {
      const result = this.pointRenderer.update(elapsedTime);
      if (!result) {
        this.state === UI_STATE.IDLE;
        this.dom.animatebutton.setAttribute('label', 'Start');
      }
    }
    this.graphicsScene.update(elapsedTime);
    requestAnimationFrame(() => this.animate());
  }
}
