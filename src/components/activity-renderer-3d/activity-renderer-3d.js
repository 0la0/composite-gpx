import { 
  PerspectiveCamera, Scene, BoxBufferGeometry,
  WebGLRenderer, InstancedMesh, Vector3,
  Object3D, MeshLambertMaterial, PointLight,
  AmbientLight, FrontSide, InstancedBufferAttribute,
  // SphereBufferGeometry,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import BaseComponent from '../primitives/util/base-component.js';
import markup from './activity-renderer-3d.html';
import styles from './activity-renderer-3d.css';

class GeoProperties {
  constructor() {
    this.position = new Vector3();
  }
}

const ELEVATION = {
  MIN: 228, // 750 ft in meters
  MAX: 365, // 1200 ft in meters
  MAPPED_RANGE: 0.2,
  HALF_RANGE: 0.1
};
const elevationRange = ELEVATION.MAX - ELEVATION.MIN;
const normalizeElevation = (elevation = 0) => {
  const normalized = (elevation - ELEVATION.MIN) / elevationRange;
  return normalized * ELEVATION.MAPPED_RANGE - ELEVATION.HALF_RANGE;
};

export default class ActivityRenderer3d extends BaseComponent {
  static get tag() {
    return 'activity-renderer-3d';
  }

  constructor() {
    super(styles, markup, [ 'graphicscontainer', 'profileselector', ]);
    this.animate = this._animate.bind(this);
    this._objectProxy = new Object3D();
    this.profileData = {
      bounds: {},
      activities: [],
    };
    this.tempCount = 0;
  }

  connectedCallback() {
    this.initScene();
  }

  handleRenderButtonClick() {
    this.profileData = this.dom.profileselector.getProfileData();
    const allPoints = this.profileData.activities
      .flatMap(activity => activity.points)
      .filter((point, index) => index % 2 === 0);

    const numInstances = allPoints.length;
    const geoSize = 0.0025;
    const pointGeometry = new BoxBufferGeometry(geoSize, geoSize, geoSize);
    // const pointGeometry = new SphereBufferGeometry(geoSize, 4, 4);
    const pointMaterial = new MeshLambertMaterial({ side: FrontSide, });

    const color = { r: 1, g: 1, b: 1, };

    this.cluster = new InstancedMesh(pointGeometry, pointMaterial, numInstances);
    this.geoProperties = new Array(numInstances).fill(null).map(() => new GeoProperties());
    this.colorBuffer = new Float32Array(numInstances * 3);
    this.cluster.material.vertexColors = true;

    this.geoProperties.forEach((geoProperty, index) => {
      const z = (allPoints[index].lat - 0.5) * 5;
      const y = normalizeElevation(allPoints[index].elevation);
      const x = (allPoints[index].lon - 0.5) * 5;
      geoProperty.position = new Vector3(x, y, z);
      const colorIndex = index * 3;
      this.colorBuffer[colorIndex] = color.r;
      this.colorBuffer[colorIndex + 1] = color.g;
      this.colorBuffer[colorIndex + 2] = color.b;
      this._objectProxy.position.copy(geoProperty.position);
      this._objectProxy.updateMatrix();
      this.cluster.setMatrixAt(index, this._objectProxy.matrix);  
    });
    this.cluster.geometry.setAttribute('color', new InstancedBufferAttribute(this.colorBuffer, 3));
    this.cluster.instanceMatrix.needsUpdate = true;
    
    this.scene.add(this.cluster);
    this.renderer.setAnimationLoop(this.animate);
  }

  _animate(time) {
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  }

  initScene() {
    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.camera.position.z = 1;
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const ambientLight = new AmbientLight(0x404040);
    const pointLight = new PointLight(0xFFFFFF, 20, 100);
    pointLight.position.set(25, 25, 25);
    this.scene.add(ambientLight);
    this.scene.add(pointLight);
    this.dom.graphicscontainer.appendChild(this.renderer.domElement);
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
  }
}
