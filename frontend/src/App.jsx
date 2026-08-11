// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import LearnPage from './pages/LearnPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>
    </Router>
  );
}