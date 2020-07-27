// This is the component that wraps the calendar in a drag and drop context to allow dragging. 

import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

export default DragDropContext(HTML5Backend);
