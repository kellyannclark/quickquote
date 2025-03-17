import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

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

  const handleInputChange = (key: string, value: string) => {
    setRates((prevRates) => ({
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

  // Use colors directly
  const backgroundColor = useThemeColor("background");
  const textColor = useThemeColor("text");
  const inputBackground = useThemeColor("background"); 
  const borderColor = useThemeColor("secondary");
  const buttonColor = useThemeColor("primary");
  const placeholderColor = "#A0A0A0"; // Light gray for placeholders

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
              placeholderTextColor={placeholderColor} // ✅ Light gray placeholder text
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
          placeholderTextColor={placeholderColor} // ✅ Light gray placeholder text
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
                placeholderTextColor={placeholderColor} // ✅ Light gray placeholder text
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
          placeholderTextColor={placeholderColor} // ✅ Light gray placeholder text
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
          placeholderTextColor={placeholderColor} // ✅ Light gray placeholder text
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
          placeholderTextColor={placeholderColor} // ✅ Light gray placeholder text
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={() => console.log("Rates saved!", rates)} color={buttonColor} />
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
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 50,
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
    marginTop: 20,
  },
  spacing: {
    height: 10,
  },
});

export default CustomizeRatesScreen;
