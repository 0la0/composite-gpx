import App from '../app';
import Primitives from '../primitives';
import ActivityEditor from '../activity-editor/activity-editor.js';
import ActivityRenderer from '../activity-renderer/activity-renderer.js';
import MapViewer from '../map-viewer/map-viewer.js';
import RenderControls2d from '../render-controls-2d/render-controls-2d.js';

const components = [
  Primitives.TextButton,
  Primitives.ToggleButton,
  Primitives.ComboBox,
  Primitives.ExpandableSection,
  Primitives.SliderHorizontal,
  Primitives.RouterOutlet,
  Primitives.TextInput,
  Primitives.ToastNotifcation,
  App,
  ActivityEditor,
  ActivityRenderer,
  MapViewer,
  RenderControls2d,
];

export default function init() {
  components.forEach(component => customElements.define(component.tag, component));
}
