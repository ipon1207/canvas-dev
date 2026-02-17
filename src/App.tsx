import { FlowCanvas } from "@/features/canvas/components/FlowCanvas";
import { Toaster } from "./components/ui/sonner";

function App() {
	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<FlowCanvas />
			<Toaster />
		</div>
	);
}

export default App;
