"use client"

import { useState, useRef, useEffect } from "react"
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
  StatusBar,
  SafeAreaView,
  Dimensions,
} from "react-native"
import { useSignUp, useOAuth } from "@clerk/clerk-expo"
import { useNavigation } from "@react-navigation/native"
import * as WebBrowser from "expo-web-browser"
import { makeRedirectUri } from "expo-auth-session"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import OAuthButton from "../components/ui/OAuthButton"

WebBrowser.maybeCompleteAuthSession()

const { width } = Dimensions.get("window")

const SignUpScreen = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const formFadeAnim = useRef(new Animated.Value(0)).current
  const formSlideAnim = useRef(new Animated.Value(50)).current
  const socialFadeAnim = useRef(new Animated.Value(0)).current
  const socialSlideAnim = useRef(new Animated.Value(50)).current

  // Hooks and state
  const { signUp, setActive, isLoaded } = useSignUp()
  const navigation = useNavigation()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const redirectUrl = makeRedirectUri({
    preferLocalhost: true,
  })

  // Start animations
  useEffect(() => {
    if (isLoaded) {
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
          }),
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
          }),
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
          }),
        ]),
      ]).start()
    }
  }, [isLoaded])

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0

    // Length check
    if (password.length >= 8) strength += 1

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1

    // Contains number
    if (/[0-9]/.test(password)) strength += 1

    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    setPasswordStrength(strength)
  }, [password])

  const getPasswordStrengthLabel = () => {
    if (!password) return ""
    if (passwordStrength <= 1) return "Faible"
    if (passwordStrength <= 3) return "Moyen"
    return "Fort"
  }

  const getPasswordStrengthColor = () => {
    if (!password) return "#E5E5E5"
    if (passwordStrength <= 1) return "#FF3B30"
    if (passwordStrength <= 3) return "#FFCC00"
    return "#34C759"
  }

  const handleSignUp = async () => {
    if (!isLoaded) return

    // Basic validation
    if (!firstName.trim()) {
      setError("Le prénom est requis")
      return
    }

    if (!lastName.trim()) {
      setError("Le nom est requis")
      return
    }

    if (!email.trim()) {
      setError("L'email est requis")
      return
    }

    if (!password) {
      setError("Le mot de passe est requis")
      return
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create the sign-up attempt
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      })

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

      // Navigate to verification screen
      navigation.navigate("VerifyEmail", { email })
    } catch (err) {
      console.error("Sign up error:", err)
      setError(err.errors?.[0]?.message || "Une erreur s'est produite")
    } finally {
      setLoading(false)
    }
  }

  // OAuth providers setup
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" })
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: "oauth_apple" })
  const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({ strategy: "oauth_facebook" })
  const { startOAuthFlow: startGithubOAuthFlow } = useOAuth({ strategy: "oauth_github" })
  const handleOAuthSignUp = async (strategy) => {
    if (!isLoaded) return

    try {
      setLoading(true)
      setError("")

      const authFlow = {
        oauth_google: startGoogleOAuthFlow,
        oauth_apple: startAppleOAuthFlow,
        oauth_facebook: startFacebookOAuthFlow,
        oauth_github: startGithubOAuthFlow,
      }[strategy]

      const { createdSessionId } = await authFlow()

      if (createdSessionId) {
        await setActive({ session: createdSessionId })
        navigation.navigate("RoleSelection")
      }
    } catch (err) {
      console.error(`${strategy} OAuth error:`, err)
      setError("Échec de l'inscription avec OAuth. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <LinearGradient colors={["#f7f9ff", "#ffffff"]} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#6C47FF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LinearGradient colors={["#f7f9ff", "#ffffff"]} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#7c3aed', '#db2777']}
                style={styles.logoBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image source={{ uri: "/placeholder.svg?height=80&width=80" }} style={styles.logo} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Créer un Compte</Text>
            <Text style={styles.subtitle}>Rejoignez MyLearn et commencez votre parcours d'apprentissage</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: formFadeAnim,
                transform: [{ translateY: formSlideAnim }],
              },
            ]}
          >
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Input
                  label="Prénom"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Jean"
                  icon="account-outline"
                  containerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.nameField}>
                <Input
                  label="Nom"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Dupont"
                  containerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <Input
              label="Adresse Email"
              value={email}
              onChangeText={setEmail}
              placeholder="votre.email@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="email-outline"
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Mot de Passe"
              value={password}
              onChangeText={setPassword}
              placeholder="Créez un mot de passe sécurisé"
              secureTextEntry
              icon="lock-outline"
              containerStyle={styles.inputContainer}
            />

            <View style={styles.passwordStrengthContainer}>
              <View style={styles.passwordStrengthBars}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.passwordStrengthBar,
                      {
                        backgroundColor: passwordStrength >= index ? getPasswordStrengthColor() : "#E5E5E5",
                      },
                    ]}
                  />
                ))}
              </View>
              {password ? (
                <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrengthLabel()}
                </Text>
              ) : (
                <Text style={styles.passwordHint}>Le mot de passe doit contenir au moins 8 caractères</Text>
              )}
            </View>

            <Button title="Créer un Compte" onPress={handleSignUp} loading={loading} style={styles.signUpButton} />
          </Animated.View>

          <Animated.View
            style={[
              styles.socialSection,
              {
                opacity: socialFadeAnim,
                transform: [{ translateY: socialSlideAnim }],
              },
            ]}
          >
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
              <OAuthButton provider="google" onPress={() => handleOAuthSignUp("oauth_google")} />
              <OAuthButton provider="apple" onPress={() => handleOAuthSignUp("oauth_apple")} />
              <OAuthButton provider="facebook" onPress={() => handleOAuthSignUp("oauth_facebook")} />
              <OAuthButton provider="github" onPress={() => handleOAuthSignUp("oauth_github")} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Déjà un compte? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignIn")} activeOpacity={0.7}>
                <Text style={styles.footerLink}>Se Connecter</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

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
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 60,
    height: 60,
    tintColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameField: {
    width: "48%",
  },
  inputContainer: {
    marginBottom: 16,
  },
  passwordStrengthContainer: {
    marginBottom: 24,
  },
  passwordStrengthBars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  passwordHint: {
    color: "#666666",
    fontSize: 12,
    textAlign: "right",
  },
  signUpButton: {
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  footerText: {
    color: "#666666",
    fontSize: 15,
  },
  footerLink: {
    color: "#7c3aed",
    fontSize: 15,
    fontWeight: "700",
  },
})

export default SignUpScreen