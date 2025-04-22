import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Animated, 
  Keyboard,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const VerificationCodeInput = ({ 
  codeLength = 6, 
  value = '', 
  onChangeText, 
  autoFocus = true 
}) => {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const animatedBorderColor = useRef(new Animated.Value(0)).current;
  
  // Convert string to array of characters
  const codeArray = value.split('');
  while (codeArray.length < codeLength) {
    codeArray.push('');
  }

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [autoFocus]);

  useEffect(() => {
    Animated.timing(animatedBorderColor, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = animatedBorderColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E5E5', '#6C47FF']
  });

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const handlePress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={(text) => {
          // Only allow numbers and limit to codeLength
          const cleanedText = text.replace(/[^0-9]/g, '').slice(0, codeLength);
          onChangeText(cleanedText);
        }}
        keyboardType="number-pad"
        maxLength={codeLength}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      
      <View style={styles.codeContainer} onTouchStart={handlePress}>
        {Array(codeLength).fill(0).map((_, index) => {
          const isFilled = index < value.length;
          const isCurrentPosition = index === value.length;
          
          return (
            <Animated.View 
              key={index}
              style={[
                styles.codeBox,
                {
                  borderColor: isCurrentPosition && focused ? borderColor : (isFilled ? '#6C47FF' : '#E5E5E5'),
                  backgroundColor: isFilled ? 'rgba(108, 71, 255, 0.05)' : '#F8F9FA',
                }
              ]}
            >
              <Animated.Text style={[
                styles.codeText,
                { color: isFilled ? '#1A1A1A' : '#A0A0A0' }
              ]}>
                {codeArray[index] || (isCurrentPosition && focused ? '|' : '')}
              </Animated.Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  codeBox: {
    width: width > 380 ? 50 : 40,
    height: width > 380 ? 60 : 50,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '600',
  },
});

export default VerificationCodeInput;