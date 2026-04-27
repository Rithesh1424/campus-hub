import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Standard Components
import Navbar from './components/Navbar';
import Landing from './pages/Landing'; 
import Sell from './pages/Sell';
import Buy from './pages/Buy';
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import Profile from './pages/Profile'; 
import ChatHub from './pages/ChatHub'; // 🟢 NEW CHAT HUB IMPORT

// Locked Admin Components
import AdminLogin from './pages/AdminLogin'; 
import Admin from './pages/Admin'; 

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* THE GATEWAY */}
        <Route path="/" element={<Landing />} /> 
        
        {/* PUBLIC/STUDENT ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* 🟢 THE SECURE CHAT ROUTE */}
        <Route path="/chat" element={<ChatHub />} />
        
        {/* 🛡️ ISOLATED ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;