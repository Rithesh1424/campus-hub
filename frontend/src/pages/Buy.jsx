import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2, MessageSquare, Search } from 'lucide-react';

const Buy = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/items');
        setItems(response.data);
      } catch (error) {
        console.error("Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleStartChat = async (item) => {
    const token = localStorage.getItem('campusHubToken');
    if (!token) {
      alert("Security Alert: You must be logged in to initiate a deal.");
      window.location.href = '/login';
      return;
    }

    try {
      // Initialize the anonymous chat
      await axios.post('http://localhost:5000/api/chats/init', {
        itemId: item.id,
        itemName: item.name,
        sellerEmail: item.sellerEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Send them to the Chat Hub!
      navigate('/chat');
    } catch (error) {
      alert("Failed to establish secure connection with seller.");
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center pt-20 text-white font-mono flex justify-center"><Loader2 className="animate-spin text-green-500" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <ShoppingBag size={32} className="text-green-500" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Campus Storefront</h2>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-white focus:border-green-500 focus:outline-none transition-colors text-sm"
          />
        </div>
      </div>

      {/* THE GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20 font-mono">No items currently available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-colors flex flex-col shadow-lg">
              
              <div className="h-48 w-full bg-zinc-900 relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">No Image</div>
                )}
                {item.sellerEmail === 'Campus Hub Official' && (
                  <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-lg">
                    Official Item
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white line-clamp-1">{item.name}</h3>
                  <span className="text-green-400 font-mono font-bold bg-green-500/10 px-2 py-1 rounded text-sm ml-2">₹{item.displayPrice}</span>
                </div>
                
                <p className="text-zinc-400 text-sm mb-6 line-clamp-2 flex-1">{item.description}</p>
                
                <button 
                  onClick={() => handleStartChat(item)}
                  className="w-full py-3 bg-zinc-900 hover:bg-blue-600 text-white font-bold uppercase tracking-widest rounded-lg transition-colors border border-zinc-800 hover:border-blue-500 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Secure Chat
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