import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { logout, token } = useAuth();
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:5000/api/groups')
                .then(res => setGroups(res.data))
                .catch(err => console.error(err));
        }
    }, [token]);

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'My Groups', icon: <Users size={20} />, path: '/#groups' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed md:static inset-y-0 left-0 bg-dark text-white w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-xl">S</div>
                        <span className="text-xl font-bold tracking-tight">StudySync</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-primary text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}

                    <div className="pt-8 pb-2">
                        <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Join Groups</span>
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-48 custom-scrollbar">
                        {groups.map((group) => (
                            <Link
                                key={group._id}
                                to={`/group/${group._id}`}
                                className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors ${location.pathname === `/group/${group._id}` ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                            >
                                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                <span>{group.name}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
