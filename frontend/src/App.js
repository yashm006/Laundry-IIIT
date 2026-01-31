import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentApp from './StudentApp';
import WorkerApp from './WorkerApp';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route path="/student" element={<StudentApp />} />
        <Route path="/worker" element={<WorkerApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;