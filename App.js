import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { ClerkProvider } from "@clerk/clerk-expo"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

import SignInScreen from "./src/screens/SignInScreen"
import SignUpScreen from "./src/screens/SignUpScreen"
import HomeScreen from "./src/screens/HomeScreen"
import { tokenCache } from "./src/utils/tokenCache"
import AuthProvider from "./src/providers/AuthProvider"
import VerifyEmailScreen from "./src/screens/VerifyEmailScreen"
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen"
import VerifyResetScreen from "./src/screens/VerifyResetScreen"
import RoleSelectionScreen from "./src/screens/role-selection-screen"
import ProfesseurHomeScreen from "./src/screens/professeur-home-screen"
import RouteGuard from "./src/components/RouteGuard"
import QuizScreen from "./src/screens/quiz-screen"
import QuizResultsScreen from "./src/screens/quiz-results-screen"

// Replace with your publishable key from Clerk Dashboard
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

const Stack = createNativeStackNavigator()

// Create dedicated protected screen components instead of inline functions
const ProtectedRoleSelectionScreen = (props) => (
  <RouteGuard>
    <RoleSelectionScreen {...props} />
  </RouteGuard>
)

const ProtectedHomeScreen = (props) => (
  <RouteGuard>
    <HomeScreen {...props} />
  </RouteGuard>
)

const ProtectedProfesseurHomeScreen = (props) => (
  <RouteGuard>
    <ProfesseurHomeScreen {...props} />
  </RouteGuard>
)

const ProtectedQuizScreen = (props) => (
  <RouteGuard>
    <QuizScreen {...props} />
  </RouteGuard>
)

const ProtectedQuizResultsScreen = (props) => (
  <RouteGuard>
    <QuizResultsScreen {...props} />
  </RouteGuard>
)

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {/* Public screens */}
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="VerifyReset" component={VerifyResetScreen} />

              {/* Protected screens with RouteGuard */}
              <Stack.Screen name="RoleSelection" component={ProtectedRoleSelectionScreen} />
              <Stack.Screen name="Home" component={ProtectedHomeScreen} />
              <Stack.Screen name="ProfesseurHome" component={ProtectedProfesseurHomeScreen} />
              <Stack.Screen name="Quiz" component={ProtectedQuizScreen} />
              <Stack.Screen name="QuizResults" component={ProtectedQuizResultsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  )
}