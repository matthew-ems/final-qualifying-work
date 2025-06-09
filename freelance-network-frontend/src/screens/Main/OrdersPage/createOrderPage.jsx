import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/AuthContext";
import { createOrder } from "../../../api/api";
import TelegramUserInfo from "../../../components/TelegramUserInfo";
import "./createOrderPage.css";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { id } = TelegramUserInfo();
  const { token } = useAuth();
  const [orderData, setOrderData] = useState({
    title: "",
    description: "",
    totalAmount: null,
    currency: "RUB",
    paymentMethod: "/ проект",
    boost: 0,
    directionId: "bd61c493-bfb3-4807-ae2e-c1332df4d8a2",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.Telegram.WebApp.BackButton.show();
    window.Telegram.WebApp.BackButton.onClick(() => {
      navigate("/orders");
    });
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePaymentMethod = () => {
    setOrderData((prevData) => ({
      ...prevData,
      paymentMethod:
        prevData.paymentMethod === "/ проект" ? "/ час" : "/ проект",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prepare order data according to the specified conditions
    let preparedOrderData = { ...orderData };

    // Check if `totalAmount` has a value or is empty
    const hasAmount = !!preparedOrderData.totalAmount;

    // Set `paymentMethod` based on the selected payment type and amount presence
    if (preparedOrderData.paymentMethod === "/ час") {
      preparedOrderData.paymentMethod = hasAmount ? 1 : 3;
    } else {
      preparedOrderData.paymentMethod = hasAmount ? 2 : 4;
    }

    if (preparedOrderData.currency === "RUB") {
      preparedOrderData.currency = 1;
    }

    // Set `totalAmount` to integer value or 0 if empty
    preparedOrderData.totalAmount = hasAmount
      ? parseInt(preparedOrderData.totalAmount, 10)
      : 0;

    console.log("Order data to be sent:", preparedOrderData);

    try {
      const response = await createOrder(preparedOrderData, token, id);

      if (response.success) {
        console.log("Order created successfully:", response.data);
        navigate("/main");
      } else {
        setError(response.error || "Failed to create order");
        console.error("Order creation failed:", response.error);
      }
    } catch (err) {
      setError("Unexpected error occurred");
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-order">
      <form onSubmit={handleSubmit} className="form-container">
        <div className="content-container">
          <div className="text-container">
            <h1>Создание заказа</h1>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
  
          <textarea
            name="title"
            className="input-title"
            placeholder="Название задачи"
            value={orderData.title}
            onChange={handleChange}
          ></textarea>
  
          <textarea
            name="description"
            className="input-description"
            placeholder="Описание задачи"
            value={orderData.description}
            onChange={handleChange}
          ></textarea>
  
          <div className="amount-container">
            <input
              type="number"
              name="totalAmount"
              className="input-amount"
              placeholder="Сумма"
              value={orderData.totalAmount || ""}
              onChange={handleChange}
            />
            <span className="currency-label">RUB</span>
            <button
              type="button"
              className="toggle-button"
              onClick={togglePaymentMethod}
            >
              {orderData.paymentMethod}
            </button>
          </div>
  
          <div className="button-container">
            <button type="submit" disabled={loading} className="create-button">
              {loading ? "Загрузка..." : "Добавить"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
