import { React } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import SpaceStationLayout from "./components/allThings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SpaceStationLayout />} />
      </Routes>
    </Router>
  );
}
