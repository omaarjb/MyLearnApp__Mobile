"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { useNavigation } from "@react-navigation/native"

const AuthContext = createContext({
  isLoading: true,
  isSignedIn: false,
})

export const useAuthContext = () => useContext(AuthContext)

const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const navigation = useNavigation()

  useEffect(() => {
    if (!isLoaded) return

    const checkAuth = async () => {
      setIsLoading(true)

      if (isSignedIn && user) {
        // Use setTimeout to ensure navigation happens after render
        setTimeout(() => {
          navigation.navigate("Home")
        }, 0)
      } else {
        setTimeout(() => {
          navigation.navigate("SignIn")
        }, 0)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [isLoaded, isSignedIn, user, navigation])

  const value = {
    isLoading: isLoading || !isLoaded,
    isSignedIn: isSignedIn || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
