// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:4000/api/", 
//   withCredentials: true,
// });

// export default api;
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api/", 
  withCredentials: true,
});

export default api;