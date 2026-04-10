import React, { useState } from "react";
import styles from "./Register.module.css";

const Register = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("idle"); // idle | success | error

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    avatarUrl: "",
  });

  const [errors, setErrors] = useState({});

  // VALIDACIONES
  const validate = (name, value) => {
    let error = "";

    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
      error = "Email inválido";
    }

    if (name === "password" && value.length < 6) {
      error = "Mínimo 6 caracteres";
    }

    if ((name === "firstName" || name === "lastName") && value.length < 2) {
      error = "Muy corto";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });
    validate(name, value);
  };

  // PROGRESO
  const progress = Math.min(
    100,
    (Object.values(form).filter((v) => v).length / Object.keys(form).length) * 100
  );

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:3001/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      setStatus("success");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div
        className={`${styles.authCard} ${styles.neonBorder} ${
          status === "success" ? styles.success : ""
        } ${status === "error" ? styles.error : ""}`}
      >
        <h2 className={styles.authTitle}>🪪 Pre acreditación</h2>

        {/* PROGRESS BAR */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* STEP INDICATOR */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${step === 1 && styles.stepActive}`} />
          <div className={`${styles.step} ${step === 2 && styles.stepActive}`} />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className={styles.form}>
            <input name="firstName" placeholder="Nombre" onChange={handleChange} />
            {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}

            <input name="lastName" placeholder="Apellido" onChange={handleChange} />
            {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}

            <input name="email" placeholder="Email" onChange={handleChange} />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}

            <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} />
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}

            <button className={styles.neonButton} onClick={() => setStep(2)}>
              Siguiente
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className={styles.form}>
            <input name="phone" placeholder="Teléfono" onChange={handleChange} />
            <input name="address" placeholder="Dirección" onChange={handleChange} />
            <input name="city" placeholder="Ciudad" onChange={handleChange} />
            <input name="country" placeholder="País" onChange={handleChange} />
            <input name="avatarUrl" placeholder="Avatar URL" onChange={handleChange} />

            <div className={styles.buttonGroup}>
              <button className={styles.secondaryButton} onClick={() => setStep(1)}>
                Volver
              </button>

              <button className={styles.secondaryButton} onClick={handleSubmit}>
                Omitir
              </button>

              <button className={styles.neonButton} onClick={handleSubmit}>
                Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;