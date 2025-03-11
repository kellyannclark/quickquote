import React, {useState} from 'react'
import { SafeAreaView, View, Text, TextInput, StyleSheet, Image} from 'react-native'
import quickQuoteLogo from "@/assets/images/react-logo.png"


export default function Login() {
   const [form, setForm] = useState({
    username: '',
    password: ''
   })
  return (
    <SafeAreaView style={styles.container}>
      <Image
      source={quickQuoteLogo}
      style={styles.headerImg}
      alt="Logo"
      />

      <Text style={styles.text}>Window cleaning bids without the pane.</Text>

      <View style={styles.form}>
        <View style={styles.input}>
            {/* Username */}
            <TextInput 
            style={styles.inputControl}
            placeholder="Username"
            placeholderTextcolor="grey"
            value={form.username}
            onChangeText={username => setForm({ ...form, username})}
            >
            </TextInput>

             {/* Password */}
            <TextInput 
            style={styles.inputControl}
            placeholder="Password"
            placeholderTextcolor="grey"
            value={form.password}
            onChangeText={password => setForm({ ...form, password})}
            >
            </TextInput>
        </View>

      </View>
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
    color: 'black',
    fontSize: 25,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginTop:'10%'
  },
  input:{ marginTop: 20,},
  inputLabel: {
    fontSzie: 17,
    fontWeight: 600,
    color: '#222',
    
    marginBottom: 8
  },
  inputControl: {
    height: 44,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderRadius: 20,
    borderColor: 'grey',
    borderWidth: 2,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    marginTop: 10
  }
})