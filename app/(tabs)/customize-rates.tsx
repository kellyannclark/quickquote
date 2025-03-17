import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Customize Rates</Text>

      {/* Base Prices for Each Window Size in Two Columns */}
      <View style={styles.rowContainer}>
        {["XS", "SM", "MD", "LG", "XL"].map((size) => (
          <View key={size} style={styles.halfWidthInputContainer}>
            <Text style={styles.text}>Base Price ({size})</Text>
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
        <Text style={styles.text}>Interior Window Percentage (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rates.interiorPercentage}
          onChangeText={(value) => handleInputChange("interiorPercentage", value)}
        />
      </View>

      {/* Dirt Level Adjustments (Three Input Fields) */}
      <View style={styles.inputContainer}>
        <Text style={styles.text}>Dirt Level Adjustment (%)</Text>
        <View style={styles.rowContainer}>
          <View style={styles.thirdWidthInputContainer}>
            <Text style={styles.text}>Level 1</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={rates.dirtLevel1}
              onChangeText={(value) => handleInputChange("dirtLevel1", value)}
              placeholder="e.g. 5%"
            />
          </View>
          <View style={styles.thirdWidthInputContainer}>
            <Text style={styles.text}>Level 2</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={rates.dirtLevel2}
              onChangeText={(value) => handleInputChange("dirtLevel2", value)}
              placeholder="e.g. 10%"
            />
          </View>
          <View style={styles.thirdWidthInputContainer}>
            <Text style={styles.text}>Level 3</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={rates.dirtLevel3}
              onChangeText={(value) => handleInputChange("dirtLevel3", value)}
              placeholder="e.g. 15%"
            />
          </View>
        </View>
      </View>

      {/* Accessibility Charge */}
      <View style={styles.inputContainer}>
        <Text style={styles.text}>Accessibility Charge (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rates.accessibility}
          onChangeText={(value) => handleInputChange("accessibility", value)}
        />
      </View>

      {/* Contract Discount */}
      <View style={styles.inputContainer}>
        <Text style={styles.text}>Contract Discount ($)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rates.contractDiscount}
          onChangeText={(value) => handleInputChange("contractDiscount", value)}
        />
      </View>

      {/* Extra Charge */}
      <View style={styles.inputContainer}>
        <Text style={styles.text}>Extra Charge ($)</Text>
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
    fontFamily: "Poppins-SemiBold",
  },
  text: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "black",
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
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
    backgroundColor: "white",
    fontFamily: "Roboto_Condensed-Thin",
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
  buttonContainer: {
    marginTop: 20,
  },
  spacing: {
    height: 10,
  },
});

export default CustomizeRatesScreen;
