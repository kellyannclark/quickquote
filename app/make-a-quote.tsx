import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Platform, Image } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { auth, db, storage } from '@/backend/firebaseConfig';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { calculateQuoteTotal } from '../utils/quoteCalculator';

export default function MakeAQuoteScreen() {
  const [rates, setRates] = useState<any>(null);
  const [windowCounts, setWindowCounts] = useState({
    XS: '0', SM: '0', MD: '0', LG: '0', XL: '0'
  });

  const [quoteDetails, setQuoteDetails] = useState({
    interior: false,
    dirtLevel: 1,
    isAccessible: false,
    hasContract: false,
    extraCharge: '',
  });

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    businessName: '',
    address: '',
  });

  const [imageUploads, setImageUploads] = useState<{ file: File; comment: string; previewUrl: string }[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const textColor = useThemeColor(undefined, 'text');
  const backgroundColor = useThemeColor(undefined, 'background');
  const inputBg = useThemeColor(undefined, 'background');
  const borderColor = useThemeColor(undefined, 'secondary');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchRates = async () => {
        const docRef = doc(db, 'Rates', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRates(docSnap.data());
        } else {
          Alert.alert('Error', 'No rate data found. Please customize your rates first.');
        }
        setLoading(false);
      };
      fetchRates();
    }
  }, []);

  const handleWindowCountChange = (key: string, value: string) => {
    setWindowCounts(prev => ({ ...prev, [key]: value }));
  };

  const handleQuoteDetailChange = (key: string, value: any) => {
    setQuoteDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomerDetailChange = (key: string, value: string) => {
    setCustomer(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
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
        dirtLevel: quoteDetails.dirtLevel as 1 | 2 | 3,
        isAccessible: quoteDetails.isAccessible,
        hasContract: quoteDetails.hasContract,
        extraCharge: parsedExtraCharge,
      }
    );

    setTotal(totalPrice);
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
    if (!user) return;

    try {
      let uploadedImages: { imageUrl: string; comment: string }[] = [];

      // Upload images to Firebase Storage
      for (const item of imageUploads) {
        const file = item.file;
        const comment = item.comment;
        const storageRef = ref(storage, `quotes/${user.uid}_${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedImages.push({ imageUrl: downloadURL, comment });
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
        },
        finalPrice: total,
        extraCharge: parseFloat(quoteDetails.extraCharge) || 0,
        createdAt: Timestamp.now(),
        customer,
        images: uploadedImages,
      };

      await addDoc(collection(db, 'Quotes'), quoteData);
      Alert.alert("Success", "Quote saved to Firestore.");
      handleReset();
    } catch (error) {
      console.error("Error saving quote:", error);
      Alert.alert("Error", "Failed to save quote.");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newUploads = Array.from(files).map(file => ({
        file,
        comment: '',
        previewUrl: URL.createObjectURL(file),
      }));
      setImageUploads(newUploads);
    }
  };

  const handleCommentChange = (index: number, comment: string) => {
    setImageUploads(prev => {
      const newUploads = [...prev];
      newUploads[index].comment = comment;
      return newUploads;
    });
  };

  if (loading) return <Text style={{ padding: 20 }}>Loading rates...</Text>;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Make a Quote</Text>

      {['XS', 'SM', 'MD', 'LG', 'XL'].map(size => (
        <View key={size} style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>{size} Windows</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor }]}
            keyboardType="numeric"
            value={windowCounts[size as keyof typeof windowCounts]}
            onChangeText={value => handleWindowCountChange(size, value)}
            placeholder="0"
            placeholderTextColor="#999"
          />
        </View>
      ))}

      {['name', 'email', 'businessName', 'address'].map(field => (
        <View key={field} style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor }]}
            value={customer[field as keyof typeof customer]}
            onChangeText={value => handleCustomerDetailChange(field, value)}
            placeholder={field === 'email' ? 'example@email.com' : ''}
            placeholderTextColor="#999"
          />
        </View>
      ))}

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
          onChangeText={(val) =>
            handleQuoteDetailChange('dirtLevel', Math.max(1, Math.min(3, parseInt(val) || 1)))
          }
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
          keyboardType="numeric"
          value={quoteDetails.extraCharge}
          onChangeText={(val) => handleQuoteDetailChange('extraCharge', val)}
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
          />
          {imageUploads.map((item, index) => (
            <View key={index} style={{ marginTop: 10 }}>
              <Image
                source={{ uri: item.previewUrl }}
                style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 10, objectFit: 'cover' }}
                resizeMode="cover"
              />
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor }]}
                placeholder="Enter comment (optional)"
                placeholderTextColor="#999"
                value={item.comment}
                onChangeText={(val) => handleCommentChange(index, val)}
              />
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleCalculate}>
        <Text style={styles.btnText}>Calculate Quote</Text>
      </TouchableOpacity>

      <Text style={[styles.totalText, { color: textColor }]}>Total: ${total.toFixed(2)}</Text>

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#2ecc71' }]} onPress={handleSave}>
        <Text style={styles.btnText}>Save Quote</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: 'red' }]} onPress={handleReset}>
        <Text style={styles.btnText}>Reset</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 40,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  btn: {
    backgroundColor: '#38b6ff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});
