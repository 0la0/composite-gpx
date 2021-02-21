
const disposeMaterial = material => {
  material.dispose();
  Object.values(material).forEach(material => {
    if (material && typeof material === 'object' && 'minFilter' in material) {
      material.dispose();
    }
  });
};

export default class ThreeUtil {
  static disposeScene(scene) {
    scene.traverse(object => {
      if (!object.isMesh) { return; }
      object.geometry.dispose();
      if (object.material.isMaterial) {
        disposeMaterial(object.material);
      } else {
        object.material.forEach(disposeMaterial);
      }
    });
  }
}