import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const CustomizeRatesScreen = () => {
  const [rates, setRates] = useState({
    baseXS: "",
    baseSM: "",
    baseMD: "",
    baseLG: "",
    baseXL: "",
    interiorPercentage: "",
    dirtLevel: "1", // Default dirt level
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
      dirtLevel: "1",
      accessibility: "",
      contractDiscount: "",
      extraCharge: "",
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Customize Rates</Text>

      {/* Base Prices for Each Window Size in Two Columns */}
      <View style={styles.rowContainer}>
        {["XS", "SM", "MD", "LG", "XL"].map((size) => (
          <View key={size} style={styles.halfWidthInputContainer}>
            <Text>Base Price ({size})</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={rates[`base${size}` as keyof typeof rates]}
              onChangeText={(value) => handleInputChange(`base${size}`, value)}
            />
          </View>
        ))}
      </View>

      {/* Interior Window Percentage */}
      <View style={styles.inputContainer}>
        <Text>Interior Window Percentage (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rates.interiorPercentage}
          onChangeText={(value) => handleInputChange("interiorPercentage", value)}
        />
      </View>

      {/* Dirt Level Adjustment (Dropdown) */}
      <View style={styles.inputContainer}>
        <Text>Dirt Level Adjustment</Text>
        <View style={styles.pickerContainer}>
        <Picker
          selectedValue={rates.dirtLevel}
          onValueChange={(value) => handleInputChange("dirtLevel", value)}
          style={styles.picker}
          mode="dropdown" 
        >
          <Picker.Item label="Level 1 (Light Dirt)" value="1" />
          <Picker.Item label="Level 2 (Medium Dirt)" value="2" />
          <Picker.Item label="Level 3 (Heavy Dirt)" value="3" />
        </Picker>

        </View>
      </View>

      {/* Accessibility Charge */}
      <View style={styles.inputContainer}>
        <Text>Accessibility Charge (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rates.accessibility}
          onChangeText={(value) => handleInputChange("accessibility", value)}
        />
      </View>

      {/* Contract Discount */}
      <View style={styles.inputContainer}>
        <Text>Contract Discount ($)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rates.contractDiscount}
          onChangeText={(value) => handleInputChange("contractDiscount", value)}
        />
      </View>

      {/* Extra Charge */}
      <View style={styles.inputContainer}>
        <Text>Extra Charge ($)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rates.extraCharge}
          onChangeText={(value) => handleInputChange("extraCharge", value)}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={() => console.log("Rates saved!", rates)} />
        <View style={styles.spacing} />
        <Button title="Reset to Default" onPress={resetDefaults} color="red" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20, 
    paddingVertical: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 50,
  },
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows items to move to the next line
    justifyContent: "space-between",
  },
  halfWidthInputContainer: {
    width: "48%", // Two inputs per row
    marginBottom: 15,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
    backgroundColor: "white",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
    
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "white",
    overflow: "hidden",  // ✅ Ensures correct rendering
    width: "100%",  // ✅ Ensures the dropdown is visible
  },
  
  picker: {
    height: 50,
    width: "100%",
  },
  buttonContainer: {
    marginTop: 20,
  },
  spacing: {
    height: 10, 
  },
});

export default CustomizeRatesScreen;
