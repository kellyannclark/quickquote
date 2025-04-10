import React, { useState, useEffect } from "react";
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
import { faUserCircle, faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
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

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  useEffect(() => {
    setIsFormReady(isFormValid());
  }, [form, formErrors]);

  const validateField = (name: string, value: string) => {
    let error = "";
    const nameRegex = /^[A-Za-z\s]+$/;

    switch (name) {
      case "firstName":
      case "lastName":
      case "businessName":
        if (!value.trim()) {
          error = "This field is required";
        } else if (!nameRegex.test(value)) {
          error = "Only letters and spaces are allowed";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Enter a valid email";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6) error = "At least 6 characters required";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== form.password) error = "Passwords do not match";
        break;
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    return (
      Object.values(form).every((value) => value.trim() !== "") &&
      Object.values(formErrors).every((error) => error === "")
    );
  };

  const handleSignup = async () => {
    if (!isFormValid()) {
      Alert.alert("Error", "Please fix the errors before submitting.");
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

      Alert.alert("Success", "Account created successfully!");
      router.replace("/(tabs)/login");
    } catch (error: any) {
      Alert.alert("Signup Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userIconBg}>
        <FontAwesomeIcon icon={faUserCircle} style={styles.userIcon} size={60} />
      </View>

      <Text style={styles.text}>Sign Up</Text>

      <View style={styles.form}>
        {/* Name Fields */}
        <View style={styles.name}>
          <View style={styles.inputWithIcon}>
            <FontAwesomeIcon icon={faUser} style={styles.icon} />
            <TextInput
              autoCapitalize="words"
              style={[styles.inputControl, styles.marginRName]}
              placeholder="First Name"
              placeholderTextColor="grey"
              value={form.firstName}
              onChangeText={(text) => {
                setForm({ ...form, firstName: text });
                validateField("firstName", text);
              }}
              onBlur={() => validateField("firstName", form.firstName)}
            />
            {formErrors.firstName ? <Text style={styles.errorText}>{formErrors.firstName}</Text> : null}
          </View>

          <View style={styles.inputWithIcon}>
            <FontAwesomeIcon icon={faUser} style={styles.icon} />
            <TextInput
              autoCapitalize="words"
              style={[styles.inputControl, styles.marginLName]}
              placeholder="Last Name"
              placeholderTextColor="grey"
              value={form.lastName}
              onChangeText={(text) => {
                setForm({ ...form, lastName: text });
                validateField("lastName", text);
              }}
              onBlur={() => validateField("lastName", form.lastName)}
            />
            {formErrors.lastName ? <Text style={styles.errorText}>{formErrors.lastName}</Text> : null}
          </View>
        </View>

        {/* Business Name */}
        <TextInput
          autoCapitalize="words"
          style={styles.inputControl}
          placeholder="Business Name"
          placeholderTextColor="grey"
          value={form.businessName}
          onChangeText={(text) => {
            setForm({ ...form, businessName: text });
            validateField("businessName", text);
          }}
          onBlur={() => validateField("businessName", form.businessName)}
        />
        {formErrors.businessName ? <Text style={styles.errorText}>{formErrors.businessName}</Text> : null}

        {/* Email */}
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.inputControl}
          placeholder="Email address"
          placeholderTextColor="grey"
          value={form.email}
          onChangeText={(text) => {
            setForm({ ...form, email: text });
            validateField("email", text);
          }}
          onBlur={() => validateField("email", form.email)}
        />
        {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : null}

        {/* Password */}
        <View style={styles.passwordWrapper}>
          <TextInput
            secureTextEntry={!showPassword}
            style={[styles.inputControl, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="grey"
            value={form.password}
            onChangeText={(text) => {
              setForm({ ...form, password: text });
              validateField("password", text);
            }}
            onBlur={() => validateField("password", form.password)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} size={20} color="grey" />
          </TouchableOpacity>
        </View>
        {formErrors.password ? <Text style={styles.errorText}>{formErrors.password}</Text> : null}

        {/* Confirm Password */}
        <View style={styles.passwordWrapper}>
          <TextInput
            secureTextEntry={!showConfirmPassword}
            style={[styles.inputControl, styles.passwordInput]}
            placeholder="Confirm Password"
            placeholderTextColor="grey"
            value={form.confirmPassword}
            onChangeText={(text) => {
              setForm({ ...form, confirmPassword: text });
              validateField("confirmPassword", text);
            }}
            onBlur={() => validateField("confirmPassword", form.confirmPassword)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword((prev) => !prev)}
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} size={20} color="grey" />
          </TouchableOpacity>
        </View>
        {formErrors.confirmPassword ? <Text style={styles.errorText}>{formErrors.confirmPassword}</Text> : null}

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.signUpBtn, { opacity: isFormReady && !loading ? 1 : 0.6 }]}
          onPress={handleSignup}
          disabled={!isFormReady || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signUpBtnText}>Sign up</Text>}
        </TouchableOpacity>

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
    justifyContent: 'center'
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
    color: '#000',
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
    color: '#000',
    marginTop: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 6,
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
    top: 28,
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
    backgroundColor: '#1e3a8a',
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
  passwordWrapper: {
    position: "relative",
    marginTop: 12,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 25,
    zIndex: 1,
  },
});
