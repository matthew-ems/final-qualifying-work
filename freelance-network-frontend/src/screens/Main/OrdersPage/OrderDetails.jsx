import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrderById } from "../../../api/api"; // Импорт функции для получения заказа по ID
import { useAuth } from "../../../components/AuthContext"; // Импортируем useAuth для токена

const OrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Получаем ID из параметров URL
    const { token } = useAuth(); // Достаем токен
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
          navigate("/main");
        });
        return () => {
          window.Telegram.WebApp.BackButton.offClick();
        };
      }, [navigate]);

    useEffect(() => {
        const fetchOrder = async () => {
            console.log("Fetching order with ID:", id, "Token:", token); // Логирование ID заказа и токена
            if (id && token) {
                try {
                    const response = await fetchOrderById(id, token); // Получаем заказ по ID
                    
                    // Проверка, является ли ответ JSON
                    const responseData = typeof response.json === 'function' ? await response.json() : response;

                    console.log("Parsed API response:", responseData); // Логирование полного ответа API
                    
                    // Присваиваем данные, если они существуют
                    setOrder(responseData.data || responseData); // В случае, если `data` отсутствует

                } catch (error) {
                    setError("Произошла ошибка при загрузке заказа.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError("ID заказа или токен отсутствуют.");
            }
        };
    
        fetchOrder();
    }, [id, token]);
    

    if (loading) {
        return <p>Загрузка деталей заказа...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!order) {
        return <p>Заказ не найден.</p>;
    }

    return (
        <div className="order-details">
            <h1>{order.title}</h1> {/* Выводим только название заказа */}
            {/* Логируем все детали заказа в консоль */}
            {console.log("Order Details:", order)}
        </div>
    );
};

export default OrderDetails;
