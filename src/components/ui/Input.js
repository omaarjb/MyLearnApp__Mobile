import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Input = ({ 
  label, 
  error, 
  secureTextEntry, 
  containerStyle, 
  icon,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const animatedBorderColor = new Animated.Value(0);
  
  const borderColor = animatedBorderColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E5E5', '#6C47FF']
  });

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedBorderColor, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedBorderColor, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[
        styles.label, 
        isFocused && styles.focusedLabel,
        error && styles.errorLabel
      ]}>
        {label}
      </Text>
      
      <View style={styles.inputWrapper}>
        {icon && (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={20} color={isFocused ? "#6C47FF" : "#A0A0A0"} />
          </View>
        )}
        
        <Animated.View 
          style={[
            styles.inputContainer, 
            { borderColor: error ? "#FF3B30" : borderColor },
            isFocused && styles.focusedInput,
            error && styles.errorInput
          ]}
        >
          <TextInput 
            style={[
              styles.input,
              icon && styles.inputWithIcon
            ]} 
            placeholderTextColor="#A0A0A0"
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={actualSecureTextEntry}
            {...props} 
          />
          
          {secureTextEntry && (
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={togglePasswordVisibility}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MaterialCommunityIcons 
                name={isPasswordVisible ? "eye-off" : "eye"} 
                size={20} 
                color="#A0A0A0" 
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  focusedLabel: {
    color: "#6C47FF",
  },
  errorLabel: {
    color: "#FF3B30",
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F8F9FA",
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    overflow: 'hidden',
  },
  focusedInput: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#6C47FF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  errorInput: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
    height: 56,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;