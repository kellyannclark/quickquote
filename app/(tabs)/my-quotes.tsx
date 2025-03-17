import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import quotesData from '../../assets/data/mockQuotes.json';

export default function MyQuotesScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'date' | 'price'>('date');
  const [filteredQuotes, setFilteredQuotes] = useState(quotesData);

  useEffect(() => {
    let filtered = quotesData.filter(
      quote =>
        quote.clientName.toLowerCase().includes(search.toLowerCase()) ||
        quote.quoteId.toLowerCase().includes(search.toLowerCase())
    );

    filtered = filtered.sort((a, b) => {
      if (sortType === 'price') {
        return a.price - b.price;
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    setFilteredQuotes(filtered);
  }, [search, sortType]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Quotes</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by Client Name or Quote ID"
        onChangeText={setSearch}
        value={search}
      />

      <View style={styles.sortButtons}>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortType('date')}>
          <Text style={styles.sortText}>Sort by Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortType('price')}>
          <Text style={styles.sortText}>Sort by Price</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.quoteId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.quoteItem}
            onPress={() => router.push({ pathname: '/quote-detail', params: { quoteId: item.quoteId } })}
          >
            <Text style={styles.quoteId}>{item.quoteId}</Text>
            <Text>{item.clientName}</Text>
            <Text>{item.date}</Text>
            <Text>${item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sortButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  sortText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  quoteItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  quoteId: {
    fontWeight: 'bold',
  },
});
