"use client"

import { useEffect, useState } from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { useNavigation, useRoute } from "@react-navigation/native"

/**
 * AuthGuard component to check if user has selected a role
 * and redirect accordingly
 */
const AuthGuard = ({ children }) => {
  const { isLoaded, user } = useUser()
  const navigation = useNavigation()
  const route = useRoute()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Skip role check if we're already on these screens
    const exemptScreens = ["SignIn", "SignUp", "VerifyEmail", "RoleSelection"]
    if (exemptScreens.includes(route.name)) {
      setChecking(false)
      return
    }

    if (isLoaded && user) {
      // Check if user has a role
      const userRole = user?.unsafeMetadata?.role

      if (!userRole) {
        // If no role is set, redirect to role selection
        navigation.reset({
          index: 0,
          routes: [{ name: "RoleSelection" }],
        })
      } else {
        // If we're on the wrong home screen for our role, redirect
        if (
          (userRole === "student" && route.name === "ProfesseurHome") ||
          (userRole === "professeur" && route.name === "Home")
        ) {
          navigation.reset({
            index: 0,
            routes: [{ name: userRole === "student" ? "Home" : "ProfesseurHome" }],
          })
        }
      }
      setChecking(false)
    } else if (isLoaded && !user) {
      // If user is not authenticated, redirect to sign in
      navigation.reset({
        index: 0,
        routes: [{ name: "SignIn" }],
      })
      setChecking(false)
    }
  }, [isLoaded, user, route.name, navigation])

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6C47FF" />
      </View>
    )
  }

  return children
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
})

export default AuthGuard
