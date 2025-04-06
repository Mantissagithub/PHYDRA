import {React} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import SpaceStationLayout from './components/allThings';
import Navbar from './components/navBar';
import SpaceZonesDashboard from './components/zoneThing';
import ContainerDashboard from './components/containerThing';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SpaceStationLayout />} />
        <Route path="/crewQuarters" element={<Navbar />} />
        <Route path="/zones" element={<SpaceZonesDashboard />} />
        <Route path="/containers" element={<ContainerDashboard />} />
      </Routes>
    </Router>
  );
}