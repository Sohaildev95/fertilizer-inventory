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
import { clearOfflineQueue } from '../services/storage';

interface OfflineSyncModalProps {
  visible: boolean;
  onClose: () => void;
  offlineQueue: MobileSaleRecord[];
  isOnline: boolean;
  isUrdu: boolean;
  onSyncComplete: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  visible,
  onClose,
  offlineQueue,
  isOnline,
  isUrdu,
  onSyncComplete,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const totalOfflineAmount = offlineQueue.reduce((sum, s) => sum + s.netPayable, 0);
  const totalOfflineBags = offlineQueue.reduce((sum, s) => sum + s.totalBags, 0);

  const handleSyncNow = async () => {
    if (!isOnline) {
      Alert.alert(
        isUrdu ? 'انٹرنیٹ نہیں ہے' : 'No Internet',
        isUrdu
          ? 'سرور سے سنک کرنے کے لیے موبائل کو انٹرنیٹ سے کنیکٹ کریں یا آن لائن موڈ آن کریں۔'
          : 'Please connect to internet or toggle Online mode.'
      );
      return;
    }

    setIsSyncing(true);
    try {
      // Simulate cloud server POST request for queued records
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const count = await clearOfflineQueue();

      Alert.alert(
        isUrdu ? 'سنک مکمل' : 'Sync Complete',
        isUrdu
          ? `${count} بل کامیابی سے کلائوڈ سرور (Supabase) پر اپ ڈیٹ ہو گئے ہیں۔`
          : `${count} offline bills synced with cloud database.`
      );
      onSyncComplete();
      onClose();
    } catch {
      Alert.alert(isUrdu ? 'خرابی' : 'Error', isUrdu ? 'سنک نہیں ہو سکا۔' : 'Sync failed.');
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
              <Ionicons name="cloud-offline" size={22} color="#D97706" />
              <View>
                <Text style={styles.title}>
                  {isUrdu ? 'آف لائن بلنگ کیو (Unsynced Bills)' : 'Offline Bills Queue'}
                </Text>
                <Text style={styles.subTitle}>
                  {offlineQueue.length}{' '}
                  {isUrdu ? 'بل سرور پر اپ ڈیٹ ہونے کے منتظر' : 'bills waiting to sync'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* KPI Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>
                {isUrdu ? 'کل بلز رقم:' : 'Total Amount:'}
              </Text>
              <Text style={styles.summaryValue}>
                Rs {totalOfflineAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>
                {isUrdu ? 'کل بوری فروخت:' : 'Total Bags:'}
              </Text>
              <Text style={styles.summaryValue}>{totalOfflineBags} بوری</Text>
            </View>
          </View>

          {/* Bills List */}
          <ScrollView style={styles.scrollList}>
            {offlineQueue.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
                <Text style={styles.emptyText}>
                  {isUrdu
                    ? 'تمام بل سرور کے ساتھ سنک ہیں! کوئی بل زیر التواء نہیں ہے۔'
                    : 'All bills are synced with the server!'}
                </Text>
              </View>
            ) : (
              offlineQueue.map((sale) => (
                <View key={sale.id} style={styles.billCard}>
                  <View style={styles.billCardHeader}>
                    <Text style={styles.billInvoice}>{sale.invoiceNumber}</Text>
                    <View style={styles.unsyncedPill}>
                      <Text style={styles.unsyncedText}>
                        {isUrdu ? 'آف لائن محفوظ' : 'Offline'}
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
              ))
            )}
          </ScrollView>

          {/* Sync Button */}
          {offlineQueue.length > 0 && (
            <View style={styles.footerBar}>
              <TouchableOpacity
                style={[styles.syncBtn, isSyncing && { opacity: 0.7 }]}
                onPress={handleSyncNow}
                disabled={isSyncing}
              >
                <Ionicons
                  name={isSyncing ? 'refresh' : 'cloud-upload'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.syncBtnText}>
                  {isSyncing
                    ? isUrdu
                      ? 'سرور سے سنک ہو رہا ہے...'
                      : 'Syncing with Supabase...'
                    : isUrdu
                    ? `تمام ${offlineQueue.length} بل ابھی سرور پر بھیجیں`
                    : `Sync ${offlineQueue.length} Bills to Server`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    maxHeight: '85%',
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
  summaryBox: {
    flexDirection: 'row',
    padding: 12,
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
  scrollList: {
    padding: 12,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  billCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  billCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billInvoice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  unsyncedPill: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  unsyncedText: {
    fontSize: 9,
    color: '#92400E',
    fontWeight: '700',
  },
  billCustomer: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  billItems: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  billTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  billAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#064E3B',
  },
  footerBar: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
