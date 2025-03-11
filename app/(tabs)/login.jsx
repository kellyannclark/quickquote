import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, Image} from 'react-native'
import quickQuoteLogo from "@/assets/images/react-logo.png"


export default function Login() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
      source={quickQuoteLogo}
      style={styles.headerImg}
      alt="Logo"
      
      />


      <Text style={styles.text}>Window cleaning bids without the pane.</Text>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    marginTop: '40%',
    marginHorizontal: '20%'
  },
  headerImg:{
    width: '100%',
    height: '10%',
    alignSelf: 'center',
    
  },
  text: {
    color: 'grey',
    fontSize: 25,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginTop:'10%'
  }
})