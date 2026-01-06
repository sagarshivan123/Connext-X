import {BrowserRouter as Router ,Routes ,Route} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";
import { getUser } from "./store/slices/authSlice";
import { connectSocket } from "./socket/socket";

function App() {

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUser());
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
