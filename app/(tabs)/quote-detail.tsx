import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import quotesData from '../../assets/data/mockQuotes.json';

export default function QuoteDetailScreen() {
  const { quoteId } = useLocalSearchParams();
  const router = useRouter();

  const quote = quotesData.find(q => q.quoteId === quoteId);

  if (!quote) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Quote not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        <Text style={styles.value}>{quote.clientName}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{quote.date}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Total Price:</Text>
        <Text style={styles.value}>${quote.price}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Window Details:</Text>
        <Text style={styles.value}>Number of Windows: {quote.windowDetails.numberOfWindows}</Text>

        <Text style={styles.label}>Window Types:</Text>
        {Object.entries(quote.windowDetails.windowTypes).map(([type, count]) => (
          <Text key={type} style={styles.value}>
            {type}: {count}
          </Text>
        ))}

        <Text style={styles.label}>Pricing Breakdown:</Text>
        {Object.entries(quote.windowDetails.pricingBreakdown).map(([key, value]) => (
            <Text key={key} style={styles.value}>
            {key}: ${value}
            </Text>
        ))}
      </View>

      {/* Display Images */}
      {quote.images && quote.images.length > 0 && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Images:</Text>
          <ScrollView horizontal>
            {quote.images.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => console.log("Open Image Fullscreen")}>
                <Image source={{ uri: image }} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => console.log("Edit Quote")}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => console.log("Delete Quote")}>
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
  imageContainer: {
    marginTop: 15,
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
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
