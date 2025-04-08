import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Platform, Image } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { auth, db, storage } from '@/backend/firebaseConfig';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { calculateQuoteTotal } from '../utils/quoteCalculator';

// Type definitions
interface WindowCounts {
  XS: string;
  SM: string;
  MD: string;
  LG: string;
  XL: string;
}

interface QuoteDetails {
  interior: boolean;
  dirtLevel: 1 | 2 | 3;
  isAccessible: boolean;
  hasContract: boolean;
  extraCharge: string;
}

interface Customer {
  name: string;
  email: string;
  businessName: string;
  address: string;
}

interface ImageUpload {
  file: File;
  comment: string;
  previewUrl: string;
}

export default function MakeAQuoteScreen() {
  const [rates, setRates] = useState<any>(null);
  const [windowCounts, setWindowCounts] = useState<WindowCounts>({
    XS: '0', SM: '0', MD: '0', LG: '0', XL: '0'
  });

  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>({
    interior: false,
    dirtLevel: 1,
    isAccessible: false,
    hasContract: false,
    extraCharge: '',
  });

  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    businessName: '',
    address: '',
  });

  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const textColor = useThemeColor(undefined, 'text');
  const backgroundColor = useThemeColor(undefined, 'background');
  const inputBg = useThemeColor(undefined, 'background');
  const borderColor = useThemeColor(undefined, 'secondary');

  // Calculate total whenever relevant inputs change
  const calculateTotal = useCallback(() => {
    if (!rates) return;

    const parsedCounts = {
      XS: parseInt(windowCounts.XS) || 0,
      SM: parseInt(windowCounts.SM) || 0,
      MD: parseInt(windowCounts.MD) || 0,
      LG: parseInt(windowCounts.LG) || 0,
      XL: parseInt(windowCounts.XL) || 0,
    };

    const parsedExtraCharge = parseFloat(quoteDetails.extraCharge) || 0;

    const totalPrice = calculateQuoteTotal(
      rates,
      parsedCounts,
      {
        interior: quoteDetails.interior,
        dirtLevel: quoteDetails.dirtLevel,
        isAccessible: quoteDetails.isAccessible,
        hasContract: quoteDetails.hasContract,
        extraCharge: parsedExtraCharge,
      }
    );

    

    setTotal(totalPrice);
  }, [rates, windowCounts, quoteDetails]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchRates = async () => {
        try {
          const docRef = doc(db, 'Rates', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRates(docSnap.data());
          } else {
            Alert.alert('Error', 'No rate data found. Please customize your rates first.');
          }
        } catch (error) {
          console.error('Error fetching rates:', error);
          Alert.alert('Error', 'Failed to load rate data.');
        } finally {
          setLoading(false);
        }
      };
      fetchRates();
    } else {
      setLoading(false);
      Alert.alert('Error', 'You must be logged in to create quotes.');
    }
  }, []);

  const handleWindowCountChange = (key: keyof WindowCounts, value: string) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setWindowCounts(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleQuoteDetailChange = <K extends keyof QuoteDetails>(key: K, value: QuoteDetails[K]) => {
    setQuoteDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomerDetailChange = <K extends keyof Customer>(key: K, value: Customer[K]) => {
    setCustomer(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setWindowCounts({ XS: '0', SM: '0', MD: '0', LG: '0', XL: '0' });
    setQuoteDetails({
      interior: false,
      dirtLevel: 1,
      isAccessible: false,
      hasContract: false,
      extraCharge: '',
    });
    setCustomer({
      name: '',
      email: '',
      businessName: '',
      address: '',
    });
    setImageUploads([]);
    setTotal(0);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save quotes.');
      return;
    }

    if (total <= 0) {
      Alert.alert('Error', 'Please calculate a valid total before saving.');
      return;
    }

    setIsSaving(true);

    try {
      let uploadedImages: { imageUrl: string; comment: string }[] = [];

      // Upload images to Firebase Storage if there are any
      if (imageUploads.length > 0) {
        await Promise.all(
          imageUploads.map(async (item) => {
            const storageRef = ref(storage, `quotes/${user.uid}/${Date.now()}_${item.file.name}`);
            await uploadBytes(storageRef, item.file);
            const downloadURL = await getDownloadURL(storageRef);
            uploadedImages.push({ imageUrl: downloadURL, comment: item.comment });
          })
        );
      }

      const quoteData = {
        userId: user.uid,
        windows: {
          XS: parseInt(windowCounts.XS) || 0,
          SM: parseInt(windowCounts.SM) || 0,
          MD: parseInt(windowCounts.MD) || 0,
          LG: parseInt(windowCounts.LG) || 0,
          XL: parseInt(windowCounts.XL) || 0,
        },
        quoteDetails: {
          interior: quoteDetails.interior,
          dirtLevel: quoteDetails.dirtLevel,
          isAccessible: quoteDetails.isAccessible,
          hasContract: quoteDetails.hasContract,
          extraCharge: parseFloat(quoteDetails.extraCharge) || 0,
        },
        finalPrice: total,
        customer: {
          ...customer,
          email: customer.email.toLowerCase().trim(),
        },
        images: uploadedImages,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'Quotes'), quoteData);
      Alert.alert("Success", "Quote has been saved successfully.");
      handleReset();
    } catch (error) {
      console.error("Error saving quote:", error);
      Alert.alert("Error", "Failed to save quote. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUploads = Array.from(files).map(file => ({
        file,
        comment: '',
        previewUrl: URL.createObjectURL(file),
      }));
      setImageUploads(prev => [...prev, ...newUploads]);
    }
  };


  const handleRemoveImage = (index: number) => {
    setImageUploads(prev => prev.filter((_, i) => i !== index));
  };

  const handleCommentChange = (index: number, comment: string) => {
    setImageUploads(prev => {
      const newUploads = [...prev];
      newUploads[index].comment = comment;
      return newUploads;
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: textColor }}>Loading rates...</Text>
      </View>
    );
  }

  if (!rates) {
    return (
      <View style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: textColor, textAlign: 'center', padding: 20 }}>
          No rate data found. Please customize your rates first.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Make a Quote</Text>

      <Text style={[styles.totalText, { color: textColor }]}>Total: ${total.toFixed(2)}</Text>

      <Text style={[styles.sectionHeader, { color: textColor }]}>Window Counts</Text>
      {(['XS', 'SM', 'MD', 'LG', 'XL'] as const).map(size => (
        <View key={size} style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>{size} Windows</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor }]}
            keyboardType="numeric"
            value={windowCounts[size]}
            onChangeText={value => handleWindowCountChange(size, value)}
            placeholder="0"
            placeholderTextColor="#999"
          />
        </View>
      ))}

      <Text style={[styles.sectionHeader, { color: textColor }]}>Customer Information</Text>
      {(['name', 'email', 'businessName', 'address'] as const).map(field => (
        <View key={field} style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>
            {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor }]}
            value={customer[field]}
            onChangeText={value => handleCustomerDetailChange(field, value)}
            placeholder={field === 'email' ? 'example@email.com' : ''}
            placeholderTextColor="#999"
            keyboardType={field === 'email' ? 'email-address' : 'default'}
          />
        </View>
      ))}

      <Text style={[styles.sectionHeader, { color: textColor }]}>Quote Details</Text>
      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: textColor }]}>Include Interior Windows?</Text>
        <Switch
          value={quoteDetails.interior}
          onValueChange={(val) => handleQuoteDetailChange('interior', val)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: textColor }]}>Dirt Level (1-3)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor }]}
          keyboardType="numeric"
          value={quoteDetails.dirtLevel.toString()}
          onChangeText={(val) => {
            const num = parseInt(val);
            if (num >= 1 && num <= 3) {
              handleQuoteDetailChange('dirtLevel', num as 1 | 2 | 3);
            }
          }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: textColor }]}>Accessibility Charge?</Text>
        <Switch
          value={quoteDetails.isAccessible}
          onValueChange={(val) => handleQuoteDetailChange('isAccessible', val)}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: textColor }]}>Contract Discount?</Text>
        <Switch
          value={quoteDetails.hasContract}
          onValueChange={(val) => handleQuoteDetailChange('hasContract', val)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: textColor }]}>Extra Charge ($)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor }]}
          keyboardType="decimal-pad"
          value={quoteDetails.extraCharge}
          onChangeText={(val) => handleQuoteDetailChange('extraCharge', val.replace(/[^0-9.]/g, ''))}
          placeholder="0"
          placeholderTextColor="#999"
        />
      </View>

      {Platform.OS === 'web' && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Upload Images (optional)</Text>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ marginBottom: 10 }}
          />
          {imageUploads.map((item, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: item.previewUrl }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, flex: 1 }]}
                placeholder="Enter comment (optional)"
                placeholderTextColor="#999"
                value={item.comment}
                onChangeText={(val) => handleCommentChange(index, val)}
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: '#38b6ff' }]} 
          onPress={calculateTotal}
        >
          <Text style={styles.btnText}>Recalculate</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: '#2ecc71' }]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.btnText}>
            {isSaving ? 'Saving...' : 'Save Quote'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: '#e74c3c' }]} 
          onPress={handleReset}
        >
          <Text style={styles.btnText}>Reset</Text>
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
    paddingTop: 40,
    backgroundColor: '#ffffff', // White background
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000000',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 20,
    color: '#000000',
    fontFamily: 'Roboto-Regular',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    backgroundColor: '#ffffff',
    color: '#000000',
    borderColor: '#1e3a8a', // Deep Blue
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 23,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginVertical: 15,
    fontFamily: 'Roboto-Regular',
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
});
