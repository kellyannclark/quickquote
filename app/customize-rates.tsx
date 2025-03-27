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
  
      // Delay to allow last state update to commit
      setTimeout(async () => {
        try {
          const ratesData = {
            baseRates: {
              XS: rates.baseXS,
              SM: rates.baseSM,
              MD: rates.baseMD,
              LG: rates.baseLG,
              XL: rates.baseXL,
            },
            interiorPercentage: rates.interiorPercentage,
            dirtLevelAdjustments: {
              level1: rates.dirtLevel1,
              level2: rates.dirtLevel2,
              level3: rates.dirtLevel3,
            },
            accessibilityCharge: rates.accessibility,
            contractDiscount: rates.contractDiscount,
            extraCharge: rates.extraCharge,
          };
  
          console.log("Saving this data:", ratesData);
  
          const ratesDocRef = doc(db, "Rates", user.uid);
          await setDoc(ratesDocRef, ratesData);
  
          console.log("Rates saved successfully to Firestore.");
  
          Alert.alert("Success", "Customized Rates saved successfully", [
            {
              text: "OK",
              onPress: () => {
                console.log("Redirecting to dashboard...");
                router.push("/dashboard");
              },
            },
          ]);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error saving data:", error.message);
            Alert.alert("Error", `Failed to save data: ${error.message}`, [{ text: "OK" }]);
          } else {
            console.error("Unknown error saving data:", error);
            Alert.alert("Error", "An unknown error occurred", [{ text: "OK" }]);
          }
        }
      }, 100); // <- small delay
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
      <Text style={[styles.title, { color: textColor }]}>Customize Rates</Text>

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

      <TouchableOpacity style={styles.btn} onPress={saveRatesData}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.resetBtn]} onPress={resetDefaults}>
        <Text style={styles.btnText}>Reset</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20,
    fontFamily: "Poppins-SemiBold",
  },
  text: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  halfWidthInputContainer: {
    width: "48%",
    marginBottom: 15,
  },
  thirdWidthInputContainer: {
    width: "30%",
    marginBottom: 15,
  },
  smallInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  btn: {
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: "90%",
    marginHorizontal: '5%',
    backgroundColor: "#38b6ff",
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  resetBtn: {
    backgroundColor: "red"
  },
  savedBanner: {
    backgroundColor: '#d4edda',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  savedText: {
    color: '#155724',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CustomizeRatesScreen;
