import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MobileCustomer } from '../types';
import { updateCustomerBalance } from '../services/storage';

interface FarmerKhataTabProps {
  customers: MobileCustomer[];
  isUrdu: boolean;
  onRefreshData: () => void;
  onPaymentReceived: (customer: MobileCustomer, amount: number) => void;
}

export const FarmerKhataTab: React.FC<FarmerKhataTabProps> = ({
  customers,
  isUrdu,
  onRefreshData,
  onPaymentReceived,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<MobileCustomer | null>(null);
  const [recoveryModalVisible, setRecoveryModalVisible] = useState(false);
  const [wasooliAmount, setWasooliAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered farmers
  const filteredFarmers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameUrdu.includes(search) ||
      c.village.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.totalBalance, 0);
  const overLimitCount = customers.filter((c) => c.totalBalance > c.creditLimit).length;

  // Open WhatsApp with pre-drafted Urdu Reminder
  const handleSendWhatsAppReminder = (farmer: MobileCustomer) => {
    let cleanPhone = farmer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    }

    const message = isUrdu
      ? `السلام علیکم محترم ${farmer.nameUrdu} صاحب!\nالرحمان کھاد اینڈ سپرے ڈیلرز کی طرف سے اطلاع ہے کہ آپ کے کھاتے کا بقایا میزان Rs ${farmer.totalBalance.toLocaleString()} روپے ہے۔\nبرائے مہربانی اگلی قسط دکان پر جمع کروا دیں۔ شکریہ۔`
      : `Dear ${farmer.name},\nThis is a friendly reminder from Al-Rehman Fertilizers. Your outstanding Khata balance is Rs ${farmer.totalBalance.toLocaleString()}.\nPlease visit the shop to clear your due installment.\nThank you.`;

    const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            isUrdu ? 'واٹس ایپ' : 'WhatsApp',
            isUrdu
              ? `میسج تیار ہے:\n\n${message}`
              : `Message ready for ${cleanPhone}:\n\n${message}`
          );
        }
      })
      .catch(() => {
        Alert.alert(
          isUrdu ? 'واٹس ایپ' : 'WhatsApp',
          isUrdu ? `میسج تیار ہے:\n\n${message}` : message
        );
      });
  };

  // Open Recovery Modal
  const openRecoveryModal = (farmer: MobileCustomer) => {
    setSelectedCustomer(farmer);
    setWasooliAmount('');
    setPaymentNote('');
    setRecoveryModalVisible(true);
  };

  // Submit Wasooli (Payment Collection)
  const handleSaveWasooli = async () => {
    if (!selectedCustomer) return;
    const amount = parseFloat(wasooliAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        isUrdu ? 'غلط رقم' : 'Invalid Amount',
        isUrdu ? 'برائے مہربانی وصولی کی صحیح رقم درج کریں۔' : 'Please enter valid amount.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Deduct balance from customer
      const updated = await updateCustomerBalance(selectedCustomer.id, -amount);
      if (updated) {
        Alert.alert(
          isUrdu ? 'وصولی کامیاب' : 'Payment Recorded',
          isUrdu
            ? `${selectedCustomer.nameUrdu} سے Rs ${amount.toLocaleString()} کی وصولی کھاتے میں درج کر دی گئی۔`
            : `Rs ${amount.toLocaleString()} received from ${selectedCustomer.name}.`
        );
        onRefreshData();
        onPaymentReceived(updated, amount);
      }
      setRecoveryModalVisible(false);
    } catch {
      Alert.alert(isUrdu ? 'خرابی' : 'Error', isUrdu ? 'وصولی محفوظ نہ ہو سکی۔' : 'Failed to record payment.');
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
            {isUrdu ? 'کل کسان ادھار (مارکیٹ بقایا):' : 'Total Market Udhaar:'}
          </Text>
          <Text style={styles.kpiAmount}>Rs {totalOutstanding.toLocaleString()}</Text>
          <Text style={styles.kpiSub}>
            {customers.length} {isUrdu ? 'رجسٹرڈ زمیندار' : 'Registered Farmers'}
          </Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardWarning]}>
          <Text style={styles.kpiLabel}>
            {isUrdu ? 'حد سے زیادہ ادھار:' : 'Over-Limit Farmers:'}
          </Text>
          <Text style={styles.kpiWarningCount}>{overLimitCount}</Text>
          <Text style={styles.kpiSub}>
            {isUrdu ? 'فوری وصولی درکار' : 'Urgent Recovery'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder={
            isUrdu
              ? 'کسان کا نام، چک / گاؤں یا فون نمبر تلاش کریں...'
              : 'Search farmer by name, village, phone...'
          }
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Farmers List */}
      <View style={styles.listContainer}>
        {filteredFarmers.map((farmer) => {
          const isExceeded = farmer.totalBalance > farmer.creditLimit;
          const limitPercent = Math.min(
            100,
            Math.round((farmer.totalBalance / farmer.creditLimit) * 100)
          );

          return (
            <View
              key={farmer.id}
              style={[styles.farmerCard, isExceeded && styles.farmerCardExceeded]}
            >
              <View style={styles.farmerCardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.farmerUrduName}>{farmer.nameUrdu}</Text>
                    {isExceeded && (
                      <View style={styles.exceededBadge}>
                        <Text style={styles.exceededBadgeText}>
                          {isUrdu ? 'حد سے زیادہ' : 'Over Limit'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.farmerEngName}>{farmer.name}</Text>
                  <Text style={styles.farmerVillage}>
                    <Ionicons name="location-outline" size={12} color="#6B7280" />{' '}
                    {farmer.village}
                  </Text>
                  <Text style={styles.farmerPhone}>
                    <Ionicons name="call-outline" size={12} color="#6B7280" />{' '}
                    {farmer.phone} | ضامن: {farmer.guarantorName || 'N/A'}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.balanceLabel}>
                    {isUrdu ? 'بقایا میزان:' : 'Balance Due:'}
                  </Text>
                  <Text
                    style={[
                      styles.balanceAmount,
                      farmer.totalBalance > 0 ? styles.balancePositive : styles.balanceZero,
                    ]}
                  >
                    Rs {farmer.totalBalance.toLocaleString()}
                  </Text>
                  <Text style={styles.creditLimitText}>
                    {isUrdu ? 'حد:' : 'Limit:'} Rs {farmer.creditLimit.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Credit Limit Progress Bar */}
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${limitPercent}%` },
                    isExceeded ? styles.progressExceeded : styles.progressNormal,
                  ]}
                />
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionRow}>
                {/* 1-Tap Wasooli Button */}
                <TouchableOpacity
                  style={styles.wasooliBtn}
                  onPress={() => openRecoveryModal(farmer)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cash-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.wasooliBtnText}>
                    {isUrdu ? 'وصولی درج کریں' : 'Collect Cash'}
                  </Text>
                </TouchableOpacity>

                {/* 1-Click WhatsApp Reminder */}
                <TouchableOpacity
                  style={styles.whatsappBtn}
                  onPress={() => handleSendWhatsAppReminder(farmer)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                  <Text style={styles.whatsappBtnText}>
                    {isUrdu ? 'واٹس ایپ یاد دہانی' : 'WhatsApp'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Wasooli (Recovery) Modal */}
      <Modal
        visible={recoveryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRecoveryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {isUrdu ? 'نقد وصولی اندراج' : 'Record Cash Recovery'}
                </Text>
                <Text style={styles.modalFarmerName}>
                  {selectedCustomer?.nameUrdu} ({selectedCustomer?.village})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRecoveryModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalCurrentBalance}>
              <Text style={styles.modalCurrentLabel}>
                {isUrdu ? 'موجودہ کل بقایا:' : 'Current Balance Due:'}
              </Text>
              <Text style={styles.modalCurrentAmount}>
                Rs {selectedCustomer?.totalBalance.toLocaleString()}
              </Text>
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.quickAmountRow}>
              {[10000, 25000, 50000, 100000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickAmtChip}
                  onPress={() => setWasooliAmount(amt.toString())}
                >
                  <Text style={styles.quickAmtText}>Rs {amt / 1000}k</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.wasooliInput}
              keyboardType="numeric"
              placeholder={isUrdu ? 'وصول شدہ رقم درج کریں (Rs)' : 'Enter received amount...'}
              value={wasooliAmount}
              onChangeText={setWasooliAmount}
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              style={styles.noteInput}
              placeholder={
                isUrdu
                  ? 'تفصیل / چیک نمبر / وصول کنندہ منشی...'
                  : 'Notes / Cheque # (Optional)...'
              }
              value={paymentNote}
              onChangeText={setPaymentNote}
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={[styles.saveWasooliBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSaveWasooli}
              disabled={isSubmitting}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.saveWasooliBtnText}>
                {isSubmitting
                  ? isUrdu
                    ? 'محفوظ ہو رہا ہے...'
                    : 'Saving...'
                  : isUrdu
                  ? 'وصولی کھاتے میں جمع کریں'
                  : 'Confirm Recovery Payment'}
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
  kpiCardWarning: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  kpiAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
    marginTop: 4,
  },
  kpiWarningCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  listContainer: {
    marginTop: 12,
    paddingHorizontal: 12,
  },
  farmerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  farmerCardExceeded: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFBFB',
  },
  farmerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  farmerUrduName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
  },
  farmerEngName: {
    fontSize: 12,
    color: '#374151',
    marginTop: 1,
  },
  farmerVillage: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  farmerPhone: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  balanceLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  balancePositive: {
    color: '#B91C1C',
  },
  balanceZero: {
    color: '#059669',
  },
  creditLimitText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  exceededBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  exceededBadgeText: {
    fontSize: 9,
    color: '#DC2626',
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressNormal: {
    backgroundColor: '#059669',
  },
  progressExceeded: {
    backgroundColor: '#DC2626',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  wasooliBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#064E3B',
    paddingVertical: 8,
    borderRadius: 8,
  },
  wasooliBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingVertical: 8,
    borderRadius: 8,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  modalFarmerName: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  modalCurrentBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  modalCurrentLabel: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  modalCurrentAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B91C1C',
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  quickAmtChip: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickAmtText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  wasooliInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111827',
    marginTop: 8,
  },
  saveWasooliBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  saveWasooliBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
