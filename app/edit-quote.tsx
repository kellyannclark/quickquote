import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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

export default function EditQuoteScreen() {
  const { quoteId } = useLocalSearchParams();
  const normalizedQuoteId = Array.isArray(quoteId) ? quoteId[0] : quoteId;
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Quote>>({});

  useEffect(() => {
    const fetchQuote = async () => {
      if (!normalizedQuoteId || typeof normalizedQuoteId !== "string") return;

      try {
        const quoteRef = doc(db, "Quotes", normalizedQuoteId);
        const quoteSnap = await getDoc(quoteRef);

        if (quoteSnap.exists()) {
          const data = quoteSnap.data() as Quote;
          setQuote(data);
          setForm({ ...data }); 
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

  const handleUpdate = async () => {
    if (!normalizedQuoteId || !form) return;

    try {
      const quoteRef = doc(db, "Quotes", normalizedQuoteId);
      await updateDoc(quoteRef, form);
      Alert.alert("Success", "Quote updated successfully.");
      router.push(`/quote-detail?quoteId=${normalizedQuoteId}`);
    } catch (error) {
      console.error("Error updating quote:", error);
      Alert.alert("Error", "Failed to update quote.");
    }
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
      <Text style={styles.title}>Edit Quote</Text>

      {/* Client Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Client Name:</Text>
        <TextInput
          style={styles.input}
          value={form.customer?.name ?? ""}
          onChangeText={(text) => setForm((prev) => ({
            ...prev,
            customer: { ...(prev.customer || { name: "", businessName: "", email: "", address: "" }), name: text }
          }))}
        />
      </View>

      {/* Business Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Business Name:</Text>
        <TextInput
          style={styles.input}
          value={form.customer?.businessName ?? ""}
          onChangeText={(text) => setForm((prev) => ({
            ...prev,
            customer: { ...(prev.customer || { name: "", businessName: "", email: "", address: "" }), businessName: text }
          }))}
        />
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={form.customer?.email ?? ""}
          onChangeText={(text) => setForm((prev) => ({
            ...prev,
            customer: { ...(prev.customer || { name: "", businessName: "", email: "", address: "" }), email: text }
          }))}
        />
      </View>

      {/* Address */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address:</Text>
        <TextInput
          style={styles.input}
          value={form.customer?.address ?? ""}
          onChangeText={(text) => setForm((prev) => ({
            ...prev,
            customer: { ...(prev.customer || { name: "", businessName: "", email: "", address: "" }), address: text }
          }))}
        />
      </View>

      {/* Total Price */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Total Price:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={form.finalPrice?.toString() ?? ""}
          onChangeText={(text) => setForm((prev) => ({
            ...prev,
            finalPrice: parseFloat(text) || 0
          }))}
        />
      </View>

      {/* Windows */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Windows:</Text>
        {quote.windows &&
          Object.entries(quote.windows).map(([type, count]) => (
            <View key={type} style={styles.windowInput}>
              <Text style={styles.windowLabel}>{type}:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(form.windows?.[type] ?? count)}
                onChangeText={(text) =>
                  setForm((prev) => ({
                    ...prev,
                    windows: { ...(prev.windows || {}), [type]: parseInt(text) || 0 },
                  }))
                }
              />
            </View>
          ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/my-quotes')}>
        <Text style={styles.backButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: "#f8f8f8",
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      backgroundColor: "#fff",
    },
    windowInput: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    windowLabel: {
      fontSize: 16,
      fontWeight: "bold",
    },
    buttonContainer: {
      marginTop: 20,
    },
    saveButton: {
      backgroundColor: "#007AFF",
      padding: 10,
      borderRadius: 8,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
    },
    backButton: {
      marginTop: 20,
      backgroundColor: "#ccc",
      padding: 10,
      borderRadius: 8,
    },
    backButtonText: {
      textAlign: "center",
      fontWeight: "bold",
    },
    errorText: {
      textAlign: "center",
      fontSize: 18,
      fontWeight: "bold",
      color: "red",
      marginBottom: 20,
    },
  });
  