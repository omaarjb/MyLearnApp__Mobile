import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { checkExistingSession } from '../utils/session';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import OAuthButton from '../components/ui/OAuthButton';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const SignInScreen = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(50)).current;
  const socialFadeAnim = useRef(new Animated.Value(0)).current;
  const socialSlideAnim = useRef(new Animated.Value(50)).current;

  // Hooks
  const navigation = useNavigation();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const redirectUrl = makeRedirectUri({
    preferLocalhost: true,
  });

  // Start animations
  useEffect(() => {
    if (isLoaded && !checkingSession) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          })
        ]),
        Animated.parallel([
          Animated.timing(formFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(formSlideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          })
        ]),
        Animated.parallel([
          Animated.timing(socialFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(socialSlideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          })
        ])
      ]).start();
    }
  }, [isLoaded, checkingSession]);

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const hasSession = await checkExistingSession(signIn, setActive, navigation);
        setCheckingSession(false);
      } catch (err) {
        console.error('Session check error:', err);
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigation, signIn, setActive]);

  const handleSignIn = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      await setActive({ session: result.createdSessionId });
      navigation.navigate('Home');
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.errors?.[0]?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // OAuth providers setup
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });
  const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({ strategy: 'oauth_facebook' });
  const { startOAuthFlow: startGithubOAuthFlow } = useOAuth({ strategy: 'oauth_github' });

  const handleOAuthSignIn = useCallback(async (strategy) => {
    if (!isLoaded) return;
    
    try {
      setLoading(true);
      setError('');
      
      const authFlow = {
        oauth_google: startGoogleOAuthFlow,
        oauth_apple: startAppleOAuthFlow,
        oauth_facebook: startFacebookOAuthFlow,
        oauth_github: startGithubOAuthFlow,
      }[strategy];

      const { createdSessionId } = await authFlow();
      
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        navigation.navigate('Home');
      }
    } catch (err) {
      console.error(`${strategy} OAuth error:`, err);
      setError('OAuth sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, startGoogleOAuthFlow, startAppleOAuthFlow, startFacebookOAuthFlow, setActive, navigation]);

  // Loading state
  if (!isLoaded || checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <LinearGradient
          colors={['#f7f9ff', '#ffffff']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#6C47FF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LinearGradient
        colors={['#f7f9ff', '#ffffff']}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#7C5AFF', '#6C47FF']}
                style={styles.logoBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image 
                  source={{ uri: "/placeholder.svg?height=80&width=80" }} 
                  style={styles.logo} 
                />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Welcome to MyLearn</Text>
            <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.formCard,
              {
                opacity: formFadeAnim,
                transform: [{ translateY: formSlideAnim }]
              }
            ]}
          >
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="email-outline"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              icon="lock-outline"
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ResetPassword")}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button 
              title="Sign In" 
              onPress={handleSignIn} 
              loading={loading} 
              style={styles.signInButton}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.socialSection,
              {
                opacity: socialFadeAnim,
                transform: [{ translateY: socialSlideAnim }]
              }
            ]}
          >
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
              <OAuthButton provider="google" onPress={() => handleOAuthSignIn("oauth_google")} />
              <OAuthButton provider="apple" onPress={() => handleOAuthSignIn("oauth_apple")} />
              <OAuthButton provider="facebook" onPress={() => handleOAuthSignIn("oauth_facebook")} />
              <OAuthButton provider="github" onPress={() => handleOAuthSignIn("oauth_github")} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate("SignUp")}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6C47FF",
    fontWeight: "500",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: "#6C47FF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: "#FF3B30",
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    padding: 4,
  },
  forgotPasswordText: {
    color: "#6C47FF",
    fontSize: 14,
    fontWeight: "600",
  },
  signInButton: {
    marginTop: 8,
  },
  socialSection: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#888888",
    fontSize: 14,
    fontWeight: "600",
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    color: "#666666",
    fontSize: 15,
  },
  footerLink: {
    color: "#6C47FF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default SignInScreen;