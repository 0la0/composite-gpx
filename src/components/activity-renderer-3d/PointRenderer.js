import {
  BoxBufferGeometry,
  Color,
  FrontSide,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshLambertMaterial,
  Object3D,
  Vector3,
} from 'three';
import { clamp, } from '../../services/Math.js';

const scaleOff = new Vector3(0, 0, 0);
const scaleOn = new Vector3(1, 1, 1);
const geoSize = 0.005;
const animationSpeed = 2.5;
const MAP_BOUNDS = 3;

class Particle {
  constructor(position, color) {
    this.position = position || new Vector3();
    this.color = color || new Color();
    this.scale = scaleOff.clone();
  }
}

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

const getCoordsFromPoint = ({ lat = 0, lon = 0, elevation = 0,}, aspectRatio) => new Vector3(
  (lon - 0.5) * MAP_BOUNDS * 0.75,
  normalizeElevation(elevation),
  (lat - 0.5) * MAP_BOUNDS / aspectRatio
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
  constructor({ activities, bounds, }) {
    const allPoints = activities
      .flatMap(activity => activity.points)
      .filter((point, index) => index % 5 === 0);
    const aspectRatio = (bounds.maxlon - bounds.minlon) / (bounds.maxlat - bounds.minlat);

    const pointGeometry = new BoxBufferGeometry(geoSize, geoSize, geoSize);
    const pointMaterial = new MeshLambertMaterial({ side: FrontSide, });
    
    this.animatedIndex = 0;
    this.cluster = new InstancedMesh(pointGeometry, pointMaterial, allPoints.length);
    
    this.particles = allPoints.map(particle => {
      const position = getCoordsFromPoint(particle, aspectRatio);
      const color = getColorForElevation(particle.elevation);
      return new Particle(position, color);
    });
  
    this.colorBuffer = new Float32Array(allPoints.length * 3);
    this.cluster.material.vertexColors = true;

    const objectProxy = new Object3D();
    this.particles.forEach((geoProperty, index) => {
      const colorIndex = index * 3;
      this.colorBuffer[colorIndex] = geoProperty.color.r;
      this.colorBuffer[colorIndex + 1] = geoProperty.color.g;
      this.colorBuffer[colorIndex + 2] = geoProperty.color.b;
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
    if (this.animatedIndex >= this.particles.length) {
      return false;
    }
    const objectProxy = new Object3D();
    const pointsPerFrame = Math.floor(elapsedTime * animationSpeed);
    const lowerBound = this.animatedIndex;
    const upperBound = Math.min(lowerBound + pointsPerFrame, this.particles.length - 1);
    for (let i = lowerBound; i <= upperBound; i++) {
      const animatedScale = scaleOn.clone();
      objectProxy.position.copy(this.particles[i].position);
      objectProxy.scale.copy(animatedScale);
      objectProxy.updateMatrix();
      this.cluster.setMatrixAt(i, objectProxy.matrix);
    }
    this.animatedIndex = this.animatedIndex + pointsPerFrame;
    this.cluster.instanceMatrix.needsUpdate = true;
    return true;
  }

  dispose() {
    this.cluster?._geometry?.dispose();
    this.cluster?._material?.dispose();
  }
}