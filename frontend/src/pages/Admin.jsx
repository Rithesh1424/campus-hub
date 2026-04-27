import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShieldAlert, CheckCircle, XCircle, Activity, Inbox, Database, PlusCircle, Upload, Loader2, LogOut, MessageSquare, Send } from 'lucide-react';

const Admin = () => {
  const [items, setItems] = useState([]);
  const [adminChats, setAdminChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); 
  
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const [activeChat, setActiveChat] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');

  const token = localStorage.getItem('campusHubToken');

  useEffect(() => {
    if (!token) { window.location.href = '/admin'; return; }
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3000);
    return () => clearInterval(interval);
  }, [activeChat?.id]);

  const fetchAdminData = async () => {
    try {
      const itemsRes = await axios.get('http://localhost:5000/api/items/admin/all', { headers: { Authorization: `Bearer ${token}` } });
      setItems(itemsRes.data);

      const chatsRes = await axios.get('http://localhost:5000/api/chats/admin/all', { headers: { Authorization: `Bearer ${token}` } });
      setAdminChats(chatsRes.data);

      if (activeChat) {
        const updatedChat = chatsRes.data.find(c => c.id === activeChat.id);
        if (updatedChat) setActiveChat(updatedChat);
        else setActiveChat(null);
      }
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 403) { alert("SECURITY ALERT: Access Denied."); window.location.href = '/'; }
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this item?`)) return;
    try { await axios.get(`http://localhost:5000/api/items/admin/${action}/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchAdminData(); } catch (err) { alert(`Failed to ${action} item.`); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Force delete this item?")) return;
    try { await axios.delete(`http://localhost:5000/api/items/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchAdminData(); } catch (err) { alert("Failed to delete."); }
  };

  const handleAdminUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file); formData.append('name', name); formData.append('price', price); formData.append('description', description);

    try {
      await axios.post('http://localhost:5000/api/items/admin/create', formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      alert('Official Ad successfully pushed to Storefront!');
      setName(''); setPrice(''); setDescription(''); setFile(null);
      fetchAdminData(); setActiveTab('all');
    } catch (err) { alert('Upload failed.'); } finally { setUploading(false); }
  };

  const sendAdminMessage = async (targetRole) => {
    if (!adminMessage.trim() || !activeChat) return;
    try {
      await axios.post('http://localhost:5000/api/chats/message', 
        { chatId: activeChat.id, text: adminMessage, senderRole: 'admin', targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminMessage('');
      fetchAdminData();
    } catch (err) { alert(`Failed to message ${targetRole}.`); }
  };

  // 🛑 NEW: ADMIN KILL SWITCH
  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("WARNING: Terminate this chat and throw the item back onto the storefront?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/chats/admin/${chatId}`, { headers: { Authorization: `Bearer ${token}` } });
      setActiveChat(null);
      fetchAdminData();
    } catch (err) { alert("Failed to terminate chat."); }
  };

  if (loading) return <div className="text-center pt-20 text-white font-mono">Verifying Security Credentials...</div>;

  const displayedItems = activeTab === 'pending' ? items.filter(item => item.status === 'pending') : items;
  const pendingChatsCount = adminChats.filter(c => c.status === 'pending_admin').length;

  return (
    <div className="p-6 max-w-7xl mx-auto pt-8 pb-24">
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
        <ShieldAlert size={32} className="text-red-500" />
        <h2 className="text-3xl font-bold text-white tracking-tight">Master Control Panel</h2>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800"><Activity size={14} className="text-green-500" /> Secure Connection</div>
          <button onClick={() => { localStorage.removeItem('campusHubToken'); window.location.href = '/admin'; }} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"><LogOut size={16} /> Admin Logout</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={() => setActiveTab('pending')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'}`}><Inbox size={18} /> Pending Approvals</button>
        <button onClick={() => setActiveTab('all')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'all' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'}`}><Database size={18} /> Manage DB</button>
        <button onClick={() => setActiveTab('create')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'create' ? 'bg-green-500 text-black' : 'bg-zinc-900 text-green-500 hover:bg-zinc-800 border border-green-500/20'}`}><PlusCircle size={18} /> Post Official Ad</button>
        <button onClick={() => setActiveTab('chats')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ml-auto ${activeTab === 'chats' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-zinc-900 text-blue-500 hover:bg-zinc-800 border border-blue-500/20'}`}>
          <MessageSquare size={18} /> Comms Intercept
          {pendingChatsCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{pendingChatsCount} Action Required</span>}
        </button>
      </div>

      <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
        {activeTab === 'chats' ? (
          <div className="flex h-[600px]">
            <div className="w-1/3 border-r border-zinc-800 overflow-y-auto p-2 space-y-2 bg-black">
              {adminChats.map(chat => (
                <button key={chat.id} onClick={() => setActiveChat(chat)} className={`w-full text-left p-4 rounded-lg border transition-all ${activeChat?.id === chat.id ? 'bg-zinc-900 border-blue-500' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-sm">{chat.itemName}</span>
                    {chat.status === 'pending_admin' && <span className="bg-red-500/20 text-red-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Action</span>}
                  </div>
                  <p className="text-[10px] text-green-500 font-mono mt-2 truncate">B: {chat.buyerEmail}</p>
                  <p className="text-[10px] text-blue-500 font-mono truncate">S: {chat.sellerEmail}</p>
                </button>
              ))}
            </div>

            <div className="w-2/3 flex flex-col relative">
              {!activeChat ? (
                <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono">Select a deal to broker comms.</div>
              ) : (
                <>
                  <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white">Item: {activeChat.itemName}</h3>
                      <p className="text-xs text-yellow-500 font-mono mt-1 font-bold">MODE: BROKER</p>
                    </div>
                    {/* 🛑 TERMINATE CHAT BUTTON */}
                    <button onClick={() => handleDeleteChat(activeChat.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 rounded transition-colors" title="Delete Chat & Restore Item">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950">
                    {activeChat.messages.map((msg, i) => {
                      const isSystem = msg.senderRole === 'system';
                      const isAdmin = msg.senderRole === 'admin';
                      
                      let badge = '';
                      if (isAdmin && msg.targetRole === 'buyer') badge = ' (DM to Buyer)';
                      if (isAdmin && msg.targetRole === 'seller') badge = ' (DM to Seller)';
                      if (!isAdmin && !isSystem && msg.targetRole === 'admin') badge = ' (Private to Admin)';

                      return isSystem ? (
                        <div key={i} className="text-center"><span className="bg-zinc-900 text-zinc-500 text-[10px] uppercase px-3 py-1 rounded-full border border-zinc-800">{msg.text}</span></div>
                      ) : (
                        <div key={i} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-zinc-600 uppercase mb-1 font-bold">
                            {isAdmin ? `🛡️ You${badge}` : `${msg.senderRole.toUpperCase()}${badge}`}
                          </span>
                          <div className={`px-4 py-2 rounded-xl text-sm ${isAdmin ? 'bg-red-600 text-white' : msg.senderRole === 'buyer' ? 'bg-green-600/20 text-green-500 border border-green-500/30' : 'bg-blue-600/20 text-blue-500 border border-blue-500/30'}`}>{msg.text}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-black border-t border-zinc-800 flex flex-col gap-3">
                    <input 
                      type="text" 
                      value={adminMessage} 
                      onChange={(e) => setAdminMessage(e.target.value)} 
                      placeholder="Type your negotiation message here..."
                      className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => sendAdminMessage('buyer')} className="flex-1 py-3 bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white border border-green-500/50 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">
                        Send to Buyer
                      </button>
                      <button onClick={() => sendAdminMessage('seller')} className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/50 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">
                        Send to Seller
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : activeTab === 'create' ? (
          <div className="p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Create Platform Post</h3>
            <form onSubmit={handleAdminUpload} className="space-y-5">
              <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer ${file ? 'border-green-500/50 bg-green-500/5' : 'border-zinc-700 bg-zinc-900/50'}`}>
                <input type="file" className="hidden" id="admin-image-upload" onChange={(e) => setFile(e.target.files[0])} accept="image/*" required />
                <label htmlFor="admin-image-upload" className="flex flex-col items-center cursor-pointer w-full h-full">
                  <Upload size={32} className={`${file ? 'text-green-500' : 'text-zinc-500'} mb-3`} />
                  <span className="text-zinc-400 font-medium">{file ? file.name : "Tap to upload image"}</span>
                </label>
              </div>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Item Title" className="w-full p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-white" required />
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Base Price (₹)" className="w-full p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-white" required />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-white h-24 resize-none" />
              <button type="submit" disabled={uploading || !file} className="w-full py-4 bg-green-500 text-black rounded-lg font-bold hover:bg-green-600 flex items-center justify-center disabled:opacity-50">
                {uploading ? <Loader2 className="animate-spin mr-2" /> : "Publish to Storefront"}
              </button>
            </form>
          </div>
        ) : (
          <table className="w-full text-left text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b border-zinc-800">Thumbnail</th>
                <th className="p-4 border-b border-zinc-800">Item Details</th>
                <th className="p-4 border-b border-zinc-800">Seller ID</th>
                <th className="p-4 border-b border-zinc-800">Status</th>
                <th className="p-4 border-b border-zinc-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {displayedItems.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-zinc-500 font-medium">{activeTab === 'pending' ? '🎉 No pending requests!' : 'Database is empty.'}</td></tr>
              ) : (
                displayedItems.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-900/80 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded bg-zinc-800 border border-zinc-700 overflow-hidden">
                        {item.imageUrl ? <img src={item.imageUrl} alt="item" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">No Img</div>}
                      </div>
                    </td>
                    <td className="p-4"><p className="font-bold text-zinc-100">{item.name}</p><p className="text-green-400 font-mono text-sm mt-1">₹{item.price}</p></td>
                    <td className="p-4 text-xs text-zinc-400 truncate max-w-[150px]">
                      {item.sellerEmail === 'Campus Hub Official' ? <span className="text-green-500 font-bold">{item.sellerEmail}</span> : item.sellerEmail}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : item.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>{item.status}</span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {item.status === 'pending' && (
                        <>
                          <button onClick={() => handleAction(item.id, 'approve')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition" title="Approve Ad"><CheckCircle size={18} /></button>
                          <button onClick={() => handleAction(item.id, 'deny')} className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded transition" title="Deny & Delete"><XCircle size={18} /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition" title="Force Delete"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Admin;