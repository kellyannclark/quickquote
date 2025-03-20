import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth, db } from "../backend/firebaseConfig"; // Import auth and db from your firebaseConfig
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore methods
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { router } from "expo-router";

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

  const [loading, setLoading] = useState(true);  // To handle loading state

  // Fetch data from Firestore
  const fetchRatesData = async (userId: string) => {
    try {
      
      // Fetch from Firestore
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
        
      } else {
        console.log("No data found for this user.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);  // Set loading to false once the data is fetched
    }
  };

  // Fetch the current user and their data when the component mounts
  useEffect(() => {
    const user = auth.currentUser; // Get the current logged-in user
    if (user) {
      fetchRatesData(user.uid); // Fetch data for the logged-in user
    } else {
      console.log("No user is logged in.");
      setLoading(false);  // Set loading to false if no user is logged in
    }
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setRates(prevRates=> ({
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

  // Save data to Firestore 
  const saveRatesData = async () => {
    const user = auth.currentUser;
    if (user) {
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
  
        // Save ratesData to Firestore
        const ratesDocRef = doc(db, "Rates", user.uid); // Reference to the user's document
        await setDoc(ratesDocRef, ratesData); // Save the structured ratesData to Firestore
        console.log("Rates saved successfully!");
  
        // Show success alert after both Firestore 
        Alert.alert("Success", "Customized Rates saved successfully", [{ text: "OK" }]);
        router.push('/dashboard'); // Navigate to dashboard after saving
      } catch (error: unknown) {
        // Check if the error is an instance of Error
        if (error instanceof Error) {
          console.error("Error saving data:", error.message);  // Access error.message safely
          Alert.alert("Error", `Failed to save data: ${error.message}`, [{ text: "OK" }]);
        } else {
          // If the error is not an instance of Error, just log it as unknown
          console.error("Unknown error saving data:", error);
          Alert.alert("Error", "An unknown error occurred", [{ text: "OK" }]);
        }
      }
    } else {
      console.log("No user is logged in, unable to save data.");
      Alert.alert("Error", "No user is logged in", [{ text: "OK" }]);
    }
  };
  

  // Use colors directly
  const backgroundColor = useThemeColor(undefined, "background");
  const textColor = useThemeColor(undefined, "text");
  const inputBackground = useThemeColor(undefined, "background");
  const borderColor = useThemeColor(undefined, "secondary");
  const buttonColor = useThemeColor(undefined, "primary");
  const placeholderColor = "#A0A0A0"; // Light gray for placeholders

  if (loading) {
    return <Text>Loading...</Text>;  // Show loading indicator while fetching data
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Customize Rates</Text>

      {/* Base Prices for Each Window Size */}
      <View style={styles.rowContainer}>
        {[
          { key: "baseXS", label: "XS Window" },
          { key: "baseSM", label: "SM Window" },
          { key: "baseMD", label: "MD Window" },
          { key: "baseLG", label: "LG Window" },
          { key: "baseXL", label: "XL Window" },
        ].map(({ key, label }) => (
          <View key={key} style={styles.halfWidthInputContainer}>
            <Text style={[styles.text, { color: textColor }]}>{label}</Text>
            <TextInput
              style={[styles.smallInput, { backgroundColor: inputBackground, borderColor }]}
              keyboardType="numeric"
              value={rates[key as keyof typeof rates]}
              onChangeText={(value) => handleInputChange(key, value)}
              placeholder="Base Price Per Window"
              placeholderTextColor={placeholderColor} 
            />
          </View>
        ))}
      </View>

      {/* Interior Window Percentage */}
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

      {/* Dirt Level Adjustments */}
      <View style={styles.inputContainer}>
        <Text style={[styles.text, { color: textColor }]}>Add Dirt Level Adjustment (%)</Text>
        <View style={styles.rowContainer}>
          {[
            { key: "dirtLevel1", label: "Level 1", placeholder: "ex: 3%" },
            { key: "dirtLevel2", label: "Level 2", placeholder: "ex: 5%" },
            { key: "dirtLevel3", label: "Level 3", placeholder: "ex: 7%" },
          ].map(({ key, label, placeholder }) => (
            <View key={key} style={styles.thirdWidthInputContainer}>
              <Text style={[styles.text, { color: textColor }]}>{label}</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: inputBackground, borderColor }]}
                keyboardType="numeric"
                value={rates[key as keyof typeof rates]}
                onChangeText={(value) => handleInputChange(key, value)}
                placeholder={placeholder}
                placeholderTextColor={placeholderColor} 
              />
            </View>
          ))}
        </View>
      </View>

      {/* Accessibility Charge */}
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

     {/* Discount */}
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

      {/* Other Charges */}
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
      
    {/* Save/Reset Button */}
      {/* <TouchableOpacity style={styles.btn} onPress={saveRatesData}>
         <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.resetBtn]} onPress={resetDefaults}>
         <Text style={styles.btnText}>Reset</Text>
      </TouchableOpacity> */}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={saveRatesData} />
        <View style={styles.spacing} />
        <Button title="Reset to Default" onPress={resetDefaults} color="red" />
      </View>
    </ScrollView>
  );
};

// Styles (No Theme-Related Changes Here)
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3
  },
  spacing: {
    height: 10,
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
  }
});

export default CustomizeRatesScreen;
