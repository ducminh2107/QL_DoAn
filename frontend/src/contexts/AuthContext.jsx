import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
axios.defaults.timeout = 10000;
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Axios interceptor để thêm token vào headers
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired — thử refresh
          try {
            const newToken = await refreshToken();
            if (newToken) {
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return axios(error.config);
            }
          } catch {
            logout();
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Load user on mount
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      setUser(response.data.data.user);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post("/api/auth/login", { email, password });
    const { accessToken, user } = response.data.data;
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    setUser(user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await axios.post("/api/auth/register", userData);
    const { accessToken, user } = response.data.data;
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    setUser(user);
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      window.location.href = "/login";
    }
  };

  const refreshToken = async () => {
    const response = await axios.post("/api/auth/refresh-token");
    const { accessToken } = response.data.data;
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    return accessToken;
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put("/api/auth/update-profile", userData);
      setUser(response.data.data.user);
      toast.success("Cập nhật thông tin thành công");
      return response.data;
    } catch (error) {
      toast.error("Cập nhật thất bại");
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await axios.put(
        "/api/auth/change-password",
        passwordData
      );
      toast.success("Đổi mật khẩu thành công");
      return response.data;
    } catch (error) {
      toast.error("Đổi mật khẩu thất bại");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
