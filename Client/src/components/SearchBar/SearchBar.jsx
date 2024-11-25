import React from 'react';

const SearchBar = () => {
  return (
      <div className="d-flex justify-content-center mt-3">
          <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar productos"
              aria-label="Buscar"
          />
          <button className="btn btn-outline-success" type="submit">Buscar</button>
      </div>
  );
};

export default SearchBar;
