import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Animated, Pressable, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const OAuthButton = ({ provider, onPress }) => {
  const getProviderDetails = () => {
    switch (provider) {
      case "google":
        return {
          iconName: "google",
          color: "#FFFFFF",
          gradientColors: ['#DB4437', '#DB4437'],
          shadowColor: 'rgba(219, 68, 55, 0.5)',
        }
      case "apple":
        return {
          iconName: "apple",
          color: "#FFFFFF",
          gradientColors: ['#000000', '#333333'],
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        }
      case "facebook":
        return {
          iconName: "facebook",
          color: "#FFFFFF",
          gradientColors: ['#1877F2', '#0D5DC1'],
          shadowColor: 'rgba(24, 119, 242, 0.5)',
        }
      case "github":
        return {
          iconName: "github",
          color: "#FFFFFF",
          gradientColors: ['#333333', '#000000'],
          shadowColor: 'rgba(51, 51, 51, 0.5)',
        }
      default:
        return {
          iconName: "account",
          color: "#FFFFFF",
          gradientColors: ['#6C47FF', '#7C5AFF'],
          shadowColor: 'rgba(108, 71, 255, 0.5)',
        }
    }
  }

  const { iconName, color, gradientColors, shadowColor } = getProviderDetails();
  const animatedScale = new Animated.Value(1);
  
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.buttonWrapper}
    >
      <Animated.View 
        style={[
          styles.buttonContainer, 
          { 
            transform: [{ scale: animatedScale }],
            shadowColor: shadowColor,
          }
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons 
            name={iconName} 
            size={24} 
            color={color}
          />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    margin: 8,
  },
  buttonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OAuthButton;