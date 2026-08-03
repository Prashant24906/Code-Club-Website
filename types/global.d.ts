export { };

declare global {
  module '*.glb';
  module '*.png';
  module '*.jpg';
  
  module 'meshline' {
    export const MeshLineGeometry: any;
    export const MeshLineMaterial: any;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}
