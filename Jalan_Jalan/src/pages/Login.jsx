import {useEffect, useState} from "react";
import {Link, Navigate, useNavigate} from "react-router";
import axios from "axios";

export default function LoginPage() {
  const access_token = localStorage.getItem("access_token");

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        data: { email, password },
      });
      localStorage.setItem("access_token", response.access_token);
      navigate("/");
    } catch (error) {
      console.log("🚀 ~ handleLogin ~ error:", error);
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
      <div className="w-50 d-flex justify-content-center align-items-center">
        <form className="form w-100 p-5" onSubmit={handleLogin}>
          <div className="mb-4">
            <h1 className="fw-bold">Login to your account</h1>
            <h6>Welcome back!</h6>
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
              u
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
          <div className="mt-4 d-flex gap-2 justify-content-center">
            <button type="submit" className="btn btn-danger w-50">
              Login
            </button>
            <div className="d-flex align-items-center">
              <p className="m-0 text-center">or</p>
            </div>
            <div className="w-50" id="buttonDiv"></div>
          </div>
          <p className="text-center mt-3">
            Don't have account?{" "}
            <Link to={"/register"} className="text-danger">
              Create an account
            </Link>
          </p>
        </form>
      </div>
      <div className="w-50 cooking-bg"></div>
    </div>
  );
}
