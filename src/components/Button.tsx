import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import {commonStyles} from '../styles/styles';
import Icon from 'react-native-vector-icons/Feather';
import COLOURS from '../../constants/colours';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  dark?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  containerStyle,
  textStyle,
  ...props
}) => {
  return (
    <TouchableOpacity style={[commonStyles.button, containerStyle]} {...props}>
      <Text style={[commonStyles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export const ClearButton: React.FC<ButtonProps> = ({
  title,
  containerStyle,
  textStyle,
  dark,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        commonStyles.clearButton,
        containerStyle,
        dark && {borderColor: COLOURS.white},
      ]}
      {...props}>
      <Text
        style={[
          commonStyles.smallText,
          textStyle,
          dark && {color: COLOURS.white},
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

type BackButtonProps = {
  onPress: () => void;
  size: number;
  theme: string;
} & PressableProps; // Extend with PressableProps to inherit all pressable props

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  size,
  theme,
  ...pressableProps
}) => {
  const iconColor = theme === 'dark' ? 'white' : 'black';

  return (
    <Pressable
      style={{marginLeft: 10}}
      onPress={onPress}
      {...pressableProps} // Spread other pressable props
    >
      <Icon name="chevron-left" size={size} color={iconColor} />
    </Pressable>
  );
};
