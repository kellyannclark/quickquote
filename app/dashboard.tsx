import { Alert, SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from 'expo-router';
import { auth, db } from "../backend/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import React from 'react';
import { signOut } from 'firebase/auth';


export default function Dashboard() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(tabs)/login'); // ✅ Navigate to your login screen
    } catch (error) {
      Alert.alert("Error", "Failed to log out.");
      console.error("Logout error:", error);
    }
  };
  

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "Users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setFirstName(userDoc.data().firstName);
          } else {
            Alert.alert("Error", "User data not found.");
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        Alert.alert("Error", "Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FontAwesomeIcon icon={faUserCircle} size={60} style={styles.headerIcon} />
      <Text style={styles.welcome}>Welcome, {firstName || "User"}!</Text>
  
       {/* View Profile */}
        <TouchableOpacity onPress={() => router.push({ pathname: './view-profile' })}>
          <Text style={styles.subtext}>View Profile</Text>
        </TouchableOpacity>

      <TouchableOpacity style={[styles.primaryBtn]} onPress={() => router.push('/make-a-quote')}>
        <Text style={styles.primaryBtnText}>Make a Quote</Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/my-quotes')}>
        <Text style={styles.outlineBtnText}>My Quotes</Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/customize-rates')}>
        <Text style={styles.outlineBtnText}>Customize Rates</Text>
      </TouchableOpacity>
  
      {/* ✅ LOGOUT BUTTON HERE */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
  




  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerIcon: {
    color: '#1e3a8a',
    marginBottom: 25,
    marginTop: 32,
  },
  welcome: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
    textAlign: 'center',
    marginTop: '5%'
  },
  subtext: {
    color: '#2b93cf',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 100,
    fontSize: 18,
  },
  primaryBtn: {
    backgroundColor: '#ffcc00',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '90%',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
  },
  outlineBtn: {
    borderColor: '#1e3a8a',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '90%',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  outlineBtnText: {
    color: '#1e3a8a',
    fontSize: 20,
    fontWeight: '600',
  },
  text: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
  },

  logoutBtn: {
    marginTop: 20,
    borderRadius: 20,
    padding: 12,
    backgroundColor: '#1e3a8a', 
    alignItems: 'center',
    width: '90%',
    marginHorizontal: '5%',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  
});
