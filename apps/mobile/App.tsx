import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  BroadcastMessageTemplate,
  DEFAULT_BROADCAST_TEMPLATES,
  PerBagMarginReport,
} from '@fertilizer/shared';
import {
  MobileTab,
  MobileProduct,
  MobileCustomer,
  MobileSaleRecord,
  MobilePaymentRecord,
} from './src/types';
import {
  getProducts,
  getCustomers,
  getOfflineQueue,
  getOfflinePayments,
  getLastSyncedAt,
  getCachedFasliForecast,
  getCachedMarginsReport,
  getCachedBroadcastTemplates,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_FASLI_FORECAST,
  INITIAL_MARGINS_REPORT,
} from './src/services/storage';
import { syncAllFromServer } from './src/services/sync';
import { Header } from './src/components/Header';
import { PosBillingTab } from './src/components/PosBillingTab';
import { BarcodeScannerTab } from './src/components/BarcodeScannerTab';
import { FarmerKhataTab } from './src/components/FarmerKhataTab';
import { GodownStockTab } from './src/components/GodownStockTab';
import { FasliInsightsTab } from './src/components/FasliInsightsTab';
import { ThermalReceiptModal } from './src/components/ThermalReceiptModal';
import { OfflineSyncModal } from './src/components/OfflineSyncModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<MobileTab>('pos');
  const [isOnline, setIsOnline] = useState(true);
  const [isUrdu, setIsUrdu] = useState(true);
  const [products, setProducts] = useState<MobileProduct[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<MobileCustomer[]>(INITIAL_CUSTOMERS);
  const [offlineQueue, setOfflineQueue] = useState<MobileSaleRecord[]>([]);
  const [offlinePayments, setOfflinePayments] = useState<MobilePaymentRecord[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [fasliForecast, setFasliForecast] = useState<any>(INITIAL_FASLI_FORECAST);
  const [marginsReport, setMarginsReport] =
    useState<PerBagMarginReport>(INITIAL_MARGINS_REPORT);
  const [broadcastTemplates, setBroadcastTemplates] = useState<BroadcastMessageTemplate[]>(
    DEFAULT_BROADCAST_TEMPLATES as BroadcastMessageTemplate[]
  );

  // Modals state
  const [receiptSale, setReceiptSale] = useState<MobileSaleRecord | null>(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);

  // Load cached data from AsyncStorage
  const loadData = useCallback(async () => {
    try {
      const [prods, custs, queue, payQueue, synced, fasli, margins, templates] =
        await Promise.all([
          getProducts(),
          getCustomers(),
          getOfflineQueue(),
          getOfflinePayments(),
          getLastSyncedAt(),
          getCachedFasliForecast(),
          getCachedMarginsReport(),
          getCachedBroadcastTemplates(),
        ]);
      setProducts(prods);
      setCustomers(custs);
      setOfflineQueue(queue);
      setOfflinePayments(payQueue);
      setLastSyncedAt(synced);
      setFasliForecast(fasli);
      setMarginsReport(margins);
      setBroadcastTemplates(templates);
    } catch {
      // Fallback to initial state
    }
  }, []);

  useEffect(() => {
    loadData().then(() => {
      if (isOnline) {
        syncAllFromServer().then((res) => {
          if (res.success) {
            loadData();
          }
        });
      }
    });
  }, [loadData, isOnline]);

  const handleSaleComplete = (sale: MobileSaleRecord) => {
    loadData();
    setReceiptSale(sale);
    setReceiptModalVisible(true);
  };

  const handlePaymentReceived = (_customer: MobileCustomer, _amount: number) => {
    loadData();
  };

  const totalPendingSyncCount = offlineQueue.length + offlinePayments.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Shop Header */}
      <Header
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        isUrdu={isUrdu}
        onToggleLanguage={() => setIsUrdu(!isUrdu)}
        offlineCount={totalPendingSyncCount}
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
            isOnline={isOnline}
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

        {activeTab === 'fasli' && (
          <FasliInsightsTab
            fasliForecast={fasliForecast}
            marginsReport={marginsReport}
            broadcastTemplates={broadcastTemplates}
            customers={customers}
            lastSyncedAt={lastSyncedAt}
            isOnline={isOnline}
            isUrdu={isUrdu}
            onSyncPress={() => setOfflineModalVisible(true)}
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
            size={21}
            color={activeTab === 'pos' ? '#059669' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'pos' && styles.navLabelActive,
            ]}
          >
            {isUrdu ? 'بلنگ' : 'POS'}
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
            size={21}
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
            size={21}
            color={activeTab === 'khata' ? '#059669' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'khata' && styles.navLabelActive,
            ]}
          >
            {isUrdu ? 'کھاتہ' : 'Khata'}
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
            size={21}
            color={activeTab === 'stock' ? '#059669' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'stock' && styles.navLabelActive,
            ]}
          >
            {isUrdu ? 'گودام' : 'Godown'}
          </Text>
        </TouchableOpacity>

        {/* Fasli, Profit & Sync Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('fasli')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'fasli' ? 'analytics' : 'analytics-outline'}
            size={21}
            color={activeTab === 'fasli' ? '#059669' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'fasli' && styles.navLabelActive,
            ]}
          >
            {isUrdu ? 'فصلی و سنک' : 'Fasli/Sync'}
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
        offlinePayments={offlinePayments}
        lastSyncedAt={lastSyncedAt}
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
