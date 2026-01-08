
// import { useState, useEffect } from "react";
// import { register, resetAuthSlice } from "../store/slices/authSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";

// export default function Register() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [avatar, setAvatar] = useState(null);
//   const [avatarPreview, setAvatarPreview] = useState(null);

//   const avatarChangeHandler = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     setAvatar(file);
  
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setAvatarPreview(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };
  
//   const { loading, error, isAuthenticated } = useSelector(
//     (state) => state.auth
//   );

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [focusedField, setFocusedField] = useState(null);
//   const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

//   const changeHandler = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
    
//     // Check password strength
//     if (e.target.name === 'password') {
//       checkPasswordStrength(e.target.value);
//     }
//   };

//   const checkPasswordStrength = (password) => {
//     let score = 0;
//     let feedback = [];

//     if (password.length >= 8) score += 1;
//     else feedback.push('8+ characters');

//     if (/[A-Z]/.test(password)) score += 1;
//     else feedback.push('uppercase letter');

//     if (/[a-z]/.test(password)) score += 1;
//     else feedback.push('lowercase letter');

//     if (/[0-9]/.test(password)) score += 1;
//     else feedback.push('number');

//     if (/[^A-Za-z0-9]/.test(password)) score += 1;
//     else feedback.push('special character');

//     const strength = {
//       0: { text: 'Very Weak', color: 'text-red-400' },
//       1: { text: 'Weak', color: 'text-red-400' },
//       2: { text: 'Fair', color: 'text-yellow-400' },
//       3: { text: 'Good', color: 'text-blue-400' },
//       4: { text: 'Strong', color: 'text-green-400' },
//       5: { text: 'Very Strong', color: 'text-green-400' }
//     };

//     setPasswordStrength({ 
//       score, 
//       text: password ? strength[score]?.text || 'Very Weak' : '', 
//       color: password ? strength[score]?.color || 'text-red-400' : '',
//       feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'All requirements met!'
//     });
//   };

//   const submitHandler = (e) => {
//     e.preventDefault();
  
//     const formData = new FormData();
//     formData.append("name", form.name);
//     formData.append("email", form.email);
//     formData.append("password", form.password);
  
//     if (avatar) {
//       formData.append("avatar", avatar); // MUST MATCH multer
//     }
  
//     dispatch(register(formData));
//   };
  
//   useEffect(() => {
//     if (isAuthenticated) navigate("/chat");
//   }, [isAuthenticated, navigate]);

//   useEffect(() => {
//     return () => dispatch(resetAuthSlice());
//   }, []);

//   const isFormValid = form.name.trim() && form.email.trim() && form.password.trim();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      
//       <div className="relative z-10 w-full max-w-md">
//         {/* Logo/Brand Section */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//             </svg>
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
//           <p className="text-slate-400">Join us and start connecting with friends</p>
//         </div>

//         {/* Register Form */}
//         <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
//           <form onSubmit={submitHandler} className="space-y-6">
//             {/* Avatar Upload */}
// <div className="flex flex-col items-center space-y-3">
//   <div className="relative group">
//     <img
//       src={
//         avatarPreview ||
//         "https://ui-avatars.com/api/?name=" + (form.name || "User")
//       }
//       alt="Avatar Preview"
//       className="w-24 h-24 rounded-full object-cover border-2 border-slate-600 shadow-lg"
//     />

//     <label className="absolute inset-0 bg-black/40 rounded-full hidden group-hover:flex items-center justify-center cursor-pointer">
//       <svg
//         className="w-6 h-6 text-white"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M3 16l4-4a3 3 0 014 0l6 6"
//         />
//       </svg>

//       <input
//         type="file"
//         accept="image/*"
//         hidden
//         onChange={avatarChangeHandler}
//       />
//     </label>
//   </div>

//   <p className="text-xs text-slate-400">
//     Click to upload profile picture (optional)
//   </p>
// </div>


//             {/* Error Message */}
//             {error && (
//               <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-shake">
//                 <div className="flex items-center gap-3">
//                   <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <p className="text-red-400 text-sm">{error}</p>
//                 </div>
//               </div>
//             )}

//             {/* Name Field */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-300">Full Name</label>
//               <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'scale-[1.02]' : ''}`}>
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <svg className={`w-5 h-5 transition-colors ${focusedField === 'name' ? 'text-green-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                 </div>
//                 <input
//                   name="name"
//                   type="text"
//                   placeholder="Enter your full name"
//                   value={form.name}
//                   onChange={changeHandler}
//                   onFocus={() => setFocusedField('name')}
//                   onBlur={() => setFocusedField(null)}
//                   className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Email Field */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-300">Email Address</label>
//               <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <svg className={`w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//                   </svg>
//                 </div>
//                 <input
//                   name="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={form.email}
//                   onChange={changeHandler}
//                   onFocus={() => setFocusedField('email')}
//                   onBlur={() => setFocusedField(null)}
//                   className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-300">Password</label>
//               <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <svg className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-purple-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                   </svg>
//                 </div>
//                 <input
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Create a strong password"
//                   value={form.password}
//                   onChange={changeHandler}
//                   onFocus={() => setFocusedField('password')}
//                   onBlur={() => setFocusedField(null)}
//                   className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
//                 >
//                   {showPassword ? (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
//                     </svg>
//                   ) : (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
              
//               {/* Password Strength Indicator */}
//               {form.password && (
//                 <div className="mt-2 space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-slate-400">Password Strength:</span>
//                     <span className={`text-xs font-medium ${passwordStrength.color}`}>
//                       {passwordStrength.text}
//                     </span>
//                   </div>
//                   <div className="w-full bg-slate-700/50 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full transition-all duration-300 ${
//                         passwordStrength.score <= 1 ? 'bg-red-500' :
//                         passwordStrength.score <= 2 ? 'bg-yellow-500' :
//                         passwordStrength.score <= 3 ? 'bg-blue-500' : 'bg-green-500'
//                       }`}
//                       style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
//                     ></div>
//                   </div>
//                   <p className="text-xs text-slate-500">{passwordStrength.feedback}</p>
//                 </div>
//               )}
//             </div>

//             {/* Register Button */}
//             <button
//               type="submit"
//               disabled={loading || !isFormValid}
//               className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed disabled:opacity-50 group"
//             >
//               {loading ? (
//                 <div className="flex items-center justify-center gap-3">
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                   Creating Account...
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center gap-2">
//                   Create Account
//                   <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                   </svg>
//                 </div>
//               )}
//             </button>

//             {/* Divider */}
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-slate-600/50"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-3 bg-slate-800/50 text-slate-400">Already have an account?</span>
//               </div>
//             </div>

//             {/* Login Link */}
//             <Link
//               to="/login"
//               className="w-full py-3 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-200 hover:bg-slate-700/20 flex items-center justify-center gap-2 group"
//             >
//               Sign In
//               <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//               </svg>
//             </Link>
//           </form>
//         </div>

//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { register, resetAuthSlice } from "../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const avatarChangeHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (avatar) formData.append("avatar", avatar);
    dispatch(register(formData));
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/chat");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(resetAuthSlice());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={submitHandler} className="space-y-5">
            {/* Avatar Selection */}
            <div className="flex flex-col items-center">
              <label className="relative group cursor-pointer">
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${form.name || 'User'}`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-600"
                  alt="avatar"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16l4-4a3 3 0 014 0l6 6" /></svg>
                </div>
                <input type="file" accept="image/*" hidden onChange={avatarChangeHandler} />
              </label>
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

            <input
              name="name"
              type="text"
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white outline-none focus:border-green-500/50"
              onChange={changeHandler}
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white outline-none focus:border-blue-500/50"
              onChange={changeHandler}
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white outline-none focus:border-purple-500/50"
                onChange={changeHandler}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 text-xs font-medium uppercase tracking-wider">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="text-center text-slate-400 text-sm">
              Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}