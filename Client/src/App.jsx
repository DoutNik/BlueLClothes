import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home/Home";
import SearchBar from "./components/SearchBar/SearchBar";
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
        </Routes>
        <footer>Footer content</footer>
      </div>
    </Router>
  );
};

export default App;
