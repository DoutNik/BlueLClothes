import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";

import Categories from "../../components/Categories/Categories";
import SearchBar from "../../components/SearchBar/SearchBar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

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

      {category && <SearchBar />}

      <ProductGrid />
    </div>
  );
};

export default Home;
