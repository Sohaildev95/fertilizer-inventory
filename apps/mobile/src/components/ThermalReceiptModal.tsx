import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MobileSaleRecord } from '../types';

interface ThermalReceiptModalProps {
  sale: MobileSaleRecord | null;
  visible: boolean;
  onClose: () => void;
  isUrdu: boolean;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  visible,
  onClose,
  isUrdu,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      Alert.alert(
        isUrdu ? 'پرچی پرنٹ ہو گئی' : 'Printed',
        isUrdu
          ? 'بلوٹوتھ 80mm تھرمل پرنٹر پر پرچی کامیابی سے بھیج دی گئی ہے۔'
          : 'Receipt sent to 80mm Bluetooth thermal printer.'
      );
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="receipt" size={20} color="#064E3B" />
              <Text style={styles.topBarTitle}>
                {isUrdu ? 'تھرمل کاؤنٹر پرچی (80mm)' : 'Thermal Cash Slip (80mm)'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Paper Receipt Simulation */}
          <ScrollView style={styles.receiptScroll} contentContainerStyle={styles.receiptPaper}>
            {/* Traditional Header */}
            <Text style={styles.bismillah}>بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ</Text>
            <Text style={styles.shopName}>الرحمٰن کھاد اینڈ سپرے ڈیلرز</Text>
            <Text style={styles.shopSub}>چچو شاپ — رجسٹرڈ زرعی ایجنسی</Text>
            <Text style={styles.shopAddress}>
              مین لاری اڈا روڈ، غلہ منڈی چوک، چیچہ وطنی
            </Text>
            <Text style={styles.shopPhone}>
              فون: 0300-7654321 / 0301-9876543 | NTN: 8945201-3
            </Text>

            <View style={styles.dashedDivider} />

            {/* Meta Row */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>بل نمبر: {sale.invoiceNumber}</Text>
              <Text style={styles.metaText}>
                تاریخ: {new Date(sale.createdAt).toLocaleDateString('en-GB')}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>گاہک: {sale.customerName}</Text>
              <Text style={styles.metaText}>چک/گاؤں: {sale.customerVillage}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                طریقہ ادائیگی:{' '}
                {sale.paymentMethod === 'CASH'
                  ? 'نقد وصولی'
                  : sale.paymentMethod === 'CREDIT'
                  ? 'ادھار کھاتہ'
                  : 'بینک آن لائن'}
              </Text>
              <Text style={styles.metaText}>منشی: کاؤنٹر سیلزمین</Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { flex: 2 }]}>کھاد / آئٹم</Text>
              <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>بوری</Text>
              <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>ریٹ</Text>
              <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'right' }]}>کل رقم</Text>
            </View>

            <View style={styles.solidDivider} />

            {/* Item Rows */}
            {sale.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.itemName}>{item.productNameUrdu}</Text>
                  <Text style={styles.itemSub}>{item.productName}</Text>
                </View>
                <Text style={[styles.itemQty, { flex: 1, textAlign: 'center' }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.itemRate, { flex: 1, textAlign: 'right' }]}>
                  {item.unitPrice.toLocaleString()}
                </Text>
                <Text style={[styles.itemTotal, { flex: 1.2, textAlign: 'right' }]}>
                  {item.total.toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.solidDivider} />

            {/* Totals */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>کل تعداد بوری:</Text>
              <Text style={styles.summaryValue}>{sale.totalBags} بوری</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>سب ٹوٹل:</Text>
              <Text style={styles.summaryValue}>Rs {sale.subtotal.toLocaleString()}</Text>
            </View>

            {sale.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>رعایت (ڈسکاؤنٹ):</Text>
                <Text style={styles.summaryValue}>- Rs {sale.discount.toLocaleString()}</Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>صافی رقم (Net):</Text>
              <Text style={styles.grandTotalValue}>
                Rs {sale.netPayable.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>نقد وصول شدہ:</Text>
              <Text style={styles.summaryValue}>
                Rs {sale.paidAmount.toLocaleString()}
              </Text>
            </View>

            {sale.balanceDue > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#B91C1C' }]}>
                  کھاتے میں بقایا ادھار:
                </Text>
                <Text style={[styles.summaryValue, { color: '#B91C1C' }]}>
                  Rs {sale.balanceDue.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.dashedDivider} />

            {/* Desi Footer */}
            <Text style={styles.receiptFooterUrdu}>
              نوٹ: خریدا ہوا بیج یا زرعی زہر موسم گزرنے کے بعد واپس نہیں ہوگا۔
            </Text>
            <Text style={styles.receiptFooterUrdu}>
              اللہ تعالیٰ آپ کی فصل اور رزق میں برکت عطا فرمائے۔ آمین!
            </Text>
            <Text style={styles.receiptFooterEnglish}>
              Software: Khad Khata POS Mobile • Powered by Antigravity
            </Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={[styles.printBtn, isPrinting && { opacity: 0.7 }]}
              onPress={handlePrint}
              disabled={isPrinting}
            >
              <Ionicons name="print" size={18} color="#FFFFFF" />
              <Text style={styles.printBtnText}>
                {isPrinting
                  ? isUrdu
                    ? 'پرنٹ ہو رہا ہے...'
                    : 'Printing...'
                  : isUrdu
                  ? 'بلوٹوتھ پرنٹر سے پرچی نکالیں'
                  : 'Print Bluetooth Slip'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>{isUrdu ? 'بند کریں' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
  },
  receiptScroll: {
    backgroundColor: '#FAFAFA',
  },
  receiptPaper: {
    padding: 18,
    alignItems: 'center',
  },
  bismillah: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },
  shopSub: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 2,
  },
  shopAddress: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  shopPhone: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 2,
  },
  dashedDivider: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  solidDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 6,
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
  },
  tableHeader: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 4,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  tableRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  itemSub: {
    fontSize: 9,
    color: '#6B7280',
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  itemRate: {
    fontSize: 11,
    color: '#374151',
  },
  itemTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  summaryRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#4B5563',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  grandTotalRow: {
    paddingVertical: 6,
    marginVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#111827',
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#064E3B',
  },
  receiptFooterUrdu: {
    fontSize: 10,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 4,
  },
  receiptFooterEnglish: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  printBtn: {
    flex: 2,
    backgroundColor: '#064E3B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  printBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  closeBtnText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
  },
});
