import ProductList from "./ProductList";

export default function Favorites({ triggerCartSuccess }) {
  return <ProductList showOnlyFavorites={true} triggerCartSuccess={triggerCartSuccess} />;
}
