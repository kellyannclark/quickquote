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
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const router = useRouter();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent!");
      router.replace("/(tabs)/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
      console.error("Password Reset Error:", error.message);
      Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userIconBg}>
        <FontAwesomeIcon icon={faUser} size={30} style={styles.userIcon} />
      </View>
      <Text style={styles.text}>Forgot Password</Text>
      <View style={styles.form}>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.inputControl}
          placeholder="Email address"
          placeholderTextColor="grey"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.resetPwBtn} onPress={handlePasswordReset} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetPwBtnText}>Reset Password</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(tabs)/login")}>
          <Text style={styles.subtext}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
    justifyContent: 'flex-start',
  },
  userIconBg: {
    backgroundColor: "#1e3a8a", // Deep blue (secondary)
    borderRadius: 60,
    padding: 20,
    alignSelf: "center",
    marginTop: 40,
  },
  
  userIcon: {
    alignSelf: "center",
    color: "#fff",
  },
  text: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  subtext: {
    color: "grey",
    fontSize: 18,
    textAlign: "center",
    marginTop: 16,
  },
  form: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  inputControl: {
    height: 48,
    backgroundColor: "#fff",
    paddingHorizontal: 24, // ⬅️ more side padding
    borderRadius: 24,
    borderColor: "#1e3a8a", // match your dark blue
    borderWidth: 2,
    fontWeight: "500",
    color: "#000",
    marginTop: 20,
    alignSelf: "center", // ⬅️ centers the input
    width: "90%",        // ⬅️ controls overall width
  },
  
  resetPwBtn: {
    backgroundColor: "#1e3a8a", // Deep blue (secondary)
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    marginHorizontal: "5%",
    marginTop: 10,
  },
  
  resetPwBtnText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
});
