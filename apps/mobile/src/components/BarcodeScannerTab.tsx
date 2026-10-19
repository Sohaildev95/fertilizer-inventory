import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MobileProduct } from '../types';
import { recordStockMovement } from '../services/storage';

interface BarcodeScannerTabProps {
  products: MobileProduct[];
  isUrdu: boolean;
  onRefreshData: () => void;
}

export const BarcodeScannerTab: React.FC<BarcodeScannerTabProps> = ({
  products,
  isUrdu,
  onRefreshData,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<MobileProduct | null>(null);
  const [mode, setMode] = useState<'INWARD' | 'OUTWARD' | 'LOOKUP'>('INWARD');
  const [bagsCount, setBagsCount] = useState<string>('50');
  const [notes, setNotes] = useState('');
  const [scanHistory, setScanHistory] = useState<
    { id: string; time: string; text: string; success: boolean }[]
  >([]);

  // Barcode Lookup
  const handleScanBarcode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const found = products.find(
      (p) => p.barcode === cleanCode || p.sku.toLowerCase() === cleanCode.toLowerCase()
    );

    if (found) {
      setSelectedProduct(found);
      setScanHistory((prev) => [
        {
          id: `scan-${Date.now()}`,
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          text: `${found.nameUrdu} (${cleanCode})`,
          success: true,
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      Alert.alert(
        isUrdu ? 'بارکوڈ نہیں ملا' : 'Barcode Not Found',
        isUrdu
          ? `بارکوڈ "${cleanCode}" کا کوئی پروڈکٹ سسٹم میں موجود نہیں ہے۔`
          : `No product matches barcode "${cleanCode}".`
      );
      setScanHistory((prev) => [
        {
          id: `scan-${Date.now()}`,
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          text: `Unknown (${cleanCode})`,
          success: false,
        },
        ...prev.slice(0, 9),
      ]);
    }
    setBarcodeInput('');
  };

  // Submit Stock Movement
  const handleConfirmMovement = async () => {
    if (!selectedProduct) return;
    const count = parseInt(bagsCount, 10);
    if (isNaN(count) || count <= 0) {
      Alert.alert(
        isUrdu ? 'غلط تعداد' : 'Invalid Count',
        isUrdu ? 'برائے مہربانی بوریوں کی صحیح تعداد درج کریں۔' : 'Please enter valid bag count.'
      );
      return;
    }

    if (mode === 'OUTWARD' && count > selectedProduct.stockBags) {
      Alert.alert(
        isUrdu ? 'اسٹاک الرٹ' : 'Stock Alert',
        isUrdu
          ? `گودام میں صرف ${selectedProduct.stockBags} بوری موجود ہے، لوڈنگ ممکن نہیں۔`
          : `Only ${selectedProduct.stockBags} bags in godown.`
      );
      return;
    }

    try {
      const type = mode === 'INWARD' ? 'INWARD_TRUCK' : 'OUTWARD_SALE';
      await recordStockMovement(
        selectedProduct.id,
        type,
        count,
        notes || (mode === 'INWARD' ? 'Truck Delivery Inward' : 'Trolley Loading Outward')
      );

      Alert.alert(
        isUrdu ? 'کامیابی' : 'Success',
        isUrdu
          ? `${selectedProduct.nameUrdu} کی ${count} بوری ${
              mode === 'INWARD' ? 'گودام میں جمع' : 'لوڈ'
            } کر دی گئی۔`
          : `${count} bags of ${selectedProduct.name} recorded.`
      );

      setSelectedProduct(null);
      setNotes('');
      onRefreshData();
    } catch {
      Alert.alert(isUrdu ? 'خرابی' : 'Error', isUrdu ? 'ریکارڈ محفوظ نہ ہو سکا۔' : 'Failed to record.');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Scanner Mode Switcher */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'INWARD' && styles.modeBtnActive]}
          onPress={() => setMode('INWARD')}
        >
          <Ionicons
            name="download"
            size={16}
            color={mode === 'INWARD' ? '#FFFFFF' : '#4B5563'}
          />
          <Text
            style={[styles.modeBtnText, mode === 'INWARD' && styles.modeBtnTextActive]}
          >
            {isUrdu ? 'ٹرک سے اتارائی (Inward)' : 'Truck Inward (+)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, mode === 'OUTWARD' && styles.modeBtnActive]}
          onPress={() => setMode('OUTWARD')}
        >
          <Ionicons
            name="arrow-up"
            size={16}
            color={mode === 'OUTWARD' ? '#FFFFFF' : '#4B5563'}
          />
          <Text
            style={[styles.modeBtnText, mode === 'OUTWARD' && styles.modeBtnTextActive]}
          >
            {isUrdu ? 'ٹرالی لوڈنگ (Outward)' : 'Trolley Outward (-)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, mode === 'LOOKUP' && styles.modeBtnActive]}
          onPress={() => setMode('LOOKUP')}
        >
          <Ionicons
            name="search"
            size={16}
            color={mode === 'LOOKUP' ? '#FFFFFF' : '#4B5563'}
          />
          <Text
            style={[styles.modeBtnText, mode === 'LOOKUP' && styles.modeBtnTextActive]}
          >
            {isUrdu ? 'معلومات' : 'Lookup'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Simulated Scanner Viewfinder Card */}
      <View style={styles.viewfinderCard}>
        <View style={styles.cameraBox}>
          {/* Laser animation simulation line */}
          <View style={styles.laserLine} />

          {/* Corner Guides */}
          <View style={[styles.cornerGuide, styles.topLeft]} />
          <View style={[styles.cornerGuide, styles.topRight]} />
          <View style={[styles.cornerGuide, styles.bottomLeft]} />
          <View style={[styles.cornerGuide, styles.bottomRight]} />

          <Ionicons name="barcode-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
          <Text style={styles.scannerPrompt}>
            {isUrdu
              ? 'کھاد کی بوری پر موجود بارکوڈ یا QR کوڈ کیمرے کے سامنے لائیں'
              : 'Target fertilizer bag barcode inside the frame'}
          </Text>
        </View>

        {/* Manual Barcode Input / Scanner trigger */}
        <View style={styles.barcodeInputRow}>
          <TextInput
            style={styles.barcodeInput}
            placeholder={
              isUrdu ? 'بارکوڈ درج کریں (مثلاً 896400010012)' : 'Enter or scan barcode...'
            }
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            onSubmitEditing={() => handleScanBarcode(barcodeInput)}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => handleScanBarcode(barcodeInput)}
          >
            <Ionicons name="scan" size={18} color="#FFFFFF" />
            <Text style={styles.scanBtnText}>{isUrdu ? 'اسکین' : 'Scan'}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Barcode Chips */}
        <View style={styles.demoBarcodesRow}>
          <Text style={styles.demoTitle}>
            {isUrdu ? 'تیز ڈیمو بارکوڈز:' : 'Demo Barcodes:'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {products.slice(0, 4).map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.demoChip}
                onPress={() => handleScanBarcode(p.barcode)}
              >
                <Text style={styles.demoChipText}>
                  {p.nameUrdu.split(' ')[0]} ({p.barcode.slice(-4)})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Scanned Product Result & Stock Movement Action */}
      {selectedProduct && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultNameUrdu}>{selectedProduct.nameUrdu}</Text>
              <Text style={styles.resultNameEng}>{selectedProduct.name}</Text>
              <Text style={styles.resultCompany}>
                {selectedProduct.company} | وزن: {selectedProduct.bagSizeKg} KG
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.resultPrice}>
                Rs {selectedProduct.retailPrice.toLocaleString()}
              </Text>
              <Text style={styles.resultStock}>
                {isUrdu
                  ? `موجودہ اسٹاک: ${selectedProduct.stockBags} بوری`
                  : `In Godown: ${selectedProduct.stockBags} bags`}
              </Text>
            </View>
          </View>

          {mode !== 'LOOKUP' && (
            <View style={styles.movementForm}>
              <Text style={styles.movementFormTitle}>
                {mode === 'INWARD'
                  ? isUrdu
                    ? '🚚 ٹرک سے اتاری جانے والی بوریوں کی تعداد:'
                    : '🚚 Bags Unloaded from Truck:'
                  : isUrdu
                  ? '🚜 ٹرالی پر لوڈ کی جانے والی بوریوں کی تعداد:'
                  : '🚜 Bags Loaded to Trolley:'}
              </Text>

              <View style={styles.bagCounterRow}>
                {[10, 25, 50, 100, 200].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.quickCountBtn,
                      bagsCount === num.toString() && styles.quickCountBtnActive,
                    ]}
                    onPress={() => setBagsCount(num.toString())}
                  >
                    <Text
                      style={[
                        styles.quickCountText,
                        bagsCount === num.toString() && styles.quickCountTextActive,
                      ]}
                    >
                      {num} بوری
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.bagsCustomInput}
                keyboardType="numeric"
                value={bagsCount}
                onChangeText={setBagsCount}
                placeholder="تعداد بوری درج کریں"
              />

              <TextInput
                style={styles.notesInput}
                placeholder={
                  isUrdu
                    ? 'تفصیل / ٹرک نمبر / بلٹی نمبر (اختیاری)...'
                    : 'Notes / Truck # / Bilty # (Optional)...'
                }
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  mode === 'INWARD' ? styles.confirmBtnInward : styles.confirmBtnOutward,
                ]}
                onPress={handleConfirmMovement}
              >
                <Ionicons
                  name={mode === 'INWARD' ? 'checkmark-circle' : 'arrow-forward-circle'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.confirmBtnText}>
                  {mode === 'INWARD'
                    ? isUrdu
                      ? `گودام میں ${bagsCount} بوری اندراج محفوظ کریں`
                      : `Log ${bagsCount} Bags Inward`
                    : isUrdu
                    ? `لوڈنگ کی ${bagsCount} بوری مائنس کریں`
                    : `Deduct ${bagsCount} Bags Outward`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Recent Scan History */}
      {scanHistory.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>
            {isUrdu ? 'حالیہ اسکین ہسٹری:' : 'Recent Scans:'}
          </Text>
          {scanHistory.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <Ionicons
                name={item.success ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={item.success ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.historyText}>{item.text}</Text>
              <Text style={styles.historyTime}>{item.time}</Text>
            </View>
          ))}
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
  modeRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modeBtnActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  viewfinderCard: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cameraBox: {
    height: 180,
    backgroundColor: '#111827',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  laserLine: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  cornerGuide: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#10B981',
  },
  topLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scannerPrompt: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  barcodeInputRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  barcodeInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  scanBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  demoBarcodesRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginRight: 6,
  },
  demoChip: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 6,
  },
  demoChipText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#059669',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultNameUrdu: {
    fontSize: 16,
    fontWeight: '700',
    color: '#064E3B',
  },
  resultNameEng: {
    fontSize: 12,
    color: '#374151',
    marginTop: 2,
  },
  resultCompany: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  resultStock: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
  },
  movementForm: {
    marginTop: 10,
  },
  movementFormTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  bagCounterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  quickCountBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickCountBtnActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  quickCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  quickCountTextActive: {
    color: '#FFFFFF',
  },
  bagsCustomInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    fontSize: 12,
    color: '#111827',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  confirmBtnInward: {
    backgroundColor: '#059669',
  },
  confirmBtnOutward: {
    backgroundColor: '#D97706',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyText: {
    flex: 1,
    fontSize: 11,
    color: '#1F2937',
  },
  historyTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
