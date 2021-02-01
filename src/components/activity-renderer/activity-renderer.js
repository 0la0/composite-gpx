import BaseComponent from '../primitives/util/base-component.js';
import ProfileService from '../../services/ProfileService.js';
import { TWO_PI, } from '../../services/Math.js';
import markup from './activity-renderer.html';
import styles from './activity-renderer.css';

const DIMS = {
  WIDTH: 1000,
  HEIGHT: 1000,
};

export default class ActivityRenderer extends BaseComponent {
  static get tag() {
    return 'activity-renderer';
  }

  constructor() {
    super(styles, markup, [ 'canvas', 'activities' ]);
    this.profileService = new ProfileService();
    this.activities = [];
  }

  connectedCallback() {
    this.initCanvas();
    this.profileService.getRenderViews()
      .then(response => this.renderOptions(response.views))
      .catch(error => console.log(error));
  }

  initCanvas() {
    this.dom.canvas.width = DIMS.WIDTH;
    this.dom.canvas.height = DIMS.HEIGHT;

    this.ctx = this.dom.canvas.getContext('2d');
    // ctx.fillStyle = 'white';
    // ctx.fillRect(0, 0, DIMS.WIDTH, DIMS.HEIGHT);

    // ctx.fillStyle = 'rgb(200, 0, 0)';
    // ctx.fillRect(10, 10, 50, 50);

    // ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    // ctx.fillRect(30, 30, 50, 50);
  }

  render() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, DIMS.WIDTH, DIMS.HEIGHT);
    this.ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';

    const pointRadius = 0.1;
    
    this.activities.forEach(activity => {
      const points = activity.points;
      points.forEach(point => {
        const adjustedLat = point.lat * DIMS.WIDTH;
        const adjustedLon = point.lon * DIMS.HEIGHT;
        this.ctx.beginPath();
        this.ctx.arc(adjustedLon, adjustedLat, pointRadius, 0, TWO_PI);
        this.ctx.fill();
      });
    });
  }

  renderOptions(views) {
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
        if (!response || !response.length) {
          throw new Error('No activities', response);
        }
        this.activeViewName = name;
        this.activities = response;
        this.render();
      })
      .catch(error => console.log(error));
  }
}
