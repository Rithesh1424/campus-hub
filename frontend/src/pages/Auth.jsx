import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = () => {
  const [step, setStep] = useState(1); // 1 = Login/Reg, 2 = OTP
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('campusHubToken', res.data.token);
        navigate(res.data.needsSetup ? '/setup' : '/home');
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/register', { email, password });
        if (res.data.requiresOtp) setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify', { email, otp });
      localStorage.setItem('campusHubToken', res.data.token);
      navigate(res.data.needsSetup ? '/setup' : '/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <h1 className="text-4xl font-bold mb-2 text-center tracking-tight">Campus Hub</h1>
        <p className="text-zinc-400 text-center mb-6">
          {step === 1 ? "Managed marketplace for students" : "Enter the verification code sent to your email"}
        </p>
        
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Campus Email (@mru.edu.in)" className="w-full p-3 bg-zinc-950 rounded-lg border border-zinc-800 focus:outline-none focus:border-white transition-colors" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 bg-zinc-950 rounded-lg border border-zinc-800 focus:outline-none focus:border-white transition-colors" required />
            <button type="submit" disabled={loading} className="w-full py-3 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold transition-colors disabled:opacity-50">
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register & Get OTP')}
            </button>
            <p className="mt-6 text-center text-zinc-500 text-sm">
              {isLogin ? "New to Campus Hub?" : "Already verified?"}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} type="button" className="ml-2 text-white hover:underline font-medium">
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-Digit OTP" className="w-full p-3 bg-zinc-950 rounded-lg border border-zinc-800 focus:outline-none focus:border-white transition-colors text-center tracking-widest text-lg" required maxLength={6} />
            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;