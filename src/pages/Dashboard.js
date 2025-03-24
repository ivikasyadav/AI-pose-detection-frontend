// src/pages/Dashboard.js
import { useContext } from "react";
import { AuthContext } from "../context/Authcontext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <h2>Welcome, {user.email}! This is your Dashboard.</h2>;
};

export default Dashboard;
