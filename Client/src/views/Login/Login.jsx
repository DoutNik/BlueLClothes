import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.email || !form.password) {
      return "Todos los campos son obligatorios";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return "Email inválido";
    }

    if (form.password.length < 6) {
      return "Contraseña muy corta";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3001/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al iniciar sesión");
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card neon-border">
        <h2 className="auth-title">🎟 Control de acceso</h2>
        <p className="auth-subtitle">
          Presentá tus datos para ingresar al evento
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="neon-button" disabled={loading}>
            {loading ? "Validando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;