import { useDispatch } from "react-redux";

import {
  setBrand,
  setColor,
  setMinPrice,
  setMaxPrice,
  setSort,
  setOnlyStock,
  clearFilters,
} from "../../REDUX/actions";

import styles from "./Filters.module.css";

const Filters = () => {
  const dispatch = useDispatch();

  return (
    <div className={styles.filtersContainer}>
      <input
        className={styles.input}
        placeholder="Marca"
        onChange={(e) => dispatch(setBrand(e.target.value))}
      />

      <input
        className={styles.input}
        placeholder="Color"
        onChange={(e) => dispatch(setColor(e.target.value))}
      />

      <input
        className={styles.input}
        type="number"
        placeholder="Precio mínimo"
        onChange={(e) => dispatch(setMinPrice(e.target.value))}
      />

      <input
        className={styles.input}
        type="number"
        placeholder="Precio máximo"
        onChange={(e) => dispatch(setMaxPrice(e.target.value))}
      />

      <select
        className={styles.select}
        onChange={(e) => dispatch(setSort(e.target.value))}
      >
        <option value="price-asc">Precio ↑</option>
        <option value="price-desc">Precio ↓</option>
        <option value="name-asc">Nombre A-Z</option>
        <option value="name-desc">Nombre Z-A</option>
        <option value="stock-desc">Más stock</option>
      </select>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          onChange={(e) => dispatch(setOnlyStock(e.target.checked))}
        />
        Solo disponibles
      </label>

      <button
        className={styles.clearBtn}
        onClick={() => dispatch(clearFilters())}
      >
        Limpiar filtros
      </button>
    </div>
  );
};

export default Filters;
