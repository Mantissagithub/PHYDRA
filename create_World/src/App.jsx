import {React} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import SpaceStationLayout from './components/allThings';
// import Zones from './components/crewQuarters';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SpaceStationLayout />} />
      </Routes>
    </Router>
  );
}