import React, { useState, useEffect } from 'react';
import { Plus, Users, ArrowRight, BookOpen, Clock, Star } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/groups`);
            setGroups(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/groups`, { name: newGroupName, description: newGroupDesc });
            setShowCreateModal(false);
            setNewGroupName('');
            setNewGroupDesc('');
            fetchGroups();
        } catch (err) {
            console.error(err);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Study Groups</h1>
                    <p className="text-gray-500 mt-1">Join or create a group to start collaborating.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} />
                    <span>New Group</span>
                </button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {groups.map((group) => (
                    <motion.div
                        key={group._id}
                        variants={item}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10"></div>

                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 truncate max-w-[180px]">{group.name}</h3>
                                <p className="text-xs text-gray-500 flex items-center">
                                    <Star size={12} className="text-yellow-400 mr-1 fill-current" />
                                    {group.members?.length || 0} members
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-6 h-10">
                            {group.description || 'No description provided. Click to join and start chatting!'}
                        </p>

                        <Link
                            to={`/group/${group._id}`}
                            className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 rounded-xl text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all"
                        >
                            <span>{group.members?.includes(user?._id) ? 'Enter Room' : 'Join & Enter'}</span>
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                ))}

                {groups.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No groups found</h3>
                        <p className="text-gray-500 mt-2">Create your first study group to get started!</p>
                    </div>
                )}
            </motion.div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Study Group</h2>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    placeholder="e.g. Advanced Calculus"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-24"
                                    placeholder="What is this group about?"
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
