import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from 'expo-router';
import { auth, db } from "../../backend/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useGoogleAuth } from "../../backend/GoogleAuth";

export default function Login() {
  console.log("🚀 Login.tsx mounted");
  const router = useRouter();
  const quickQuoteLogo = require('../../assets/images/logo.png');
  const { promptAsync, request } = useGoogleAuth();
  const [authInProgress, setAuthInProgress] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      console.log("📨 Email login attempt:", form.email, form.password);
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;


      const userRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        console.log("User found in Firestore:", userDoc.data());
        router.push("/dashboard");
      } else {
        Alert.alert("Error", "User data not found. Please sign up.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (authInProgress || !request) return;

    console.log("🟢 Google Sign-In button clicked (redirect)");
    setAuthInProgress(true);

    try {
      const result = await promptAsync({
        useProxy: false,
        redirectUri: "http://localhost:8081",
        prompt: "select_account",
      } as any);

      console.log("🔁 Google redirect login result:", result);

      if (result.type === "success") {
        console.log("✅ Google Sign-In via redirect successful");
        // useGoogleAuth will handle Firebase
      } else {
        console.warn("❌ Google Sign-In was dismissed or canceled");
      }
    } catch (error) {
      console.error("❌ Google Sign-In error:", error);
    } finally {
      setAuthInProgress(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <Image source={quickQuoteLogo} style={styles.headerImg} alt="Logo" />
      <Text style={styles.text}>Window cleaning bids without the pane.</Text>
      <View style={styles.form}>
        <View style={styles.input}>
          {/* Email */}
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.inputControl}
            placeholder="Email"
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

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => router.push({ pathname: '../forgot-password' })}>
            <Text style={styles.subtext}>Forgot Password</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <View style={styles.formAction}>
          <TouchableOpacity style={styles.logBtn} onPress={handleLogin} disabled={loading}>
            <Text style={styles.logBtnText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Google Sign In Button*/}
        <TouchableOpacity
          style={[styles.logBtn, styles.googleBtn]}
          onPress={handleGoogleLogin}
          disabled={!request || authInProgress}
        >
          <Text style={styles.logBtnText}>
            {authInProgress ? "Please wait..." : "Sign in with Google"}
          </Text>
        </TouchableOpacity>

        {/* Navigate to Sign Up */}
        <TouchableOpacity onPress={() => router.push({ pathname: '../signup' })}>
          <View style={styles.btn}>
            <View style={styles.regBtn}>
              <Text style={styles.regBtnText}>Sign Up Now</Text>
            </View>
            <Text style={styles.regBtnArrow}>&gt;</Text>
          </View>
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
    marginHorizontal: "20%",
  },
  headerImg: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  text: {
    fontSize: 25,
    textAlign: "center",
  },
  subtext: {
    color: "grey",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },
  input: { marginTop: 20 },
  inputControl: {
    height: 44,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    borderRadius: 20,
    borderColor: "grey",
    borderWidth: 2,
    fontSize: 20,
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
  logBtn: {
    backgroundColor: "#1e3a8a", // Deep Blue
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5%",
    width: "80%",
    marginHorizontal: "10%",
  },
  logBtnText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff", // White Text
  },

  btn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  regBtn: {
    borderTopStartRadius: 20,
    borderBottomStartRadius: 20,
    borderWidth: 2,
    borderColor: "grey",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  regBtnText: {
    fontSize: 20
  },
  regBtnArrow: {
    borderTopEndRadius: 20,
    borderEndEndRadius: 20,
    borderColor: "grey",
    borderWidth: 2,
    padding: 10,
    fontWeight: "700",
    fontSize: 20,
  },
  googleBtn: {
    backgroundColor: "#db4437", // Google red
    marginTop: 3,              // Space below login
    marginBottom: 20,           // ✅ Space above "Sign Up Now"
    width: "80%",
    marginHorizontal: "10%",
  },


});
