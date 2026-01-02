import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ setSidebarOpen }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 z-10">
            <div className="flex items-center md:hidden">
                <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex-1 max-w-xl mx-4 hidden md:block">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search for groups or files..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-primary transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'Guest User'}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'Member'}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary to-indigo-400 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
