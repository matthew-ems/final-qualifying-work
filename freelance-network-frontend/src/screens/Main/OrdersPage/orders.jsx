import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TelegramUserInfo from "../../../components/TelegramUserInfo";
import { useAuth } from "../../../components/AuthContext";
import { fetchProfileInfo, fetchCustomerOrders } from "../../../api/api";
import "./orders.css";

import HeartIcon from "../MainPage/static/HeartIcon";
import ResponseIcon from "../MainPage/static/ResponseIcon";
import TimeIcon from "../MainPage/static/TimeIcon";
import ViewsIcon from "../MainPage/static/ViewsIcon";

const OrdersExecutor = () => {
  const navigate = useNavigate();
  const { id } = TelegramUserInfo();
  const { token } = useAuth();

  useEffect(() => {
    window.Telegram.WebApp.BackButton.hide();
  }, []);

  const [profileInfo, setProfileInfo] = useState({
    photoUrl: "",
    bio: "",
    experience: 0,
    direction: "",
    role: "",
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProfileInfo = async () => {
    if (id && token) {
      try {
        const data = await fetchProfileInfo(id, token);
        setProfileInfo(data);
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      }
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return "negotiable";
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  };

  // Функция для форматирования времени
  const formatTimeAgo = (date) => {
    console.log(date)
    const now = new Date();
    console.log(now)
    const diffMs = now - new Date(date);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));

    if (diffMinutes < 60) {
      return `${diffMinutes} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays < 30) {
      return `${diffDays} дн назад`;
    } else {
      return `${diffMonths} мес назад`;
    }
    
  };

  const loadCustomerOrders = async () => {
    if (token) {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCustomerOrders(token);
        setOrders(data || []);
      } catch (error) {
        console.error("Ошибка при получении заказов:", error);
        setError("Ошибка при получении заказов");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProfileInfo();
    loadCustomerOrders();
  }, [id, token]);

  const handleCreateOrder = () => {
    navigate("/createOrderPage");
  };

  const renderContentByRole = () => {
    if (profileInfo.role === "Customer") {
      return (
        <div className="orders-executor">
          <div className="btn-container">
            <button className="create-order-button" onClick={handleCreateOrder}>
              Создать заказ
            </button>
          </div>
          <div className="orders-cards-container">
            {loading ? (
              <p>Загрузка заказов...</p>
            ) : error ? (
              <p>{error}</p>
            ) : orders && orders.length > 0 ? (
              orders.map((order, index) => (
                <div key={index} className="card">
                  <div className="heart-icon">
                    <HeartIcon />
                  </div>
                  <div className="card-content">
                    <div className="card-title">{order.title}</div>
                    <div className="card-description">{order.description}</div>
                    <div className="card-footer">
                      <div
                        className={`price ${
                          formatPrice(order.totalAmount) === "negotiable"
                            ? "negotiable"
                            : ""
                        }`}
                      >
                        {formatPrice(order.totalAmount) === "negotiable"
                          ? "По договоренности"
                          : formatPrice(order.totalAmount)}
                      </div>
                      <div className="time-stamps">
                        <div className="response">
                          <ResponseIcon />
                          <span className="time-stamp">{order.responses}</span>
                        </div>
                        <div className="views">
                          <ViewsIcon />
                          <span className="time-stamp">{order.views}</span>
                        </div>
                        <div className="time">
                          <TimeIcon />
                          <span className="time-stamp">
                            {formatTimeAgo(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Заказов еще нет</p>
            )}
          </div>
        </div>
      );
    } else if (profileInfo.role === "Performer") {
      return <p>Performer</p>;
    } else {
      return <p>Загрузка...</p>;
    }
  };

  return <div className="profile-container">{renderContentByRole()}</div>;
};

export default OrdersExecutor;
