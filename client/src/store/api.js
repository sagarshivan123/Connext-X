// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:4000/api/", 
//   withCredentials: true,
// });

// export default api;
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});


export default api;