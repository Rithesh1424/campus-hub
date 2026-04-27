import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Sell = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('campusHubToken');
    if (!token) {
      setError("Authentication missing. Please log in.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);

    try {
      const response = await axios.post('http://localhost:5000/api/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 201) setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto pt-20 text-center space-y-4">
        <CheckCircle2 size={64} className="text-green-500 mx-auto" />
        <h2 className="text-3xl font-bold text-white">Submitted!</h2>
        <p className="text-zinc-400">Admins have been paged on Discord.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-lg font-bold">Sell another item</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto pt-8">
      <h2 className="text-3xl font-bold mb-2 text-white">Sell an Item</h2>
      <p className="text-zinc-400 mb-8 text-sm">Upload your item for admin verification.</p>
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">{error}</div>}

      <form onSubmit={handleUpload} className="space-y-5">
        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer ${file ? 'border-green-500/50 bg-green-500/5' : 'border-zinc-700 bg-zinc-900/50'}`}>
          <input type="file" className="hidden" id="image-upload" onChange={(e) => setFile(e.target.files[0])} accept="image/*" required />
          <label htmlFor="image-upload" className="flex flex-col items-center cursor-pointer w-full h-full">
            <Upload size={32} className={`${file ? 'text-green-500' : 'text-zinc-500'} mb-3`} />
            <span className="text-zinc-400 font-medium">{file ? file.name : "Tap to upload image"}</span>
          </label>
        </div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Item Title" className="w-full p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-white" required />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Base Price (₹)" className="w-full p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-white" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief Description" className="w-full p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-white h-24 resize-none" />
        <button type="submit" disabled={loading || !file} className="w-full py-4 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 flex items-center justify-center disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin mr-2" /> : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Sell;