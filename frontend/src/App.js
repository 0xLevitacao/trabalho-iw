import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import MovieDisplay from './components/MovieDisplay';
import Admin from './components/Admin';

function App() {
  return (
    <div className="App bg-dark min-vh-100">
      <Router>
        <Routes>
          <Route path="/" element={<MovieDisplay />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;