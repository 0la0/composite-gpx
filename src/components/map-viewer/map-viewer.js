import leaflet from 'leaflet';
import BaseComponent from '../primitives/util/base-component';
import markup from './map-viewer.html';
import styles from './map-viewer.css';
import leafletSyles from 'leaflet/dist/leaflet.css';

const INIT_COORDS = {
  KC: [ 39.0353, -94.5691 ],
  LONDON: [ 51.508, -0.11 ],
};

export default class MapViewer extends BaseComponent {
  static get tag() {
    return 'map-viewer';
  }

  constructor() {
    super(`${leafletSyles}\n${styles}`, markup, [ 'mapContainer', ]);
  }

  connectedCallback() {
    const { mapBoxAccessToken, } = ENV; // eslint-disable-line no-undef
    const leafletMap = leaflet.map(
      this.dom.mapContainer,
      {
        zoom: 12,
        preferCanvas: true,
        center: INIT_COORDS.LONDON,
      }
    );
    const tileLayer = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapBoxAccessToken}`;
    const options = {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: mapBoxAccessToken,
    };
    leaflet.tileLayer(tileLayer, options).addTo(leafletMap);

    const circle = leaflet.circle([51.508, -0.11], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
    }).addTo(leafletMap);

    var polygon = leaflet.polygon([
      [51.509, -0.08],
      [51.503, -0.06],
      [51.51, -0.047]
    ]).addTo(leafletMap);
  }
}
