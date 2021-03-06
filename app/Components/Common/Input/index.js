import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '_styles';

const Input = ({ label, value, editable, placeholder, style }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onPressLabel = () => {
    setTimeout(() => setIsOpen(!isOpen), 0);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        disabled={editable == false}
        onPress={onPressLabel}
        style={styles.valueContainer}
        accessible={true}
        accessibilityLabel="Input Button"
        testID="input_btn">
        <Text style={styles.value}>{value ? value : placeholder}</Text>
      </TouchableOpacity>
    </View>
  );
};
export default Input;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    flex: 1,
  },
  label: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    lineHeight: Typography.LINE_HEIGHT_30,
    color: Colors.TEXT_COLOR,
  },
  value: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_20,
    color: Colors.TEXT_COLOR,
    fontWeight: Typography.FONT_WEIGHT_MEDIUM,
    flex: 1,
    paddingVertical: 10,
  },
  valueContainer: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.TEXT_COLOR,
  },
});
