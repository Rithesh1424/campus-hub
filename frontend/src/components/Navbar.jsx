import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, PlusCircle, User, LogOut, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('campusHubToken');
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to load user data.");
      }
    };
    fetchUser();
  }, [location.pathname]);

  if (location.pathname === '/' || location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/register') {
    return null; 
  }

  return (
    <>
      {/* 🔝 TOP HEADER */}
      <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/buy" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:opacity-80 transition" title="Go to Storefront">
            <span className="bg-white text-black px-2 py-1 rounded">CH</span>
            Campus Hub
          </Link>

          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition">
            <span className={`font-bold text-sm hidden sm:block ${location.pathname === '/profile' ? 'text-green-500' : 'text-white'}`}>
              {userData?.name || "Student"}
            </span>
            <div className={`w-9 h-9 rounded-full bg-zinc-900 border-2 flex items-center justify-center overflow-hidden ${location.pathname === '/profile' ? 'border-green-500' : 'border-zinc-700'}`}>
              {userData?.profilePic ? (
                <img src={userData.profilePic} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-zinc-500" />
              )}
            </div>
          </Link>
        </div>
      </nav>

      {/* ⬇️ BOTTOM TAB BAR */}
      <nav className="bg-zinc-950 border-t border-zinc-800 fixed bottom-0 w-full z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/buy" className={`flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${location.pathname === '/buy' ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}>
            <ShoppingBag size={24} /> <span>Buy</span>
          </Link>
          
          <Link to="/sell" className={`flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${location.pathname === '/sell' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>
            <PlusCircle size={24} /> <span>Sell</span>
          </Link>

          {/* 🟢 NEW CHAT ICON */}
          <Link to="/chat" className={`flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${location.pathname === '/chat' ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}>
            <MessageSquare size={24} /> <span>Chat</span>
          </Link>

          <button onClick={() => { localStorage.removeItem('campusHubToken'); window.location.href = '/'; }} className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors">
            <LogOut size={24} /> <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;