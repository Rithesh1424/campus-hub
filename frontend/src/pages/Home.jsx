import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ShoppingBag } from 'lucide-react';

const Buy = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('https://campus-hub-2tb0.onrender.com/api/items');
        setItems(response.data);
      } catch (err) {
        setError('Failed to load the marketplace.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-white w-12 h-12" /></div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto pt-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag size={32} className="text-white" />
        <h2 className="text-3xl font-bold text-white">Marketplace</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">
          <p className="text-xl">No items available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="h-48 w-full bg-zinc-800 relative">
                <img 
                  src={`https://campus-hub-2tb0.onrender.com/${item.imageUrl}`} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-green-400 font-bold text-2xl mb-3">₹{item.displayPrice}</p>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                <button 
                  onClick={async () => {
                    const token = localStorage.getItem('campusHubToken');
                    if (!token) return alert("Please log in first.");
                    if (!window.confirm(`Commit to buying this for ₹${item.displayPrice}? You will receive pickup instructions via email.`)) return;
                    
                    try {
                      const res = await axios.post(`https://campus-hub-2tb0.onrender.com/api/items/buy/${item.id}`, {}, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      alert(res.data.message);
                      window.location.reload();
                    } catch (err) {
                      alert("Failed to process request.");
                    }
                  }}
                  className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
                >
                  Request to Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Buy;