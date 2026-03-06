import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5072'; 

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      localStorage.setItem('tms_token', data.token);
      localStorage.setItem('tms_user', JSON.stringify({
        name: data.name,
        role: data.role,
        companyId: data.companyId
      })); 
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white bg-gradient-to-br from-emerald-600 to-blue-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="z-10 relative">
          <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg mb-8 border border-white/20 backdrop-blur-sm">
            <Truck className="text-white" size={28} />
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            Enterprise <br/>
            <span className="text-emerald-200">Transit Management</span>
          </h1>
          <p className="text-blue-100/90 text-lg max-w-md leading-relaxed">
            Secure admin portal for Head Administrators and Company Managers. Monitor fleets, track revenue, and optimize routes in real-time.
          </p>
        </div>

        <div className="z-10 text-sm text-blue-200/60 flex items-center gap-2 font-medium">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          Secure Connection Established
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up border border-slate-100">
          
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-extrabold text-blue-950">Admin Portal</h2>
            <p className="text-slate-500 mt-2 font-medium">Sign in to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="admin@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center gap-3">
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;