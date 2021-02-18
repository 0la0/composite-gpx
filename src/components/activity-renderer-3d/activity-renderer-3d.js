import { 
  PerspectiveCamera, Scene, BoxBufferGeometry,
  WebGLRenderer, InstancedMesh, Vector3,
  Object3D, MeshLambertMaterial, PointLight,
  AmbientLight, FrontSide, InstancedBufferAttribute,
  Color, Vector2,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import BaseComponent from '../primitives/util/base-component.js';
import { clamp, } from '../../services/Math.js';
import markup from './activity-renderer-3d.html';
import styles from './activity-renderer-3d.css';

const scaleOff = new Vector3(0, 0, 0);
const scaleOn = new Vector3(1, 1, 1);
const geoSize = 0.005;
const animationSpeed = 2.5;

class GeoProperties {
  constructor() {
    this.position = new Vector3();
    this.scale = scaleOff.clone();
  }
}

// TODO:
//  - create render options UI
//  - play / pause / restart
//  - move render logic to own class
//  - aspect ratio

const ELEVATION = {
  // MIN: 228, // 750 ft in meters
  MIN: 300, // 750 ft in meters
  // MAX: 335, // 1100 ft in meters
  MAX: 380,
  MAPPED_RANGE: 0.15,
  HALF_RANGE: 0.075
};
const elevationRange = ELEVATION.MAX - ELEVATION.MIN;
const normalizeElevation = (elevation = 0) => {
  const clampedElevation = clamp(elevation, ELEVATION.MIN, ELEVATION.MAX);
  const normalized = (clampedElevation - ELEVATION.MIN) / elevationRange;
  return normalized * ELEVATION.MAPPED_RANGE - ELEVATION.HALF_RANGE;
};

const mapRange = 5;
const xBuffer = 0.7;
const getCoordsFromPoint = ({ lat = 0, lon = 0, elevation = 0,}) => new Vector3(
  (lon - 0.5) * mapRange - xBuffer,
  normalizeElevation(elevation),
  (lat - 0.5) * mapRange
);

const getColorForElevation = (elevation) => {
  const normalized = (elevation - ELEVATION.MIN) / elevationRange;
  const adjusted = normalized * 0.75 + 0.25;
  return new Color(
    adjusted,
    0.5,
    1 - adjusted,
  );
};

export default class ActivityRenderer3d extends BaseComponent {
  static get tag() {
    return 'activity-renderer-3d';
  }

  constructor() {
    super(styles, markup, [ 'graphicscontainer', 'profileselector', ]);
    this._objectProxy = new Object3D();
    this.animatedIndex = 0;
    this.lastRenderTime = 0;
  }

  connectedCallback() {
    this.initScene();
  }

  handleRenderButtonClick() {
    const profileData = this.dom.profileselector.getProfileData();
    this.allPoints = profileData.activities
      .flatMap(activity => activity.points)
      .filter((point, index) => index % 5 === 0);

    const numInstances = this.allPoints.length;
    const pointGeometry = new BoxBufferGeometry(geoSize, geoSize, geoSize);
    const pointMaterial = new MeshLambertMaterial({ side: FrontSide, });

    this.cluster = new InstancedMesh(pointGeometry, pointMaterial, numInstances);
    this.geoProperties = new Array(numInstances).fill(null).map(() => new GeoProperties());
    this.colorBuffer = new Float32Array(numInstances * 3);
    this.cluster.material.vertexColors = true;

    this.geoProperties.forEach((geoProperty, index) => {
      const position = getCoordsFromPoint(this.allPoints[index]);
      geoProperty.position = position;
      const colorIndex = index * 3;
      const color = getColorForElevation(this.allPoints[index].elevation);
      this.colorBuffer[colorIndex] = color.r;
      this.colorBuffer[colorIndex + 1] = color.g;
      this.colorBuffer[colorIndex + 2] = color.b;
      this._objectProxy.position.copy(geoProperty.position);
      this._objectProxy.scale.copy(geoProperty.scale);
      this._objectProxy.updateMatrix();
      this.cluster.setMatrixAt(index, this._objectProxy.matrix);  
    });
    this.cluster.geometry.setAttribute('color', new InstancedBufferAttribute(this.colorBuffer, 3));
    this.cluster.instanceMatrix.needsUpdate = true;
    
    this.scene.add(this.cluster);
    this.lastRenderTime = performance.now();
    this.animate();
  }

  animate() {
    const currentTime = performance.now();
    const timeDelta = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    const pointsPerFrame = Math.floor(timeDelta * animationSpeed);
    if (this.animatedIndex < this.allPoints.length) {
      const lowerBound = this.animatedIndex;
      const upperBound = Math.min(lowerBound + pointsPerFrame, this.allPoints.length - 1);
      for (let i = lowerBound; i <= upperBound; i++) {
        const animatedScale = scaleOn.clone();
        this._objectProxy.position.copy(this.geoProperties[i].position);
        this._objectProxy.scale.copy(animatedScale);
        this._objectProxy.updateMatrix();
        this.cluster.setMatrixAt(i, this._objectProxy.matrix);
      }
      this.animatedIndex = this.animatedIndex + pointsPerFrame;
      this.cluster.instanceMatrix.needsUpdate = true;
    }
    this.orbitControls.update();
    const cameraPostion = new Vector3();
    this.camera.getWorldPosition(cameraPostion);
    this.pointLight1.position.copy(cameraPostion);
    this.effectComposer.render();
    requestAnimationFrame(() => this.animate());
  }

  initScene() {
    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.camera.position.z = 1;
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const ambientLight = new AmbientLight(0x909090);
    this.pointLight1 = new PointLight(0xFFFFFF, 1, 50);
    const pointLight2 = new PointLight(0xFFFFFF, 0.4, 50);
    pointLight2.position.set(-5, -5, 5);
    this.scene.add(ambientLight);
    this.scene.add(this.pointLight1);
    this.scene.add(pointLight2);
    this.dom.graphicscontainer.appendChild(this.renderer.domElement);
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

    // GLOW EFFECT
    const exposure = 1.7;
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass( new Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.5;
    bloomPass.radius = 1;
    renderPass.toneMappingExposure = Math.pow(exposure, 4.0);
    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.addPass(renderPass);
    this.effectComposer.addPass(bloomPass);
  }
}
