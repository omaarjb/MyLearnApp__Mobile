"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import  {apiUrl}  from "../api/apiUrl"

import Button from "../components/ui/Button"



const { width } = Dimensions.get("window")

const RoleSelectionScreen = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const cardFadeAnim = useRef(new Animated.Value(0)).current
  const cardSlideAnim = useRef(new Animated.Value(50)).current

  // Hooks and state
  const { isLoaded, user } = useUser()
  const navigation = useNavigation()
  const [role, setRole] = useState("student")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [autoRedirected, setAutoRedirected] = useState(false)




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
          Animated.timing(cardFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(cardSlideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start()
    }
  }, [isLoaded])

  // Set initial role from user metadata if available
  // But don't auto-redirect if role is already set
  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.role && !autoRedirected) {
      // Just set the initial role selection, but don't navigate away
      setRole(user.unsafeMetadata.role)
      
      // Prevent multiple checks
      setAutoRedirected(true)
    }
  }, [isLoaded, user, autoRedirected])

  const handleSubmit = async () => {
    if (!isLoaded || !user) {
      setError("User not loaded. Please try again.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. First update backend
      const response = await fetch(`${apiUrl}/user/update-role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          role: role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to save role to backend")
      }

      // 2. Then update Clerk metadata
      try {
        await user.update({
          unsafeMetadata: {
            ...(user.unsafeMetadata || {}), // Preserve existing metadata
            role: role,
          },
        })

        // Redirect based on role
        if (role === "student") {
          navigation.navigate("Home")
        } else {
          navigation.navigate("ProfesseurHome")
        }
      } catch (updateError) {
        console.error("Clerk metadata update failed:", updateError)
        throw new Error(`Failed to update Clerk profile: ${updateError.message || "Unknown error"}`)
      }
    } catch (err) {
      console.error("Error in role update process:", err)
      setError(err.message || "Failed to save role. Please try again.")
    } finally {
      setIsSubmitting(false)
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
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LinearGradient colors={["#f7f9ff", "#ffffff"]} style={StyleSheet.absoluteFill} />

      <View style={styles.container}>
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
              colors={["#7C5AFF", "#6C47FF"]}
              style={styles.logoBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="account-group" size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>Choose the role that best describes you</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardFadeAnim,
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>What best describes your role?</Text>

          <View style={styles.roleOptions}>
            <TouchableOpacity
              style={[styles.roleOption, role === "student" && styles.roleOptionSelected]}
              onPress={() => setRole("student")}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="school" size={28} color={role === "student" ? "#FFFFFF" : "#6C47FF"} />
              <Text style={[styles.roleText, role === "student" && styles.roleTextSelected]}>Student</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, role === "professeur" && styles.roleOptionSelected]}
              onPress={() => setRole("professeur")}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="teach" size={28} color={role === "professeur" ? "#FFFFFF" : "#6C47FF"} />
              <Text style={[styles.roleText, role === "professeur" && styles.roleTextSelected]}>Professeur</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={isSubmitting ? "Saving..." : "Continue"}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.continueButton}
          />
        </Animated.View>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 40,
    justifyContent: "center",
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
    maxWidth: "80%",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  roleOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  roleOption: {
    width: "48%",
    backgroundColor: "#F5F5F7",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F5F5F7",
  },
  roleOptionSelected: {
    backgroundColor: "#6C47FF",
    borderColor: "#6C47FF",
  },
  roleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 12,
  },
  roleTextSelected: {
    color: "#FFFFFF",
  },
  continueButton: {
    marginTop: 8,
  },
})

export default RoleSelectionScreen
