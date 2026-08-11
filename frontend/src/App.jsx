import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WorkspacePage from './pages/WorkspacePage';
import LearnPage from './pages/LearnPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkspacePage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>
    </BrowserRouter>
  );
}