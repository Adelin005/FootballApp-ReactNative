import React, { useState, useEffect, useCallback } from 'react';
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
import { getTeamsByLeague } from '../src/services/footballApi';
import {
  getFavorites,
  toggleFavorite,
  FavoriteTeam,
} from '../src/services/favoritesService';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

export default function LeagueTeamsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { t } = useLanguage();
  
  const { leagueId, leagueName } = useLocalSearchParams<{
    leagueId: string;
    leagueName: string;
  }>();

  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (leagueId) {
      loadTeams();
    }
    loadFavoriteIds();
  }, [leagueId]);

  const loadFavoriteIds = async () => {
    const favs = await getFavorites();
    setFavoriteIds(new Set(favs.map((f) => f.teamId)));
  };

  const loadTeams = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getTeamsByLeague(leagueId!);
      if (Array.isArray(data)) {
        setTeams(data);
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

  const handleToggleFavorite = useCallback(
    async (item: any) => {
      const teamId = item.team?.id || item.id || '';
      const teamName = item.team?.name || item.name || 'Unknown';

      const favTeam: FavoriteTeam = {
        teamId,
        teamName,
        leagueId: leagueId || '',
        leagueName: leagueName || '',
        position: item.position,
        points: item.points,
        win: item.win,
        draw: item.draw,
        loss: item.loss,
        goalsScored: item.goals_scored,
        goalsConceded: item.goals_conceded,
        note: item.note,
        savedAt: Date.now(),
      };

      const isNowFavorite = await toggleFavorite(favTeam);

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isNowFavorite) {
          next.add(teamId);
        } else {
          next.delete(teamId);
        }
        return next;
      });
    },
    [leagueId, leagueName]
  );

  const renderTeamItem = ({ item, index }: { item: any; index: number }) => {
    const teamId = item.team?.id || item.id || '';
    const teamName = item.team?.name || item.name || 'Unknown';
    const position = item.position || index + 1;
    const points = item.points ?? '-';
    const wins = item.win ?? '-';
    const draws = item.draw ?? '-';
    const losses = item.loss ?? '-';
    const isFav = favoriteIds.has(teamId);

    const getMedalColor = (pos: number) => {
      if (pos === 1) return '#FFD700'; // Gold
      if (pos === 2) return '#C0C0C0'; // Silver
      if (pos === 3) return '#CD7F32'; // Bronze
      return colors.textDim;
    };

    return (
      <View style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Position */}
        <View style={[styles.positionBadge, { borderColor: getMedalColor(position), backgroundColor: colors.backgroundCenter }]}>
          <Text style={[styles.positionText, { color: getMedalColor(position) }]}>
            {position}
          </Text>
        </View>

        {/* Team Icon & Name */}
        <View style={[styles.teamIconContainer, { backgroundColor: colors.cardLight }]}>
          <Ionicons name="shield" size={24} color={colors.primary} />
        </View>
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
            {teamName}
          </Text>
          {item.note ? (
            <Text
              style={[
                styles.noteText,
                { color: colors.textDim },
                item.note?.toLowerCase().includes('relegation') && { color: colors.error },
                item.note?.toLowerCase().includes('champions') && { color: colors.success },
              ]}
            >
              {item.note}
            </Text>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>{t('teams_stat_w')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{wins}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>{t('teams_stat_d')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{draws}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>{t('teams_stat_l')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{losses}</Text>
          </View>
          <View style={[styles.statRow, styles.pointsContainer]}>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>{t('teams_stat_pts')}</Text>
            <Text style={[styles.pointsValue, { color: colors.primary }]}>{points}</Text>
          </View>
        </View>

        {/* Favorite Star */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFav ? 'star' : 'star-outline'}
            size={22}
            color={isFav ? colors.accent : colors.textDim}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textDim }]}>{t('teams_loading')}</Text>
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
            {leagueName || t('teams_title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textDim }]}>
            {teams.length} {teams.length !== 1 ? t('teams_teams') : t('teams_team')} · {t('teams_standings')}
          </Text>
        </View>
        <Ionicons name="football" size={22} color={colors.primary} />
      </View>

      {/* Error State */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={48} color={colors.textDim} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>{t('teams_error_title')}</Text>
          <Text style={[styles.errorText, { color: colors.textDim }]}>
            {t('teams_error_text')}
          </Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadTeams}>
            <Ionicons name="refresh" size={18} color={colors.white} />
            <Text style={[styles.retryText, { color: colors.white }]}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item, index) => item.team?.id || index.toString()}
          renderItem={renderTeamItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="football-outline" size={48} color={colors.textDim} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('teams_no_teams_title')}</Text>
              <Text style={[styles.emptyText, { color: colors.textDim }]}>
                {t('teams_no_teams_text')}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  teamIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 10,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  statRow: {
    alignItems: 'center',
    minWidth: 22,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  pointsContainer: {
    minWidth: 26,
  },
  pointsValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  favoriteButton: {
    marginLeft: 8,
    padding: 4,
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