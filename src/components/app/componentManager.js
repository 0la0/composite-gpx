import App from '../app';
import Primitives from '../primitives';
import ActivityEditor from '../activity-editor/activity-editor.js';
import ActivityRenderer2d from '../activity-renderer-2d/activity-renderer-2d.js';
import ActivityRenderer3d from '../activity-renderer-3d/activity-renderer-3d.js';
import MapViewer from '../map-viewer/map-viewer.js';
import RenderControls2d from '../render-controls-2d/render-controls-2d.js';
import RenderControls3d from '../render-controls-3d/render-controls-3d.js';
import ProfileSelector from '../profile-selector/profile-selector.js';

const components = [
  Primitives.TextButton,
  Primitives.ToggleButton,
  Primitives.ColorInput,
  Primitives.ComboBox,
  Primitives.ExpandableSection,
  Primitives.SliderHorizontal,
  Primitives.RouterOutlet,
  Primitives.TextInput,
  Primitives.ToastNotifcation,  
  App,
  ActivityEditor,
  ActivityRenderer2d,
  ActivityRenderer3d,
  MapViewer,
  RenderControls2d,
  RenderControls3d,
  ProfileSelector,
];

export default function init() {
  components.forEach(component => customElements.define(component.tag, component));
}
