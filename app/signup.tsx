import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from "expo-router";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/backend/firebaseConfig";

export default function Signup() {
  const router = useRouter();
  const auth = getAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      await setDoc(doc(db, "Users", user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        businessName: form.businessName,
        email: form.email,
      });

      console.log("User registered successfully:", user.email);
      Alert.alert("Success", "Account created successfully!");

      router.replace("/(tabs)/login");
    } catch (error: any) {
      console.error("Signup Error:", error.message);
      Alert.alert("Signup Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userIconBg}>
        <FontAwesomeIcon icon={faUser} size={30} style={styles.userIcon} />
      </View>
      <Text style={styles.text}>Sign Up</Text>
      <View style={styles.form}>
        <View style={styles.name}>
          {/* First Name */}
          <View style={styles.inputWithIcon}>
            <FontAwesomeIcon icon={faUser} style={styles.icon} />
            <TextInput
              autoCapitalize="words"
              style={[styles.inputControl, styles.marginRName]}
              placeholder="First Name"
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
              style={[styles.inputControl, styles.marginLName]}
              placeholder="Last Name"
              placeholderTextColor="grey"
              value={form.lastName}
              onChangeText={(lastName) => setForm({ ...form, lastName })}
            />
          </View>
        </View>

        {/* Business Name */}
        <TextInput
          autoCapitalize="words"
          style={styles.inputControl}
          placeholder="Business Name"
          placeholderTextColor="grey"
          value={form.businessName}
          onChangeText={(businessName) => setForm({ ...form, businessName })}
        />

        {/* Email */}
        <TextInput
          autoCapitalize="none"
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
        <TouchableOpacity style={styles.signUpBtn} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signUpBtnText}>Sign up</Text>}
        </TouchableOpacity>

        {/* Sign in link */}
        <TouchableOpacity onPress={() => router.push("/(tabs)/login")}>
          <Text style={styles.subtext}>Already a member? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    margin: "10%",
    marginHorizontal: "10%",
  },
  userIcon: {
    alignSelf: "center",
    color: "#fff",
  },
  userIconBg: {
    backgroundColor: "lightgrey",
    borderRadius: 60,
    padding: 20,
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
    marginTop: 10,
  },
  inputControl: {
    height: 44,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    borderRadius: 20,
    borderColor: "grey",
    borderWidth: 2,
    fontWeight: "500",
    color: "#222",
    marginTop: 10,
  },
  form: {
    marginBottom: 20,
    flex: 1,
  },
  marginRName: {
    marginRight: 5,
    paddingLeft: 30,
  },
  marginLName: {
    paddingLeft: 30,
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
    marginTop: 20,
  },
  inputWithIcon: {
    position: "relative",
    width: "50%",
  },
  icon: {
    position: "absolute",
    left: 10,
    top: "65%",
    transform: [{ translateY: -12 }],
    color: "grey",
    zIndex: 1,
  },
});
