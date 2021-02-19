import * as L from 'leaflet';
import 'leaflet-draw';
import BaseComponent from '../primitives/util/base-component';
import markup from './map-viewer.html';
import customStyles from './map-viewer.css';
import leafletSyles from 'leaflet/dist/leaflet.css';
import leafletDrawStyles from 'leaflet-draw/dist/leaflet.draw.css';

const styles = `${leafletSyles}\n${leafletDrawStyles}\n${customStyles}`;

const INITIAL_COORD_FALLBACK = { lat: 51.508, lon:  -0.11, };

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
    const { mapBoxAccessToken, initialCoords, } = ENV; // eslint-disable-line no-undef
    const center = [
      initialCoords?.lat ?? INITIAL_COORD_FALLBACK.lat,
      initialCoords?.lon ?? INITIAL_COORD_FALLBACK.lon,
    ];
    const mapOptions = {
      zoom: 12,
      preferCanvas: true,
      center,
    };
    this.leafletMap = L.map(this.dom.mapContainer, mapOptions);
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
    this.activityLayer = new L.FeatureGroup();
    this.leafletMap.addLayer(this.activityLayer);

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

  clear() {
    this.activityLayer.clearLayers();
  }

  plotActivities(activities) {
    const pointOptions = {
      color: 'red',
      radius: 2
    };
    activities.forEach(activities => {
      const { points, } = activities;
      points
        // .filter((point, index) => index % 5 === 0)
        .forEach(point => {
          const latLon = [point.lat, point.lon];
          const circle = L.circle(latLon, pointOptions).addTo(this.activityLayer);
        });
    });
  }
}
