import { useEffect, useState } from "react";
import OwnerHeader from "./OwnerHeader";
import StoreSubHeader from "./StoreSubHeader"; 
import client from "../../api";
import { useCart } from "./CartContext"; 
import "../../styles/OwnerStore.css";
import { getImageUrl } from "../../utils/imageUrl";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  imagePath?: string;
  rating?: number;
};

export default function OwnerStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { cart, addToCart } = useCart();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      const res = await client.get("/api/store/products");
      const productsWithRating = res.data.map((p: Product) => ({
        ...p,
        rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
      }));
      setProducts(productsWithRating);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }

  function handleAddToCart(product: Product) {
    if (cart.some((i) => i.productId === product.id)) {
      setToast("Already in cart 🛒");
    } else {
      addToCart(product);
      setToast("Added to cart 🛒");
    }
    setTimeout(() => setToast(null), 2000);
  }

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "ALL" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="owner-store-page"><OwnerHeader /><div className="store-loading-state"><div className="store-spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="owner-store-page">
      <OwnerHeader />
      
      <StoreSubHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <div className="store-container">
        <div className="product-grid">
          {filteredProducts.map((p) => {
            const inCart = cart.some((i) => i.productId === p.id);
            return (
              <div key={p.id} className="product-card">
                <div className="product-image-wrapper">
                  <img
                    className="product-image"
                    src={getImageUrl(p.imagePath, "/no-image.png")}
                    alt={p.name}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Product&size=400&background=f1f5f9&color=334155"; }}
                  />
                  {p.quantity === 0 && <div className="out-of-stock-badge">Out of Stock</div>}
                </div>
                <div className="product-info">
                  <span className="product-category">{p.category}</span>
                  <h3 className="product-name">{p.name}</h3>
                  <div className="product-price-row">
                    <strong className="product-price">₹{p.price}</strong>
                    <span className="product-stock">{p.quantity} in stock</span>
                  </div>
                  <button className={`product-add-btn ${inCart ? "added" : ""}`} disabled={inCart || p.quantity === 0} onClick={() => handleAddToCart(p)}>
                    {inCart ? "Added to Cart" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {toast && <div className="toast-notification">{toast}</div>}
    </div>
  );
}