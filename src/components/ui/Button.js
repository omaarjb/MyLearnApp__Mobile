import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, Pressable } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const Button = ({ 
  title, 
  loading = false, 
  variant = "primary", 
  style, 
  textStyle,
  ...props 
}) => {
  const animatedScale = new Animated.Value(1);
  
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.97,
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

  const isPrimary = variant === "primary";
  
  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#FFFFFF" : "#7c3aed"} />
      ) : (
        <Text 
          style={[
            styles.text, 
            isPrimary ? styles.primaryText : styles.secondaryText,
            textStyle
          ]}
        >
          {title}
        </Text>
      )}
    </>
  );

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading || props.disabled}
      onPress={props.onPress}
      style={({ pressed }) => [
        { opacity: (props.disabled && !loading) ? 0.6 : 1 }
      ]}
    >
      <Animated.View
        style={[
          styles.buttonContainer,
          { transform: [{ scale: animatedScale }] },
          style
        ]}
      >
        {isPrimary ? (
          <LinearGradient
            colors={['#7c3aed', '#db2777']} // Updated to purple-600 to pink-600
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              styles.primaryButton,
            ]}
          >
            <ButtonContent />
          </LinearGradient>
        ) : (
          <Animated.View 
            style={[
              styles.button, 
              styles.secondaryButton,
            ]}
          >
            <ButtonContent />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: "#7c3aed", // Updated to purple-600
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: "#7c3aed", // Fallback color (purple-600)
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#7c3aed", // Updated to purple-600
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#7c3aed", // Updated to purple-600
  },
});

export default Button;