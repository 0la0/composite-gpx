import BaseComponent from '../primitives/util/base-component.js';
import ProfileService from '../../services/ProfileService.js';
import { getPosNeg, TWO_PI, } from '../../services/Math.js';
import markup from './activity-renderer.html';
import styles from './activity-renderer.css';

const ZOOM = {
  MIN: 0.05,
  MAX: 1,
  STEP: 0.025,
  DEFAULT: 0.15,
};

export default class ActivityRenderer extends BaseComponent {
  static get tag() {
    return 'activity-renderer';
  }

  constructor() {
    super(styles, markup, [ 'canvas', 'activities', 'rendercontrols', 'zoomin', 'zoomout', 'zoomdisplay' ]);
    this.profileService = new ProfileService();
    this.profileData = {
      bounds: {},
      activities: [],
    };
    this.dom.zoomin.addEventListener('click', () => {
      this.zoom = Math.min(this.zoom + ZOOM.STEP, ZOOM.MAX);
      this.setZoom();
    });
    this.dom.zoomout.addEventListener('click', () => {
      this.zoom = Math.max(this.zoom - ZOOM.STEP, ZOOM.MIN);
      this.setZoom();
    });
    this.zoom = ZOOM.DEFAULT;
    this.aspectRatio = 1;
    this.dims = {
      width: 5000,
      height: 5000,
    };
  }

  connectedCallback() {
    this.initCanvas();
    this.setZoom();
    this.profileService.getRenderViews()
      .then(response => this.renderProfileMenu(response.views))
      .catch(error => console.log(error));
  }

  setZoom() {
    const width = `${this.dom.canvas.width * this.zoom}px`;
    const height = `${this.dom.canvas.height * this.zoom}px`;
    this.dom.canvas.style.setProperty('width', width);
    this.dom.canvas.style.setProperty('height', height);
    this.dom.zoomdisplay.innerText = `${Math.round(this.zoom * 100)}%`;
  }

  handleRenderButtonClick() {
    this.renderOptions = this.dom.rendercontrols.getRenderOptions();
    this.render();
  }

  initCanvas() {
    this.dom.canvas.width = this.dims.width;
    this.dom.canvas.height = this.dims.height;
    this.ctx = this.dom.canvas.getContext('2d');
  }

  render() {
    if (!this.renderOptions) {
      console.error('Define render options');
      return;
    }
    console.log('renderOptions', this.renderOptions);
    const { bounds, activities, } = this.profileData;
    this.aspectRatio = (bounds.maxlon - bounds.minlon) / (bounds.maxlat - bounds.minlat);

    const adjustedWidth = this.renderOptions.canvasWidth * this.aspectRatio;
    const adjustedHeight = this.renderOptions.canvasHeight * (1 / this.aspectRatio);
    this.dom.canvas.width = adjustedWidth;
    this.dom.canvas.height = adjustedHeight;
    this.setZoom();

    // TODO: parameterize background color
    this.ctx.fillStyle = this.renderOptions.canvasColor;
    this.ctx.fillRect(0, 0, adjustedWidth, adjustedHeight);

    // TODO: parameterize color alpha
    this.ctx.fillStyle = this.renderOptions.fillColor;
    this.ctx.strokeStyle = this.renderOptions.strokeColor;
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = this.renderOptions.strokeWidth;
    // this.ctx.shadowColor = 'rgba(0, 0, 250, 0.5)';
    // this.ctx.shadowBlur = 20;

    // const jitter = (magnitude) => getPosNeg() * magnitude * Math.random(); 
    activities.forEach(activity => {
      const points = activity.points;

      if (this.renderOptions.renderPoint) {
        points
          .forEach((point) => {
            const adjustedLat = point.lat * adjustedHeight;
            const adjustedLon = point.lon * adjustedWidth;
            this.ctx.beginPath();
            this.ctx.arc(adjustedLon, adjustedLat, this.renderOptions.radius, 0, TWO_PI);
            this.ctx.fill();
          });
      }


      if (this.renderOptions.renderLine) {
        this.ctx.beginPath();
        points
          .forEach((point, index) => {
            const adjustedLat = point.lat * adjustedHeight;
            const adjustedLon = point.lon * adjustedWidth;
            if (index === 0) {
              this.ctx.moveTo(adjustedLon, adjustedLat);
            } else {
              this.ctx.lineTo(adjustedLon, adjustedLat);
            }
            if (index === points.length -1) {
              this.ctx.stroke();
            }
          });
      }
      
    });
  }

  renderProfileMenu(views) {
    requestAnimationFrame(() => {
      this.activeNewName = '';
      [...this.dom.activities.children].forEach(child => this.dom.activities.removeChild(child));
      views.forEach(profile => {
        const viewButton = document.createElement('button');
        viewButton.classList.add('profile-button');
        viewButton.innerText = profile;
        viewButton.addEventListener('click', () => this.loadView(profile));
        this.dom.activities.appendChild(viewButton);
      });
    });
  }

  loadView(name) {
    this.profileService.getRenderView(name)
      .then(response => {
        if (!response) {
          throw new Error('No activities', response);
        }
        this.activeViewName = name;
        this.profileData = response;
        this.render();
      })
      .catch(error => console.log(error));
  }
}
