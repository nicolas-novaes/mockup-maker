import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Editor } from './components/Editor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
