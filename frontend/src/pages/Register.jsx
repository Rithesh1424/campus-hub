import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      alert("Registration successful! Please log in.");
      navigate('/login'); 
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
            <GraduationCap size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase">New Student</h2>
          <p className="text-zinc-500 text-sm mt-2 font-mono">Enroll in Campus Hub</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-mono text-center rounded">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-4 bg-black border border-zinc-800 text-white rounded focus:border-green-500 focus:outline-none transition-colors font-mono"
              placeholder="John Doe"
              required 
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">College Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 bg-black border border-zinc-800 text-white rounded focus:border-green-500 focus:outline-none transition-colors font-mono"
              placeholder="student@mru.ac.in"
              required 
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 bg-black border border-zinc-800 text-white rounded focus:border-green-500 focus:outline-none transition-colors font-mono"
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 py-4 bg-green-500 hover:bg-green-600 text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-zinc-800 pt-6">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 hover:text-green-400 font-bold transition-colors">
              Log In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;