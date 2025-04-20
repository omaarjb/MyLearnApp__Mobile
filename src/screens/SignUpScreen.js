import { useState } from "react"
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
} from "react-native"
import { useSignUp } from "@clerk/clerk-expo"
import { useNavigation } from "@react-navigation/native"
import * as WebBrowser from "expo-web-browser"
import { makeRedirectUri } from "expo-auth-session"

import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import OAuthButton from "../components/ui/OAuthButton"

WebBrowser.maybeCompleteAuthSession()

const SignUpScreen = () => {
  const { signUp, setActive, isLoaded } = useSignUp()
  const navigation = useNavigation()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState("")

  const redirectUrl = makeRedirectUri()

  const handleSignUp = async () => {
    if (!isLoaded) return

    setLoading(true)
    setError("")

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      })

      // Start the email verification process
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setVerifying(true)
    } catch (err) {
      setError(err.errors[0]?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async () => {
    if (!isLoaded) return

    setLoading(true)
    setError("")

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      })

      await setActive({ session: result.createdSessionId })
      navigation.navigate("Home")
    } catch (err) {
      setError(err.errors[0]?.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignUp = async (strategy) => {
    if (!isLoaded) return

    setLoading(true)
    setError("")

    try {
      const result = await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete: redirectUrl,
      })

      const { createdSessionId } = result
      if (createdSessionId) {
        await setActive({ session: createdSessionId })
        navigation.navigate("Home")
      }
    } catch (err) {
      setError(err.errors[0]?.message || "Something went wrong with OAuth")
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C47FF" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image source={{ uri: "/placeholder.svg?height=80&width=80" }} style={styles.logo} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {verifying ? (
          <View style={styles.form}>
            <Text style={styles.verificationText}>
              We've sent a verification code to your email. Please enter it below.
            </Text>
            <Input
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              placeholder="Enter verification code"
              keyboardType="number-pad"
            />
            <Button title="Verify Email" onPress={handleVerification} loading={loading} />
          </View>
        ) : (
          <>
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Input label="First Name" value={firstName} onChangeText={setFirstName} placeholder="First name" />
                </View>
                <View style={styles.nameField}>
                  <Input label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Last name" />
                </View>
              </View>

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
              />

              <Text style={styles.passwordHint}>Password must be at least 8 characters long</Text>

              <Button title="Sign Up" onPress={handleSignUp} loading={loading} />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
              <OAuthButton provider="google" onPress={() => handleOAuthSignUp("oauth_google")} />
              <OAuthButton provider="apple" onPress={() => handleOAuthSignUp("oauth_apple")} />
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameField: {
    width: "48%",
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  passwordHint: {
    color: "#666666",
    fontSize: 12,
    marginTop: -16,
    marginBottom: 24,
    marginLeft: 4,
  },
  verificationText: {
    marginBottom: 24,
    textAlign: "center",
    color: "#666666",
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
    color: "#666666",
    fontSize: 14,
  },
  socialButtons: {
    marginBottom: 40,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#666666",
    fontSize: 14,
  },
  footerLink: {
    color: "#6C47FF",
    fontSize: 14,
    fontWeight: "bold",
  },
})

export default SignUpScreen
