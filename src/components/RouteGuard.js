"use client"

import { useEffect } from "react"
import { useUser, useAuth } from "@clerk/clerk-expo"
import { useNavigation, useRoute } from "@react-navigation/native"

const RouteGuard = ({ children }) => {
  const { isLoaded: isUserLoaded, user } = useUser()
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const navigation = useNavigation()
  const route = useRoute()

  // Check if user is authenticated and has a role
  useEffect(() => {
    const checkAuthAndRole = async () => {
      // Wait for Clerk to load
      if (!isUserLoaded || !isAuthLoaded) return

      // Skip role check if we're on these screens
      const publicScreens = ["SignIn", "SignUp", "VerifyEmail", "ResetPassword", "VerifyReset"]
      const isPublicScreen = publicScreens.includes(route.name)

      // If user is signed in
      if (isSignedIn && user) {
        // If we're on a public screen, navigate to appropriate screen based on role
        if (isPublicScreen) {
          const userRole = user?.unsafeMetadata?.role

          if (!userRole) {
            // If no role is set, go to role selection
            navigation.reset({
              index: 0,
              routes: [{ name: "RoleSelection" }],
            })
          } else {
            // If role is set, go to appropriate home screen
            navigation.reset({
              index: 0,
              routes: [{ name: userRole === "student" ? "Home" : "ProfesseurHome" }],
            })
          }
        }
        // If we're on the role selection screen, don't redirect
        else if (route.name === "RoleSelection") {
          // Do nothing, let the user select a role
        }
        // If we're on a protected screen, check if user has the right role
        else {
          const userRole = user?.unsafeMetadata?.role

          if (!userRole) {
            // If no role is set, go to role selection
            navigation.reset({
              index: 0,
              routes: [{ name: "RoleSelection" }],
            })
          } else if (
            (userRole === "student" && route.name === "ProfesseurHome") ||
            (userRole === "professeur" && route.name === "Home")
          ) {
            // If user is on the wrong home screen, redirect to the correct one
            navigation.reset({
              index: 0,
              routes: [{ name: userRole === "student" ? "Home" : "ProfesseurHome" }],
            })
          }
        }
      }
      // If user is not signed in and trying to access a protected screen
      else if (!isSignedIn && !isPublicScreen && route.name !== "RoleSelection") {
        navigation.reset({
          index: 0,
          routes: [{ name: "SignIn" }],
        })
      }
    }

    checkAuthAndRole()
  }, [isUserLoaded, isAuthLoaded, isSignedIn, user, route.name, navigation])

  return children
}

export default RouteGuard
