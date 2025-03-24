// client/src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const register = async (email, password) => {
        await axios.post("http://localhost:5001/api/auth/register", { email, password });
    };

    const login = async (email, password) => {
        await axios.post("http://localhost:5001/api/auth/login", { email, password }, { withCredentials: true });
        setUser({ email });
    };

    const logout = async () => {
        await axios.post("http://localhost:5001/api/auth/logout", {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
