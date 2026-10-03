import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentMethod } from '@fertilizer/shared';

export interface PosCartItem {
  productId: string;
  name: string;
  urduName?: string;
  company: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  availableStock: number;
  totalPrice: number;
}

export interface SelectedCustomer {
  id?: string;
  name: string;
  phone?: string;
  village?: string;
  creditLimit: number;
  currentBalance: number;
  isWalkIn: boolean;
}

interface PosState {
  // Cart
  items: PosCartItem[];
  customer: SelectedCustomer;
  discount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  notes: string;

  // Actions
  addItem: (product: any, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updatePrice: (productId: string, salePrice: number) => void;
  setCustomer: (customer: SelectedCustomer) => void;
  setDiscount: (discount: number) => void;
  setPaidAmount: (paidAmount: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;

  // Computed Helpers
  getSubtotal: () => number;
  getTotalAmount: () => number;
  getBalanceDue: () => number;
  getItemCount: () => number;
}

const defaultCustomer: SelectedCustomer = {
  name: 'عام نقد کسان (Walk-in Cash)',
  creditLimit: 0,
  currentBalance: 0,
  isWalkIn: true,
};

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: defaultCustomer,
      discount: 0,
      paidAmount: 0,
      paymentMethod: PaymentMethod.CASH,
      notes: '',

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((item) => item.productId === product.id);

        if (existing) {
          const newQty = existing.quantity + quantity;
          set({
            items: items.map((item) =>
              item.productId === product.id
                ? {
                    ...item,
                    quantity: newQty,
                    totalPrice: newQty * item.salePrice,
                  }
                : item,
            ),
          });
        } else {
          const newItem: PosCartItem = {
            productId: product.id,
            name: product.name,
            urduName: product.urdu_name,
            company: product.company_name,
            unit: product.unit,
            costPrice: Number(product.cost_price),
            salePrice: Number(product.sale_price),
            quantity,
            availableStock: Number(product.current_stock),
            totalPrice: Number(product.sale_price) * quantity,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity,
                  totalPrice: quantity * item.salePrice,
                }
              : item,
          ),
        });
      },

      updatePrice: (productId, salePrice) => {
        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  salePrice,
                  totalPrice: item.quantity * salePrice,
                }
              : item,
          ),
        });
      },

      setCustomer: (customer) => set({ customer }),
      setDiscount: (discount) => set({ discount: Math.max(0, discount) }),
      setPaidAmount: (paidAmount) => set({ paidAmount: Math.max(0, paidAmount) }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setNotes: (notes) => set({ notes }),

      clearCart: () =>
        set({
          items: [],
          customer: defaultCustomer,
          discount: 0,
          paidAmount: 0,
          paymentMethod: PaymentMethod.CASH,
          notes: '',
        }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getTotalAmount: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        return Math.max(0, subtotal - discount);
      },

      getBalanceDue: () => {
        const total = get().getTotalAmount();
        const paid = get().paidAmount;
        return Math.max(0, total - paid);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'fertilizer_pos_cart',
    },
  ),
);
