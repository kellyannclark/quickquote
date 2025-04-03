import React, { useState } from "react";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons"; // change here
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
      <FontAwesomeIcon icon={faUserCircle} style={styles.userIcon} size={60} />

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
    marginHorizontal: '10%',
    justifyContent: 'center',
  },
  userIconBg: {
    alignSelf: "center",
    marginTop: 32,
    marginBottom: 25,
  },
  userIcon: {
    color: '#1e3a8a',
    fontSize: 60,
  },
  
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtext: {
    color: 'grey',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 10,
  },
  form: {
    flex: 1,
    marginBottom: 20,
  },
  inputControl: {
    height: 48,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'grey',
    fontSize: 20,
    color: '#000000',
    marginTop: 12,
  },
  name: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  inputWithIcon: {
    position: 'relative',
    width: '48%',
  },
  icon: {
    position: "absolute",
    left: 10,
    top: 28, // 👈 Adjusted for better vertical alignment
    color: "grey",
    zIndex: 1,
  },
  
  marginRName: {
    marginRight: 5,
    paddingLeft: 30,
  },
  marginLName: {
    paddingLeft: 30,
  },
  signUpBtn: {
    backgroundColor: '#1e3a8a', // deep blue for consistency
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10%',
    width: '60%',
    marginHorizontal: '20%',
  },
  signUpBtnText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
});
