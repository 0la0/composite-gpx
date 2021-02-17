import BaseComponent from '../primitives/util/base-component.js';
import { getPosNeg, TWO_PI, } from '../../services/Math.js';
import markup from './activity-renderer-2d.html';
import styles from './activity-renderer-2d.css';

const ZOOM = {
  MIN: 0.05,
  MAX: 1,
  STEP: 0.025,
  DEFAULT: 0.15,
};

const jitter = (magnitude) => getPosNeg() * magnitude * Math.random();

const alphaFloatToHex = (num = 0) => {
  const hexValue = Math.floor(num * 255).toString(16);
  if (hexValue.length < 2) {
    return `0${hexValue}`;
  }
  return hexValue;
};

export default class ActivityRenderer2d extends BaseComponent {
  static get tag() {
    return 'activity-renderer-2d';
  }

  constructor() {
    super(styles, markup, [ 'canvas', 'profileselector', 'rendercontrols', 'zoomin', 'zoomout', 'zoomdisplay' ]);
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
  }

  setZoom() {
    const width = `${this.dom.canvas.width * this.zoom}px`;
    const height = `${this.dom.canvas.height * this.zoom}px`;
    this.dom.canvas.style.setProperty('width', width);
    this.dom.canvas.style.setProperty('height', height);
    this.dom.zoomdisplay.innerText = `${Math.round(this.zoom * 100)}%`;
  }

  handleRenderButtonClick() {
    this.profileData = this.dom.profileselector.getProfileData();
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
    const { bounds, activities, } = this.profileData;
    this.aspectRatio = (bounds.maxlon - bounds.minlon) / (bounds.maxlat - bounds.minlat);
    const adjustedWidth = this.renderOptions.canvasSize.value;
    const adjustedHeight = this.renderOptions.canvasSize.value * (1 / this.aspectRatio);
    this.dom.canvas.width = adjustedWidth;
    this.dom.canvas.height = adjustedHeight;
    this.setZoom();

    // TODO: parameterize background color
    this.ctx.fillStyle = this.renderOptions.canvasColor.value;
    this.ctx.fillRect(0, 0, adjustedWidth, adjustedHeight);

    const fillAlphaHex = alphaFloatToHex(this.renderOptions.fillAlpha.value);
    const fillStyle = `${this.renderOptions.fillColor.value}${fillAlphaHex}`;
    this.ctx.fillStyle = fillStyle;

    const strokeAlphaHex = alphaFloatToHex(this.renderOptions.strokeAlpha.value);  
    const strokeStyle = `${this.renderOptions.strokeColor.value}${strokeAlphaHex}`;
    this.ctx.strokeStyle = strokeStyle;
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = this.renderOptions.strokeWidth.value;

    const shadowAlphaHex = alphaFloatToHex(this.renderOptions.shadowAlpha.value);  
    const shadowStyle = `${this.renderOptions.shadowColor.value}${shadowAlphaHex}`;
    this.ctx.shadowColor = shadowStyle;
    this.ctx.shadowBlur = this.renderOptions.shadowSpread.value;

    const calculateAdjustedPoint = (point) => {
      if (this.renderOptions.jitter.value) {
        return {
          lat: point.lat * adjustedHeight + jitter(this.renderOptions.jitter.value),
          lon: point.lon * adjustedWidth + jitter(this.renderOptions.jitter.value),
        };
      } else {
        return {
          lat: point.lat * adjustedHeight,
          lon: point.lon * adjustedWidth,
        };
      }
    };

    if (this.renderOptions.renderPoint.value) {
      activities.forEach(activity => {
        this.ctx.beginPath();
        const points = activity.points;
        points
          .forEach((point) => {
            const { lat, lon, } = calculateAdjustedPoint(point);
            this.ctx.moveTo(lon, lat);
            this.ctx.arc(lon, lat, this.renderOptions.radius.value, 0, TWO_PI);
          });
        this.ctx.fill();
      });
    }

    if (this.renderOptions.renderLine.value) {
      activities.forEach(activity => {

        if (this.renderOptions.shadowSpread.value) {
          const spread = this.renderOptions.shadowSpread.value + jitter(10);
          const shadowBlur = Math.max(spread, this.renderOptions.shadowSpread.value);
          // console.log(shadowBlur);
          this.ctx.shadowBlur = shadowBlur;
        }


        this.ctx.beginPath();
        const points = activity.points;
        points
          .forEach((point, index) => {
            const { lat, lon, } = calculateAdjustedPoint(point);
            if (index === 0) {
              this.ctx.moveTo(lon, lat);
            } else {
              this.ctx.lineTo(lon, lat);
            }
          });
        this.ctx.stroke();
      });
    }
  }
}
