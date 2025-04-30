import "./App.css";
import {BrowserRouter, Routes, Route} from "react-router";
import {configureStore} from "@reduxjs/toolkit";
import countriesReducer from "./store/countries";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DetailPage from "./pages/Detail";
import {Provider} from "react-redux";

const store = configureStore({
  reducer: {
    countries: countriesReducer,
  },
});

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/countries/:id" element={<DetailPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
