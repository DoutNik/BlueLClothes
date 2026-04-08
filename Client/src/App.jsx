import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home/Home";
import SearchBar from "./components/SearchBar/SearchBar";
import Glasses from "./views/Glasses/Glasses";
import Clothes from "./views/Clothes/Clothes";
import Navbar from "./components/Navbar/Navbar";
import backgroundImage from "./assets/backgroundImage.jpg";

import "./App.css";

const App = () => {
  return (
    <Router>
      <div
        className="app-container"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <header>
          <Navbar />
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/glasses" element={<Glasses />} />
          <Route path="/clothes" element={<Clothes />} />
        </Routes>
        <footer>Footer content</footer>
      </div>
    </Router>
  );
};

export default App;
