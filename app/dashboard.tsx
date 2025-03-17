import { Alert, SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native'
import { Link } from '@react-navigation/native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser, faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
       <FontAwesomeIcon icon={faUserCircle} size={50} style={styles.headerImg} />

       <Text style={styles.text}>Welcome, User!</Text>
      
        
        {/* Make q Quote Button */}
        <View style={styles.formAction}>
            <TouchableOpacity onPress={()=>
                router.push({ pathname: '/(tabs)/customize-rates' })}>

            <View style={styles.createQuoteBtn}>
                <Text style={styles.createQuoteBtnText}>Make a Quote</Text>
            </View>
            </TouchableOpacity>

        </View> {/* End - Make a Quote Button */}
          
        {/* MY Quptes Button */}
        <View style={styles.formAction}>
            <TouchableOpacity onPress={()=>{
                // handle onPress
                Alert.alert('My Quotes!')
            }}>

            <View style={styles.btn}>
                <Text style={styles.btnText}>My Quotes</Text>
            </View>
            </TouchableOpacity>

        </View> {/* End - My Quotes Button */}

        {/* Customize Rates Button */}
        <View style={styles.formAction}>
            <TouchableOpacity onPress={()=>{
                // handle onPress
                Alert.alert('Customize Rates!')
            }}>

            <View style={styles.btn}>
                <Text style={styles.btnText}>Customize Rates</Text>
            </View>
            </TouchableOpacity>

        </View> {/* End - Customize Rates Button */}
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
  headerImg:{
    color: "grey",
    alignSelf: 'center',
    zIndex: 1,

  },
  text: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginTop:'5%'
  },
  formAction: {
    marginVertical: 20,
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
  createQuoteBtnText:{
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
    marginTop: '1%',
    width: "90%",
    marginHorizontal: '5%'
  },
  btnText:{
    fontSize: 14,
    fontWeight: '600',
    color: '#000'
  },

  
})