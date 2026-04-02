import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLeaguesByCountry } from '../src/services/footballApi';
import { useTheme } from '../src/context/ThemeContext';

export default function CountryLeaguesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { countryCode, countryName } = useLocalSearchParams<{
    countryCode: string;
    countryName: string;
  }>();

  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (countryCode) {
      loadLeagues();
    }
  }, [countryCode]);

  const loadLeagues = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getLeaguesByCountry(countryCode!);
      if (Array.isArray(data)) {
        setLeagues(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaguePress = (league: any) => {
    router.push({
      pathname: '/league-teams',
      params: {
        leagueId: league.id,
        leagueName: league.name,
      },
    });
  };

  const renderLeagueItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.leagueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleLeaguePress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.leagueIcon, { backgroundColor: colors.cardLight }, item.important && styles.leagueIconImportant]}>
        <Ionicons
          name="trophy"
          size={20}
          color={item.important ? colors.accent : colors.textDim}
        />
      </View>
      <View style={styles.leagueInfo}>
        <Text style={[styles.leagueName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.important && (
          <Text style={[styles.importantBadge, { color: colors.accent }]}>⭐ Major League</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textDim }]}>Loading leagues...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header with Back Button */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.cardLight }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {countryName || 'Leagues'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textDim }]}>
            {leagues.length} league{leagues.length !== 1 ? 's' : ''} available
          </Text>
        </View>
        <Ionicons name="trophy" size={22} color={colors.primary} />
      </View>

      {/* Error State */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={48} color={colors.textDim} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load leagues</Text>
          <Text style={[styles.errorText, { color: colors.textDim }]}>
            Check your internet connection and try again
          </Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadLeagues}>
            <Ionicons name="refresh" size={18} color={colors.white} />
            <Text style={[styles.retryText, { color: colors.white }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={leagues}
          keyExtractor={(item) => item.id}
          renderItem={renderLeagueItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={48} color={colors.textDim} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No leagues found</Text>
              <Text style={[styles.emptyText, { color: colors.textDim }]}>
                There are no leagues available for {countryName}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  leagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  leagueIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueIconImportant: {
    backgroundColor: '#FEF3C7',
  },
  leagueInfo: {
    flex: 1,
    marginLeft: 14,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: '600',
  },
  importantBadge: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});