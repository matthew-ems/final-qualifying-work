import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePerformerRegistration } from "../../components/PerformerRegistrationContext";
import "./PerformerStep.css";
import "./SharedStyles.css"
import TelegramUserInfo from "../../components/TelegramUserInfo";
import usePerformerRegistrationActions from "../../hooks/usePerformerRegistrationActions"; // Измененное имя

const PerformerStep3 = () => {
  const navigate = useNavigate();
  const { registrationData } = usePerformerRegistration();
  const [aboutYou, setAboutYou] = useState(registrationData.bio);
  const { id, first_name, last_name, username, avatarUrl, language_code } = TelegramUserInfo();

  const telegramUserData = {
    id: id ? id.toString() : "",
    first_name: first_name || "",
    last_name: last_name || "",
    username: username || "none",
    photo_url: avatarUrl || "none",
    language_code: language_code || "en",
    role: "Performer",
  };

  const { completeRegistration } = usePerformerRegistrationActions(telegramUserData);

  useEffect(() => {
    window.Telegram.WebApp.BackButton.show();
    window.Telegram.WebApp.BackButton.onClick(() => {
      navigate("/performer-step2");
    });
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
    };
  }, [navigate]);

  return (
    <div className="performer-step">
      <div className="content-container">
        <div className="text-container">
          <h1>Информация о Вас</h1>
          <p>Расскажите о себе заказчикам. При выборе исполнителя они будут опираться на эту информацию.</p>
        </div>
        <div className="input-container">
          <textarea
            className="about-you-input"
            placeholder="Напишите о себе..."
            value={aboutYou}
            onChange={(e) => setAboutYou(e.target.value)}
          />
        </div>
      </div>

      <div className="button-container">
        <button
          className="continue-button"
          onClick={() => completeRegistration(aboutYou)}
        >
          Завершить регистрацию (3/3)
        </button>
      </div>
    </div>
  );
};

export default PerformerStep3;
