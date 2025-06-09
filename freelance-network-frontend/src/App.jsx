import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import {
    Loading,
    RegistrationPage,
    RegistrationPerformer,
    RegistrationCustormer,
    Main,
    Orders,
    Favorites,
    Profile,
    CreateOrder,
    OrderDetails,
    OrderDetailsCustomer,
} from "./pages";

import PageWithMenu from "./menu/PerformerPageWithMenu";

function App() {
    const bot = window.Telegram.WebApp;
    bot.expand();

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Loading />} />
                <Route path="/registration-page" element={<RegistrationPage />} />
                <Route path="/registration-performer" element={<RegistrationPerformer />} />
                <Route path="/registration-customer" element={<RegistrationCustormer />} />
                <Route path="/customer/order/:orderId" element={<OrderDetailsCustomer />} />
                <Route path="/performer/order/:orderId" element={<OrderDetails />} />
                <Route path="/create-order" element={<CreateOrder />} />

                <Route
                    path="/main"
                    element={
                        <PageWithMenu>
                            <Main />
                        </PageWithMenu>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <PageWithMenu>
                            <Orders />
                        </PageWithMenu>
                    }
                />
                <Route
                    path="/favorites"
                    element={
                        <PageWithMenu>
                            <Favorites />
                        </PageWithMenu>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PageWithMenu>
                            <Profile />
                        </PageWithMenu>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
