import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

import { getRoleProfile, getAllOrders } from "../api/api.jsx";
import TelegramUserInfo from "../components/TelegramUserInfo.jsx";

import FilterIcon from "../icons/FilterIcon";
import ResponseIcon from "../icons/ResponseIcon";
import TimeIcon from "../icons/TimeIcon";
import ViewsIcon from "../icons/ViewsIcon";

const Main = () => {
  const { id } = TelegramUserInfo();
  const [orders, setOrders] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleData = await getRoleProfile(id);
        setRole(roleData);
        if (roleData === "Performer") {
          const { success, data } = await getAllOrders(id, 10);
          if (success) {
            const openOrders = data.orders.filter(order => order.status === 2);
            setOrders(openOrders);
          }
        }
      } catch (error) {
        console.error("Ошибка при получении заказов исполнителя:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
      <div className="container">
        <div className="main-screen">
          <div className="search-bar">
            <input type="text" placeholder="Поиск..." className="search-input" />
            <button className="filter-button">
              <FilterIcon />
            </button>
          </div>

          <div className="cards-container">
            {loading && <div className="spinner" />}
            {!loading && orders.length === 0 && (
                <div style={{ color: "var(--tg-theme-hint-color)", textAlign: "center" }}>
                  Нет доступных заказов
                </div>
            )}
            {!loading &&
                orders.map((order) => (
                    <div
                        key={order.id}
                        className="card-container"
                        onClick={() => navigate(`/performer/order/${order.id}`)}
                        style={{ cursor: "pointer" }}
                    >
                      <div className="tegs">
                        {order.tags &&
                            order.tags.split(",").map((tag, index) => (
                                <p className="teg" key={index}>
                                  {tag.trim()}
                                </p>
                            ))}
                      </div>
                      <div className="describe-card">
                        <h1>{order.title}</h1>
                        <h2>{order.description}</h2>
                      </div>
                      <div className="card-footer">
                        <div className="card-price">
                          <p className="price">
                            {order.totalAmount === 0 ? "По договоренности" : `${order.totalAmount} ₽`}
                          </p>
                          <p className="per">
                            {order.paymentMethod === 2 || order.paymentMethod === 4
                                ? "/ проект"
                                : "/ час"}
                          </p>
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
                        {new Date(order.createdAt).toLocaleString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
          </div>
        </div>
      </div>
  );
};

export default Main;
