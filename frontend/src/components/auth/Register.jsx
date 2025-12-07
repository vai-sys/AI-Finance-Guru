// import React, { useState } from "react";
// import { User, Mail, Lock, Globe, Loader2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../service/AuthContext.jsx"; 

// const Register = () => {
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     preferredLanguage: "en",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

   
//     if (!formData.name || !formData.email || !formData.password) {
//       setError("Please fill in all required fields");
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = await register(formData);
     
//       if (data?.message) {
       
//         alert(data.message);
//         navigate("/login");
//       } else if (data?.user) {
    
//         navigate("/profile");
//       } else {
//         setError(data?.message || "Registration failed");
//       }
//     } catch (err) {
//       console.error("Register error:", err);
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl mb-4">
//             <User className="w-7 h-7 text-white" />
//           </div>
//           <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create account</h1>
//           <p className="text-gray-600">Join us today</p>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8" noValidate>
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
//               {error}
//             </div>
//           )}

//           <div className="space-y-5">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
//               <div className="relative">
//                 <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   autoComplete="name"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm"
//                   placeholder="John Doe"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm"
//                   placeholder="you@example.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete="new-password"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
//               <div className="relative">
//                 <Globe className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <select
//                   value={formData.preferredLanguage}
//                   onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
//                   className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm appearance-none bg-white"
//                 >
//                   <option value="en">English</option>
//                   <option value="es">Spanish</option>
//                   <option value="fr">French</option>
//                   <option value="de">German</option>
//                 </select>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Creating account...
//                 </>
//               ) : (
//                 "Create account"
//               )}
//             </button>
//           </div>

//           <div className="mt-6 text-center">
//             <button
//               type="button"
//               onClick={() => navigate("/login")}
//               className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
//             >
//               Already have an account? <span className="text-gray-900">Sign in</span>
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from "react";
import { User, Mail, Lock, Globe, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../service/AuthContext.jsx"; 

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    preferredLanguage: "en",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const data = await register(formData);
      if (data?.message) {
        alert(data.message);
        navigate("/login");
      } else if (data?.user) {
        navigate("/profile");
      } else {
        setError(data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #D1FAE5 0%, #4ADE80 100%)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #D1FAE5 100%)' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)' }}>
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight" style={{ color: '#0F172A' }}>
            Create account
          </h1>
          <p className="text-lg" style={{ color: '#6B7280' }}>Join us today and start your journey</p>
        </div>

        {/* Form Card */}
        <div className="bg-white backdrop-blur-xl rounded-2xl shadow-xl border p-8 transform transition-all duration-300 hover:shadow-2xl" style={{ borderColor: '#E5E7EB', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {error && (
                <div className="p-4 border rounded-2xl text-sm font-medium" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                    {error}
                  </div>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="name" 
                  className="block text-sm font-semibold ml-1"
                  style={{ color: '#0F172A' }}
                >
                  Full Name
                </label>
                <div className="relative group">
                  <User 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200" 
                    style={{ color: focusedField === 'name' ? '#14B8A6' : '#6B7280' }} 
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl transition-all duration-200 outline-none"
                    style={{
                      backgroundColor: focusedField === 'name' ? '#FFFFFF' : '#F9FAFB',
                      borderColor: focusedField === 'name' ? '#14B8A6' : '#E5E7EB',
                      color: '#0F172A'
                    }}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
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

              {/* Password Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold ml-1"
                  style={{ color: '#0F172A' }}
                >
                  Password
                </label>
                <div className="relative group">
                  <Lock 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200" 
                    style={{ color: focusedField === 'password' ? '#14B8A6' : '#6B7280' }} 
                  />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl transition-all duration-200 outline-none"
                    style={{
                      backgroundColor: focusedField === 'password' ? '#FFFFFF' : '#F9FAFB',
                      borderColor: focusedField === 'password' ? '#14B8A6' : '#E5E7EB',
                      color: '#0F172A'
                    }}
                    placeholder="Create a strong password"
                  />
                </div>
              </div>

              {/* Language Select */}
              <div className="space-y-2">
                <label 
                  className="block text-sm font-semibold ml-1"
                  style={{ color: '#0F172A' }}
                >
                  Preferred Language
                </label>
                <div className="relative">
                  <Globe 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200" 
                    style={{ color: focusedField === 'language' ? '#14B8A6' : '#6B7280' }} 
                  />
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    onFocus={() => setFocusedField('language')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl transition-all duration-200 appearance-none outline-none"
                    style={{
                      backgroundColor: focusedField === 'language' ? '#FFFFFF' : '#F9FAFB',
                      borderColor: focusedField === 'language' ? '#14B8A6' : '#E5E7EB',
                      color: '#0F172A'
                    }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E5E7EB' }}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white font-medium" style={{ color: '#6B7280' }}>OR</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold inline-flex items-center gap-1 group transition-colors"
                style={{ color: '#0F172A' }}
                onMouseEnter={(e) => e.target.style.color = '#14B8A6'}
                onMouseLeave={(e) => e.target.style.color = '#0F172A'}
              >
                Sign in
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: '#6B7280' }}>
            By creating an account, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;