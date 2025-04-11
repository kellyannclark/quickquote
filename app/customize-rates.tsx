import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth, db } from "../backend/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { router } from "expo-router";
import { Keyboard } from 'react-native'; // 👈 Import this at the top


const CustomizeRatesScreen = () => {
  const [rates, setRates] = useState({
    baseXS: "",
    baseSM: "",
    baseMD: "",
    baseLG: "",
    baseXL: "",
    interiorPercentage: "",
    dirtLevel1: "",
    dirtLevel2: "",
    dirtLevel3: "",
    accessibility: "",
    contractDiscount: "",
    extraCharge: "",
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const fetchRatesData = async (userId: string) => {
    try {
      const ratesDocRef = doc(db, "Rates", userId);
      const ratesDoc = await getDoc(ratesDocRef);
      if (ratesDoc.exists()) {
        const data = ratesDoc.data();
        setRates({
          baseXS: data?.baseRates?.XS || "",
          baseSM: data?.baseRates?.SM || "",
          baseMD: data?.baseRates?.MD || "",
          baseLG: data?.baseRates?.LG || "",
          baseXL: data?.baseRates?.XL || "",
          interiorPercentage: data?.interiorPercentage || "",
          dirtLevel1: data?.dirtLevelAdjustments?.level1 || "",
          dirtLevel2: data?.dirtLevelAdjustments?.level2 || "",
          dirtLevel3: data?.dirtLevelAdjustments?.level3 || "",
          accessibility: data?.accessibilityCharge || "",
          contractDiscount: data?.contractDiscount || "",
          extraCharge: data?.extraCharge || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchRatesData(user.uid);
    } else {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setRates(prevRates => ({
      ...prevRates,
      [key]: value,
    }));
  };

  const resetDefaults = () => {
    setRates({
      baseXS: "",
      baseSM: "",
      baseMD: "",
      baseLG: "",
      baseXL: "",
      interiorPercentage: "",
      dirtLevel1: "",
      dirtLevel2: "",
      dirtLevel3: "",
      accessibility: "",
      contractDiscount: "",
      extraCharge: "",
    });
  };

  const saveRatesData = async () => {
    Keyboard.dismiss();
    const user = auth.currentUser;
    console.log("Save button pressed");
  
    if (user) {
      console.log("User is logged in:", user.uid);
  
      try {
        const ratesData = {
          baseRates: {
            XS: Number(rates.baseXS),
            SM: Number(rates.baseSM),
            MD: Number(rates.baseMD),
            LG: Number(rates.baseLG),
            XL: Number(rates.baseXL),
          },
          interiorPercentage: Number(rates.interiorPercentage),
          dirtLevelAdjustments: {
            level1: Number(rates.dirtLevel1),
            level2: Number(rates.dirtLevel2),
            level3: Number(rates.dirtLevel3),
          },
          accessibilityCharge: Number(rates.accessibility),
          contractDiscount: Number(rates.contractDiscount),
          extraCharge: Number(rates.extraCharge),
        };
  
        console.log("Saving this data:", ratesData);
  
        const ratesDocRef = doc(db, "Rates", user.uid);
        await setDoc(ratesDocRef, ratesData);
  
        console.log("Rates saved successfully to Firestore.");
  
        // ✅ Show success message
        Alert.alert("Success", "Your Rates Were Successfully Saved!");

        resetDefaults(); // Clear the inputs
        setSaved(true);  // Show success banner
        
        // Hide the banner after 3 seconds
        setTimeout(() => setSaved(false), 3000);
        
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error saving data:", error.message);
          Alert.alert("Error", `Failed to save data: ${error.message}`, [{ text: "OK" }]);
        } else {
          console.error("Unknown error saving data:", error);
          Alert.alert("Error", "An unknown error occurred", [{ text: "OK" }]);
        }
      }
    } else {
      console.warn("No user logged in, cannot save.");
      Alert.alert("Error", "No user is logged in", [{ text: "OK" }]);
    }
  };
  
  

  
  // Use colors directly
  const backgroundColor = useThemeColor(undefined, "background");
  const textColor = useThemeColor(undefined, "text");
  const inputBackground = useThemeColor(undefined, "background");
  const borderColor = useThemeColor(undefined, "secondary");
  const placeholderColor = "#A0A0A0";

  if (loading) return <Text>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
<View style={styles.headerContainer}>
  <View style={styles.titleRow}>
    <Text style={[styles.title, { color: textColor }]}>Customize Rates</Text>
  </View>

</View>



      {saved && (
        <View style={styles.savedBanner}>
          <Text style={styles.savedText}>✅ Rates saved successfully!</Text>
        </View>
      )}

      <View style={styles.rowContainer}>
        {["XS", "SM", "MD", "LG", "XL"].map(size => (
          <View key={size} style={styles.halfWidthInputContainer}>
            <Text style={[styles.text, { color: textColor }]}>{size} Window</Text>
            <TextInput
              style={[styles.smallInput, { backgroundColor: inputBackground, borderColor }]}
              keyboardType="numeric"
              value={rates[`base${size}` as keyof typeof rates]}
              onChangeText={(value) => handleInputChange(`base${size}`, value)}
              placeholder="Base Price Per Window"
              placeholderTextColor={placeholderColor}
            />
          </View>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.text, { color: textColor }]}>Add Interior Window Cleaning (%)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, borderColor }]}
          keyboardType="numeric"
          value={rates.interiorPercentage}
          onChangeText={(value) => handleInputChange("interiorPercentage", value)}
          placeholder="ex: 75%"
          placeholderTextColor={placeholderColor}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.text, { color: textColor }]}>Add Dirt Level Adjustment (%)</Text>
        <View style={styles.rowContainer}>
          {[1, 2, 3].map(level => (
            <View key={level} style={styles.thirdWidthInputContainer}>
              <Text style={[styles.text, { color: textColor }]}>Level {level}</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: inputBackground, borderColor }]}
                keyboardType="numeric"
                value={rates[`dirtLevel${level}` as keyof typeof rates]}
                onChangeText={(value) => handleInputChange(`dirtLevel${level}`, value)}
                placeholder={`ex: ${level * 2 + 1}%`}
                placeholderTextColor={placeholderColor}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.text, { color: textColor }]}>Add Accessibility Charge (%)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, borderColor }]}
          keyboardType="numeric"
          value={rates.accessibility}
          onChangeText={(value) => handleInputChange("accessibility", value)}
          placeholder="ex: 10%"
          placeholderTextColor={placeholderColor}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.text, { color: textColor }]}>Discount (%)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, borderColor }]}
          keyboardType="numeric"
          value={rates.contractDiscount}
          onChangeText={(value) => handleInputChange("contractDiscount", value)}
          placeholder="ex: 10%"
          placeholderTextColor={placeholderColor}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.text, { color: textColor }]}>Other Charges ($)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, borderColor }]}
          keyboardType="numeric"
          value={rates.extraCharge}
          onChangeText={(value) => handleInputChange("extraCharge", value)}
          placeholder="ex: $25.00"
          placeholderTextColor={placeholderColor}
        />
      </View>

      <View style={styles.buttonGroup}>
  <TouchableOpacity style={styles.btn} onPress={saveRatesData}>
    <Text style={styles.btnText}>Save</Text>
  </TouchableOpacity>

  <TouchableOpacity style={[styles.btn, styles.resetBtn]} onPress={resetDefaults}>
    <Text style={styles.resetBtnText}>Reset</Text>
  </TouchableOpacity>
</View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#f8f9fa", // Light Gray Background
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  
  subtitle: {
    fontSize: 18,
    color: '#555',
    fontFamily: 'Roboto-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  
  
  title: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    marginTop: 20,
  },
  icon: {
    fontSize: 35,
  },
  
  text: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    marginBottom: 4,
    color: "#ffffff",
  },
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  halfWidthInputContainer: {
    width: "48%",
    marginBottom: 20,
  },
  thirdWidthInputContainer: {
    width: "30%",
    marginBottom: 20,
  },
  smallInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    borderColor: "#1e3a8a",
    backgroundColor: "#ffffff",
    color: "#ffffff",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    borderColor: "#1e3a8a",
    backgroundColor: "#ffffff",
    color: "#ffffff",
  },
  btn: {
    borderColor: '#1e3a8a',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '90%',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff', // Matches outlineBtn
  },
  
  btnText: {
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    color: '#1e3a8a', // Deep Blue text to match the outline
    fontWeight: '600',
  },
  buttonGroup: {
    alignItems: 'center', // centers buttons inside
    marginTop: 10,
  },
  
  resetBtn: {
    backgroundColor: '#dc3545', // red
    borderColor: '#dc3545',     // match border
  },
  
  resetBtnText: {
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    color: '#ffffff', // white text
    fontWeight: '600',
  },
  
  savedBanner: {
    backgroundColor: "#fff8e1",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffcc00",
    marginBottom: 16,
  },
  savedText: {
    color: "#1e3a8a",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
});

export default CustomizeRatesScreen;
