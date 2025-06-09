import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDirection, createOrder } from "../api/api";
import "./style.css";
import TelegramUserInfo from "../components/TelegramUserInfo.jsx";

const CreateOrder = () => {
    const { id } = TelegramUserInfo();
    const currencies = ["RUB", "EUR", "USD", "AED"];
    const paymentMethods = ["/проект", "/час"];
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState(null);
    const navigate = useNavigate();

    const [dataToCreate, setDataToCreate] = useState({
        title: "",
        tags: "", // строка
        description: "",
        totalAmount: "",
        currency: 1, // по умолчанию RUB
        paymentMethod: 0,
        boost: 0,
        directionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    });

    const fetchAllDirections = async () => {
        const { success, data, error } = await getAllDirection();

        if (success) {
            setSpecializations(data);
        } else {
            console.error("Ошибка получения данных:", error);
        }
    };

    useEffect(() => {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            navigate("/orders");
        });

        fetchAllDirections();
    }, [navigate]);

    const handleCreateOrder = async () => {
        const title = dataToCreate.title.trim();
        const description = dataToCreate.description.trim();
        const tags = dataToCreate.tags.trim();
        const amount = dataToCreate.totalAmount.trim() || "0";

        if (!title) return alert("Введите название задачи");
        if (!description) return alert("Введите описание задачи");

        const isHourly = dataToCreate.paymentMethod === 1;
        const isProject = dataToCreate.paymentMethod === 0;

        let calculatedPaymentMethod = 0;
        if (isHourly && amount !== "0") calculatedPaymentMethod = 1;
        else if (isProject && amount !== "0") calculatedPaymentMethod = 2;
        else if (isHourly && amount === "0") calculatedPaymentMethod = 3;
        else if (isProject && amount === "0") calculatedPaymentMethod = 4;

        const directionId =
            specializations.find((item) => item.title === selectedSpecialization)?.id ||
            dataToCreate.directionId;

        const orderData = {
            title,
            description,
            tags,
            totalAmount: amount,
            currency: dataToCreate.currency,
            paymentMethod: calculatedPaymentMethod,
            boost: 0,
            directionId,
        };

        console.log("Отправка заказа:", orderData);

        try {
            await createOrder(id, orderData);
            navigate("/orders");
        } catch (error) {
            alert("Ошибка при создании заказа. Проверьте введённые данные.");
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDataToCreate((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSpecializationClick = (item) => {
        setSelectedSpecialization(item.title);
        setDataToCreate((prevState) => ({ ...prevState, directionId: item.id }));
    };

    const toggleCurrency = () => {
        setDataToCreate((prevState) => ({
            ...prevState,
            currency: (prevState.currency % 4) + 1
        }));
    };

    const togglePaymentMethod = () => {
        setDataToCreate((prevState) => ({
            ...prevState,
            paymentMethod: (prevState.paymentMethod + 1) % paymentMethods.length
        }));
    };

    return (
        <div className="container">
            <div className="create-order-page">
                <div className="scroll">
                    <textarea
                        className="one-line-input"
                        placeholder="Название задачи"
                        name="title"
                        value={dataToCreate.title}
                        onChange={handleInputChange}
                    ></textarea>
                    <textarea
                        className="three-line-input"
                        placeholder="Описание задачи"
                        name="description"
                        value={dataToCreate.description}
                        onChange={handleInputChange}
                    ></textarea>
                    <textarea
                        className="one-line-input"
                        placeholder="Введите теги через запятую"
                        name="tags"
                        value={dataToCreate.tags}
                        onChange={handleInputChange}
                    ></textarea>
                    <div className="input-group">
                        <input
                            type="number"
                            className="one-half-line-input"
                            placeholder="Сумма"
                            name="totalAmount"
                            value={dataToCreate.totalAmount}
                            onChange={handleInputChange}
                        />
                        <button className="currency-button" onClick={toggleCurrency}>
                            {currencies[dataToCreate.currency - 1]}
                        </button>
                        <button className="payment-method-button" onClick={togglePaymentMethod}>
                            {paymentMethods[dataToCreate.paymentMethod]}
                        </button>
                    </div>
                    <div className="button-container">
                        {specializations.map((item) => (
                            <button
                                key={item.id}
                                className={`specialization-button ${
                                    selectedSpecialization === item.title ? "active" : ""
                                }`}
                                onClick={() => handleSpecializationClick(item)}
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="alone-btn-container">
                    <button className="btn" onClick={handleCreateOrder}>
                        Разместить заказ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
