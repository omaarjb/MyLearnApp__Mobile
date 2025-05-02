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
import PassQuizScreen from "./src/screens/pass-quiz-screen"
import QuizResultsScreen from "./src/screens/quiz-results-screen"
import StatsScreen from "./src/screens/StatsScreen"
import AccueilScreen from "./src/screens/AccueilScreen"
import QuizScreen from "./src/screens/QuizScreen"

// Replace with your publishable key from Clerk Dashboard
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

const Stack = createNativeStackNavigator()


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
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="ProfesseurHome" component={ProfesseurHomeScreen} />
              <Stack.Screen name="PassQuiz" component={PassQuizScreen} />
              <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
              <Stack.Screen name="Stats" component={StatsScreen} />
              <Stack.Screen name="Accueil" component={AccueilScreen} />
              <Stack.Screen name="Quiz" component={QuizScreen} />

              {/* Add more screens as needed */}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  )
}