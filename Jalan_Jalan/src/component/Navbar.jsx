import React, {useState, useEffect} from "react";
import {Link, useNavigate} from "react-router";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-blue-500">
      <div className="text-xl font-bold">Jalan-Jalan</div>
      <ul className="flex gap-4">
        <li className="nav-item">
          <Link to="/">Home</Link>
        </li>
        {isLoggedIn ? (
          <li className="nav-item">
            <button
              onClick={handleLogout}
              className="nav-link active text-red-500">
              Logout
            </button>
          </li>
        ) : (
          <li className="nav-item">
            <Link to="/login" className="nav-link active text-blue-500">
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
