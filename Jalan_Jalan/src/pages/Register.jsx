import {useState} from "react";
import {Link, useNavigate} from "react-router";
import axios from "axios";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await axios({
        method: "POST",
        url: "http://localhost:3000/register",
        data: {username, email, password},
      });
      navigate("/login");
    } catch (error) {
      console.log("🚀 ~ handleRegister ~ error:", error);
      if (error.response?.data?.message) {
        window.Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response.data.message,
        });
      }
    }
  }

  return (
    <div className="d-flex flex-grow-1">
      <div className="w-50 cooking-bg"></div>
      <div className="w-50 d-flex justify-content-center align-items-center">
        <form className="form w-100 p-5" onSubmit={handleRegister}>
          <div className="mb-4">
            <h1 className="fw-bold">Create your account</h1>
            <h6>Post your own recipes for everyone to see!</h6>
          </div>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-danger mt-4 w-100">
            Register
          </button>
          <p className="text-center mt-3">
            You have an account?{" "}
            <Link to={"/login"} className="text-danger">
              Login now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
