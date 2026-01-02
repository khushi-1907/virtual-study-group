import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
            setMessage('Instructions to reset your password have been sent to your email.');
            setResetToken(res.data.token); // For demo purposes
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full space-y-8 glass p-10 rounded-3xl shadow-2xl relative z-10">
                <div>
                    <h2 className="text-center text-4xl font-black text-gray-900 tracking-tight">Forgot Password?</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {message ? (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle size={64} className="text-green-500" />
                        </div>
                        <p className="text-gray-700 font-medium">{message}</p>
                        {resetToken && (
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Demo Reset Link</p>
                                <Link to={`/reset-password/${resetToken}`} className="text-primary font-bold break-all hover:underline">
                                    Click here to reset password
                                </Link>
                            </div>
                        )}
                        <Link to="/login" className="block font-bold text-primary hover:text-primary-dark">
                            Back to login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-xl relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Reset password
                                        <ArrowRight className="ml-2" size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="text-center">
                            <Link to="/login" className="font-bold text-gray-500 hover:text-gray-700">
                                Back to login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
