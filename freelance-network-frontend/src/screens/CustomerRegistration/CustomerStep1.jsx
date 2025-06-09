import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TelegramUserInfo from "../../components/TelegramUserInfo";
import { registerUser, createOrUpdateProfile } from "../../api/api";
import "./CustomerStep1.css"; // Подключаем стили

const CustomerStep1 = () => {
  const navigate = useNavigate();
  const [aboutYou, setAboutYou] = useState("");

  // Получаем данные пользователя Telegram через компонент
  const { id, first_name, last_name, username, avatarUrl, language_code } =
    TelegramUserInfo();

  useEffect(() => {
    window.Telegram.WebApp.BackButton.show();
    window.Telegram.WebApp.BackButton.onClick(() => {
      navigate("/"); // Возвращаемся на предыдущий шаг
    });
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
    };
  }, [navigate]);

  const handleComplete = async () => {
    if (aboutYou.trim()) {
      const customerData = {
        bio: aboutYou,
        role: "Customer",
      };

      const telegramUserData = {
        id: id ? id.toString() : "",
        first_name: first_name || "",
        last_name: last_name || "",
        username: username || "none",
        photo_url: avatarUrl || "none",
        language_code: language_code || "en",
        role: "Customer",
      };

      console.log("Telegram User Data:", JSON.stringify(telegramUserData));
      console.log("Customer Profile Info:", JSON.stringify(customerData));

      try {
        // Регистрируем пользователя
        const registerResponse = await registerUser(telegramUserData);

        if (!registerResponse.success) {
          throw new Error(registerResponse.message || "Ошибка регистрации");
        }

        // Создаем профиль пользователя
        const profileResponse = await createOrUpdateProfile(
          telegramUserData.id,
          customerData
        );

        if (!profileResponse.success) {
          throw new Error(profileResponse.error || "Ошибка создания профиля");
        }

        // Навигация на начальную страницу
        navigate("/");
      } catch (error) {
        console.error("Произошла ошибка:", error.message);
        alert("Ошибка при регистрации. Пожалуйста, попробуйте еще раз.");
      }
    } else {
      alert("Пожалуйста, расскажите о себе.");
    }
  };

  return (
    <div className="performer-step">
      <div className="content-container">
        <div className="text-container">
          <h1>Информация о Вас</h1>
          <p>Расскажите о себе исполнителям. Они будут знать с кем им предстоит работать. </p>
        </div>
        <div className="input-container">
          <textarea
            className="about-you-input"
            placeholder="Расскажите о себе..."
            value={aboutYou}
            onChange={(e) => setAboutYou(e.target.value)}
          />
        </div>
      </div>
      <div className="button-container">
        <button className="continue-button" onClick={handleComplete}>
          Завершить
        </button>
      </div>
    </div>
  );
};

export default CustomerStep1;
