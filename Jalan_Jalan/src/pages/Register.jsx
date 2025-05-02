import {useState, useEffect} from "react";
import {Link, useNavigate} from "react-router";
import axios from "axios";
import Navbar from "../component/Navbar";
import Logo from "../assets/Jalan jalan.png";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await axios({
        method: "POST",
        url: "https://ip-yanbi.yanbipanjaitan.space/register",
        data: {username, email, password},
      });
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You can now log in with your new account!",
      });
      navigate("/login");
    } catch (error) {
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
        <div className="flex w-full max-w-6xl p-4">
          <div className="w-full flex justify-center items-center">
            <form
              className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl"
              onSubmit={handleRegister}>
              <div className="flex justify-center mb-6">
                <img src={Logo} alt="Logo" className="w-20 h-20" />
              </div>
              <div className="mb-4">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-2">
                  Create Your Account
                </h1>
                <h6 className="text-center text-gray-600">
                  Ayok jalan-jalan ke negara impianmu!
                </h6>
              </div>
              <div className="flex flex-col mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={username}
                  placeholder="Enter your username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="flex flex-col mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300">
                Register
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
