import App from '../app';
import Primitives from '../primitives';
import ActivityEditor from '../activity-editor/activity-editor.js';
import MapViewer from '../map-viewer/map-viewer.js';

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
  MapViewer,
];

export default function init() {
  components.forEach(component => customElements.define(component.tag, component));
}
