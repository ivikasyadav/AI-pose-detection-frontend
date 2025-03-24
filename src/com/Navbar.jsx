import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/Authcontext";
import "./Navbar.css"; // Import the CSS file

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">FitnessApp</Link>
                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <button className="nav-button" onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Register</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Icon */}
                <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
                    ☰
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
                {user ? (
                    <>
                        <Link to="/dashboard" className="mobile-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
                        <button className="mobile-button" onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="mobile-link" onClick={() => setIsOpen(false)}>Login</Link>
                        <Link to="/register" className="mobile-link" onClick={() => setIsOpen(false)}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
