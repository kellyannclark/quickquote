import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Platform, Image,
  GestureResponderEvent
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../backend/firebaseConfig";
import { useThemeColor } from '@/hooks/useThemeColor';
import { calculateQuoteTotal } from '../utils/quoteCalculator';

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
  quoteDetails?: {
    interior?: boolean;
    dirtLevel?: 1 | 2 | 3;
    isAccessible?: boolean;
    hasContract?: boolean;
    extraCharge?: number;
  };
}

interface ImageUpload {
  file: File;
  previewUrl: string;
  comment: string;
}
interface WindowCounts {
  XS: number;
  SM: number;
  MD: number;
  LG: number;
  XL: number;
  [key: string]: number;
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
  const [rates, setRates] = useState<any>(null);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const ratesRef = doc(db, 'Rates', user.uid);
          const ratesSnap = await getDoc(ratesRef);
          if (ratesSnap.exists()) {
            setRates(ratesSnap.data());
          }
        }

        if (!normalizedQuoteId || typeof normalizedQuoteId !== "string") return;
        const quoteRef = doc(db, "Quotes", normalizedQuoteId);
        const quoteSnap = await getDoc(quoteRef);

        if (quoteSnap.exists()) {
          const data = quoteSnap.data() as Quote;
          setQuote(data);
          setForm({ ...data });
          setTotal(data.finalPrice || 0);
        } else {
          setQuote(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [normalizedQuoteId]);

  const calculateTotal = useCallback(() => {
    if (!rates || !form.windows) return;

    const windowCounts: WindowCounts = {
      XS: form.windows.XS || 0,
      SM: form.windows.SM || 0,
      MD: form.windows.MD || 0,
      LG: form.windows.LG || 0,
      XL: form.windows.XL || 0,
      ...form.windows
    };

    const totalPrice = calculateQuoteTotal(
      rates,
      windowCounts,
      {
        interior: form.quoteDetails?.interior || false,
        dirtLevel: form.quoteDetails?.dirtLevel || 1,
        isAccessible: form.quoteDetails?.isAccessible || false,
        hasContract: form.quoteDetails?.hasContract || false,
        extraCharge: form.quoteDetails?.extraCharge || 0,
      }
    );

    setTotal(totalPrice);
    setForm(prev => ({ ...prev, finalPrice: totalPrice }));
  }, [rates, form.windows, form.quoteDetails]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  const handleWindowCountChange = (type: string, value: string) => {
    setForm(prev => ({
      ...prev,
      windows: {
        ...(prev.windows || {}),
        [type]: parseInt(value) || 0
      }
    }));
  };

  const handleQuoteDetailChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      quoteDetails: {
        ...(prev.quoteDetails || {}),
        [field]: value
      }
    }));
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
      await updateDoc(quoteRef, {
        ...form,
        finalPrice: total,
        images: updatedImages
      });
      Alert.alert("Success", "Quote updated successfully.");
      router.push(`/quote-detail?quoteId=${normalizedQuoteId}`);
    } catch (error) {
      console.error("Error updating quote:", error);
      Alert.alert("Error", "Failed to update quote.");
    }
  };

  function handleDeleteQuote(event: GestureResponderEvent): void {
    throw new Error("Function not implemented.");
  }

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

      <View style={[styles.totalContainer, { borderColor }]}>
        <Text style={[styles.totalLabel, { color: textColor }]}>Quote Total:</Text>
        <Text style={[styles.totalAmount, { color: '#2ecc71' }]}>${total.toFixed(2)}</Text>
      </View>

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
        <Text style={[styles.label, { color: textColor }]}>Windows:</Text>
        {quote?.windows &&
          Object.entries(quote.windows).map(([type, count]) => (
            <View key={type} style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>{type}:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                keyboardType="numeric"
                value={String(form.windows?.[type] ?? count)}
                onChangeText={(text) => handleWindowCountChange(type, text)}
              />
            </View>
          ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: textColor }]}>Extra Charge ($):</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
          keyboardType="numeric"
          value={String(form.quoteDetails?.extraCharge || 0)}
          onChangeText={(text) => handleQuoteDetailChange('extraCharge', parseFloat(text) || 0)}
        />
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
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#2ecc71' }]} onPress={handleUpdate}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: '#e74c3c' }]} onPress={handleDeleteQuote}>
          <Text style={styles.btnText}>Delete Quote</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: '#6c757d' }]} onPress={() => router.push('/my-quotes')}>
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
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 24,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
  },
  totalLabel: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  totalAmount: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#000000',
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    backgroundColor: '#ffffff',
    borderColor: '#1e3a8a',
    color: '#000000',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginRight: 10,
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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a8a',
    marginHorizontal: 5,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Regular',
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
