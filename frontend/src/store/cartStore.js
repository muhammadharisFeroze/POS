import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cart: [],
  invoiceDiscount: 0,
  
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1, discount: 0 }] };
  }),
  
  updateQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    )
  })),
  
  updateDiscount: (productId, discount) => set((state) => ({
    cart: state.cart.map(item =>
      item.id === productId ? { ...item, discount } : item
    )
  })),
  
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== productId)
  })),
  
  setInvoiceDiscount: (discount) => set({ invoiceDiscount: discount }),
  
  clearCart: () => set({ cart: [], invoiceDiscount: 0 }),
  
  getCartSummary: () => {
    const state = useCartStore.getState();
    let subtotal = 0;
    let totalItemDiscount = 0;
    let totalTax = 0;
    
    state.cart.forEach(item => {
      const lineTotal = item.price * item.quantity;
      const lineDiscount = (item.discount || 0) * item.quantity;
      const taxableAmount = lineTotal - lineDiscount;
      const lineTax = (taxableAmount * (item.tax_percent || 0)) / 100;
      
      subtotal += lineTotal;
      totalItemDiscount += lineDiscount;
      totalTax += lineTax;
    });
    
    const total = subtotal - totalItemDiscount - state.invoiceDiscount + totalTax;
    
    return {
      subtotal: subtotal.toFixed(2),
      itemDiscount: totalItemDiscount.toFixed(2),
      discount: state.invoiceDiscount.toFixed(2),
      tax: totalTax.toFixed(2),
      total: total.toFixed(2)
    };
  }
}));
