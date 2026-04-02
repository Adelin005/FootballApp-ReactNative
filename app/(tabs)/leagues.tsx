import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCountries } from '../../src/services/footballApi';
import { getFlagUrl } from '../../src/utils/footballUtils';
import { useTheme } from '../../src/context/ThemeContext';

export default function LeaguesTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  
  const [countries, setCountries] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(countries);
    } else {
      const q = search.toLowerCase();
      setFiltered(countries.filter((c: any) => c.name?.toLowerCase().includes(q)));
    }
  }, [search, countries]);

  const loadCountries = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getCountries();
      if (Array.isArray(data) && data.length > 0) {
        // Sort by name and filter out countries with 0 championships
        const sorted = data
          .filter((c: any) => c.championships > 0)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(sorted);
        setFiltered(sorted);
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

  const handleCountryPress = (country: any) => {
    router.push({
      pathname: '/country-leagues',
      params: {
        countryCode: country.code,
        countryName: country.name,
      },
    });
  };

  const renderCountryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.countryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleCountryPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: getFlagUrl(item.code || 'un') }}
        style={[styles.flag, { backgroundColor: colors.border }]}
        resizeMode="cover"
      />
      <View style={styles.countryInfo}>
        <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.countryMeta, { color: colors.textDim }]}>
          {item.championships} league{item.championships !== 1 ? 's' : ''} · {item.teams} teams
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textDim }]}>Loading countries...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="earth" size={24} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Choose a Country</Text>
      </View>
      <Text style={[styles.headerSubtitle, { color: colors.textDim }]}>
        Select a country to explore its football leagues
      </Text>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardLight }]}>
        <Ionicons name="search" size={18} color={colors.textDim} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search countries..."
          placeholderTextColor={colors.textDim}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textDim} />
          </TouchableOpacity>
        )}
      </View>

      {/* Error State */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={48} color={colors.textDim} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load countries</Text>
          <Text style={[styles.errorText, { color: colors.textDim }]}>Check your internet connection and try again</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadCountries}>
            <Ionicons name="refresh" size={18} color={colors.white} />
            <Text style={[styles.retryText, { color: colors.white }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          renderItem={renderCountryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={colors.textDim} />
              <Text style={[styles.emptyText, { color: colors.textDim }]}>No countries found for "{search}"</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  flag: {
    width: 42,
    height: 28,
    borderRadius: 4,
  },
  countryInfo: {
    flex: 1,
    marginLeft: 14,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  countryMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
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