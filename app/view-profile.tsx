import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/backend/firebaseConfig';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { router, useRouter } from "expo-router";
import { TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';


type UserProfile = {
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
};

const ViewProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const secondaryColor = useThemeColor(undefined, 'secondary');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          throw new Error('User not authenticated');
        }

        const docRef = doc(db, 'Users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
        } else {
          throw new Error('No such user profile found in Firestore');
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>Profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
      <Text style={styles.title}>Profile</Text>
       {/* Edit Profile */}
        <TouchableOpacity onPress={() => router.push({ pathname: './edit-profile' })}>
        <FontAwesomeIcon icon={faEdit} style={styles.editIcon} />
        </TouchableOpacity>
     
      </View>

      <Text style={styles.label}>Business Name:</Text>
      <Text style={styles.value}>{profile.businessName}</Text>

      <Text style={styles.label}>First Name:</Text>
      <Text style={styles.value}>{profile.firstName}</Text>

      <Text style={styles.label}>Last Name:</Text>
      <Text style={styles.value}>{profile.lastName}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{profile.email}</Text>

      <TouchableOpacity style={[styles.backButton, { backgroundColor: secondaryColor }]} onPress={() => router.push('/dashboard')}>
      <Text style={styles.backButtonText}>Back to Dashboard</Text>
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: '#555',
    marginTop: 16,
  },
  value: {
    fontSize: 20,
    color: '#000',
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  editIcon: {
    marginLeft: 12,
    position: 'relative',
    bottom: 10
  },
  backButton: {
    marginTop: 40,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ffcc00',
  },
  backButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 20,
    color: '#ffffff', 
    
  },
  
});

export default ViewProfileScreen;
