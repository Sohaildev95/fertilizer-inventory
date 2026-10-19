import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { MobileTab, MobileProduct, MobileCustomer, MobileSaleRecord } from './src/types';
import {
  getProducts,
  getCustomers,
  getOfflineQueue,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
} from './src/services/storage';
import { Header } from './src/components/Header';
import { PosBillingTab } from './src/components/PosBillingTab';
import { BarcodeScannerTab } from './src/components/BarcodeScannerTab';
import { FarmerKhataTab } from './src/components/FarmerKhataTab';
import { GodownStockTab } from './src/components/GodownStockTab';
import { ThermalReceiptModal } from './src/components/ThermalReceiptModal';
import { OfflineSyncModal } from './src/components/OfflineSyncModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<MobileTab>('pos');
  const [isOnline, setIsOnline] = useState(true);
  const [isUrdu, setIsUrdu] = useState(true);
  const [products, setProducts] = useState<MobileProduct[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<MobileCustomer[]>(INITIAL_CUSTOMERS);
  const [offlineQueue, setOfflineQueue] = useState<MobileSaleRecord[]>([]);

  // Modals state
  const [receiptSale, setReceiptSale] = useState<MobileSaleRecord | null>(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);

  // Load data from local storage
  const loadData = async () => {
    try {
      const prods = await getProducts();
      const custs = await getCustomers();
      const queue = await getOfflineQueue();
      setProducts(prods);
      setCustomers(custs);
      setOfflineQueue(queue);
    } catch {
      // Fallback to initial
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaleComplete = (sale: MobileSaleRecord) => {
    loadData();
    setReceiptSale(sale);
    setReceiptModalVisible(true);
  };

  const handlePaymentReceived = (customer: MobileCustomer, amount: number) => {
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Shop Header */}
      <Header
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        isUrdu={isUrdu}
        onToggleLanguage={() => setIsUrdu(!isUrdu)}
        offlineCount={offlineQueue.length}
        onPressOfflineQueue={() => setOfflineModalVisible(true)}
      />

      {/* Main Tab Screen Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'pos' && (
          <PosBillingTab
            products={products}
            customers={customers}
            isOnline={isOnline}
            isUrdu={isUrdu}
            onSaleComplete={handleSaleComplete}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'scanner' && (
          <BarcodeScannerTab
            products={products}
            isUrdu={isUrdu}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'khata' && (
          <FarmerKhataTab
            customers={customers}
            isUrdu={isUrdu}
            onRefreshData={loadData}
            onPaymentReceived={handlePaymentReceived}
          />
        )}

        {activeTab === 'stock' && (
          <GodownStockTab
            products={products}
            isUrdu={isUrdu}
            onRefreshData={loadData}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* POS Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('pos')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'pos' ? 'calculator' : 'calculator-outline'}
            size={22}
            color={activeTab === 'pos' ? '#059669' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'pos' && styles.navLabelActive,
            ]}
          >
            {isUrdu ? 'کاؤنٹر بلنگ' : 'POS'}
          </Text>
        </TouchableOpacity>

        {/* Barcode Scanner Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('scanner')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'scanner' ? 'barcode' : 'barcode-outline'}
            size={22}
            color={activeTab === 'scanner' ? '#059669' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'scanner' && styles.navLabelActive,
            ]}
          >
            {isUrdu ? 'اسکینر' : 'Scanner'}
          </Text>
        </TouchableOpacity>

        {/* Farmer Khata Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('khata')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'khata' ? 'book' : 'book-outline'}
            size={22}
            color={activeTab === 'khata' ? '#059669' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'khata' && styles.navLabelActive,
            ]}
          >
            {isUrdu ? 'کسان کھاتہ' : 'Khata'}
          </Text>
        </TouchableOpacity>

        {/* Godown Stock Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('stock')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'stock' ? 'cube' : 'cube-outline'}
            size={22}
            color={activeTab === 'stock' ? '#059669' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'stock' && styles.navLabelActive,
            ]}
          >
            {isUrdu ? 'گودام اسٹاک' : 'Godown'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Thermal Receipt Modal */}
      <ThermalReceiptModal
        sale={receiptSale}
        visible={receiptModalVisible}
        onClose={() => setReceiptModalVisible(false)}
        isUrdu={isUrdu}
      />

      {/* Offline Sync Modal */}
      <OfflineSyncModal
        visible={offlineModalVisible}
        onClose={() => setOfflineModalVisible(false)}
        offlineQueue={offlineQueue}
        isOnline={isOnline}
        isUrdu={isUrdu}
        onSyncComplete={loadData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#059669',
    fontWeight: '800',
  },
});
