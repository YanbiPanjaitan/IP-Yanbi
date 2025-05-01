import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
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
          <Link
            to="/myfavorite"
            className="text-md font-medium hover:underline">
            Home
          </Link>
        </div>
        <div>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 font-semibold py-1.5 px-4 rounded-lg hover:bg-gray-100 transition">
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-blue-600 font-semibold py-1.5 px-4 rounded-lg hover:bg-gray-100 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
