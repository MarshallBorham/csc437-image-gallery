import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { MainLayout } from "./MainLayout.jsx";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

function App() {
    const [authToken, setAuthToken] = useState(null);
    const navigate = useNavigate();

    function handleAuthTokenReceived(token) {
        setAuthToken(token);
        navigate("/");
    }

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={
                    <ProtectedRoute authToken={authToken}>
                        <AllImages authToken={authToken} />
                    </ProtectedRoute>
                } />
                <Route path={VALID_ROUTES.UPLOAD} element={
                    <ProtectedRoute authToken={authToken}>
                        <UploadPage authToken={authToken} />
                    </ProtectedRoute>
                } />
                <Route path={VALID_ROUTES.IMAGE_DETAILS} element={
                    <ProtectedRoute authToken={authToken}>
                        <ImageDetails authToken={authToken} />
                    </ProtectedRoute>
                } />
                <Route path={VALID_ROUTES.LOGIN} element={
                    <LoginPage key="login" isRegistering={false} onAuthTokenReceived={handleAuthTokenReceived} />
                } />
                <Route path={VALID_ROUTES.REGISTER} element={
                    <LoginPage key="register" isRegistering={true} onAuthTokenReceived={handleAuthTokenReceived} />
                } />
            </Route>
        </Routes>
    );
}

export default App;