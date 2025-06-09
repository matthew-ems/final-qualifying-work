import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import TelegramUserInfo from "../components/TelegramUserInfo";
import TokenHandler from "../components/TokenHandler";
import TelegramInitData from "../components/TelegramInitData.jsx";

import { authUser, refreshUserToken } from "../api/api";
import "./style.css";

const Loading = () => {
  const { decodedInitData } = TelegramInitData.getDecodedInitData();
  const navigate = useNavigate();
  const { id: currentTelegramId } = TelegramUserInfo();

  const fetchAuthUser = useCallback(async () => {
    console.log("▶️ Start auth check...");

    const savedTelegramId = localStorage.getItem("authTelegramId");

    if (savedTelegramId && savedTelegramId !== String(currentTelegramId)) {
      console.warn("🧹 Пользователь сменился. Чистим токены.");
      TokenHandler.clearTokens();
    }

    const { hasAccessToken, hasRefreshToken } = TokenHandler.checkTokens();
    const { success, expired } = TokenHandler.getAccessToken();

    console.log("⏳ Token status → success:", success, "expired:", expired);

    try {
      if (!hasAccessToken && !hasRefreshToken) {
        console.log("Нет токенов, первичная авторизация...");

        if (!currentTelegramId) {
          console.error("Telegram ID отсутствует.");
          return;
        }

        const { status, data } = await authUser(currentTelegramId);

        if (status === 404) {
          navigate("/registration-page");
        } else if (status === 200) {
          TokenHandler.saveNewTokens(data.token, data.refreshToken, currentTelegramId);
          console.log("Токены получены через authUser");
          navigate("/main");
        }
      }

      else if (!success && hasRefreshToken) {
        console.log("🔁 Access token протух, пытаемся обновить...");

        const { status, data } = await refreshUserToken();

        if (status === 200) {
          TokenHandler.saveAccessToken(data.token);
          console.log("✅ Access token обновлён");
          navigate("/main");
        } else {
          console.warn("❌ Refresh не удался. Очищаем и переходим на регистрацию");
          TokenHandler.clearTokens();
          navigate("/registration-page");
        }
      }

      else if (success && hasRefreshToken) {
        console.log("✅ Access token валиден. Вход разрешён.");
        navigate("/main");
      }
    } catch (error) {
      console.error("⚠️ Ошибка авторизации:", error);
    }
  }, [currentTelegramId, navigate]);

  useEffect(() => {
    fetchAuthUser();
  }, [fetchAuthUser]);

  return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
  );
};

export default Loading;
