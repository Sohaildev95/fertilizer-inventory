import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MobileProduct, MobileCustomer, MobileCartItem, MobileSaleRecord } from '../types';
import { recordSale } from '../services/storage';

interface PosBillingTabProps {
  products: MobileProduct[];
  customers: MobileCustomer[];
  isOnline: boolean;
  isUrdu: boolean;
  onSaleComplete: (sale: MobileSaleRecord) => void;
  onRefreshData: () => void;
}

export const PosBillingTab: React.FC<PosBillingTabProps> = ({
  products,
  customers,
  isOnline,
  isUrdu,
  onSaleComplete,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<MobileCartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cash-walkin');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT' | 'BANK'>('CASH');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['ALL', 'Urea', 'DAP', 'CAN', 'Potash', 'Pesticides', 'Seeds'];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameUrdu.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'ALL' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  // Selected Customer details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Cart operations
  const addToCart = (product: MobileProduct, qtyToAdd: number) => {
    if (product.stockBags <= 0) {
      Alert.alert(
        isUrdu ? 'اسٹاک ختم' : 'Out of Stock',
        isUrdu
          ? 'اس کھاد کا گودام میں اسٹاک موجود نہیں ہے۔'
          : 'Stock is currently not available in godown.'
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qtyToAdd;
        if (newQty > product.stockBags) {
          Alert.alert(
            isUrdu ? 'اسٹاک الرٹ' : 'Stock Alert',
            isUrdu
              ? `گودام میں صرف ${product.stockBags} بوری دستیاب ہے۔`
              : `Only ${product.stockBags} bags available in godown.`
          );
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, lineTotal: newQty * item.unitPrice }
            : item
        );
      } else {
        const qty = Math.min(qtyToAdd, product.stockBags);
        return [
          ...prev,
          {
            product,
            quantity: qty,
            unitPrice: product.retailPrice,
            lineTotal: qty * product.retailPrice,
          },
        ];
      }
    });
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && newQty > product.stockBags) {
      Alert.alert(
        isUrdu ? 'اسٹاک الرٹ' : 'Stock Alert',
        isUrdu
          ? `صرف ${product.stockBags} بوری دستیاب ہے۔`
          : `Only ${product.stockBags} bags available.`
      );
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQty, lineTotal: newQty * item.unitPrice }
          : item
      )
    );
  };

  // Calculations
  const totalBags = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const netPayable = Math.max(0, subtotal - discount);

  // Default paid amount based on method
  const numericPaid =
    paymentMethod === 'CREDIT'
      ? paidAmount === ''
        ? 0
        : parseFloat(paidAmount) || 0
      : netPayable;
  const balanceDue = Math.max(0, netPayable - numericPaid);

  // Generate Bill
  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert(
        isUrdu ? 'کارٹ خالی ہے' : 'Cart Empty',
        isUrdu ? 'برائے مہربانی پہلے کھاد منتخب کریں۔' : 'Please select products first.'
      );
      return;
    }

    if (paymentMethod === 'CREDIT' && selectedCustomerId === 'cash-walkin') {
      Alert.alert(
        isUrdu ? 'کسان منتخب کریں' : 'Select Farmer',
        isUrdu
          ? 'ادھار کھاتے کے لیے زمیندار / کسان کا انتخاب لازمی ہے۔'
          : 'Please select a registered farmer for credit sale.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const saleRecord: MobileSaleRecord = {
        id: `sale-mob-${Date.now()}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customerId: selectedCustomerId,
        customerName:
          selectedCustomerId === 'cash-walkin'
            ? isUrdu
              ? 'نقد کسٹمر'
              : 'Walk-in Cash'
            : selectedCustomer?.name || 'Customer',
        customerVillage: selectedCustomer?.village || 'Counter Walkin',
        customerPhone: selectedCustomer?.phone || '-',
        items: cart.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          productNameUrdu: i.product.nameUrdu,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.lineTotal,
        })),
        totalBags,
        subtotal,
        discount,
        netPayable,
        paidAmount: numericPaid,
        balanceDue,
        paymentMethod,
        createdAt: new Date().toISOString(),
        isSynced: isOnline,
      };

      const result = await recordSale(saleRecord, isOnline);
      setCart([]);
      setDiscount(0);
      setPaidAmount('');
      setPaymentMethod('CASH');
      setSelectedCustomerId('cash-walkin');
      onRefreshData();
      onSaleComplete(result.sale);
    } catch {
      Alert.alert(isUrdu ? 'خرابی' : 'Error', isUrdu ? 'بل محفوظ نہ ہو سکا۔' : 'Failed to save bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Search & Categories */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              isUrdu ? 'کھاد کا نام یا برانڈ تلاش کریں...' : 'Search fertilizer name, SKU...'
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catPill,
                selectedCategory === cat && styles.catPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.catPillText,
                  selectedCategory === cat && styles.catPillTextActive,
                ]}
              >
                {cat === 'ALL' ? (isUrdu ? 'سب کھادیں' : 'All') : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Customer Selection Row */}
      <View style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="person-circle" size={20} color="#059669" />
            <Text style={styles.customerTitle}>
              {isUrdu ? 'گاہک / زمیندار کا انتخاب:' : 'Customer / Farmer:'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={[
                styles.customerTypePill,
                selectedCustomerId === 'cash-walkin' && styles.customerTypeActive,
              ]}
              onPress={() => setSelectedCustomerId('cash-walkin')}
            >
              <Text
                style={[
                  styles.customerTypeText,
                  selectedCustomerId === 'cash-walkin' && styles.customerTypeTextActive,
                ]}
              >
                {isUrdu ? 'نقد کسٹمر' : 'Cash'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Farmer Picker Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {customers.map((c) => {
            const isExceeded = c.totalBalance > c.creditLimit;
            const isSelected = selectedCustomerId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.farmerPill,
                  isSelected && styles.farmerPillSelected,
                  isExceeded && styles.farmerPillExceeded,
                ]}
                onPress={() => setSelectedCustomerId(c.id)}
              >
                <Text
                  style={[
                    styles.farmerPillName,
                    isSelected && styles.farmerPillNameSelected,
                  ]}
                >
                  {isUrdu ? c.nameUrdu : c.name}
                </Text>
                <Text style={styles.farmerPillBalance}>
                  {isUrdu ? `بقایا: Rs ${c.totalBalance.toLocaleString()}` : `Due: Rs ${c.totalBalance.toLocaleString()}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Farmer Info banner */}
        {selectedCustomer && selectedCustomerId !== 'cash-walkin' && (
          <View
            style={[
              styles.selectedCustomerBanner,
              selectedCustomer.totalBalance > selectedCustomer.creditLimit &&
                styles.warningBanner,
            ]}
          >
            <View>
              <Text style={styles.bannerCustomerName}>
                {isUrdu ? selectedCustomer.nameUrdu : selectedCustomer.name} (
                {selectedCustomer.village})
              </Text>
              <Text style={styles.bannerCustomerPhone}>
                {selectedCustomer.phone} | ضامن: {selectedCustomer.guarantorName || 'N/A'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.bannerKhataText}>
                {isUrdu ? 'سابقہ کھاتہ میزان:' : 'Khata Balance:'}
              </Text>
              <Text style={styles.bannerKhataAmount}>
                Rs {selectedCustomer.totalBalance.toLocaleString()}
              </Text>
              {selectedCustomer.totalBalance > selectedCustomer.creditLimit && (
                <Text style={styles.limitWarningText}>
                  {isUrdu ? '⚠️ حد سے زیادہ ادھار' : '⚠️ Limit Exceeded'}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Fertilizer Products Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {isUrdu ? 'کھاد اسٹاک لسٹ (تیز کاؤنٹر اندراج):' : 'Available Fertilizers:'}
        </Text>
        <Text style={styles.sectionBadge}>
          {filteredProducts.length} {isUrdu ? 'آئٹمز' : 'items'}
        </Text>
      </View>

      {filteredProducts.map((p) => {
        const inCartItem = cart.find((i) => i.product.id === p.id);
        const isLow = p.stockBags <= p.minStockWarning;
        return (
          <View key={p.id} style={styles.productCard}>
            <View style={styles.productTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productUrduName}>{p.nameUrdu}</Text>
                <Text style={styles.productEngName}>{p.name}</Text>
                <Text style={styles.productCompany}>{p.company}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.productPrice}>Rs {p.retailPrice.toLocaleString()}</Text>
                <View
                  style={[
                    styles.stockPill,
                    isLow ? styles.stockPillLow : styles.stockPillNormal,
                  ]}
                >
                  <Text
                    style={[
                      styles.stockPillText,
                      isLow ? styles.stockTextLow : styles.stockTextNormal,
                    ]}
                  >
                    {isUrdu ? `گودام: ${p.stockBags} بوری` : `Stock: ${p.stockBags} bags`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Multiplier Buttons for Fast Counter Entry */}
            <View style={styles.quickAddRow}>
              <Text style={styles.quickAddLabel}>
                {isUrdu ? 'بوری بٹن:' : 'Quick Add:'}
              </Text>
              {[1, 5, 10, 50].map((qty) => (
                <TouchableOpacity
                  key={qty}
                  style={styles.quickAddBtn}
                  onPress={() => addToCart(p, qty)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAddBtnText}>+{qty}</Text>
                </TouchableOpacity>
              ))}

              {inCartItem && (
                <View style={styles.inCartIndicator}>
                  <Text style={styles.inCartIndicatorText}>
                    {isUrdu
                      ? `کارٹ: ${inCartItem.quantity} بوری`
                      : `In Cart: ${inCartItem.quantity}`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Cart & Checkout Panel */}
      {cart.length > 0 && (
        <View style={styles.cartContainer}>
          <View style={styles.cartHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="cart" size={20} color="#059669" />
              <Text style={styles.cartTitle}>
                {isUrdu ? 'کاؤنٹر بل کا خلاصہ' : 'Counter Bill Summary'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setCart([])}>
              <Text style={styles.clearCartText}>
                {isUrdu ? 'صاف کریں' : 'Clear'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cart Items List */}
          {cart.map((item) => (
            <View key={item.product.id} style={styles.cartItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartItemName}>{item.product.nameUrdu}</Text>
                <Text style={styles.cartItemRate}>
                  Rs {item.unitPrice.toLocaleString()} × {item.quantity} بوری
                </Text>
              </View>

              <View style={styles.qtyControlRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateCartQty(item.product.id, item.quantity - 1)}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateCartQty(item.product.id, item.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cartItemTotal}>
                Rs {item.lineTotal.toLocaleString()}
              </Text>
            </View>
          ))}

          {/* Discount & Payment Mode */}
          <View style={styles.calculationRow}>
            <Text style={styles.calcLabel}>{isUrdu ? 'کل بوری:' : 'Total Bags:'}</Text>
            <Text style={styles.calcValue}>{totalBags} بوری</Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calcLabel}>{isUrdu ? 'سب ٹوٹل:' : 'Subtotal:'}</Text>
            <Text style={styles.calcValue}>Rs {subtotal.toLocaleString()}</Text>
          </View>

          {/* Discount Row */}
          <View style={styles.discountRow}>
            <Text style={styles.calcLabel}>{isUrdu ? 'رعایت / ڈسکاؤنٹ:' : 'Discount:'}</Text>
            <TextInput
              style={styles.discountInput}
              keyboardType="numeric"
              placeholder="0"
              value={discount === 0 ? '' : discount.toString()}
              onChangeText={(val) => setDiscount(parseFloat(val) || 0)}
            />
          </View>

          <View style={[styles.calculationRow, styles.netPayableRow]}>
            <Text style={styles.netPayableLabel}>
              {isUrdu ? 'صافی قابل ادائیگی:' : 'Net Payable:'}
            </Text>
            <Text style={styles.netPayableValue}>
              Rs {netPayable.toLocaleString()}
            </Text>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.paymentMethodsRow}>
            {(['CASH', 'CREDIT', 'BANK'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.paymentPill,
                  paymentMethod === m && styles.paymentPillActive,
                ]}
                onPress={() => setPaymentMethod(m)}
              >
                <Text
                  style={[
                    styles.paymentPillText,
                    paymentMethod === m && styles.paymentPillTextActive,
                  ]}
                >
                  {m === 'CASH'
                    ? isUrdu
                      ? 'نقد وصولی'
                      : 'Cash'
                    : m === 'CREDIT'
                    ? isUrdu
                      ? 'ادھار کھاتہ'
                      : 'Credit Khata'
                    : isUrdu
                    ? 'بینک آن لائن'
                    : 'Bank'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* If Credit, Partial Payment Field */}
          {paymentMethod === 'CREDIT' && (
            <View style={styles.partialPayRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.partialLabel}>
                  {isUrdu ? 'موقع پر نقد ادا کیا:' : 'Cash Paid Now:'}
                </Text>
                <TextInput
                  style={styles.partialInput}
                  keyboardType="numeric"
                  placeholder="0"
                  value={paidAmount}
                  onChangeText={setPaidAmount}
                />
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.partialLabel}>
                  {isUrdu ? 'کھاتے میں نیا ادھار:' : 'Khata Debit Due:'}
                </Text>
                <Text style={styles.partialDueValue}>
                  Rs {balanceDue.toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {/* Checkout Button */}
          <TouchableOpacity
            style={[styles.checkoutBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleCheckout}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt" size={20} color="#FFFFFF" />
            <Text style={styles.checkoutBtnText}>
              {isSubmitting
                ? isUrdu
                  ? 'پرچی تیار ہو رہی ہے...'
                  : 'Generating Slip...'
                : isUrdu
                ? `بل پرچی جاری کریں (Rs ${netPayable.toLocaleString()})`
                : `Generate Bill Slip (Rs ${netPayable.toLocaleString()})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  catScroll: {
    marginTop: 10,
    flexDirection: 'row',
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  customerTypePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  customerTypeActive: {
    backgroundColor: '#D1FAE5',
  },
  customerTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  customerTypeTextActive: {
    color: '#065F46',
  },
  farmerPill: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  farmerPillSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  farmerPillExceeded: {
    borderColor: '#EF4444',
  },
  farmerPillName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  farmerPillNameSelected: {
    color: '#065F46',
  },
  farmerPillBalance: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },
  selectedCustomerBanner: {
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warningBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  bannerCustomerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  bannerCustomerPhone: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  bannerKhataText: {
    fontSize: 10,
    color: '#6B7280',
  },
  bannerKhataAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  limitWarningText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  sectionBadge: {
    fontSize: 12,
    color: '#6B7280',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productUrduName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
  },
  productEngName: {
    fontSize: 12,
    color: '#374151',
    marginTop: 2,
  },
  productCompany: {
    fontSize: 10,
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  stockPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  stockPillNormal: {
    backgroundColor: '#ECFDF5',
  },
  stockPillLow: {
    backgroundColor: '#FEF2F2',
  },
  stockPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockTextNormal: {
    color: '#059669',
  },
  stockTextLow: {
    color: '#DC2626',
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quickAddLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickAddBtn: {
    backgroundColor: '#064E3B',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  quickAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  inCartIndicator: {
    marginLeft: 'auto',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  inCartIndicatorText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '700',
  },
  cartContainer: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
  },
  clearCartText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  cartItemRate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  qtyControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 10,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  cartItemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    minWidth: 70,
    textAlign: 'right',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  calcLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  calcValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  discountInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    width: 90,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
  netPayableRow: {
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  netPayableLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  netPayableValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  paymentPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  paymentPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  paymentPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  paymentPillTextActive: {
    color: '#FFFFFF',
  },
  partialPayRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
  },
  partialLabel: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },
  partialInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  partialDueValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B91C1C',
    marginTop: 4,
  },
  checkoutBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
