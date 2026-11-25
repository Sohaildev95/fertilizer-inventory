import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BroadcastMessageTemplate, PerBagMarginReport } from '@fertilizer/shared';
import { MobileCustomer } from '../types';

interface FasliInsightsTabProps {
  fasliForecast: any;
  marginsReport: PerBagMarginReport;
  broadcastTemplates: BroadcastMessageTemplate[];
  customers: MobileCustomer[];
  lastSyncedAt: string | null;
  isOnline: boolean;
  isUrdu: boolean;
  onSyncPress: () => void;
}

export const FasliInsightsTab: React.FC<FasliInsightsTabProps> = ({
  fasliForecast,
  marginsReport,
  broadcastTemplates,
  customers,
  lastSyncedAt,
  isOnline,
  isUrdu,
  onSyncPress,
}) => {
  const [subTab, setSubTab] = useState<'fasli' | 'profit' | 'broadcast'>('fasli');

  const formatPhone = (raw: string) => {
    const clean = (raw || '').replace(/[^0-9]/g, '');
    return clean.startsWith('0') ? '92' + clean.slice(1) : clean;
  };

  const openWhatsAppWithText = (phone: string, text: string) => {
    const intl = formatPhone(phone);
    const url = intl
      ? `whatsapp://send?phone=${intl}&text=${encodeURIComponent(text)}`
      : `whatsapp://send?text=${encodeURIComponent(text)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            isUrdu ? 'واٹس ایپ پیغام تیار' : 'Message Ready',
            text
          );
        }
      })
      .catch(() => {
        Alert.alert(isUrdu ? 'واٹس ایپ پیغام' : 'Message Ready', text);
      });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Sync Banner */}
      <View style={styles.syncCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.syncTitle}>
            {isUrdu ? 'ویب پورٹل و کلاؤڈ سنک اسٹیٹس' : 'Web Dashboard Sync Status'}
          </Text>
          <Text style={styles.syncSub}>
            {lastSyncedAt
              ? `${isUrdu ? 'آخری سنک:' : 'Last synced:'} ${new Date(lastSyncedAt).toLocaleString('en-GB')}`
              : isUrdu
              ? 'آف لائن لوکل کیش موڈ (سنک کے لیے ٹچ کریں)'
              : 'Using offline cache (Tap to sync)'}
          </Text>
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={onSyncPress}>
          <Ionicons name="sync" size={16} color="#FFFFFF" />
          <Text style={styles.syncBtnText}>
            {isOnline ? (isUrdu ? 'سنک' : 'Sync') : isUrdu ? 'آف لائن' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-Navigation Pills */}
      <View style={styles.pillsRow}>
        <TouchableOpacity
          style={[styles.pill, subTab === 'fasli' && styles.pillActive]}
          onPress={() => setSubTab('fasli')}
        >
          <Text style={[styles.pillText, subTab === 'fasli' && styles.pillTextActive]}>
            {isUrdu ? 'فصلی ادھار' : 'Fasli Schedule'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pill, subTab === 'profit' && styles.pillActive]}
          onPress={() => setSubTab('profit')}
        >
          <Text style={[styles.pillText, subTab === 'profit' && styles.pillTextActive]}>
            {isUrdu ? 'فی بوری منافع' : 'Bag Margins'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pill, subTab === 'broadcast' && styles.pillActive]}
          onPress={() => setSubTab('broadcast')}
        >
          <Text style={[styles.pillText, subTab === 'broadcast' && styles.pillTextActive]}>
            {isUrdu ? 'پیغامات و اعلانات' : 'Broadcast'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 1. FASLI UDHAAR FORECAST */}
      {subTab === 'fasli' && (
        <View style={styles.section}>
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Text style={styles.kpiLabel}>
                {isUrdu ? 'کل متوقع فصلی وصولی' : 'Total Fasli Recovery'}
              </Text>
              <Text style={[styles.kpiValue, { color: '#92400E' }]}>
                Rs {Number(fasliForecast?.summary?.totalReceivable || 0).toLocaleString()}
              </Text>
            </View>
            <View style={[styles.kpiBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Text style={styles.kpiLabel}>
                {isUrdu ? 'ربیع / گندم' : 'Rabi (Wheat)'}
              </Text>
              <Text style={[styles.kpiValue, { color: '#065F46' }]}>
                Rs {Number(fasliForecast?.summary?.rabiTotal || 0).toLocaleString()}
              </Text>
            </View>
            <View style={[styles.kpiBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={styles.kpiLabel}>
                {isUrdu ? 'خریف / کپاس و چاول' : 'Kharif (Cotton/Rice)'}
              </Text>
              <Text style={[styles.kpiValue, { color: '#1E40AF' }]}>
                Rs {Number(fasliForecast?.summary?.kharifTotal || 0).toLocaleString()}
              </Text>
            </View>
          </View>

          {(fasliForecast?.forecast || []).map((month: any) => (
            <View key={month.monthKey} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {isUrdu ? month.monthUrdu : month.monthEnglish}
                </Text>
                <Text style={styles.cardAmount}>
                  Rs {Number(month.totalReceivable || 0).toLocaleString()}
                </Text>
              </View>

              {(month.farmers || []).map((farmer: any) => (
                <View key={farmer.crop_cycle_id || farmer.customer_id} style={styles.farmerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.farmerName}>{farmer.customer_name}</Text>
                    <Text style={styles.farmerMeta}>
                      {farmer.crop_name} • {farmer.land_acreage} ایکڑ • {farmer.expected_harvest_date}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.farmerBalance}>
                      Rs {Number(farmer.expected_amount || farmer.current_balance || 0).toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      style={styles.waBtn}
                      onPress={() =>
                        openWhatsAppWithText(
                          farmer.phone,
                          `محترم ${farmer.customer_name} صاحب،\nالسلام علیکم! آپ کی ${farmer.crop_name} کی فصل کٹائی پر فصلی ادھار Rs ${Number(farmer.expected_amount || farmer.current_balance || 0).toLocaleString()} واجب الادا ہے۔ شکریہ!`
                        )
                      }
                    >
                      <Ionicons name="logo-whatsapp" size={12} color="#FFFFFF" />
                      <Text style={styles.waBtnText}>
                        {isUrdu ? 'یاد دہانی' : 'Remind'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* 2. PER-BAG PROFIT & MARGINS */}
      {subTab === 'profit' && (
        <View style={styles.section}>
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiBox, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}>
              <Text style={styles.kpiLabel}>
                {isUrdu ? 'اوسط منافع فی بوری' : 'Avg Profit / Bag'}
              </Text>
              <Text style={[styles.kpiValue, { color: '#BE123C' }]}>
                Rs {marginsReport.summary.averageProfitPerBag.toLocaleString()}
              </Text>
              <Text style={styles.kpiHint}>
                Margin: {marginsReport.summary.overallMarginPercent}%
              </Text>
            </View>

            <View style={[styles.kpiBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Text style={styles.kpiLabel}>
                {isUrdu ? 'مجموعی خالص منافع' : 'Total Gross Profit'}
              </Text>
              <Text style={[styles.kpiValue, { color: '#047857' }]}>
                Rs {marginsReport.summary.totalGrossProfit.toLocaleString()}
              </Text>
              <Text style={styles.kpiHint}>
                {marginsReport.summary.totalBagsSold} {isUrdu ? 'بوریاں' : 'Bags'}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isUrdu ? 'نقد بنام فصلی ادھار موازنہ' : 'Cash vs Credit Margin'}
            </Text>
            <View style={styles.compareRow}>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>{isUrdu ? 'نقد فی بوری' : 'Cash / Bag'}</Text>
                <Text style={styles.compareVal}>
                  Rs {marginsReport.summary.cashVsCredit.cash.avgProfitPerBag}
                </Text>
              </View>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>{isUrdu ? 'ادھار فی بوری' : 'Credit / Bag'}</Text>
                <Text style={[styles.compareVal, { color: '#7C3AED' }]}>
                  Rs {marginsReport.summary.cashVsCredit.credit.avgProfitPerBag}
                </Text>
              </View>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>{isUrdu ? 'اضافی پریمیم' : 'Premium'}</Text>
                <Text style={[styles.compareVal, { color: '#059669' }]}>
                  +Rs {marginsReport.summary.cashVsCredit.creditMarginPremium}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 8 }]}>
              {isUrdu ? 'سرفہرست منافع بخش کھادیں' : 'Top Profitable Fertilizers'}
            </Text>
            {(marginsReport.topProducts || []).map((prod) => (
              <View key={prod.id} style={styles.farmerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.farmerName}>
                    {isUrdu ? prod.urduName : prod.name}
                  </Text>
                  <Text style={styles.farmerMeta}>
                    {prod.company} • {prod.bagsSold} {isUrdu ? 'فروخت' : 'sold'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.farmerBalance, { color: '#059669' }]}>
                    +Rs {prod.profitPerBag} / بوری
                  </Text>
                  <Text style={styles.farmerMeta}>
                    Total: Rs {prod.totalProfit.toLocaleString()} ({prod.marginPercent}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 3. QUICK BROADCAST LAUNCHER */}
      {subTab === 'broadcast' && (
        <View style={styles.section}>
          <Text style={styles.helperText}>
            {isUrdu
              ? 'نیچے کسی بھی زرعی ٹیمپلیٹ پر کلک کر کے کسانوں کو واٹس ایپ پیغام بھیجیں:'
              : 'Tap any Urdu template below to share via WhatsApp:'}
          </Text>

          {broadcastTemplates.map((tmpl) => (
            <View key={tmpl.key} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {tmpl.icon} {isUrdu ? tmpl.titleUrdu : tmpl.title}
                </Text>
                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={() => openWhatsAppWithText('', tmpl.defaultUrdu)}
                >
                  <Ionicons name="share-social" size={12} color="#FFFFFF" />
                  <Text style={styles.waBtnText}>
                    {isUrdu ? 'واٹس ایپ شیئر' : 'Share'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.tmplBody}>{tmpl.defaultUrdu}</Text>

              {customers.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  {customers.slice(0, 5).map((cust) => (
                    <TouchableOpacity
                      key={cust.id}
                      style={styles.custChip}
                      onPress={() => openWhatsAppWithText(cust.phone, tmpl.defaultUrdu)}
                    >
                      <Ionicons name="logo-whatsapp" size={12} color="#059669" />
                      <Text style={styles.custChipText}>
                        {isUrdu ? cust.nameUrdu : cust.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  syncCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  syncTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  syncSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  syncBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingBottom: 24,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  kpiBox: {
    flex: 1,
    minWidth: '30%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiHint: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  cardAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  farmerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  farmerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  farmerMeta: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  farmerBalance: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  waBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  waBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  compareRow: {
    flexDirection: 'row',
    paddingTop: 6,
  },
  compareCol: {
    flex: 1,
    alignItems: 'center',
  },
  compareLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  compareVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  tmplBody: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    textAlign: 'right',
  },
  custChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
  },
  custChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
  },
});
