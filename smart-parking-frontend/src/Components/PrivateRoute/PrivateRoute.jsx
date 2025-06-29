import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../../api/axios"; // Axios instance with `withCredentials: true`
import { LogIn } from "lucide-react";

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 

  useEffect(() => {
    const localToken = localStorage.getItem("token");

    if (localToken) {
      // ✅ Token found in localStorage — trusted login
      setIsAuthenticated(true);
    } else {
      // 🔁 No localStorage token — check cookie via backend
      const checkCookieAuth = async () => {
        try {
          alert("from private route");
          await api.get("/user/success"); 
          setIsAuthenticated(true);
        } catch (err) {
          setIsAuthenticated(false);
        }
      };
      checkCookieAuth();
    }
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
