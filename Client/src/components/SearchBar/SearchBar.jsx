import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSearch } from "../../REDUX/actions";
import styles from "./SearchBar.module.css";

const SearchBar = () => {
  const dispatch = useDispatch();

  const [input, setInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearch(input));
    }, 300);

    return () => clearTimeout(timer);
  }, [input, dispatch]);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <span className={styles.icon}>🔍</span>

        <input
          type="text"
          placeholder="Buscar productos, marcas o categorías..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {input && (
          <button
            className={styles.clearBtn}
            onClick={() => setInput("")}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;