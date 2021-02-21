import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PointLight,
  AmbientLight,
  Vector2,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import ThreeUtil from './ThreeUtil';

export default class GraphicsScene {
  constructor(domElement) {
    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.camera.position.y = 0.5;
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.tanFOV = Math.tan((( Math.PI / 180 ) * this.camera.fov / 2 ));
    this.initialHeight = window.innerHeight;
    
    const ambientLight = new AmbientLight(0x909090);
    this.pointLight1 = new PointLight(0xFFFFFF, 1, 50);
    const pointLight2 = new PointLight(0xFFFFFF, 0.4, 50);
    pointLight2.position.set(-5, -5, 5);
    this.scene.add(ambientLight);
    this.scene.add(this.pointLight1);
    this.scene.add(pointLight2);
    domElement.appendChild(this.renderer.domElement);
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.minPolarAngle = 0;
    this.orbitControls.maxPolarAngle = Math.PI * 0.5;
    // this.orbitControls.zoomSpeed = 0.75;

    // GLOW EFFECT
    const exposure = 1.7;
    const renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(new Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85);
    this.bloomPass.threshold = 0.1;
    this.bloomPass.strength = 1.5;
    this.bloomPass.radius = 1;
    renderPass.toneMappingExposure = Math.pow(exposure, 4.0);
    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.addPass(renderPass);
    this.effectComposer.addPass(this.bloomPass);
  }

  setRenderOptions(renderOptions) {
    const backgroundColor = new Color(renderOptions.backgroundColor.value);
    this.renderer.setClearColor(backgroundColor, 1);
    this.renderer.toneMappingExposure = Math.pow(renderOptions.glowExposure.value, 4.0);
    this.bloomPass.threshold = renderOptions.glowThreshold.value;
    this.bloomPass.strength = renderOptions.glowStrength.value;
    this.bloomPass.radius = renderOptions.glowRadius.value;
  }

  add(obj) {
    this.scene.add(obj);
  }

  remove(obj) {
    this.scene.remove(obj);
  }

  update() {
    this.orbitControls.update();
    const cameraPostion = new Vector3();
    this.camera.getWorldPosition(cameraPostion);
    this.pointLight1.position.copy(cameraPostion);
    this.effectComposer.render();
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.camera.fov = (360 / Math.PI) * Math.atan(this.tanFOV * (height / this.initialHeight));
    this.renderer.setSize(width, height);
    this.update();
  }

  dispose() {
    this.renderer.dispose();
    ThreeUtil.disposeScene(this.scene);
  }
}