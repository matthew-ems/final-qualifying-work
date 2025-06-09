import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders } from "../../../api/api";
import TelegramUserInfo from "../../../components/TelegramUserInfo"; // Импортируем TelegramUserInfo
import { useAuth } from "../../../components/AuthContext"; // Импортируем useAuth для токена
import "./main.css";

import ChooseIcon from "../../../icons/ChooseIcon";
import FilterIcon from "../../../icons/FilterIcon";
import HeartIcon from "./static/HeartIcon";
import ResponseIcon from "../../../icons/ResponseIcon";
import TimeIcon from "../../../icons/TimeIcon";
import ViewsIcon from "../../../icons/ViewsIcon";

const MainExecutor = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Достаем token из AuthContext
  const userData = TelegramUserInfo(); // Достаем данные о пользователе из TelegramUserInfo
  const userId = userData.id; // Извлекаем userId из данных

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [tempSelectedOptions, setTempSelectedOptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Новое состояние загрузки
  const [error, setError] = useState(null); // Состояние для обработки ошибок

  const modalRef = useRef(null);

  useEffect(() => {
    window.Telegram.WebApp.BackButton.hide();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (userId && token) {
        try {
          setLoading(true);
          const response = await fetchAllOrders(userId, token);

          console.log("Raw API response:", JSON.stringify(response, null, 2));

          if (response.success) {
            console.log("Fetched orders:", response.data);
            response.data.forEach((order, index) => {
              console.log(`Order ${index + 1}:`, JSON.stringify(order, null, 2));
            });
            setOrders(response.data);
          } else {
            console.error("Failed to fetch orders:", response.error);
            setError("Не удалось загрузить заказы.");
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
          setError("Произошла ошибка при загрузке заказов.");
        } finally {
          setLoading(false);
        }
      } else {
        console.warn("User ID или token отсутствует. Ожидание данных...");
        setLoading(false);
      }
    };

    console.log("User ID:", userId);
    console.log("Token:", token);

    fetchOrders();
  }, [userId, token]);

  const handleOrderClick = (orderId) => {
    console.log("Clicked order ID:", orderId); // Log the clicked order ID
    navigate(`/order/${orderId}`); // Navigate to order details page
};

  useEffect(() => {
    if (isFilterOpen) {
      setTempSelectedOptions(selectedOptions);

      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          setIsFilterOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isFilterOpen, selectedOptions]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const options = [
    "Разработка",
    "Тестирование",
    "Администрирование",
    "Дизайн",
    "Контент",
    "Маркетинг",
    "Другое",
  ];

  const handleOptionClick = (option) => {
    setTempSelectedOptions((prevTempSelectedOptions) => {
      if (prevTempSelectedOptions.includes(option)) {
        return prevTempSelectedOptions.filter((selectedOption) => selectedOption !== option);
      } else {
        return [...prevTempSelectedOptions, option];
      }
    });
  };

  const handleRemoveOption = (option) => {
    setSelectedOptions((prevSelectedOptions) =>
      prevSelectedOptions.filter((selectedOption) => selectedOption !== option)
    );
  };

  const formatPrice = (price) => {
    if (price === 0) return "negotiable";
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  };

  return (
    <div className="main-executor">
      {/* Поисковая строка */}
      <div className="search-bar">
        <input type="text" placeholder="Поиск..." className="search-input" />
        <button className="search-button" onClick={toggleFilter}>
          <FilterIcon />
        </button>
      </div>

      {/* Выбранные фильтры */}
      {selectedOptions.length > 0 && (
        <div className="selected-filters">
          {selectedOptions.map((option, index) => (
            <span key={index} className="filter-item" onClick={() => handleRemoveOption(option)}>
              {option}
              <button className="remove-filter">✕</button>
            </span>
          ))}
        </div>
      )}

      {/* Блок для карточек */}
      <div className="cards-container">
        {loading ? (
          <p>Загрузка заказов...</p>
        ) : error ? (
          <p>{error}</p>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="card" onClick={() => handleOrderClick(order.id)}>
              <div className="heart-icon">
                <HeartIcon />
              </div>
              <div className="card-content">
                <div className="card-title">{order.title}</div>
                <div className="card-description">{order.description}</div>
                <div className="card-footer">
                  <div className="card-price">
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
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Нет доступных заказов для пользователя {userId}</p>
        )}
      </div>

      {/* Всплывающее окно фильтра */}
      {isFilterOpen && (
        <div className="filter-overlay">
          <div className="filter-modal" ref={modalRef}>
            <div className="filter-header">
              <h1>Фильтры</h1>
              <p>Выберите параметры для фильтрации</p>
            </div>

            <div className="filter-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`option-buttons ${
                    tempSelectedOptions.includes(option) ? "selected" : ""
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                  {tempSelectedOptions.includes(option) && (
                    <div className="icon-container">
                      <ChooseIcon />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="filter-footer">
              <button
                className="filter-save-button"
                onClick={() => {
                  setSelectedOptions(tempSelectedOptions);
                  setIsFilterOpen(false);
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainExecutor;