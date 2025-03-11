import React, {useState} from 'react'
import { SafeAreaView, View, Text, TextInput, StyleSheet, Image, TouchableOpacity} from 'react-native'
import quickQuoteLogo from "@/assets/images/react-logo.png"
import { Link } from '@react-navigation/native';


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
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.inputControl}
            placeholder="Username"
            placeholderTextcolor="grey"
            value={form.username}
            onChangeText={username => setForm({ ...form, username})}
            >
            </TextInput>

             {/* Password */}
            <TextInput 
            secureTextEntry
            style={styles.inputControl}
            placeholder="Password"
            placeholderTextcolor="grey"
            value={form.password}
            onChangeText={password => setForm({ ...form, password})}
            >
            </TextInput>

            {/* Forgot Password */}
            <Link style={styles.subtext}>Forgot Password</Link>
            
        </View>  {/* End - Input */}
        
        {/* Login Button */}
        <View style={styles.formAction}>
            <TouchableOpacity onPress={()=>{
                // handle onPress
            }}>

            <View style={styles.logBtn}>
                <Text style={styles.logBtnText}>Login</Text>
            </View>
            </TouchableOpacity>

        </View> {/* End - View Login Button */}

      </View> {/* End - View Form */}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    marginTop: '30%',
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
  subtext: {
    color: 'grey',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginTop:'5%'
  },
  input:{ marginTop: 20,},
  inputLabel: {
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
  },
  form: {
    marginBottom: 24,
    flex: 1
  },
  formAction: {
    marginVertical: 24,
  },
  logBtn: {
    backgroundColor: '#38b6ff',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10%',
    width: "50%",
    marginHorizontal: '20%'
  },
  logBtnText:{
    fontSize: 15,
    fontWeight: '600',
    color: '#fff'
  }
})