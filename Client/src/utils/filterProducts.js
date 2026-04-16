export const filterByCategory = (products, category) => {
  if (!Array.isArray(products)) return [];

  return products.filter(
    (p) => p.category?.toLowerCase() === category.toLowerCase()
  );
};