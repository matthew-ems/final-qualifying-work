import React from "react";
import { useNavigate } from "react-router-dom";

import "./style.css";

import LogoIcon from "../icons/LogoIcon";

const RegistrationPage = () => {
  const navigate = useNavigate();

  const handlePerformerClick = () => {
    navigate("/registration-performer");
  };

  const handleCustomerClick = () => {
    navigate("/registration-customer");
  };

  return (
    <div className="container">
      <div className="registration-screen">
        <div className="top">
          <LogoIcon color="currentColor" />
        </div>
        <div className="middle">
          <h1 className="title">Freelance Network</h1>
          <p className="subtitle">Биржа фриланс-услуг</p>
        </div>
        <div className="bottom">
          <button className="continue-button" onClick={handleCustomerClick}>Я заказчик</button>
          <button className="continue-button" onClick={handlePerformerClick}>
            Я исполнитель
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
