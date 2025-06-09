// src/screens/PerformerRegistration/PerformerStep1.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePerformerRegistration } from "../../components/PerformerRegistrationContext";
import { fetchAllDirections } from "../../api/api"; // Импортируем функцию
import "./PerformerStep.css";
import "./SharedStyles.css";
import ChooseIcon from "../../icons/ChooseIcon";

const PerformerStep1 = () => {
  const navigate = useNavigate();
  const { registrationData, setRegistrationData } = usePerformerRegistration();
  const [selectedOption, setSelectedOption] = useState(
    registrationData.directionId
  );
  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    window.Telegram.WebApp.BackButton.show();
    window.Telegram.WebApp.BackButton.onClick(() => {
      navigate("/");
    });
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const { success, data, error } = await fetchAllDirections(); // Используем функцию

      if (success) {
        setApiData(data);
      } else {
        console.error("Ошибка получения данных:", error);
      }
    };
    fetchData();
  }, []);

  const goToNextStep = () => {
    if (selectedOption) {
      setRegistrationData((prev) => ({
        ...prev,
        directionId: selectedOption,
      }));
      navigate("/performer-step2");
    } else {
      alert("Пожалуйста, выберите специализацию");
    }
  };

  return (
    <div className="performer-step">
      <div className="content-container">
        <div className="text-container">
          <h1>Выберите специализацию</h1>
          <p>Вы сможете изменить это позже в настройках своего профиля.</p>
        </div>
        <div className="options-container">
          {apiData.map((option) => (
            <button
              key={option.id}
              className={`option-button ${selectedOption === option.id ? "selected" : ""}`}
              onClick={() => setSelectedOption(option.id)}
            >
              {option.title}
              {selectedOption === option.id && <div className="icon-container"><ChooseIcon /></div>}
            </button>
          ))}
        </div>
      </div>
      <div className="button-container">
        <button className="continue-button" onClick={goToNextStep}>Далее (1/3)</button>
      </div>
    </div>
  );
};

export default PerformerStep1;
