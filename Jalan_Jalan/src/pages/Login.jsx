import {useEffect, useState} from "react";
import {Link, Navigate, useNavigate} from "react-router";
import axios from "axios";
import Navbar from "../component/Navbar";
import Logo from "../assets/Jalan jalan.png";
import Swal from "sweetalert2";

export default function LoginPage() {
  const access_token = localStorage.getItem("access_token");

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    console.log("Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);
        const {data} = await axios({
          method: "POST",
          url: "http://localhost:3000/auth/google",
          data: {googleToken: response.credential},
        });
        localStorage.setItem("access_token", data.access_token);
        navigate("/");
      },
    });
    window.google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      {theme: "outline", size: "large"}
    );
    window.google.accounts.id.prompt();
  }, []);

  if (access_token) {
    return <Navigate to={"/"} />;
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const {data: response} = await axios({
        method: "POST",
        url: "http://localhost:3000/login",
        data: {email, password},
      });
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user_email", response.email); // Simpan email pengguna di localStorage
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
      });
      navigate("/");
    } catch (error) {
      console.log("🚀 ~ handleLogin ~ error:", error);
      if (error.response?.data?.message) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response.data.message,
        });
      }
    }
  }

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex justify-center w-full px-4">
          <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
            <div className="flex justify-center mb-6">
              <img src={Logo} alt="Logo" className="w-20 h-20" />
            </div>
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-4">
              Login to Your Account
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Welcome back! Please login to continue.
            </p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300">
                Login
              </button>
              <div className="text-center text-gray-500 my-4">or</div>
              <div
                id="buttonDiv"
                className="flex justify-center w-full mb-6"></div>
              <p className="text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
