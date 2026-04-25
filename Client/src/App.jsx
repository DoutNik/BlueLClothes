import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home/Home";
import SearchBar from "./components/SearchBar/SearchBar";
import CreateProduct from "./views/Admin/CreateProduct/CreateProduct";
import AdminDashboard from "./views/Admin/AdminDashboard";
//import AdminProducts from "./views/Admin/Products/AdminProducts";
import Glasses from "./components/Products/Glasses/Glasses";
import Clothes from "./components/Products/Clothes/Clothes";
import ProductDetail from "./views/Detail/Detail";
import Login from "./views/Login/Login";
import Register from "./views/Register/Register";
import Navbar from "./components/Navbar/Navbar";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import Cart from "./views/Cart/Cart";

import "./App.css";

const App = () => {
  return (
    <Router
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <div className="app-container">
        <header>
          <Navbar />
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/glasses" element={<Glasses />} />
          <Route path="/clothes" element={<Clothes />} />
          <Route path="/product-detail/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/*           <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          /> */}

          <Route
            path="/admin/create-product"
            element={
              <AdminRoute>
                <CreateProduct />
              </AdminRoute>
            }
          />
          <Route path="/cart" element={<Cart />} />
        </Routes>
        <footer>Footer content</footer>
      </div>
    </Router>
  );
};

export default App;
