import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PricingPage from "./components/pricing/PricingPage";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
