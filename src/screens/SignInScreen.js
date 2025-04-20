"use client"

import { useState, useCallback } from "react"
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
import { useSignIn } from "@clerk/clerk-expo"
import { useNavigation } from "@react-navigation/native"
import * as WebBrowser from "expo-web-browser"
import { makeRedirectUri } from "expo-auth-session"
import { useOAuth } from "@clerk/clerk-expo";

import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import OAuthButton from "../components/ui/OAuthButton"

// Ensure WebBrowser is properly initialized
WebBrowser.maybeCompleteAuthSession()

// Your Clerk Frontend API
const CLERK_FRONTEND_API = "thankful-starling-45"

const SignInScreen = () => {
  const { signIn, setActive, isLoaded } = useSignIn()
  const navigation = useNavigation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Get the redirect URL for Expo Go
  const redirectUrl = makeRedirectUri({
    preferLocalhost: true,
  })



  const handleSignIn = async () => {
    if (!isLoaded) return

    setLoading(true)
    setError("")

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      await setActive({ session: result.createdSessionId })
      navigation.navigate("Home")
    } catch (err) {
      console.error("Sign in error:", err)
      setError(err.errors?.[0]?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: "oauth_apple" });

  // Simple OAuth handler using Clerk's built-in functionality
  const handleOAuthSignIn = useCallback(async (strategy) => {
    if (!isLoaded) return;
    
    try {
      setLoading(true);
      setError("");
      
      let result;
      if (strategy === "oauth_google") {
        result = await startGoogleOAuthFlow();
      } else if (strategy === "oauth_apple") {
        result = await startAppleOAuthFlow();
      }
      
      if (result?.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        navigation.navigate("Home");
      }
    } catch (err) {
      console.error(`${strategy} OAuth error:`, err);
      setError("OAuth sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, startGoogleOAuthFlow, startAppleOAuthFlow, setActive, navigation]);

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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleSignIn} loading={loading} />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtons}>
  <OAuthButton provider="google" onPress={() => handleOAuthSignIn("oauth_google")} />
  <OAuthButton provider="apple" onPress={() => handleOAuthSignIn("oauth_apple")} />
</View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.footerLink}>Sign Up</Text>
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
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#6C47FF",
    fontSize: 14,
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

export default SignInScreen
