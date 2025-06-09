import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import ResponseIcon from "../icons/ResponseIcon.jsx";
import ViewsIcon from "../icons/ViewsIcon.jsx";
import TimeIcon from "../icons/TimeIcon.jsx";
import TelegramUserInfo from "../components/TelegramUserInfo.jsx";
import { getRoleProfile, getOrdersExecution, getMyOrders } from "../api/api.jsx";

const Orders = () => {
    const navigate = useNavigate();
    const { id } = TelegramUserInfo();
    const [role, setRole] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const roleData = await getRoleProfile(id);
                setRole(roleData);

                if (roleData === "Customer") {
                    const { success, data } = await getMyOrders(id);
                    if (success) {
                        setOrders(data);
                    } else {
                        console.error("Не удалось получить заказы");
                    }
                } else if (roleData === "Performer") {
                    // Если это исполнитель, используем getOrdersExecution для получения его заказов
                    const { success, data } = await getOrdersExecution(); // Получаем заказы для исполнителя
                    if (success) {
                        // Фильтруем заказы по статусу 3 (в работе) и 4 (завершенные)
                        setOrders(data); // Устанавливаем все заказы исполнителя (в работу и завершенные)
                    } else {
                        console.error("Не удалось получить заказы исполнителя");
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error("Ошибка при получении заказов:", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [id]);

    const handleCreateOrder = () => {
        navigate("/create-order");
    };

    const handleOrderClick = (orderId) => {
        navigate(`/performer/order/${orderId}`);
    };

    const handleOrderClickCustomer = (orderId) => {
        navigate(`/customer/order/${orderId}`);
    };

    return (
        <div className="container">
            <div className="orders-customer-screen">
                {role === "Customer" && (
                    <div className="orders-cards-container">
                        {loading && <div className="spinner" />}
                        {!loading && orders.length === 0 && (
                            <div style={{ textAlign: "center", color: "var(--tg-theme-hint-color)", marginTop: "20px" }}>
                                У вас пока нет заказов
                            </div>
                        )}
                        {!loading && orders.map((order) => (
                            <div key={order.id} className="card-container" onClick={() => handleOrderClickCustomer(order.id)}>
                                <div className="tegs">
                                    {order.tags && order.tags.split(",").map((tag, index) => (
                                        <p className="teg" key={index}>{tag.trim()}</p>
                                    ))}
                                </div>
                                <div className="describe-card">
                                    <h1>{order.title}</h1>
                                    <h2>{order.description}</h2>
                                </div>
                                <div className="card-footer">
                                    <div className="card-price">
                                        <p className="price">
                                            {order.totalAmount === 0 ? "Не назначено" : `${order.totalAmount} ₽`}
                                        </p>
                                        <p className="per">{order.paymentMethod === 2 || order.paymentMethod === 4 ? "/ проект" : "/ час"}</p>
                                    </div>
                                    <div className="time-stamps">
                                        <div className="response">
                                            <ResponseIcon />
                                            <span className="time-stamp">{order.responses?.length || 0}</span>
                                        </div>
                                        <div className="views">
                                            <ViewsIcon />
                                            <span className="time-stamp">{order.views?.length || 0}</span>
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
                )}

                {role === "Performer" && (
                    <div className="orders-cards-container">
                        <h2 className="title-orders">В работе</h2>
                        {loading && <div className="spinner" />}
                        {!loading && orders.filter(order => order.status === 3).length === 0 && (
                            <div style={{ textAlign: "center", color: "var(--tg-theme-hint-color)", marginTop: "20px" }}>
                                У вас нет заказов в работе
                            </div>
                        )}
                        {!loading && orders.filter(order => order.status === 3).map((order) => (
                            <div key={order.id} className="card-container" onClick={() => handleOrderClick(order.id)}>
                                <div className="tegs">
                                    {order.tags && order.tags.split(",").map((tag, index) => (
                                        <p className="teg" key={index}>{tag.trim()}</p>
                                    ))}
                                </div>
                                <div className="describe-card">
                                    <h1>{order.title}</h1>
                                    <h2>{order.description}</h2>
                                </div>
                                <div className="card-footer">
                                    <div className="card-price">
                                        <p className="price">
                                            {order.totalAmount === 0 ? "Не назначено" : `${order.totalAmount} ₽`}
                                        </p>
                                        <p className="per">{order.paymentMethod === 2 || order.paymentMethod === 4 ? "/ проект" : "/ час"}</p>
                                    </div>
                                    <div className="time-stamps">
                                        <div className="response">
                                            <ResponseIcon />
                                            <span className="time-stamp">{order.responses?.length || 0}</span>
                                        </div>
                                        <div className="views">
                                            <ViewsIcon />
                                            <span className="time-stamp">{order.views?.length || 0}</span>
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

                        <h2 className="title-orders">Завершенные</h2>
                        {loading && <div className="spinner" />}
                        {!loading && orders.filter(order => order.status === 4).length === 0 && (
                            <div style={{ textAlign: "center", color: "var(--tg-theme-hint-color)", marginTop: "20px" }}>
                                У вас нет завершенных заказов
                            </div>
                        )}
                        {!loading && orders.filter(order => order.status === 4).map((order) => (
                            <div key={order.id} className="card-container" onClick={() => handleOrderClick(order.id)}>
                                <div className="tegs">
                                    {order.tags && order.tags.split(",").map((tag, index) => (
                                        <p className="teg" key={index}>{tag.trim()}</p>
                                    ))}
                                </div>
                                <div className="describe-card">
                                    <h1>{order.title}</h1>
                                    <h2>{order.description}</h2>
                                </div>
                                <div className="card-footer">
                                    <div className="card-price">
                                        <p className="price">
                                            {order.totalAmount === 0 ? "Не назначено" : `${order.totalAmount} ₽`}
                                        </p>
                                        <p className="per">{order.paymentMethod === 2 || order.paymentMethod === 4 ? "/ проект" : "/ час"}</p>
                                    </div>
                                    <div className="time-stamps">
                                        <div className="response">
                                            <ResponseIcon />
                                            <span className="time-stamp">{order.responses?.length || 0}</span>
                                        </div>
                                        <div className="views">
                                            <ViewsIcon />
                                            <span className="time-stamp">{order.views?.length || 0}</span>
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
                )}

                {role === "Customer" && (
                    <div className="alone-btn-container">
                        <button className="btn" onClick={handleCreateOrder}>
                            Новый заказ +
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
