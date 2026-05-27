import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Upload } from './components/Upload';
import { Editor } from './components/Editor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;
