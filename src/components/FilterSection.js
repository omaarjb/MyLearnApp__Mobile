import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FilterSection = ({ 
  label, 
  options, 
  selectedValue, 
  onSelect, 
  displayText 
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => setShowOptions(!showOptions)}
      >
        <Text style={styles.filterButtonText}>
          {label}: {displayText(selectedValue)}
        </Text>
        <Ionicons 
          name={showOptions ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#666666" 
        />
      </TouchableOpacity>

      {showOptions && (
        <View style={styles.filterOptions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOptionButton,
                  selectedValue === option && styles.activeFilterOption,
                ]}
                onPress={() => {
                  onSelect(option);
                  setShowOptions(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedValue === option && styles.activeFilterOptionText,
                  ]}
                >
                  {displayText(option)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 44,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333333',
    flexShrink: 1,
  },
  filterOptions: {
    marginTop: 8,
    maxHeight: 50,
  },
  filterOptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterOption: {
    backgroundColor: '#6C47FF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  activeFilterOptionText: {
    color: '#FFFFFF',
  },
});

export default FilterSection;