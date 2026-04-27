import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, ShieldAlert, CheckCircle, XCircle, Clock, Send } from 'lucide-react';

const ChatHub = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freeText, setFreeText] = useState(''); 
  const token = localStorage.getItem('campusHubToken');

  const buyerPrompts = ["Is it still available?", "What is the condition?", "Is the price negotiable?"];
  const sellerPrompts = ["Yes, it is available.", "No, sorry.", "Good condition.", "Price is fixed.", "Slightly negotiable."];

  const fetchChats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chats/my-chats', { headers: { Authorization: `Bearer ${token}` } });
      setChats(res.data);
      if (activeChat) {
        const updatedChat = res.data.find(c => c.id === activeChat.id);
        if (updatedChat) setActiveChat(updatedChat);
        else setActiveChat(null); // If chat was deleted, clear active
      }
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [activeChat?.id]);

  const sendMessage = async (text, target = 'all') => {
    try {
      await axios.post('http://localhost:5000/api/chats/message', 
        { chatId: activeChat.id, text, senderRole: activeChat.role, targetRole: target },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFreeText('');
      fetchChats(); 
    } catch (err) { alert("Failed to send message."); }
  };

  const handleRequestBuy = async () => {
    if (!window.confirm("Ready to buy? The Admin will broker this deal securely.")) return;
    try {
      await axios.post('http://localhost:5000/api/chats/request-buy', { chatId: activeChat.id }, { headers: { Authorization: `Bearer ${token}` } });
      fetchChats();
    } catch (err) { alert("Failed to request buy."); }
  };

  // 🛑 NEW: CANCEL DEAL
  const handleCancelDeal = async () => {
    if (!window.confirm("Cancel this deal? The item will be returned to the storefront.")) return;
    try {
      await axios.post('http://localhost:5000/api/chats/cancel', { chatId: activeChat.id }, { headers: { Authorization: `Bearer ${token}` } });
      setActiveChat(null);
      fetchChats();
    } catch (err) { alert("Failed to cancel deal."); }
  };

  if (loading) return <div className="min-h-screen pt-20 text-center text-green-500 font-mono">Loading Secure Comms...</div>;

  const visibleMessages = activeChat?.messages.filter(msg => {
    if (msg.senderRole === 'system') return true;
    if (!msg.targetRole || msg.targetRole === 'all') return true; 
    if (msg.senderRole === activeChat.role) return true; 
    if (msg.targetRole === activeChat.role) return true; 
    return false; 
  });

  return (
    <div className="max-w-6xl mx-auto p-4 pt-8 h-[calc(100vh-140px)] flex gap-6">
      <div className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={18} className="text-green-500" /> Active Deals
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {chats.length === 0 && <p className="text-zinc-500 text-sm text-center p-4 font-mono">No active chats.</p>}
          {chats.map(chat => (
            <button key={chat.id} onClick={() => setActiveChat(chat)} className={`w-full text-left p-4 rounded-lg transition-all border ${activeChat?.id === chat.id ? 'bg-zinc-800 border-green-500/50' : 'bg-black border-zinc-800 hover:border-zinc-600'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-white truncate">{chat.itemName}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${chat.role === 'buyer' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>You: {chat.role}</span>
              </div>
              <div className="text-xs text-zinc-500 flex items-center gap-1 mt-2">
                {chat.status === 'pending_admin' ? <><ShieldAlert size={12} className="text-yellow-500"/> Admin Brokering</> : <><CheckCircle size={12} className="text-green-500"/> Active</>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-2/3 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden relative">
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-mono">Select a deal to view secure comms.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">{activeChat.itemName}</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Speaking with {activeChat.status === 'pending_admin' ? 'Campus Hub Admin' : `Anonymous ${activeChat.role === 'buyer' ? 'Seller' : 'Buyer'}`}</p>
              </div>
              {activeChat.status === 'pending_admin' && (
                <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold uppercase rounded flex items-center gap-2">
                  <ShieldAlert size={14} /> Admin Broker Active
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {visibleMessages.map((msg, i) => {
                if (msg.senderRole === 'system') return <div key={i} className="text-center my-2"><span className="bg-zinc-900 text-zinc-500 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-800">{msg.text}</span></div>;
                const isMe = msg.senderRole === activeChat.role;
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-zinc-600 uppercase mb-1 font-bold tracking-widest">
                      {isAdmin ? '🛡️ Campus Hub Admin' : isMe ? 'You' : `Anonymous ${msg.senderRole}`}
                    </span>
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${isAdmin ? 'bg-red-500/20 text-white border border-red-500/50' : isMe ? 'bg-green-600 text-black font-medium' : 'bg-zinc-800 text-white border border-zinc-700'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-black border-t border-zinc-800">
              {activeChat.status === 'pending_admin' ? (
                <div className="flex flex-col gap-3">
                  <form onSubmit={(e) => { e.preventDefault(); if (freeText.trim()) sendMessage(freeText, 'admin'); }} className="flex gap-2">
                    <input type="text" value={freeText} onChange={(e) => setFreeText(e.target.value)} placeholder="Reply privately to the Admin..." className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 focus:outline-none focus:border-green-500 font-mono text-sm" />
                    <button type="submit" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-bold uppercase rounded-lg transition-colors"><Send size={18} /></button>
                  </form>
                  {/* Cancel button stays available even during Admin phase */}
                  {activeChat.role === 'buyer' && (
                     <button onClick={handleCancelDeal} className="w-full mt-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold uppercase tracking-widest rounded-lg flex justify-center items-center gap-2 transition-colors"><XCircle size={18} /> Cancel Deal</button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Select Response:</p>
                  <div className="flex flex-wrap gap-2">
                    {(activeChat.role === 'buyer' ? buyerPrompts : sellerPrompts).map((prompt, i) => (
                      <button key={i} onClick={() => sendMessage(prompt, 'all')} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-green-500 text-zinc-300 hover:text-white rounded-full text-sm transition-all">{prompt}</button>
                    ))}
                  </div>
                  {activeChat.role === 'buyer' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
                      <button onClick={handleRequestBuy} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-bold uppercase tracking-widest rounded-lg flex justify-center items-center gap-2"><CheckCircle size={18} /> Request to Buy</button>
                      <button onClick={handleCancelDeal} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold uppercase tracking-widest rounded-lg flex justify-center items-center gap-2"><XCircle size={18} /> Cancel Deal</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHub;