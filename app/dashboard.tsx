import { Alert, SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from 'expo-router';
import { auth, db } from "../backend/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [firstName, setFirstName] = useState(""); // State to store firstName
  const [loading, setLoading] = useState(true);

  // Fetch the logged-in user's first name from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser; // Get the current logged-in user
        if (user) {
          const userRef = doc(db, "Users", user.uid); // Reference to the user's document
          const userDoc = await getDoc(userRef); // Fetch user data

          if (userDoc.exists()) {
            setFirstName(userDoc.data().firstName); // Set firstName from Firestore
          } else {
            Alert.alert("Error", "User data not found.");
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        Alert.alert("Error", "Failed to fetch user data.");
      } finally {
        setLoading(false); // Stop loading after fetching data
      }
    };

    fetchUserData();
  }, []); // Run this effect once after the component mounts

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FontAwesomeIcon icon={faUserCircle} size={50} style={styles.headerImg} />

      <Text style={styles.text}>Welcome, {firstName || "User"}!</Text>

      {/* Make a Quote Button */}
      <TouchableOpacity style={[styles.createQuoteBtn, styles.btn]} onPress={() =>
        router.push({ pathname: '/customize-rates' })}>
        <Text style={styles.createQuoteBtnText}>Make a Quote</Text>
      </TouchableOpacity>
      {/* End - Make a Quote Button */}

      {/* My Quotes Button */}
      <TouchableOpacity style={styles.btn} onPress={() => router.push({ pathname: '/my-quotes' })}>
        <Text style={styles.btnText}>My Quotes</Text>
      </TouchableOpacity>
      {/* End - My Quotes Button */}

      {/* Customize Rates Button */}
      <TouchableOpacity style={styles.btn} onPress={() => router.push({ pathname: '/customize-rates' })}>
        <Text style={styles.btnText}>Customize Rates</Text>
      </TouchableOpacity>
      {/* End - Customize Rates Button */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    margin: '10%',
    marginHorizontal: '20%'
  },
  headerImg: {
    color: "grey",
    alignSelf: 'center',
    zIndex: 1,

  },
  text: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginTop: '5%'
  },
 
  createQuoteBtn: {
    backgroundColor: '#ffcc00',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10%',
    width: "90%",
    marginHorizontal: '5%'
  },
  createQuoteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000'
  },
  btn: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: "90%",
    marginHorizontal: '5%',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000'
  },


})