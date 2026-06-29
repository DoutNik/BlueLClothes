import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";

import Categories from "../../components/Categories/Categories";
import SearchBar from "../../components/SearchBar/SearchBar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import Filters from "../../components/Filters/Filters";

import { getProducts } from "../../REDUX/actions";

import styles from "./Home.module.css";
import backgroundImage from "../../assets/backgroundImage.jpg";

const Home = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category");

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Categories />

      {category && (
        <>
          <SearchBar />

          <div className={styles.content}>
            <aside className={styles.sidebar}>
              <Filters />
            </aside>

            <main className={styles.products}>
              <ProductGrid />
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;