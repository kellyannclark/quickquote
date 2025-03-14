import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Link } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";

export default function Dashboard() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    confirmPassword: "",
    email: "",
    password: "",
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userIconBg}>
        <FontAwesomeIcon icon={faUser} style={styles.userIcon} />
      </View>
      <Text style={styles.text}>Sign Up</Text>
      <View style={styles.form}>
        <View style={styles.input}>
          <View style={styles.name}>
            {/* First Name */}
            <View style={styles.inputWithIcon}>
              <FontAwesomeIcon icon={faUser} style={styles.icon} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                style={[styles.inputControl, styles.marginRight]}
                placeholder={"First Name"}
                placeholderTextColor="grey"
                value={form.firstName}
                onChangeText={(firstName) => setForm({ ...form, firstName })}
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputWithIcon}>
              <FontAwesomeIcon icon={faUser} style={styles.icon} />
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                keyboardType="default"
                style={[styles.inputControl, styles.marginRight]}
                placeholder="Last Name"
                placeholderTextColor="grey"
                value={form.lastName}
                onChangeText={(lastName) => setForm({ ...form, lastName })}
              />
            </View>
          </View> {/* End - name */}
        </View>

        {/* Business Name */}
        <TextInput
          autoCapitalize="words"
          keyboardType="default"
          style={styles.inputControl}
          placeholder="Business Name"
          placeholderTextColor="grey"
          value={form.businessName}
          onChangeText={(businessName) => setForm({ ...form, businessName })}
        />

        {/* Email */}
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.inputControl}
          placeholder="Email address"
          placeholderTextColor="grey"
          value={form.email}
          onChangeText={(email) => setForm({ ...form, email })}
        />

        {/* Password */}
        <TextInput
          secureTextEntry
          style={styles.inputControl}
          placeholder="Password"
          placeholderTextColor="grey"
          value={form.password}
          onChangeText={(password) => setForm({ ...form, password })}
        />

        {/* Confirm Password */}
        <TextInput
          secureTextEntry
          style={styles.inputControl}
          placeholder="Confirm Password"
          placeholderTextColor="grey"
          value={form.confirmPassword}
          onChangeText={(confirmPassword) =>
            setForm({ ...form, confirmPassword })
          }
        />

        {/* Sign Up Button */}
        <View style={styles.formAction}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Sign Up!");
            }}
          >
            <View style={styles.signUpBtn}>
              <Text style={styles.signUpBtnText}>Sign up</Text>
            </View>
          </TouchableOpacity>

          {/* Sign in link */}
          <Text style={styles.subtext}>
            Already a member? <Link>Sign in</Link>
          </Text>
        </View> {/* End - Sign Up Button */}
      </View> {/* End - View Form */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    margin: "20%",
    marginHorizontal: "10%",
  },
  userIcon: {
    alignSelf: "center",
    color: "#fff",
  },
  userIconBg: {
    backgroundColor: "lightgrey",
    borderRadius: 60,
    padding: 30,
    alignSelf: "center",
  },
  text: {
    color: "black",
    fontSize: 20,
    textAlign: "center",
    marginTop: "5%",
  },
  subtext: {
    color: "grey",
    fontSize: 13,
    textAlign: "center",
    marginTop: "5%",
  },
  input: {
    marginTop: 20,
  },
  inputControl: {
    height: 44,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    borderColor: "grey",
    borderWidth: 2,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    marginTop: 10,
  },
  form: {
    marginBottom: 20,
    flex: 1,
  },
  formAction: {
    marginVertical: 20,
  },
  marginRight: {
    marginRight: 5,
    paddingLeft: 30
  },
  signUpBtn: {
    backgroundColor: "#38b6ff",
    borderRadius: 20,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10%",
    width: "60%",
    marginHorizontal: "20%",
  },
  signUpBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  name: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputWithIcon: {
    position: "relative", // This allows positioning the icon inside the input
    width: "50%"
  },
  icon: {
    position: "absolute",
    left: 10,
    top: "65%",
    transform: [{ translateY: -12 }], // Vertically center the icon
    color: "#000", // Icon color
    zIndex: 1
  },
});
