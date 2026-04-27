import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Save, Loader2, UploadCloud } from 'lucide-react';

const Profile = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [profilePic, setProfilePic] = useState(''); 
  const [file, setFile] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('campusHubToken');

  const iconPack = [
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Rithesh&backgroundColor=transparent",
    "https://api.dicebear.com/9.x/bottts/svg?seed=Cyber&backgroundColor=transparent",
    "https://api.dicebear.com/9.x/pixel-art/svg?seed=Gamer",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Student",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setName(response.data.name || '');
        setMobile(response.data.mobile || '');
        setProfilePic(response.data.profilePic || '');
      } catch (err) {
        console.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);
    formData.append('profilePicUrl', profilePic); 
    if (file) {
      formData.append('image', file); 
    }

    try {
      await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Profile details successfully updated!');
      window.location.href = '/buy'; // 🛑 Kicks the user to the storefront instantly
    } catch (err) {
      alert('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center pt-20 text-white font-mono flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto pt-8 pb-24 min-h-screen">
      <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-4">
        <User size={32} className="text-green-500" />
        <h2 className="text-3xl font-bold text-white tracking-tight">Account Setup</h2>
      </div>
      
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">Choose Avatar</label>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-green-500 overflow-hidden flex-shrink-0">
                {file ? (
                  <img src={URL.createObjectURL(file)} alt="Custom" className="w-full h-full object-cover" />
                ) : profilePic ? (
                  <img src={profilePic} alt="Selected" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-zinc-600" /></div>
                )}
              </div>

              <div className="h-12 w-px bg-zinc-800 mx-2 hidden sm:block"></div>

              <div className="flex gap-3 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                {iconPack.map((iconUrl, index) => (
                  <button 
                    key={index}
                    type="button"
                    onClick={() => { setProfilePic(iconUrl); setFile(null); }}
                    className={`w-12 h-12 rounded-full overflow-hidden transition-all ${profilePic === iconUrl && !file ? 'ring-2 ring-green-500 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={iconUrl} alt="Preset" className="w-full h-full object-cover bg-zinc-800" />
                  </button>
                ))}
              </div>

              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer border border-zinc-700 hover:border-zinc-500 overflow-hidden group" title="Upload Custom Photo">
                <input 
                  type="file" 
                  onChange={(e) => { setFile(e.target.files[0]); setProfilePic(''); }} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  accept="image/*"
                />
                <UploadCloud size={20} className="text-zinc-400 group-hover:text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-black border border-zinc-800 text-white rounded focus:border-green-500 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Contact Number</label>
              <input 
                type="tel" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full p-4 bg-black border border-zinc-800 text-white rounded focus:border-green-500 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center disabled:opacity-50 mt-4"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Save Settings</>}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default Profile;