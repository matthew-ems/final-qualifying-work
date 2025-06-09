// src/hooks/useAuthorization.js

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authorizeUser } from "../api/api";
import { useAuth } from "../components/AuthContext";

const useAuthorization = (userId, setError) => {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const handleAuthorization = async () => {
      try {
        const result = await authorizeUser(userId);
        if (result.success && result.data) {
          setToken(result.data);
          navigate("/main");
        } else {
          throw new Error(result.error || "Unknown authorization error");
        }
      } catch (error) {
        console.warn("Authorization error:", error);
        setError("Authorization error:\n"+error.message);
      }
    };

    handleAuthorization();
  }, [userId, navigate, setToken, setError]);
};

export default useAuthorization;
