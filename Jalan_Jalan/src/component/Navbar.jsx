import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:3000/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        Jalan-Jalan
      </Link>
      <div>
        {user ? (
          <span className="mr-4">Welcome, {user.username}!</span>
        ) : (
          <Link to="/login" className="mr-4">
            Login
          </Link>
        )}
        <Link to="/register" className="mr-4">
          Register
        </Link>
      </div>
    </nav>
  );
}
