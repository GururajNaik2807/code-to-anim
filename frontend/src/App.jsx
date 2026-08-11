import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Routes>
          {/* Your Interactive Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Your Main Visualizer Workspace */}
          <Route path="/app" element={<WorkspacePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;