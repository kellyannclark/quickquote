import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useRouter } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const router = useRouter();

  // ✅ Dynamically get redirect URI for Expo Go or web
  const redirectUri = makeRedirectUri({ 
    native: "your.app://redirect", 
    useProxy: true // use as needed for Expo Go
  } as any);
  


  console.log("🔁 Final redirectUri being used:", redirectUri);


  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "1063626636270-s7asd06386bbgfrhboijibbp9kbner0l.apps.googleusercontent.com",
    webClientId: "1063626636270-2t0u18d41qv3bjpsa3s6ct11q122pkfk.apps.googleusercontent.com",
    iosClientId: "1063626636270-856jpm1j821ghb8mdqiotg60oe4rt6gd.apps.googleusercontent.com",
    redirectUri,
    scopes: ["profile", "openid", "email"],
    responseType: 'id_token', // ✅ Required to get an ID token
  } as any); // 🧽 suppress TypeScript warning

  console.log("📌 redirectUri:", redirectUri);
  console.log("📌 request:", request);
  console.log("📌 response:", response);

  useEffect(() => {
    if (request?.url) {
      console.log("🔗 FULL Google Auth Request URL:", request.url);
    }
  }, [request]);

  useEffect(() => {
    console.log("🧪 Response changed:", response);

    if (response?.type === 'success') {
      // ✅ Extract ID token from response.params instead of authentication
      const idToken = response.params?.id_token;

      if (!idToken) {
        console.warn("⚠️ No ID token returned from Google.");
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);

      signInWithCredential(auth, credential)
        .then(() => {
          console.log("✅ Firebase login success");
          router.push('/dashboard');
        })
        .catch((err) => {
          console.error("❌ Firebase Google login error:", err);
        });
    } else if (response?.type === 'error') {
      console.error("❌ Google auth failed:", response.error);
    }
  }, [response]);

  return { promptAsync, request };
};
