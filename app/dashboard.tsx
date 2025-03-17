import { Alert, SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <FontAwesomeIcon icon={faUserCircle} size={50} style={styles.headerImg} />

      <Text style={styles.text}>Welcome, User!</Text>

      {/* Make a Quote Button */}
      <TouchableOpacity style={[styles.createQuoteBtn, styles.btn]} onPress={() =>
        router.push({ pathname: '/(tabs)/customize-rates' })}>
        <Text style={styles.createQuoteBtnText}>Make a Quote</Text>
      </TouchableOpacity>
      {/* End - Make a Quote Button */}

      {/* My Quotes Button */}
      <TouchableOpacity style={styles.btn} onPress={() => router.push({ pathname: '/(tabs)/my-quotes' })}>
        <Text style={styles.btnText}>My Quotes</Text>
      </TouchableOpacity>
      {/* End - My Quotes Button */}

      {/* Customize Rates Button */}
      <TouchableOpacity style={styles.btn} onPress={() => router.push({ pathname: '/(tabs)/customize-rates' })}>
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
    marginTop: '10%',
    width: "90%",
    marginHorizontal: '5%',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000'
  },


})