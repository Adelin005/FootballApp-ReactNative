import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getFavorites,
  removeFavorite,
  FavoriteTeam,
} from '../../src/services/favoritesService';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);

  // Reload favorites every time this tab is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const data = await getFavorites();
    // Sort by most recently saved first
    data.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    setFavorites(data);
  };

  const handleRemoveFavorite = (team: FavoriteTeam) => {
    const message = t('favorites_remove_msg').replace('{name}', team.teamName);
    
    if (Platform.OS === 'web') {
      if (window.confirm(`${t('favorites_remove_title')}: ${message}`)) {
        removeFavAndUpdate(team);
      }
    } else {
      Alert.alert(t('favorites_remove_title'), message, [
        { text: t('favorites_cancel'), style: 'cancel' },
        { text: t('favorites_remove'), style: 'destructive', onPress: () => removeFavAndUpdate(team) },
      ]);
    }
  };

  const removeFavAndUpdate = async (team: FavoriteTeam) => {
    await removeFavorite(team.teamId);
    setFavorites((prev) => prev.filter((f) => f.teamId !== team.teamId));
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteTeam }) => {
    const goalDiff = 
      item.goalsScored != null && item.goalsConceded != null
        ? item.goalsScored - item.goalsConceded
        : null;
    const goalDiffStr = goalDiff != null ? (goalDiff >= 0 ? `+${goalDiff}` : `${goalDiff}`) : '';

    return (
      <View style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Team Icon */}
        <View style={[styles.teamIconContainer, { backgroundColor: colors.cardLight }]}>
          <Ionicons name="shield" size={28} color={colors.primary} />
        </View>

        {/* Team Info */}
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
            {item.teamName}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="trophy" size={12} color={colors.textDim} />
            <Text style={[styles.leagueName, { color: colors.textDim }]} numberOfLines={1}>
              {item.leagueName}
            </Text>
          </View>

          {/* Stats Row */}
          {item.points != null && (
            <View style={styles.statsRow}>
              {item.position != null && (
                <View style={[styles.statChip, { backgroundColor: colors.cardLight }]}>
                  <Text style={[styles.statChipText, { color: colors.textDim }]}>#{item.position}</Text>
                </View>
              )}
              <View style={[styles.statChip, { backgroundColor: colors.cardLight }]}>
                <Text style={[styles.statChipText, { color: colors.textDim }]}>{item.points} pts</Text>
              </View>
              {item.win != null && (
                <View style={[styles.statChip, { backgroundColor: colors.cardLight }]}>
                  <Text style={[styles.statChipText, { color: colors.textDim }]}>
                    {item.win}{t('teams_stat_w')} {item.draw}{t('teams_stat_d')} {item.loss}{t('teams_stat_l')}
                  </Text>
                </View>
              )}
              {goalDiffStr ? (
                <View style={[styles.statChip, goalDiff! >= 0 ? (isDarkMode ? styles.statChipPositive : {backgroundColor: '#DCFCE7'}) : (isDarkMode ? styles.statChipNegative : {backgroundColor: '#FEE2E2'})]}>
                  <Text style={[styles.statChipText, goalDiff! >= 0 ? (isDarkMode ? styles.statChipTextPositive : {color: '#166534'}) : (isDarkMode ? styles.statChipTextNegative : {color: '#991B1B'})]}>
                    {goalDiffStr}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Note */}
          {item.note ? (
            <Text
              style={[
                styles.noteText,
                { color: colors.textDim },
                item.note?.toLowerCase().includes('relegation') && { color: colors.error },
                item.note?.toLowerCase().includes('champions') && { color: colors.success },
              ]}
              numberOfLines={1}
            >
              {item.note}
            </Text>
          ) : null}
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="star" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="star" size={24} color={colors.accent} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('favorites_title')}</Text>
        {favorites.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.countText, { color: colors.background }]}>{favorites.length}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.headerSubtitle, { color: colors.textDim }]}>
        {t('favorites_subtitle')}
      </Text>

      {/* Offline banner */}
      <View style={[styles.offlineBanner, isDarkMode ? {} : { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#BBF7D0' }]}>
        <Ionicons name="cloud-done" size={16} color={colors.success} />
        <Text style={[styles.offlineBannerText, isDarkMode ? {} : { color: '#166534' }]}>
          {t('favorites_offline')}
        </Text>
      </View>

      {/* Favorites List */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.teamId}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('favorites_empty_title')}</Text>
            <Text style={[styles.emptyText, { color: colors.textDim }]}>
              {t('favorites_empty_text')}
            </Text>
            <View style={[styles.emptyHint, { backgroundColor: colors.cardLight }]}>
              <Ionicons name="navigate" size={16} color={colors.primary} />
              <Text style={[styles.emptyHintText, { color: colors.textDim }]}>
                {t('favorites_empty_hint')}
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#052e16',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 12,
  },
  offlineBannerText: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  teamIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
    marginLeft: 14,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 5,
  },
  leagueName: {
    fontSize: 12,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  statChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statChipPositive: {
    backgroundColor: '#052e16',
  },
  statChipNegative: {
    backgroundColor: '#450a0a',
  },
  statChipTextPositive: {
    color: '#22C55E',
  },
  statChipTextNegative: {
    color: '#EF4444',
  },
  noteText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  removeButton: {
    padding: 6,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  emptyHintText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
