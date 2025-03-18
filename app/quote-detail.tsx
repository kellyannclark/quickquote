import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../backend/firebaseConfig";

interface Quote {
  quoteId: string;
  customer: {
    name: string;
    businessName: string;
    email: string;
    address: string;
  };
  createdAt: { seconds: number };
  finalPrice: number;
  windows: Record<string, number>;
}

export default function QuoteDetailScreen() {
  const { quoteId } = useLocalSearchParams();
  const normalizedQuoteId = Array.isArray(quoteId) ? quoteId[0] : quoteId; // ✅ Fix for Firestore reference issue
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!normalizedQuoteId || typeof normalizedQuoteId !== "string") return;

      try {
        const quoteRef = doc(db, "Quotes", normalizedQuoteId);
        const quoteSnap = await getDoc(quoteRef);

        if (quoteSnap.exists()) {
          setQuote(quoteSnap.data() as Quote);
        } else {
          setQuote(null);
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [normalizedQuoteId]);

  const handleDelete = async () => {
    if (!normalizedQuoteId) return;

    Alert.alert(
      "Delete Quote",
      "Are you sure you want to delete this quote?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Quotes", normalizedQuoteId));
              Alert.alert("Success", "Quote deleted successfully.");
              router.push('/my-quotes');
            } catch (error) {
              console.error("Error deleting quote:", error);
              Alert.alert("Error", "Failed to delete quote.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!normalizedQuoteId) return;
    router.push({ pathname: '/edit-quote', params: { quoteId: normalizedQuoteId } });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Quote not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/my-quotes')}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quote Details</Text>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Client Name:</Text>
        <Text style={styles.value}>{quote.customer?.name || "N/A"}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {quote.createdAt ? new Date(quote.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
        </Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Total Price:</Text>
        <Text style={styles.value}>${quote.finalPrice || "N/A"}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Window Details:</Text>
        <Text style={styles.value}>Number of Windows: {quote.windows ? Object.values(quote.windows).reduce((sum, val) => sum + val, 0) : "N/A"}</Text>

        <Text style={styles.label}>Window Types:</Text>
        {quote.windows && Object.entries(quote.windows).map(([type, count]) => (
          <Text key={type} style={styles.value}>
            {type}: {count}
          </Text>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/my-quotes')}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
});
