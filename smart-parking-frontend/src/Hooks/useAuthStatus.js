// src/hooks/useAuthStatus.js
import { useEffect, useState } from "react";
import api from "../api/axios"; // your Axios instance with withCredentials: true

const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const localToken = localStorage.getItem("token");
      if (localToken) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      try {
        await api.get("/user/success"); // checks if cookie token is valid
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, loading };
};

export default useAuthStatus;
