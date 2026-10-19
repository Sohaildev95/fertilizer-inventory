import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MobileProduct } from '../types';
import { recordStockMovement } from '../services/storage';

interface GodownStockTabProps {
  products: MobileProduct[];
  isUrdu: boolean;
  onRefreshData: () => void;
}

export const GodownStockTab: React.FC<GodownStockTabProps> = ({
  products,
  isUrdu,
  onRefreshData,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<MobileProduct | null>(null);
  const [damageBags, setDamageBags] = useState('');
  const [damageReason, setDamageReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['ALL', 'Urea', 'DAP', 'CAN', 'Potash', 'Pesticides', 'Seeds'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameUrdu.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'ALL' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const totalBags = products.reduce((sum, p) => sum + p.stockBags, 0);
  const totalValuation = products.reduce(
    (sum, p) => sum + p.stockBags * p.costPrice,
    0
  );
  const lowStockCount = products.filter((p) => p.stockBags <= p.minStockWarning).length;

  const openAdjustModal = (product: MobileProduct) => {
    setAdjustProduct(product);
    setDamageBags('1');
    setDamageReason(isUrdu ? 'پھٹی ہوئی بوری / سلائی خراب' : 'Torn bag / broken stitch');
    setAdjustModalVisible(true);
  };

  const handleSaveAdjustment = async () => {
    if (!adjustProduct) return;
    const count = parseInt(damageBags, 10);
    if (isNaN(count) || count <= 0) {
      Alert.alert(
        isUrdu ? 'غلط تعداد' : 'Invalid Count',
        isUrdu ? 'برائے مہربانی بوریوں کی صحیح تعداد درج کریں۔' : 'Please enter valid count.'
      );
      return;
    }

    if (count > adjustProduct.stockBags) {
      Alert.alert(
        isUrdu ? 'اسٹاک الرٹ' : 'Stock Alert',
        isUrdu
          ? `گودام میں صرف ${adjustProduct.stockBags} بوری موجود ہے۔`
          : `Only ${adjustProduct.stockBags} bags available.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await recordStockMovement(
        adjustProduct.id,
        'ADJUSTMENT_DAMAGE',
        count,
        damageReason || 'Godown damage adjustment'
      );

      Alert.alert(
        isUrdu ? 'ایڈجسٹمنٹ کامیاب' : 'Adjustment Saved',
        isUrdu
          ? `${adjustProduct.nameUrdu} کی ${count} خراب بوری اسٹاک سے مائنس کر دی گئی۔`
          : `${count} damaged bags deducted from stock.`
      );

      setAdjustModalVisible(false);
      onRefreshData();
    } catch {
      Alert.alert(isUrdu ? 'خرابی' : 'Error', isUrdu ? 'ایڈجسٹمنٹ محفوظ نہ ہو سکی۔' : 'Failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>
            {isUrdu ? 'گودام میں کل کھاد:' : 'Total Godown Stock:'}
          </Text>
          <Text style={styles.kpiValue}>{totalBags} بوری</Text>
          <Text style={styles.kpiSub}>
            {isUrdu ? 'لاگت تخمینہ:' : 'Valuation:'} Rs {(totalValuation / 100000).toFixed(1)} لاکھ
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            lowStockCount > 0 ? styles.kpiCardLow : styles.kpiCardNormal,
          ]}
        >
          <Text style={styles.kpiLabel}>
            {isUrdu ? 'کم اسٹاک انتباہ:' : 'Low Stock Alert:'}
          </Text>
          <Text
            style={[
              styles.kpiValue,
              lowStockCount > 0 ? styles.kpiValueRed : styles.kpiValueGreen,
            ]}
          >
            {lowStockCount} {isUrdu ? 'کھادیں' : 'items'}
          </Text>
          <Text style={styles.kpiSub}>
            {lowStockCount > 0
              ? isUrdu
                ? 'فوری نیا آرڈر دیں'
                : 'Reorder needed'
              : isUrdu
              ? 'اسٹاک تسلی بخش ہے'
              : 'Healthy stock'}
          </Text>
        </View>
      </View>

      {/* Search & Categories */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              isUrdu ? 'گودام میں کھاد تلاش کریں...' : 'Search godown inventory...'
            }
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>

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

      {/* Stock List */}
      <View style={styles.listContainer}>
        {filteredProducts.map((p) => {
          const isLow = p.stockBags <= p.minStockWarning;
          return (
            <View
              key={p.id}
              style={[styles.stockCard, isLow && styles.stockCardLow]}
            >
              <View style={styles.stockCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productUrdu}>{p.nameUrdu}</Text>
                  <Text style={styles.productEng}>{p.name}</Text>
                  <Text style={styles.productDetails}>
                    {p.company} | بارکوڈ: {p.barcode}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <View
                    style={[
                      styles.bagsPill,
                      isLow ? styles.bagsPillLow : styles.bagsPillNormal,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bagsCountText,
                        isLow ? styles.bagsTextLow : styles.bagsTextNormal,
                      ]}
                    >
                      {p.stockBags} بوری
                    </Text>
                  </View>
                  <Text style={styles.warningThreshold}>
                    {isUrdu ? `کم از کم الرٹ: ${p.minStockWarning}` : `Min Alert: ${p.minStockWarning}`}
                  </Text>
                </View>
              </View>

              {/* Price & Damage Button Row */}
              <View style={styles.cardFooter}>
                <View style={styles.rateCol}>
                  <Text style={styles.rateLabel}>
                    {isUrdu ? 'خریداری لاگت:' : 'Cost Rate:'}
                  </Text>
                  <Text style={styles.rateVal}>Rs {p.costPrice.toLocaleString()}</Text>
                </View>
                <View style={styles.rateCol}>
                  <Text style={styles.rateLabel}>
                    {isUrdu ? 'سیل ریٹ:' : 'Sale Rate:'}
                  </Text>
                  <Text style={styles.rateVal}>Rs {p.retailPrice.toLocaleString()}</Text>
                </View>

                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => openAdjustModal(p)}
                >
                  <Ionicons name="build-outline" size={14} color="#D97706" />
                  <Text style={styles.adjustBtnText}>
                    {isUrdu ? 'خراب بوری ایڈجسٹ' : 'Adjust'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Damage Adjustment Modal */}
      <Modal
        visible={adjustModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {isUrdu ? 'پھٹی / خراب بوری کا اندراج' : 'Damaged Bag Adjustment'}
                </Text>
                <Text style={styles.modalSub}>
                  {adjustProduct?.nameUrdu} (اسٹاک: {adjustProduct?.stockBags} بوری)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAdjustModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>
              {isUrdu ? 'خراب / ضائع شدہ بوریوں کی تعداد:' : 'Number of Damaged Bags:'}
            </Text>
            <TextInput
              style={styles.adjustInput}
              keyboardType="numeric"
              value={damageBags}
              onChangeText={setDamageBags}
              placeholder="1"
            />

            <Text style={styles.inputLabel}>
              {isUrdu ? 'وجہ / تفصیل:' : 'Reason / Note:'}
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={damageReason}
              onChangeText={setDamageReason}
              placeholder={isUrdu ? 'پھٹی ہوئی بوری، نمی وغیرہ...' : 'Torn bag, leakage...'}
            />

            <TouchableOpacity
              style={[styles.saveAdjustBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSaveAdjustment}
              disabled={isSubmitting}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveAdjustBtnText}>
                {isSubmitting
                  ? isUrdu
                    ? 'ایڈجسٹ ہو رہا ہے...'
                    : 'Saving...'
                  : isUrdu
                  ? 'گودام اسٹاک سے مائنس کریں'
                  : 'Deduct from Stock'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  kpiRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  kpiCardNormal: {
    borderColor: '#E5E7EB',
  },
  kpiCardLow: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#064E3B',
    marginTop: 4,
  },
  kpiValueRed: {
    color: '#DC2626',
  },
  kpiValueGreen: {
    color: '#059669',
  },
  kpiSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
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
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 12,
  },
  stockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stockCardLow: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFBFB',
  },
  stockCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productUrdu: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
  },
  productEng: {
    fontSize: 12,
    color: '#374151',
    marginTop: 1,
  },
  productDetails: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 3,
  },
  bagsPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  bagsPillNormal: {
    backgroundColor: '#ECFDF5',
  },
  bagsPillLow: {
    backgroundColor: '#FEF2F2',
  },
  bagsCountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  bagsTextNormal: {
    color: '#059669',
  },
  bagsTextLow: {
    color: '#DC2626',
  },
  warningThreshold: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  rateCol: {
    alignItems: 'flex-start',
  },
  rateLabel: {
    fontSize: 9,
    color: '#6B7280',
  },
  rateVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  adjustBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
  },
  modalSub: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  adjustInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  reasonInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    marginTop: 6,
  },
  saveAdjustBtn: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  saveAdjustBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
