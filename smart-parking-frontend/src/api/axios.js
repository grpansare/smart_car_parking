import axios from "axios";

const api = axios.create({
  baseURL: "https://smart-car-parking-v6in.onrender.com",
  withCredentials: true, // ✅ Send cookies (Google login)
});

// ✅ Add token from localStorage if available (for normal login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Else: let backend use token from HttpOnly cookie
  return config;
});

// ✅ Refresh token mechanism
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    const excludedPaths = ["/user/login", "/user/register"];
    const isExcluded = excludedPaths.some((path) => original.url.includes(path));

    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/user/refresh") &&
      !isExcluded
    ) {
      original._retry = true;

      try {
        const response = await api.post("/user/refresh"); // ➕ Refresh token from cookie
        const newAccessToken = response.data.accessToken;

        // 🛑 Only store in localStorage if normal login used
        localStorage.setItem("token", newAccessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        original.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api(original);
      } catch (refreshErr) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }

    return Promise.reject(err);
  }
);

export default api;
