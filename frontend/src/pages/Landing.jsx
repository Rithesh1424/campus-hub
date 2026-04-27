import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShieldAlert, GraduationCap } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* HEADER */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-3 mb-4">
          <span className="bg-white text-black px-3 py-1 rounded text-2xl font-bold">CH</span>
          <h1 className="text-4xl font-bold text-white tracking-tight">Campus Hub</h1>
        </div>
        <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Select Access Level</p>
      </div>

      {/* THE DOORS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* 🚪 DOOR 1: NOW POINTS TO /login */}
        <Link 
          to="/login" 
          className="group relative bg-zinc-950 border border-zinc-800 hover:border-green-500/50 rounded-2xl p-10 flex flex-col items-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]"
        >
          <div className="w-20 h-20 bg-zinc-900 group-hover:bg-green-500/10 rounded-full flex items-center justify-center mb-6 transition-colors border border-zinc-800 group-hover:border-green-500/30">
            <GraduationCap size={40} className="text-zinc-500 group-hover:text-green-500 transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Student Portal</h2>
          <p className="text-zinc-500 text-center text-sm">Log in to access the marketplace, buy, and sell campus items.</p>
          <div className="mt-8 px-6 py-2 bg-zinc-900 group-hover:bg-green-500 group-hover:text-black text-zinc-400 rounded-full text-sm font-bold uppercase tracking-wider transition-colors">
            Student Login
          </div>
        </Link>

        {/* 🚪 DOOR 2: MASTER CONTROL */}
        <Link 
          to="/admin" 
          className="group relative bg-zinc-950 border border-zinc-800 hover:border-red-500/50 rounded-2xl p-10 flex flex-col items-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
        >
          <div className="w-20 h-20 bg-zinc-900 group-hover:bg-red-500/10 rounded-full flex items-center justify-center mb-6 transition-colors border border-zinc-800 group-hover:border-red-500/30">
            <ShieldAlert size={40} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Master Control</h2>
          <p className="text-zinc-500 text-center text-sm">Restricted administrative access. Staff and developers only.</p>
          <div className="mt-8 px-6 py-2 bg-zinc-900 group-hover:bg-red-600 group-hover:text-white text-zinc-400 rounded-full text-sm font-bold uppercase tracking-wider transition-colors">
            Authenticate
          </div>
        </Link>

      </div>
    </div>
  );
};

export default Landing;