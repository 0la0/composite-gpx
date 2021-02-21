import BaseComponent from '../primitives/util/base-component.js';
import renderCanvas from './CanvasRenderer';
import { PROJECTION_APPROXIMATION, } from '../../services/Math.js';
import markup from './activity-renderer-2d.html';
import styles from './activity-renderer-2d.css';

const ZOOM = {
  MIN: 0.05,
  MAX: 1,
  STEP: 0.025,
  DEFAULT: 0.5,
};

export default class ActivityRenderer2d extends BaseComponent {
  static get tag() {
    return 'activity-renderer-2d';
  }

  constructor() {
    super(styles, markup, [ 'canvas', 'profileselector', 'rendercontrols', 'zoomin', 'zoomout', 'zoomdisplay' ]);
    this.dom.zoomin.addEventListener('click', () => {
      this.zoom = Math.min(this.zoom + ZOOM.STEP, ZOOM.MAX);
      this.setZoom();
    });
    this.dom.zoomout.addEventListener('click', () => {
      this.zoom = Math.max(this.zoom - ZOOM.STEP, ZOOM.MIN);
      this.setZoom();
    });
    this.zoom = ZOOM.DEFAULT;
    this.ctx = this.dom.canvas.getContext('2d');
  }

  setZoom() {
    this.dom.canvas.style.setProperty('width', `${this.dom.canvas.width * this.zoom}px`);
    this.dom.canvas.style.setProperty('height', `${this.dom.canvas.height * this.zoom}px`);
    this.dom.zoomdisplay.innerText = `${Math.round(this.zoom * 100)}%`;
  }

  handleRenderButtonClick() {
    const renderOptions = this.dom.rendercontrols.getRenderOptions();
    this.dom.profileselector.getProfileData()
      .then(profileData => {
        console.log(profileData);
        this.render(profileData, renderOptions);
      })
      .catch(error => console.log(error));
  }

  render(profileData, renderOptions) {
    const { bounds, activities, } = profileData;
    const aspectRatio = (bounds.maxlon - bounds.minlon) / (bounds.maxlat - bounds.minlat);
    const width = renderOptions.canvasSize.value * PROJECTION_APPROXIMATION; // cheap approximation of an "accurate" map projection :grimace:
    const height = renderOptions.canvasSize.value / aspectRatio;
    this.dom.canvas.width = width;
    this.dom.canvas.height = height;
    this.setZoom();
    renderCanvas({
      ctx: this.ctx,
      renderOptions,
      activities,
      width,
      height,
    });
  }
}
