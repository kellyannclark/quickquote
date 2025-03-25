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

export default function Login() {
  const router = useRouter();
  const quickQuoteLogo = require('../../assets/images/logo.png');

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

        {/* Navigate to Sign Up */}
        <TouchableOpacity onPress={() => router.push({ pathname: '../signup' })}>
          <View style={styles.btn}>
            <View style={styles.regBtn}>
              <Text>Sign Up Now</Text>
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
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  text: {
    fontSize: 25,
    textAlign: "center",
    marginTop: "5%",
  },
  subtext: {
    color: "grey",
    fontSize: 13,
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
  logBtn: {
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
  logBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
  regBtnArrow: {
    borderTopEndRadius: 20,
    borderEndEndRadius: 20,
    borderColor: "grey",
    borderWidth: 2,
    padding: 9,
    fontWeight: "700",
    fontSize: 15,
  },
});
