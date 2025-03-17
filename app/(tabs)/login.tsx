import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const quickQuoteLogo = require('../../assets/images/logo.png');

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
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
          ></TextInput>

          {/* Password */}
          <TextInput
            secureTextEntry
            style={styles.inputControl}
            placeholder="Password"
            placeholderTextColor="grey"
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
          ></TextInput>

          {/* Forgot Password */}
          <TouchableOpacity
          onPress={() => router.push({ pathname: '/' })}>
          <Text style={styles.subtext}>Forgot Password</Text>
          </TouchableOpacity>
          
        </View>
        {/* End - Input */}
        {/* Login Button */}
        <View style={styles.formAction}>
          <TouchableOpacity
             style={styles.logBtn}
            onPress={() => router.push({ pathname: '/dashboard' })}>
              <Text style={styles.logBtnText}>
                Login
              </Text>
          </TouchableOpacity>
        </View>
        {/* End - View Login Button */}
        <TouchableOpacity 
        onPress={() => router.push({ pathname: '../signup' })}>
         
          {/* Navigate to 'SignUp' screen */}
          <View style={styles.btn}>
            <View style={styles.regBtn}>
                <Text>Sign Up Now</Text>
            </View>
            <Text style={styles.regBtnArrow}>&gt;</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* End - View Form */}
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
  inputLabel: {
    marginBottom: 8,
  },
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
  regBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "black",
  },
  regBtnArrow: {
    borderTopEndRadius: 20,
    borderEndEndRadius: 20,
    borderColor: "grey",
    borderWidth: 2,
    padding: 9,
    fontWeight: 700,
    fontSize: 15,
  },
});
