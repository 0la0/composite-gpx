import { 
  PerspectiveCamera, Scene,
  BoxGeometry, BoxBufferGeometry, MeshNormalMaterial,
  Mesh, WebGLRenderer, Color, InstancedMesh, Vector3,
  Object3D, MeshBasicMaterial, MeshLambertMaterial,
  AmbientLight, FrontSide, BackSide, InstancedBufferAttribute,
  PointLight,
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
  }

  connectedCallback() {
    this.initScene();
  }

  handleRenderButtonClick() {
    this.profileData = this.dom.profileselector.getProfileData();
    const allPoints = this.profileData.activities
      .flatMap(activity => activity.points)
      .filter((point, index) => index % 100 === 0);

    const numInstances = allPoints.length;
    const pointGeometry = new BoxBufferGeometry(0.01, 0.01, 0.01);
    // const pointMaterial = new MeshNormalMaterial({ side: FrontSide, });
    // const pointMaterial = new MeshBasicMaterial({ side: FrontSide });
    const pointMaterial = new MeshLambertMaterial({ side: FrontSide, });

    const color = { r: 1, g: 0.4, b: 0.9, };

    this.cluster = new InstancedMesh(pointGeometry, pointMaterial, numInstances);
    this.geoProperties = new Array(numInstances).fill(null).map(() => new GeoProperties());
    this.colorBuffer = new Float32Array(numInstances * 3);
    this.cluster.material.vertexColors = true;

    this.geoProperties.forEach((geoProperty, index) => {
      const z = allPoints[index].lat - 0.5;
      const y = 0; // TODO: map to elevation
      const x = allPoints[index].lon - 0.5;
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
    
    // console.log(allPoints);
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
    // const geometry = new BoxGeometry(0.2, 0.2, 0.2);
    // const material = new MeshNormalMaterial();
    // const mesh = new Mesh(geometry, material);
    // this.scene.add(mesh);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const ambientLight = new AmbientLight(0x404040);
    const pointLight = new PointLight(0xFFFFFF, 20, 100);
    pointLight.position.set(25, 25, 25);
    this.scene.add(ambientLight);
    this.scene.add(pointLight);
    // this.renderer.setAnimationLoop(this.animate);
    this.dom.graphicscontainer.appendChild(this.renderer.domElement);
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
  }
}
