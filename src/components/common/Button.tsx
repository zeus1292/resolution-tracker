import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const containerStyles = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    fullWidth ? styles.fullWidth : null,
    isDisabled ? styles.disabled : null,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled ? styles.disabledText : null,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.primary[500]}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={textStyles}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants - Container
  primaryContainer: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.default,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary[500],
    borderRadius: borderRadius.default,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.default,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.default,
  },

  // Variants - Text
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.inverse,
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.primary[500],
  },
  disabledText: {
    opacity: 0.7,
  },

  // Sizes - Container
  smContainer: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: 36,
  },
  mdContainer: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44,
  },
  lgContainer: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    minHeight: 52,
  },

  // Sizes - Text
  smText: {
    ...typography.styles.buttonSmall,
  },
  mdText: {
    ...typography.styles.button,
  },
  lgText: {
    ...typography.styles.button,
    fontSize: typography.fontSize.lg,
  },

  text: {
    textAlign: 'center',
  },
});
