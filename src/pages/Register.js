import { useState, useContext } from "react";
import { AuthContext } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import "./Regis.css";  // Import CSS

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (register(email, password)) {
            navigate("/login");
        } else {
            setError("User already exists!");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Register</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
