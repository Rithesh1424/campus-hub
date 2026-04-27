import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Key, Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Log in normally to get the token
      const loginRes = await axios.post('https://campus-hub-2tb0.onrender.com/api/auth/login', { email, password });
      const token = loginRes.data.token;
      
      // 2. Immediately test if this token has Admin privileges
      try {
        await axios.get('https://campus-hub-2tb0.onrender.com/api/items/admin/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // 3. If it didn't crash, they are an admin! Save token and enter.
        localStorage.setItem('campusHubToken', token);
        window.location.href = '/admin/dashboard';
        
      } catch (adminErr) {
        // If it throws a 403, they are a normal user trying to sneak in.
        setError("ACCESS DENIED: You are not authorized as an Admin.");
        setLoading(false);
      }

    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-red-500/30 p-8 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/50">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Restricted Area</h2>
          <p className="text-zinc-500 text-sm mt-2 font-mono">Campus Hub Master Control</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-mono text-center rounded">{error}</div>}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Admin Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 bg-black border border-zinc-800 text-white rounded focus:border-red-500 focus:outline-none transition-colors font-mono"
              placeholder="admin@mru.ac.in"
              required 
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Passkey</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 bg-black border border-zinc-800 text-white rounded focus:border-red-500 focus:outline-none transition-colors font-mono"
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Key size={18} className="mr-2" /> Authenticate</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;