"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
} from "react-native"
import { useSignUp } from "@clerk/clerk-expo"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import VerificationCodeInput from "../components/ui/VerificationCodeInput"
import Button from "../components/ui/Button"

export default function VerifyEmailScreen({ route }) {
  const { email } = route.params
  const { signUp, setActive, isLoaded } = useSignUp()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigation = useNavigation()

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
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
    ]).start()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const onVerify = async () => {
    if (!isLoaded) return
    if (code.length < 6) {
      setError("Please enter the complete verification code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signUp.attemptEmailAddressVerification({ code })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        navigation.navigate("RoleSelection")
      } else {
        setError("Verification failed - unexpected result status")
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError(err.errors?.[0]?.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (!isLoaded || countdown > 0) return

    setResendLoading(true)
    setError("")

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setCountdown(60) // Start 60 second countdown
    } catch (err) {
      setError(err.errors?.[0]?.message || "Failed to resend code")
    } finally {
      setResendLoading(false)
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LinearGradient colors={["#f7f9ff", "#ffffff"]} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={["#7C5AFF", "#6C47FF"]}
                style={styles.iconBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="email-check-outline" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to{"\n"}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <View style={styles.card}>
              {error ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#FF3B30" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Enter verification code</Text>
              <VerificationCodeInput value={code} onChangeText={setCode} codeLength={6} autoFocus />

              <Button title="Verify Email" onPress={onVerify} loading={loading} />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>Resend in {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={resendCode} disabled={resendLoading} activeOpacity={0.7}>
                    <Text style={styles.resendButton}>{resendLoading ? "Sending..." : "Resend Code"}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>← Back to Sign Up</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
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
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 32,
    lineHeight: 22,
  },
  emailText: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  resendText: {
    color: "#666666",
    fontSize: 14,
  },
  resendButton: {
    color: "#6C47FF",
    fontSize: 14,
    fontWeight: "600",
  },
  countdownText: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: "#6C47FF",
    fontSize: 16,
    fontWeight: "500",
  },
})
