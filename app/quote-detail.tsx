import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../backend/firebaseConfig";
import { useThemeColor } from '@/hooks/useThemeColor';

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
  images?: { imageUrl: string; comment: string }[];
}

export default function QuoteDetailScreen() {
  const { quoteId } = useLocalSearchParams();
  const normalizedQuoteId = Array.isArray(quoteId) ? quoteId[0] : quoteId;
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const backgroundColor = useThemeColor(undefined, 'background');
  const textColor = useThemeColor(undefined, 'text');
  const secondaryColor = useThemeColor(undefined, 'secondary');

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

    Alert.alert("Delete Quote", "Are you sure you want to delete this quote?", [
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
    ]);
  };

  const handleEdit = () => {
    if (!normalizedQuoteId) return;
    router.push({ pathname: '/edit-quote', params: { quoteId: normalizedQuoteId } });
  };

  const handleImagePress = (url: string) => {
    setSelectedImage(url);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: 'red' }]}>Quote not found.</Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: secondaryColor }]} onPress={() => router.push('/my-quotes')}>
          <Text style={[styles.backButtonText, { color: textColor }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Quote Details</Text>

      {[
        { label: 'Client Name', value: quote.customer?.name },
        { label: 'Business Name', value: quote.customer?.businessName },
        { label: 'Email', value: quote.customer?.email },
        { label: 'Address', value: quote.customer?.address },
        {
          label: 'Date',
          value: quote.createdAt ? new Date(quote.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
        },
        { label: 'Total Price', value: `$${quote.finalPrice || 'N/A'}` },
        {
          label: 'Number of Windows',
          value: quote.windows ? Object.values(quote.windows).reduce((sum, val) => sum + val, 0).toString() : 'N/A'
        }
      ].map((item, idx) => (
        <View key={idx} style={styles.detailContainer}>
          <Text style={[styles.label, { color: textColor }]}>{item.label}:</Text>
          <Text style={[styles.value, { color: textColor }]}>{item.value}</Text>
        </View>
      ))}

      <View style={styles.detailContainer}>
        <Text style={[styles.label, { color: textColor }]}>Window Types:</Text>
        {quote.windows && Object.entries(quote.windows).map(([type, count]) => (
          <Text key={type} style={[styles.value, { color: textColor }]}>{type}: {count}</Text>
        ))}
      </View>

      {!!quote.images && quote.images.length > 0 && (
        <View style={styles.imageRow}>
          {quote.images.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => handleImagePress(img.imageUrl)}>
              <Image source={{ uri: img.imageUrl }} style={styles.imagePreview} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.editButton]} onPress={handleEdit}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.deleteButton]} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.backButton, { backgroundColor: secondaryColor }]} onPress={() => router.push('/my-quotes')}>
        <Text style={[styles.backButtonText, { color: textColor }]}>Go Back</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={{ uri: selectedImage || '' }} style={styles.fullImage} resizeMode="contain" />
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
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
  },
  value: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
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
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    position: 'relative',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
    lineHeight: 24,
  },
});
