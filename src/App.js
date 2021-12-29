import { CssBaseline } from "@mui/material";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";

function App() {
	return (
		<>
			<CssBaseline />
			<div className="app">
				<Header />

				<Dashboard />
			</div>
		</>
	);
}

export default App;
