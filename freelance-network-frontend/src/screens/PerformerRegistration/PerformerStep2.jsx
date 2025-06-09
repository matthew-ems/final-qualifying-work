// src/screens/PerformerRegistration/PerformerStep2.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePerformerRegistration } from "../../components/PerformerRegistrationContext";
import "./PerformerStep.css";
import "./SharedStyles.css"
import ChooseIcon from "../../icons/ChooseIcon";

const PerformerStep2 = () => {
  const navigate = useNavigate();
  const { registrationData, setRegistrationData } = usePerformerRegistration();
  const [selectedOption, setSelectedOption] = useState(
    registrationData.experience
  );

  useEffect(() => {
    window.Telegram.WebApp.BackButton.show();
    window.Telegram.WebApp.BackButton.onClick(() => {
      navigate("/performer-step1");
    });
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
    };
  }, [navigate]);

  const goToNextStep = () => {
    if (selectedOption !== null) {
      setRegistrationData((prev) => ({
        ...prev,
        experience: selectedOption, // сохраняем выбранный индекс
      }));
      navigate("/performer-step3");
    } else {
      alert("Please select your experience level.");
    }
  };

  // Изменяем массив options на массив объектов с текстом и индексом
  const options = [
    { label: "Intern", value: 1 },
    { label: "Junior (up to 2 years)", value: 2 },
    { label: "Middle (2-5 years)", value: 3 },
    { label: "Senior (5-8 years)", value: 4 },
    { label: "Lead (8+ years)", value: 5 },
  ];

  return (
    <div className="performer-step">
      <div className="content-container">
        <div className="text-container">
          <h1>Выберите свой опыт</h1>
          <p>Клиенты будут лучше понимать ваши навыки.</p>
        </div>
        <div className="options-container">
          {options.map((option) => (
            <button
              key={option.value} // Используем значение как ключ
              className={`option-button ${
                selectedOption === option.value ? "selected" : ""
              }`}
              onClick={() => setSelectedOption(option.value)} // Сохраняем значение вместо текста
            >
              {option.label}
              {selectedOption === option.value && (
                <div className="icon-container">
                  <ChooseIcon />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="button-container">
        <button className="continue-button" onClick={goToNextStep}>
          Далее (2/3)
        </button>
      </div>
    </div>
  );
};

export default PerformerStep2;
