import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById, getResponsesForOrder, getUserInfo, updateOrder, createReview, getReviewsByOrderId } from "../api/api";
import defaultAvatar from "../icons/default-avatar.svg";
import ResponseIcon from "../icons/ResponseIcon";
import ViewsIcon from "../icons/ViewsIcon";
import TimeIcon from "../icons/TimeIcon";
import ContactIcon from "../icons/ContactIcon";
import "./style.css";

const OrderDetailsCustomer = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersInfo, setUsersInfo] = useState({});
    const [rating, setRating] = useState(0); // Для хранения рейтинга
    const [comment, setComment] = useState(""); // Для хранения комментария
    const [reviews, setReviews] = useState([]); // Для хранения отзывов

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const [{ success: orderOk, data: orderData }, { success: responsesOk, data: responses }, { success: reviewsOk, data: reviews }] =
                    await Promise.all([
                        getOrderById(orderId),
                        getResponsesForOrder(orderId),
                        getReviewsByOrderId(orderId) // Получаем отзывы для заказа
                    ]);

                if (orderOk) {
                    setOrder(orderData);
                } else {
                    console.error("Не удалось загрузить заказ");
                }

                if (responsesOk) {
                    setResponses(responses);
                    console.log("Все отклики на заказ:", responses);

                    const uniqueUserIds = [...new Set(responses.map((r) => r.userId))];

                    const usersData = {};
                    await Promise.all(
                        uniqueUserIds.map(async (userId) => {
                            try {
                                const userData = await getUserInfo(userId);
                                usersData[userId] = {
                                    firstName: userData.dto?.firstName || "Пользователь",
                                    photoUrl: userData.dto?.photoUrl || null,
                                    userName: userData.dto?.userName || null
                                };
                            } catch (e) {
                                usersData[userId] = {
                                    firstName: "Пользователь",
                                    photoUrl: null,
                                    userName: null
                                };
                            }
                        })
                    );

                    setUsersInfo(usersData);
                } else {
                    console.error("Не удалось загрузить отклики");
                }

                if (reviewsOk) {
                    setReviews(reviews);
                } else {
                    console.error("Не удалось загрузить отзывы");
                }
            } catch (error) {
                console.error("Ошибка при получении деталей заказа:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();

        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            navigate("/orders");
        });

        return () => {
            window.Telegram.WebApp.BackButton.hide();
        };
    }, [orderId, navigate]);

    const handleSelectPerformer = async (userId) => {
        const updatedOrder = {
            id: order.id,
            title: order.title,
            description: order.description,
            totalAmount: order.totalAmount,
            tags: order.tags,
            currency: order.currency,
            status: 3, // Меняем статус на "в работе"
            paymentMethod: order.paymentMethod,
            boost: order.boost,
            directionId: order.directionId,
            performerId: userId // Устанавливаем выбранного исполнителя
        };

        try {
            console.log("Текущий заказ с исполнителем перед отправкой:", updatedOrder);
            console.log("JSON перед отправкой:", JSON.stringify(updatedOrder));

            const { success, error } = await updateOrder(updatedOrder);

            if (success) {
                alert(`Исполнитель выбран! Статус заказа изменен на 'В работе'`);
            } else {
                console.error("Ошибка при обновлении заказа:", error);
            }
        } catch (error) {
            console.error("Ошибка при обновлении заказа:", error);
        }
    };

    const handleContactPerformer = (userId) => {
        const user = usersInfo[userId];
        if (user && user.userName) {
            window.open(`https://t.me/${user.userName}`, "_blank");
        } else {
            alert("Не удалось получить информацию о пользователе для связи.");
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0 || !comment.trim()) {
            alert("Пожалуйста, поставьте оценку и напишите комментарий.");
            return;
        }

        try {
            console.log("Рейтинг: ", rating);
            console.log("Комментарий: ", comment);
            console.log("OrderId: ", order.id);
            console.log("TargetUserId: ", order.performerId);

            const { success, error } = await createReview({
                targetUserId: order.performerId,
                orderId: order.id,
                rating: rating,
                comment: comment.trim()
            });

            if (success) {
                alert("Ваш отзыв успешно отправлен!");

                const updatedOrder = {
                    id: order.id,
                    title: order.title,
                    description: order.description,
                    totalAmount: order.totalAmount,
                    tags: order.tags,
                    currency: order.currency,
                    status: 4,
                    paymentMethod: order.paymentMethod,
                    boost: order.boost,
                    directionId: order.directionId,
                    performerId: order.performerId
                };

                // Обновляем заказ
                const { success: updateSuccess, error: updateError } = await updateOrder(updatedOrder);

                if (updateSuccess) {
                    alert("Статус заказа изменен на 'Выполнено'");
                } else {
                    alert("Ошибка при изменении статуса заказа: " + (updateError || "Неизвестная ошибка"));
                }

                setRating(0);
                setComment("");
            } else {
                alert("Ошибка при отправке отзыва: " + (error || "Неизвестная ошибка"));
            }
        } catch (e) {
            console.error("Ошибка при отправке отзыва:", e);
            alert("Произошла ошибка при отправке отзыва.");
        }
    };

    if (loading) {
        return <div className="spinner" />;
    }

    if (!order) {
        return <div style={{ textAlign: "center" }}>Заказ не найден</div>;
    }

    return (
        <div className="container">
            <div className="profile-performer-screen">
                <div className="profile-info">
                    <h1 className="specialization">{order.title}</h1>
                    <h2 className="experience">{order.description}</h2>
                </div>

                {order.tags && (
                    <div className="tegs">
                        {order.tags.split(",").map((tag, index) => (
                            <p className="teg" key={index}>{tag.trim()}</p>
                        ))}
                    </div>
                )}

                <div className="card-price" style={{ marginBottom: "8px" }}>
                    <p className="price">
                        {String(order.totalAmount) === "0" ? "По договоренности" : `${order.totalAmount} ₽`}
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
                                minute: "2-digit"
                            })}
                        </span>
                    </div>
                </div>

                {order.status === 3 && order.performerId && (
                    <div className="review-section">
                        <h3 className="text_">Оставьте отзыв</h3>
                        <div>
                            <label className="text_">Поставьте рейтинг (1-5):</label>
                            <input
                                className="one-line-input"
                                type="number"
                                value={rating}
                                min="1"
                                max="5"
                                onChange={(e) => setRating(parseInt(e.target.value, 10))}
                                style={{ width: "50px" }}
                            />
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Оставьте комментарий"
                            className="info-textarea"
                        />
                        <button onClick={handleSubmitReview} className="btn">
                            Завершить заказ
                        </button>
                    </div>
                )}

                {/* Отображаем отзыв, если заказ завершен */}
                {order.status === 4 && reviews.length > 0 && (
                    <div className="review-section">
                        <h3>Отзыв</h3>
                        {reviews.map((review, i) => (
                            <div key={i} className="info-textarea-response" style={{ whiteSpace: "pre-wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                    <img
                                        src={usersInfo[review.authorId]?.photoUrl || defaultAvatar}
                                        alt={usersInfo[review.authorId]?.firstName || "Пользователь"}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            marginRight: 8
                                        }}
                                    />
                                    <strong>{usersInfo[review.authorId]?.firstName || "Пользователь"}</strong>
                                </div>
                                <p className="text-response">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}

                {order.status === 2 && responses.length > 0 ? (
                    responses.map((resp, i) => {
                        const user = usersInfo[resp.userId] || {};
                        return (
                            <div key={i} className="info-textarea-response" style={{ whiteSpace: "pre-wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                    <img
                                        src={user.photoUrl || defaultAvatar}
                                        alt={user.firstName || "Пользователь"}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            marginRight: 8
                                        }}
                                    />
                                    <strong>{user.firstName || "Пользователь"}</strong>
                                </div>
                                <p className="text-response">{resp.messsage}</p>
                                <div className="button-container_customer">
                                    <button
                                        className="select-btn"
                                        onClick={() => handleSelectPerformer(resp.userId)}
                                        style={{ marginRight: "8px" }}
                                    >
                                        Выбрать исполнителем
                                    </button>
                                    <button
                                        className="contact-btn"
                                        onClick={() => handleContactPerformer(resp.userId)}
                                    >
                                        <ContactIcon />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : order.status === 2 && (
                    <p style={{ color: "var(--tg-theme-hint-color)", marginTop: "8px" }}>
                        Откликов пока нет.
                    </p>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsCustomer;