import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from "../../backend/firebaseConfig";
import { collection, query, where, onSnapshot, DocumentData } from "firebase/firestore";

interface Quote {
  id: string;
  quoteId: string;
  customer: {
    name: string;
  };
  finalPrice: number;
  createdAt: any;
}


export default function MyQuotesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'date' | 'price'>('date');
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    const q = query(collection(db, "Quotes"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let quotes: Quote[] = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          quoteId: data.quoteId || doc.id,
          customer: data.customer || { name: "Unknown" },
          finalPrice: data.finalPrice || 0,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
        };
      });

      quotes = quotes.filter(quote =>
        quote.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        quote.quoteId.toLowerCase().includes(search.toLowerCase())
      );

      quotes.sort((a, b) => {
        if (sortType === 'price') {
          return a.finalPrice - b.finalPrice;
        } else {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
      });

      setFilteredQuotes(quotes);
      setLoading(false);
    });

    return () => unsubscribe();
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

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={filteredQuotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quoteItem}
              onPress={() => router.push({ pathname: '/quote-detail', params: { quoteId: item.id } })}
            >
              <Text style={styles.quoteId}>{item.quoteId}</Text>
              <Text>{item.customer.name}</Text>
              <Text>{item.createdAt.toLocaleDateString()}</Text>
              <Text>${item.finalPrice.toFixed(2)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
