import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      console.log("JWT Token from localStorage:", token);
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded JWT Payload:", payload);
        if (payload.username) {
          setUsername(payload.username);
        } else if (payload.author) {
          setUsername(payload.author);
        } else if (payload.email) {
          const emailUsername = payload.email.split("@")[0];
          setUsername(emailUsername);
        } else {
          setUsername("Unknown");
        }
      } catch (error) {
        console.error("Failed to parse token", error);
        setUsername("Unknown");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center text-white">
        <div className="flex items-center space-x-6">
          {/* Ganti "Home" dengan logo "Jalan Jalan" */}
          <Link
            to="/"
            className="text-xl font-bold hover:underline flex items-center space-x-2">
            <img src="/logo.png" alt="Jalan Jalan Logo" className="w-8 h-8" />
            <span>Jalan Jalan</span>
          </Link>

          {/* Ganti "My Favorite" jadi "Home" */}
          <Link to="/" className="text-md font-medium hover:underline">
            Home
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          {/* Show username if logged in */}
          {isLoggedIn && username && (
            <span className="text-white">{username}</span>
          )}

          {/* Conditionally render Login/Register/Logout */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 font-semibold py-1.5 px-4 rounded-lg hover:bg-gray-100 transition">
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-blue-600 font-semibold py-1.5 px-4 rounded-lg hover:bg-gray-100 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 font-semibold py-1.5 px-4 rounded-lg hover:bg-gray-100 transition ml-2">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
