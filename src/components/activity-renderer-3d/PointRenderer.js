import {
  BoxBufferGeometry,
  Color,
  FrontSide,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  TetrahedronBufferGeometry,
  Vector3,
} from 'three';
import { clamp, } from '../../services/Math.js';

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

export default class PointRenderer {
  constructor(particles) {
    const pointGeometry = new BoxBufferGeometry(geoSize, geoSize, geoSize);
    const pointMaterial = new MeshLambertMaterial({ side: FrontSide, });
    
    this.animatedIndex = 0;
    // this.particles = psarticles;
    this.cluster = new InstancedMesh(pointGeometry, pointMaterial, particles.length);
    this.geoProperties = new Array(particles.length).fill(null).map(() => new GeoProperties());
    this.colorBuffer = new Float32Array(particles.length * 3);
    this.cluster.material.vertexColors = true;

    // TODO: set size ast zero ...
    const objectProxy = new Object3D();
    this.geoProperties.forEach((geoProperty, index) => {
      const position = getCoordsFromPoint(particles[index]);
      geoProperty.position = position;
      const colorIndex = index * 3;
      const color = getColorForElevation(particles[index].elevation);
      this.colorBuffer[colorIndex] = color.r;
      this.colorBuffer[colorIndex + 1] = color.g;
      this.colorBuffer[colorIndex + 2] = color.b;
      objectProxy.position.copy(geoProperty.position);
      objectProxy.scale.copy(geoProperty.scale);
      objectProxy.updateMatrix();
      this.cluster.setMatrixAt(index, objectProxy.matrix);  
    });
    this.cluster.geometry.setAttribute('color', new InstancedBufferAttribute(this.colorBuffer, 3));
    this.cluster.instanceMatrix.needsUpdate = true;

  }

  getMesh() {
    return this.cluster;
  }

  update(elapsedTime) {
    const objectProxy = new Object3D();
    const pointsPerFrame = Math.floor(elapsedTime * animationSpeed);
    if (this.animatedIndex < this.geoProperties.length) {
      const lowerBound = this.animatedIndex;
      const upperBound = Math.min(lowerBound + pointsPerFrame, this.geoProperties.length - 1);
      for (let i = lowerBound; i <= upperBound; i++) {
        const animatedScale = scaleOn.clone();
        objectProxy.position.copy(this.geoProperties[i].position);
        objectProxy.scale.copy(animatedScale);
        objectProxy.updateMatrix();
        this.cluster.setMatrixAt(i, objectProxy.matrix);
      }
      this.animatedIndex = this.animatedIndex + pointsPerFrame;
      this.cluster.instanceMatrix.needsUpdate = true;
    }
  }

  dispose() {
    this.cluster?._geometry?.dispose();
    this.cluster?._material?.dispose();
  }
}