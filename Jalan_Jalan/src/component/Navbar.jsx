import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router";
import Swal from "sweetalert2";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
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
        setUsername("Unknown");
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        Swal.fire("Logged out!", "You have been logged out.", "success");
        navigate("/");
      }
    });
  };

  return (
    <nav
      className={`fixed w-full top-0 z-20 shadow-md bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-white transition-all duration-300">
        <Link
          to="/"
          className="text-xl font-bold hover:underline flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="Jalan Jalan Logo"
            className={`transition-all duration-300 ${
              scrolled ? "w-6 h-6" : "w-8 h-8"
            }`}
          />
          <span className={`${scrolled ? "text-base" : "text-xl"}`}>
            Jalan Jalan
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className={`font-semibold hover:underline ${
              scrolled ? "text-sm" : "text-base"
            }`}>
            Home
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          {isLoggedIn && username && (
            <span className={`${scrolled ? "text-sm" : "text-base"}`}>
              {username}
            </span>
          )}

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
