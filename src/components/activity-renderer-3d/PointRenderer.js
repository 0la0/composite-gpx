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
import { clamp, footToMeter, } from '../../services/Math.js';

const scaleOn = new Vector3(1, 1, 1);

class Particle {
  constructor(position, color) {
    this.position = position || new Vector3();
    this.color = color || new Color();
    this.scale = new Vector3(0, 0, 0);
  }
}

const ELEVATION = {
  MAPPED_RANGE: 0.1, // TODO: add to control UI
  HALF_RANGE: 0.05,
};

const normalizeElevation = (elevation = 0, renderOptions) => {
  const elevationMin = footToMeter(renderOptions.elevationMin.value);
  const elevationMax = footToMeter(renderOptions.elevationMax.value);
  const elevationRange = elevationMax - elevationMin;
  const clampedElevation = clamp(elevation, elevationMin, elevationMax);
  const normalized = (clampedElevation - elevationMin) / elevationRange;
  return normalized * ELEVATION.MAPPED_RANGE - ELEVATION.HALF_RANGE;
};

const getCoordsFromPoint = ({ lat = 0, lon = 0, elevation = 0,}, aspectRatio, renderOptions) => new Vector3(
  ((lon - 0.5) * renderOptions.mapSize.value * 0.75) - renderOptions.centerX.value,
  normalizeElevation(elevation, renderOptions),
  ((lat - 0.5) * renderOptions.mapSize.value / aspectRatio) + renderOptions.centerY.value
);

// TODO: map elevation color
const getColorForElevation = (elevation, renderOptions) => {
  return new Color(renderOptions.pointColor.value);
  // const elevationMin = footToMeter(renderOptions.elevationMin.value);
  // const elevationMax = footToMeter(renderOptions.elevationMax.value);
  // const elevationRange = elevationMax - elevationMin;
  // const normalized = (elevation - elevationMin) / elevationRange;
  // const adjusted = normalized * 0.75 + 0.25;
  // return new Color(
  //   adjusted,
  //   0.5,
  //   1 - adjusted,
  // );
};

export default class PointRenderer {
  constructor(profile, renderOptions) {
    const { activities, bounds, } = profile;
    console.log(renderOptions);
    const filterIndex = renderOptions.skipPoints.value || 1;
    const allPoints = activities
      .flatMap(activity => activity.points)
      .filter((_, index) => filterIndex < 2 ? true : index % filterIndex === 0);
    const aspectRatio = (bounds.maxlon - bounds.minlon) / (bounds.maxlat - bounds.minlat);
    const pointSize = renderOptions.pointSize.value;
    const pointGeometry = new BoxBufferGeometry(pointSize, pointSize, pointSize);
    const pointMaterial = new MeshLambertMaterial({ side: FrontSide, });
    
    this.animatedIndex = 0;
    // TODO: if animation speed is 0, render all at once
    this.animationSpeed = renderOptions.animationSpeed.value || 1;
    this.cluster = new InstancedMesh(pointGeometry, pointMaterial, allPoints.length);
    
    this.particles = allPoints.map(particle => {
      const position = getCoordsFromPoint(particle, aspectRatio, renderOptions);
      const color = getColorForElevation(particle.elevation, renderOptions);
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
    const pointsPerFrame = Math.floor(elapsedTime * this.animationSpeed);
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