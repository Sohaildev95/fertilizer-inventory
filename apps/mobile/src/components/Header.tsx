import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  isUrdu: boolean;
  onToggleLanguage: () => void;
  offlineCount: number;
  onPressOfflineQueue: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onToggleOnline,
  isUrdu,
  onToggleLanguage,
  offlineCount,
  onPressOfflineQueue,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.brandName}>
              {isUrdu ? 'الرحمٰن کھاد اینڈ سپرے' : 'Al-Rehman Fertilizers'}
            </Text>
            <Text style={styles.brandSub}>
              {isUrdu ? 'موبائل کاؤنٹر و گودام ایپ' : 'Mobile POS & Godown'}
            </Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          {/* Language Toggle */}
          <TouchableOpacity
            style={styles.langButton}
            onPress={onToggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>{isUrdu ? 'ENG' : 'اردو'}</Text>
          </TouchableOpacity>

          {/* Online / Offline Toggle */}
          <TouchableOpacity
            style={[
              styles.statusPill,
              isOnline ? styles.onlinePill : styles.offlinePill,
            ]}
            onPress={onToggleOnline}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.statusDot,
                isOnline ? styles.onlineDot : styles.offlineDot,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isOnline ? styles.onlineText : styles.offlineText,
              ]}
            >
              {isOnline
                ? isUrdu
                  ? 'آن لائن'
                  : 'Online'
                : isUrdu
                ? 'آف لائن'
                : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Queue Banner if pending */}
      {offlineCount > 0 && (
        <TouchableOpacity
          style={styles.offlineBanner}
          onPress={onPressOfflineQueue}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-offline" size={16} color="#F59E0B" />
          <Text style={styles.offlineBannerText}>
            {isUrdu
              ? `${offlineCount} بل آف لائن محفوظ ہیں (سرور سے سنک کریں)`
              : `${offlineCount} bills stored offline (Tap to sync)`}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#064E3B',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  brandSub: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '400',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  langText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  onlinePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  offlinePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  onlineDot: {
    backgroundColor: '#10B981',
  },
  offlineDot: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  onlineText: {
    color: '#6EE7B7',
  },
  offlineText: {
    color: '#FDE68A',
  },
  offlineBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineBannerText: {
    color: '#FEF3C7',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 8,
  },
});
