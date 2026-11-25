import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MobilePaymentRecord, MobileSaleRecord } from '../types';
import { getApiBaseUrl, setApiBaseUrl } from '../services/storage';
import {
  pushOfflineQueueToServer,
  syncAllFromServer,
  testServerConnection,
} from '../services/sync';

interface OfflineSyncModalProps {
  visible: boolean;
  onClose: () => void;
  offlineQueue: MobileSaleRecord[];
  offlinePayments: MobilePaymentRecord[];
  lastSyncedAt: string | null;
  isOnline: boolean;
  isUrdu: boolean;
  onSyncComplete: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  visible,
  onClose,
  offlineQueue,
  offlinePayments,
  lastSyncedAt,
  isOnline,
  isUrdu,
  onSyncComplete,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    if (visible) {
      getApiBaseUrl().then(setApiUrl);
      setConnectionStatus('idle');
    }
  }, [visible]);

  const totalOfflineSalesAmount = offlineQueue.reduce((sum, s) => sum + s.netPayable, 0);
  const totalOfflineBags = offlineQueue.reduce((sum, s) => sum + s.totalBags, 0);
  const totalOfflinePaymentsAmount = offlinePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPendingCount = offlineQueue.length + offlinePayments.length;

  const handleSaveAndTestServer = async () => {
    const cleaned = await setApiBaseUrl(apiUrl);
    setApiUrl(cleaned);
    const ok = await testServerConnection(cleaned);
    setConnectionStatus(ok ? 'ok' : 'fail');
    Alert.alert(
      ok ? (isUrdu ? 'کنکشن کامیاب' : 'Connected') : isUrdu ? 'رابطہ نہ ہو سکا' : 'Unreachable',
      ok
        ? isUrdu
          ? 'موبائل ایپ کامیابی سے سرور (API) سے جڑ چکی ہے۔'
          : 'Mobile app successfully connected to server API.'
        : isUrdu
        ? `سرور ${cleaned} تک رسائی نہیں ملی۔ چیک کریں کہ کمپیوٹر اور موبائل ایک ہی Wi-Fi پر ہوں اور API سرور چل رہا ہو۔`
        : `Could not reach ${cleaned}. Ensure phone and PC share the same Wi-Fi and API server is running.`
    );
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      Alert.alert(
        isUrdu ? 'آف لائن موڈ' : 'Offline Mode',
        isUrdu
          ? 'سرور سے سنک کرنے کے لیے اوپر سے آن لائن موڈ آن کریں۔'
          : 'Please toggle Online mode in the header to sync.'
      );
      return;
    }

    setIsSyncing(true);
    try {
      if (apiUrl.trim()) {
        await setApiBaseUrl(apiUrl);
      }

      if (totalPendingCount > 0) {
        const res = await pushOfflineQueueToServer();
        onSyncComplete();

        if (res.failedCount === 0 && res.pulledFreshData) {
          Alert.alert(
            isUrdu ? 'سنک مکمل' : 'Sync Complete',
            isUrdu
              ? `${res.salesSynced} بل اور ${res.paymentsSynced} وصولیاں سرور پر محفوظ ہو گئیں، اور تازہ اسٹاک و کھاتہ ڈیٹا ڈاؤن لوڈ ہو گیا۔`
              : `${res.salesSynced} bills and ${res.paymentsSynced} payments synced, and catalog refreshed.`
          );
          onClose();
        } else {
          Alert.alert(
            isUrdu ? 'جزوی سنک' : 'Partial Sync',
            isUrdu
              ? `${res.salesSynced + res.paymentsSynced} ریکارڈ سنک ہوئے، ${res.failedCount} ناکام رہے۔ سرور URL اور Wi-Fi چیک کریں۔`
              : `${res.salesSynced + res.paymentsSynced} synced, ${res.failedCount} failed. Check server URL and Wi-Fi.`
          );
        }
      } else {
        const pull = await syncAllFromServer();
        onSyncComplete();
        if (pull.success) {
          Alert.alert(
            isUrdu ? 'ڈیٹا اپ ڈیٹ ہو گیا' : 'Data Refreshed',
            isUrdu
              ? `${pull.productsCount} کھادیں، ${pull.customersCount} کسان، فصلی شیڈول اور منافع رپورٹ تازہ ہو گئی۔`
              : `Synced ${pull.productsCount} products, ${pull.customersCount} customers, and reports.`
          );
        } else {
          Alert.alert(
            isUrdu ? 'سرور دستیاب نہیں' : 'Server Unreachable',
            isUrdu
              ? 'سرور سے رابطہ نہیں ہو سکا، ایپ آف لائن کیش پر چل رہی ہے۔'
              : 'Could not reach server; continuing on offline cache.'
          );
        }
      }
    } catch {
      Alert.alert(isUrdu ? 'خرابی' : 'Error', isUrdu ? 'سنک ناکام ہو گیا۔' : 'Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons
                name={totalPendingCount > 0 ? 'cloud-offline' : 'cloud-done'}
                size={22}
                color={totalPendingCount > 0 ? '#D97706' : '#059669'}
              />
              <View>
                <Text style={styles.title}>
                  {isUrdu ? 'سرور سنک و آف لائن کیو' : 'Cloud Sync & Offline Queue'}
                </Text>
                <Text style={styles.subTitle}>
                  {totalPendingCount > 0
                    ? `${offlineQueue.length} ${isUrdu ? 'بل' : 'bills'} • ${offlinePayments.length} ${isUrdu ? 'وصولیاں منتظر' : 'payments pending'}`
                    : lastSyncedAt
                    ? `${isUrdu ? 'آخری سنک:' : 'Last synced:'} ${new Date(lastSyncedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : isUrdu
                    ? 'آف لائن کیش تیار ہے'
                    : 'Offline cache ready'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Server Endpoint Input */}
          <View style={styles.serverBox}>
            <Text style={styles.serverLabel}>
              {isUrdu ? 'بیک اینڈ سرور URL (Wi-Fi / Localhost):' : 'API Server URL:'}
            </Text>
            <View style={styles.serverRow}>
              <TextInput
                style={styles.serverInput}
                value={apiUrl}
                onChangeText={setApiUrl}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="http://192.168.1.x:4000/api/v1"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity style={styles.testBtn} onPress={handleSaveAndTestServer}>
                <Ionicons
                  name={
                    connectionStatus === 'ok'
                      ? 'checkmark-circle'
                      : connectionStatus === 'fail'
                      ? 'alert-circle'
                      : 'pulse'
                  }
                  size={15}
                  color="#FFFFFF"
                />
                <Text style={styles.testBtnText}>{isUrdu ? 'ٹیسٹ' : 'Test'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* KPI Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>
                {isUrdu ? 'آف لائن بلز:' : 'Offline Bills:'}
              </Text>
              <Text style={styles.summaryValue}>
                Rs {totalOfflineSalesAmount.toLocaleString()}
              </Text>
              <Text style={styles.summarySub}>{totalOfflineBags} بوری</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>
                {isUrdu ? 'آف لائن وصولیاں:' : 'Offline Wasooli:'}
              </Text>
              <Text style={styles.summaryValue}>
                Rs {totalOfflinePaymentsAmount.toLocaleString()}
              </Text>
              <Text style={styles.summarySub}>{offlinePayments.length} رسیدیں</Text>
            </View>
          </View>

          {/* Queued Items List */}
          <ScrollView style={styles.scrollList}>
            {totalPendingCount === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="checkmark-done-circle" size={44} color="#10B981" />
                <Text style={styles.emptyText}>
                  {isUrdu
                    ? 'کوئی آف لائن بل یا وصولی زیرِ التواء نہیں ہے۔ نیچے بٹن سے تازہ اسٹاک اور فصلی ڈیٹا ڈاؤن لوڈ کر سکتے ہیں۔'
                    : 'No pending offline bills or payments. Tap below to pull latest server data.'}
                </Text>
              </View>
            ) : (
              <>
                {offlineQueue.map((sale) => (
                  <View key={sale.id} style={styles.billCard}>
                    <View style={styles.billCardHeader}>
                      <Text style={styles.billInvoice}>{sale.invoiceNumber}</Text>
                      <View style={styles.unsyncedPill}>
                        <Text style={styles.unsyncedText}>
                          {isUrdu ? 'آف لائن بل' : 'Offline Sale'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.billCustomer}>
                      {sale.customerName} ({sale.customerVillage})
                    </Text>
                    <Text style={styles.billItems}>
                      {sale.totalBags} بوری •{' '}
                      {sale.items.map((i) => `${i.productNameUrdu} (${i.quantity})`).join(', ')}
                    </Text>
                    <View style={styles.billFooter}>
                      <Text style={styles.billTime}>
                        {new Date(sale.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Text style={styles.billAmount}>
                        Rs {sale.netPayable.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}

                {offlinePayments.map((pay) => (
                  <View key={pay.id} style={[styles.billCard, { borderLeftWidth: 3, borderLeftColor: '#0284C7' }]}>
                    <View style={styles.billCardHeader}>
                      <Text style={styles.billInvoice}>WASOOLI</Text>
                      <View style={[styles.unsyncedPill, { backgroundColor: '#E0F2FE' }]}>
                        <Text style={[styles.unsyncedText, { color: '#0369A1' }]}>
                          {isUrdu ? 'آف لائن وصولی' : 'Offline Payment'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.billCustomer}>{pay.customerName}</Text>
                    {pay.notes ? <Text style={styles.billItems}>{pay.notes}</Text> : null}
                    <View style={styles.billFooter}>
                      <Text style={styles.billTime}>
                        {new Date(pay.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Text style={[styles.billAmount, { color: '#0284C7' }]}>
                        +Rs {pay.amount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          {/* Sync Button */}
          <View style={styles.footerBar}>
            <TouchableOpacity
              style={[styles.syncBtn, isSyncing && { opacity: 0.7 }]}
              onPress={handleSyncNow}
              disabled={isSyncing}
            >
              <Ionicons
                name={isSyncing ? 'refresh' : totalPendingCount > 0 ? 'cloud-upload' : 'sync'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.syncBtnText}>
                {isSyncing
                  ? isUrdu
                    ? 'سرور سے سنک ہو رہا ہے...'
                    : 'Syncing with Server...'
                  : totalPendingCount > 0
                  ? isUrdu
                    ? `${totalPendingCount} ریکارڈز ابھی سنک کریں`
                    : `Push ${totalPendingCount} Offline Records & Sync`
                  : isUrdu
                  ? 'سرور سے تازہ ڈیٹا سنک کریں'
                  : 'Sync Latest Data from Server'}
              </Text>
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
    maxWidth: 420,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  subTitle: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  serverBox: {
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serverLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  serverRow: {
    flexDirection: 'row',
    gap: 6,
  },
  serverInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    color: '#111827',
  },
  testBtn: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryBox: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#064E3B',
    marginTop: 2,
  },
  summarySub: {
    fontSize: 10,
    color: '#6B7280',
  },
  scrollList: {
    padding: 12,
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  billCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  billInvoice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
  },
  unsyncedPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unsyncedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  billCustomer: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  billItems: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  billTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  billAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  footerBar: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  syncBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
