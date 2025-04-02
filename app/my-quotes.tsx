import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from "../backend/firebaseConfig";
import { collection, query, where, onSnapshot, DocumentData } from "firebase/firestore";
import { useThemeColor } from '@/hooks/useThemeColor';

interface Quote {
  id: string;
  quoteId: string;
  customer: {
    name: string;
  };
  finalPrice: number;
  createdAt: any;
  images?: { imageUrl: string; comment: string }[];
}

export default function MyQuotesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'date' | 'price'>('date');
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor(undefined, 'background');
  const textColor = useThemeColor(undefined, 'text');
  const borderColor = useThemeColor(undefined, 'secondary');
  const accentColor = useThemeColor(undefined, 'secondary');

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
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          images: data.images || []
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
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>My Quotes</Text>

      <TextInput
        style={[styles.search, { borderColor, backgroundColor: '#1e1e1e', color: textColor }]}
        placeholder="Search by Client Name or Quote ID"
        placeholderTextColor="#aaa"
        onChangeText={setSearch}
        value={search}
      />

      <View style={styles.sortButtons}>
        <TouchableOpacity style={[styles.sortButton, { backgroundColor: accentColor }]} onPress={() => setSortType('date')}>
          <Text style={styles.sortText}>Sort by Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sortButton, { backgroundColor: accentColor }]} onPress={() => setSortType('price')}>
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
              style={[styles.quoteItem, { backgroundColor: '#1e1e1e', borderColor }]}
              onPress={() => router.push({ pathname: '/quote-detail', params: { quoteId: item.id } })}
            >
              <Text style={[styles.quoteId, { color: textColor }]}>{item.quoteId}</Text>
              <Text style={{ color: textColor }}>{item.customer.name}</Text>
              <Text style={{ color: textColor }}>{item.createdAt.toLocaleDateString()}</Text>
              <Text style={{ color: textColor }}>${item.finalPrice.toFixed(2)}</Text>

              {!!item.images && item.images.length > 0 && (
                <View style={styles.imageRow}>
                  {item.images.map((img, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: img.imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                    </View>
                  ))}
                </View>
              )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  search: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  sortButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },
  sortText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  quoteItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  quoteId: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: 'cover',
  },
});
