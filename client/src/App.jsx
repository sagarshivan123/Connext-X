import {BrowserRouter as Router ,Routes ,Route} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";
import { getUser ,getAllUsers} from "./store/slices/authSlice";
import { connectSocket } from "./socket/socket";

function App() {

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUser());
    // dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
    }
  }, [user?._id]);
  

  return (

    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}

export default App

// // App.jsx
// import { Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ChatPage from "./pages/ChatPage";
// import ProtectedRoute from "./components/ProtectedRoute";
// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getUser,getAllUsers } from "./store/slices/authSlice";

// function App() {
//   const dispatch = useDispatch();
//   const { user, isAuthenticated } = useSelector((state) => state.auth);

//   useEffect(() => {
//     // This triggers the /api/auth/me call
//     dispatch(getUser());
//     dispatch(getAllUsers());
//   }, [dispatch]);

//   return (
//     <Routes>
//       {/* If user is already logged in, don't show login/register pages */}
//       <Route path="/" element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} />
//       <Route path="/login" element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} />
//       <Route path="/register" element={isAuthenticated ? <Navigate to="/chat" /> : <Register />} />
      
//       <Route
//         path="/chat"
//         element={
//           <ProtectedRoute>
//             <ChatPage />
//           </ProtectedRoute>
//         }
//       />
      
//       {/* Fallback for any other route */}
//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// }

// export default App;