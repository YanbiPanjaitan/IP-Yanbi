import "./App.css";
import {BrowserRouter, Routes, Route} from "react-router";
// import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
// import DetailPage from "./pages/Detail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/Countries/:id" element={<DetailPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
