import React, { useState } from "react";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../service/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email: formData.email, password: formData.password });
      if (res?.ok) {
        navigate("/profile");
      } else {
        setError(res?.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
    
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #D1FAE5 0%, #4ADE80 100%)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #D1FAE5 100%)' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
       
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)' }}>
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight" style={{ color: '#0F172A' }}>
            Welcome back
          </h1>
          <p className="text-lg" style={{ color: '#6B7280' }}>Sign in to continue your journey</p>
        </div>

    
        <div className="bg-white backdrop-blur-xl rounded-2xl shadow-xl border p-8 transform transition-all duration-300 hover:shadow-2xl" style={{ borderColor: '#E5E7EB', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)' }}>
          <div className="space-y-6">
            {error && (
              <div className="p-4 border rounded-2xl text-sm font-medium" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                  {error}
                </div>
              </div>
            )}

          
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold ml-1"
                style={{ color: '#0F172A' }}
              >
                Email address
              </label>
              <div className="relative group">
                <Mail 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200" 
                  style={{ color: focusedField === 'email' ? '#14B8A6' : '#6B7280' }} 
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('password').focus();
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl transition-all duration-200 outline-none"
                  style={{
                    backgroundColor: focusedField === 'email' ? '#FFFFFF' : '#F9FAFB',
                    borderColor: focusedField === 'email' ? '#14B8A6' : '#E5E7EB',
                    color: '#0F172A'
                  }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold"
                  style={{ color: '#0F172A' }}
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => e.target.style.color = '#0F172A'}
                  onMouseLeave={(e) => e.target.style.color = '#6B7280'}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200" 
                  style={{ color: focusedField === 'password' ? '#14B8A6' : '#6B7280' }} 
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl transition-all duration-200 outline-none"
                  style={{
                    backgroundColor: focusedField === 'password' ? '#FFFFFF' : '#F9FAFB',
                    borderColor: focusedField === 'password' ? '#14B8A6' : '#E5E7EB',
                    color: '#0F172A'
                  }}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 group"
              style={{
                background: loading ? '#6B7280' : 'linear-gradient(135deg, #4ADE80 0%, #14B8A6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 10px 25px -5px rgba(74, 222, 128, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 20px 35px -5px rgba(74, 222, 128, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(74, 222, 128, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E5E7EB' }}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white font-medium" style={{ color: '#6B7280' }}>OR</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-semibold inline-flex items-center gap-1 group transition-colors"
                style={{ color: '#0F172A' }}
                onMouseEnter={(e) => e.target.style.color = '#14B8A6'}
                onMouseLeave={(e) => e.target.style.color = '#0F172A'}
              >
                Sign up
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;