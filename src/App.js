import { CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";

function App() {
	return (
		<BrowserRouter>
			<>
				<CssBaseline />
				<div className="app">
					<Header />

					<Dashboard />
				</div>
			</>
		</BrowserRouter>
	);
}

export default App;
