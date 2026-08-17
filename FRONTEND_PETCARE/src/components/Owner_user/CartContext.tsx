// src/context/CartContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

/* ✅ UPDATED: imageUrl added to CartItem */
type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string; // <-- REQUIRED for cart images
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  changeQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(product: any) {
    setCart((prev) => {
      if (prev.some((i) => i.productId === product.id)) return prev;

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          /* ✅ UPDATED: store product image for cart */
          imageUrl: product.imagePath || product.imageUrl || "",
        },
      ];
    });
  }

  function changeQty(productId: number, qty: number) {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, qty) }
          : i
      )
    );
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  const cartTotal = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        changeQty,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart must be used within a CartProvider");
  return context;
}
