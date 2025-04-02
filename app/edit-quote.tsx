import React, { useState, useEffect, ChangeEvent } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Platform, Image
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../backend/firebaseConfig";
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

interface ImageUpload {
  file: File;
  previewUrl: string;
  comment: string;
}

export default function EditQuoteScreen() {
  const { quoteId } = useLocalSearchParams();
  const normalizedQuoteId = Array.isArray(quoteId) ? quoteId[0] : quoteId;
  const router = useRouter();

  const textColor = useThemeColor(undefined, 'text');
  const backgroundColor = useThemeColor(undefined, 'background');
  const inputBg = useThemeColor(undefined, 'background');
  const borderColor = useThemeColor(undefined, 'secondary');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Quote>>({});
  const [newImages, setNewImages] = useState<ImageUpload[]>([]);

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
      let updatedImages = form.images || [];

      if (newImages.length > 0) {
        const uploaded = await Promise.all(
          newImages.map(async (img) => {
            const storageRef = ref(storage, `quotes/${normalizedQuoteId}/${Date.now()}_${img.file.name}`);
            await uploadBytes(storageRef, img.file);
            const downloadURL = await getDownloadURL(storageRef);
            return { imageUrl: downloadURL, comment: img.comment };
          })
        );
        updatedImages = [...updatedImages, ...uploaded];
      }

      const quoteRef = doc(db, "Quotes", normalizedQuoteId);
      await updateDoc(quoteRef, { ...form, images: updatedImages });
      Alert.alert("Success", "Quote updated successfully.");
      router.push(`/quote-detail?quoteId=${normalizedQuoteId}`);
    } catch (error) {
      console.error("Error updating quote:", error);
      Alert.alert("Error", "Failed to update quote.");
    }
  };

  const handleImageCommentChange = (index: number, text: string) => {
    if (!form.images) return;
    const updated = [...form.images];
    updated[index].comment = text;
    setForm((prev) => ({ ...prev, images: updated }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => {
      const currentImages = prev.images ?? [];
      const updatedImages = currentImages.filter((_, i) => i !== index);
      return { ...prev, images: updatedImages };
    });
  };

  const handleDeleteQuote = () => {
    Alert.alert("Delete Quote", "Are you sure you want to delete this entire quote?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Quotes", normalizedQuoteId));
            Alert.alert("Deleted", "Quote deleted successfully.");
            router.push("/my-quotes");
          } catch (error) {
            console.error("Error deleting quote:", error);
            Alert.alert("Error", "Failed to delete quote.");
          }
        },
      },
    ]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const uploads: ImageUpload[] = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      comment: "",
    }));
    setNewImages((prev) => [...prev, ...uploads]);
  };

  const handleNewImageCommentChange = (index: number, text: string) => {
    const updated = [...newImages];
    updated[index].comment = text;
    setNewImages(updated);
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: 'red' }]}>Quote not found.</Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: '#333' }]} onPress={() => router.push('/my-quotes')}>
          <Text style={[styles.backButtonText, { color: textColor }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Edit Quote</Text>

      {["name", "businessName", "email", "address"].map((field) => (
        <View key={field} style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>{field.charAt(0).toUpperCase() + field.slice(1)}:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
            value={form.customer?.[field as keyof typeof form.customer] ?? ""}
            onChangeText={(text) =>
              setForm((prev) => ({
                ...prev,
                customer: {
                  ...(prev.customer ?? { name: "", businessName: "", email: "", address: "" }),
                  [field]: text ?? "",
                },
              }))
            }
          />
        </View>
      ))}

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: textColor }]}>Total Price:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
          keyboardType="numeric"
          value={form.finalPrice?.toString() ?? ""}
          onChangeText={(text) => setForm((prev) => ({ ...prev, finalPrice: parseFloat(text) || 0 }))}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: textColor }]}>Windows:</Text>
        {quote.windows &&
          Object.entries(quote.windows).map(([type, count]) => (
            <View key={type} style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>{type}:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
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

      {!!form.images && form.images.length > 0 && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Images:</Text>
          {form.images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: img.imageUrl }} style={styles.imagePreview} />
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: inputBg, borderColor, color: textColor }]}
                value={img.comment}
                onChangeText={(text) => handleImageCommentChange(index, text)}
                placeholder="Comment"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {Platform.OS === "web" && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Add New Images</Text>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ marginBottom: 10 }} />
          {newImages.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: img.previewUrl }} style={styles.imagePreview} />
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: inputBg, borderColor, color: textColor }]}
                value={img.comment}
                onChangeText={(text) => handleNewImageCommentChange(index, text)}
                placeholder="Comment"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveNewImage(index)}>
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: "#2ecc71" }]} onPress={handleUpdate}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: "#e74c3c" }]} onPress={handleDeleteQuote}>
          <Text style={styles.btnText}>Delete Quote</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: "#777" }]} onPress={() => router.push('/my-quotes')}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: 'cover',
  },
  removeImageButton: {
    backgroundColor: '#e74c3c',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
});
