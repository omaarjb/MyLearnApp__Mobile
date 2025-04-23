"use client"

import { createContext, useContext, useState } from "react"
import { StyleSheet } from "react-native"
import { useUser, useAuth } from "@clerk/clerk-expo"

// Create context
const AuthContext = createContext(null)

// Hook to use the auth context
export const useAuthContext = () => useContext(AuthContext)

const AuthProvider = ({ children }) => {
  const { isLoaded: isUserLoaded, user } = useUser()
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  // Provide auth context values
  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn,
        isLoaded: isUserLoaded && isAuthLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
})

export default AuthProvider
