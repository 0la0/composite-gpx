import * as L from 'leaflet';
import 'leaflet-draw';
import BaseComponent from '../primitives/util/base-component';
import markup from './map-viewer.html';
import customStyles from './map-viewer.css';
import leafletSyles from 'leaflet/dist/leaflet.css';
import leafletDrawStyles from 'leaflet-draw/dist/leaflet.draw.css';

const styles = `${leafletSyles}\n${leafletDrawStyles}\n${customStyles}`;

const INIT_COORDS = {
  KC: [ 39.0353, -94.5691 ],
  LONDON: [ 51.508, -0.11 ],
};

export default class MapViewer extends BaseComponent {
  static get tag() {
    return 'map-viewer';
  }

  constructor() {
    super(styles, markup, [ 'mapContainer', ]);
    this.renderViewCallback = () => {};
  }

  connectedCallback() {
    this.initMap();
  }

  setRenderViewCallback(renderViewCallback) {
    this.renderViewCallback = renderViewCallback;
  }

  initMap() {
    const { mapBoxAccessToken, } = ENV; // eslint-disable-line no-undef
    this.leafletMap = L.map(
      this.dom.mapContainer,
      {
        zoom: 12,
        preferCanvas: true,
        center: INIT_COORDS.KC,
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
    L.tileLayer(tileLayer, options).addTo(this.leafletMap);

    // const circle = L.circle([51.508, -0.11], {
    //   color: 'red',
    //   fillColor: '#f03',
    //   fillOpacity: 0.5,
    //   radius: 500
    // }).addTo(this.leafletMap);

    // var polygon = L.polygon([
    //   [51.509, -0.08],
    //   [51.503, -0.06],
    //   [51.51, -0.047]
    // ]).addTo(this.leafletMap);


    // Initialise the FeatureGroup to store editable layers
    const editableLayers = new L.FeatureGroup();
    this.leafletMap.addLayer(editableLayers);

    const drawOptions = {
      position: 'topleft',
      draw: {
        polyline: false,
        polygon: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: true,
      },
      edit: {
        featureGroup: editableLayers,
        remove: true
      }
    };

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    const drawControl = new L.Control.Draw(drawOptions);
    this.leafletMap.addControl(drawControl);

    const editableLayers2 = new L.FeatureGroup();
    this.leafletMap.addLayer(editableLayers2);

    this.leafletMap.on('draw:created', leafletEvent => {
      const type = leafletEvent.layerType;
      const layer = leafletEvent.layer;

      if (type !== 'rectangle') {
        layer.bindPopup('Only rectangles supported');
      } else {
        const renderViewName = window.prompt('Create render file?', '');
        if (!renderViewName) {
          return;
        }
        const latLngs = layer.getLatLngs()[0];
        const bounds = {
          minlat: latLngs[0].lat,
          minlon: latLngs[0].lng,
          maxlat: latLngs[1].lat,
          maxlon: latLngs[2].lng,
        };
        this.renderViewCallback(renderViewName, bounds);
      }
    });
  }

  plotActivities(activities) {
    const pointOptions = {
      color: 'red',
      // fillColor: '#f03',
      // fillOpacity: 0.5,
      radius: 2
    };
    activities.forEach(activities => {
      const { points, } = activities;
      points
        // .filter((point, index) => index % 5 === 0)
        .forEach(point => {
          const latLon = [point.lat, point.lon];
          const circle = L.circle(latLon, pointOptions).addTo(this.leafletMap);
        });
    });
  }
}
