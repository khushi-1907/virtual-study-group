import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, FileText, Sparkles, Upload, Paperclip, Loader2, Download, MessageSquare, History, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, SOCKET_URL } from '../config';

const GroupRoom = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [group, setGroup] = useState(null);
    const [tab, setTab] = useState('chat'); // 'chat', 'files', 'summary'
    const [summary, setSummary] = useState('');
    const [summarizing, setSummarizing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const scrollRef = useRef();

    useEffect(() => {
        fetchGroup();
        fetchMessages();
        fetchFiles();

        socket.emit('join_group', id);

        socket.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, tab]);

    const fetchGroup = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/groups/${id}/join`);
            setGroup(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/groups/${id}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/groups/${id}/files`);
            setFiles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            group: id,
            sender: user._id,
            senderName: user.name,
            text: newMessage,
            timestamp: new Date()
        };

        socket.emit('send_message', messageData);

        try {
            await axios.post(`${API_BASE_URL}/groups/${id}/messages`, { text: newMessage });
            setNewMessage('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${API_BASE_URL}/groups/${id}/upload`, formData);
            fetchFiles();
            setTab('files');
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const generateSummary = async () => {
        setSummarizing(true);
        setTab('summary');
        try {
            const chatContent = messages.map(m => `${m.sender?.name || m.senderName}: ${m.text}`).join('\n');
            const res = await axios.post(`${API_BASE_URL}/summarize`, {
                content: chatContent,
                type: 'chat'
            });
            setSummary(res.data.summary);
        } catch (err) {
            console.error(err);
        } finally {
            setSummarizing(false);
        }
    };

    const summarizeFile = async (fileContent, fileName) => {
        setSummarizing(true);
        setTab('summary');
        try {
            const res = await axios.post(`${API_BASE_URL}/summarize`, {
                content: fileContent,
                type: 'document'
            });
            setSummary(`Summary of ${fileName}:\n\n${res.data.summary}`);
        } catch (err) {
            console.error(err);
        } finally {
            setSummarizing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
                {/* Header Tabs */}
                <div className="flex bg-gray-50 border-b border-gray-100 px-6">
                    <button
                        onClick={() => setTab('chat')}
                        className={`py-4 px-6 font-bold text-sm transition-all border-b-2 ${tab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <MessageSquare size={18} />
                            <span>Discussion</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setTab('files')}
                        className={`py-4 px-6 font-bold text-sm transition-all border-b-2 ${tab === 'files' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <FileText size={18} />
                            <span>Resources</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setTab('summary')}
                        className={`py-4 px-6 font-bold text-sm transition-all border-b-2 ${tab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <Sparkles size={18} />
                            <span>AI Insights</span>
                        </div>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {tab === 'chat' && (
                        <>
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
                            >
                                {messages.map((msg, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={i}
                                        className={`flex ${msg.sender?._id === user._id || msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] rounded-2xl p-4 ${msg.sender?._id === user._id || msg.sender === user._id ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                            <p className="text-xs font-bold mb-1 opacity-70">
                                                {msg.sender?.name || msg.senderName || 'User'}
                                            </p>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className="text-[10px] mt-2 opacity-50 text-right">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t border-gray-100 flex items-center space-x-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-inner"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-primary transition-colors">
                                        <Paperclip size={20} />
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                                <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    )}

                    {tab === 'files' && (
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Shared Documents</h3>
                                <label className="cursor-pointer bg-secondary/10 text-secondary px-4 py-2 rounded-lg font-bold hover:bg-secondary hover:text-white transition-all flex items-center space-x-2">
                                    <Upload size={18} />
                                    <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {files.map((file) => (
                                    <div key={file._id} className="p-4 border border-gray-100 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{file.fileName}</h4>
                                                <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(1)} KB • {file.uploadedBy?.name}</p>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => {
                                                        // For demonstration, we'll assume text files can be read.
                                                        // In a real app, you'd fetch the file content from the server.
                                                        summarizeFile("This is a mock content of the file. Imagine this contains detailed research notes about the subject.", file.fileName);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                                    title="Summarize with AI"
                                                >
                                                    <Sparkles size={16} />
                                                </button>
                                                <a
                                                    href={`${SOCKET_URL}${file.fileUrl}`}
                                                    download
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                >
                                                    <Download size={18} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {files.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-gray-400">
                                        <Upload size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No resources shared yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'summary' && (
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">AI Collaboration Summary</h3>
                                            <p className="text-sm text-gray-500">Powered by Claude 3.5 Sonnet</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={generateSummary}
                                        disabled={summarizing}
                                        className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                    >
                                        {summarizing ? <Loader2 className="animate-spin" size={18} /> : <History size={18} />}
                                        <span>Refresh Summary</span>
                                    </button>
                                </div>

                                {summarizing ? (
                                    <div className="space-y-4 py-10">
                                        <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                                        <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                                        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                                    </div>
                                ) : summary ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-purple-50 rounded-2xl p-8 border border-purple-100 text-gray-800"
                                    >
                                        <div className="prose prose-purple max-w-none">
                                            {summary.split('\n').map((line, i) => (
                                                <p key={i} className="mb-2 leading-relaxed whitespace-pre-wrap">{line}</p>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Sparkles size={48} className="mx-auto mb-4 text-purple-300" />
                                        <h4 className="text-lg font-bold text-gray-900">No summary yet</h4>
                                        <p className="text-gray-500 mt-2 mb-6">Click the button to analyze recent chat history.</p>
                                        <button
                                            onClick={generateSummary}
                                            className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            Generate Initial Summary
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar for Group Info (Desktop only) */}
            <div className="hidden lg:block w-72 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Users size={18} className="mr-2 text-primary" />
                        Members ({group?.members?.length || 0})
                    </h3>
                    <div className="space-y-4">
                        {group?.members?.map((m, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-primary text-xs uppercase">
                                    {m.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-700">User {i + 1}</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 ml-auto"></div>
                            </div>
                        ))}
                        {/* Added a mock dynamic user entry if group isn't fully populated */}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-primary text-xs uppercase">
                                {user?.name?.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.name} (You)</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 ml-auto"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary to-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200">
                    <h3 className="font-bold mb-2 flex items-center">
                        <Sparkles size={18} className="mr-2" />
                        Study Tip
                    </h3>
                    <p className="text-xs opacity-90 leading-relaxed">
                        Did you know? Spaced repetition is proven to increase memory retention by up to 50%. Use our AI summary to review key points every few days!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GroupRoom;
