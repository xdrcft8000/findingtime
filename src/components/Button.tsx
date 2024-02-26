import React, {useEffect} from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Pressable,
  PressableProps,
  TextInputProps,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import {commonStyles} from '../styles/styles';
import Icon from 'react-native-vector-icons/Feather';
import COLOURS from '../../constants/colours';
import {SelectList, SelectListProps} from 'react-native-dropdown-select-list';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  dark?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  containerStyle,
  textStyle,
  disabled,
  ...props
}) => {
  return (
    <TouchableOpacity style={[commonStyles.button, containerStyle]} {...props}>
      <Text
        style={[
          commonStyles.buttonText,
          textStyle,
          {opacity: disabled ? 0.5 : 1},
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export const WhiteButton: React.FC<ButtonProps> = ({
  title,
  containerStyle,
  textStyle,
  dark,
  disabled,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        commonStyles.whiteButton,
        containerStyle,
        dark && {backgroundColor: COLOURS.white},
      ]}
      {...props}>
      <Text
        style={[
          commonStyles.buttonText,
          textStyle,
          {opacity: disabled ? 0.5 : 1},
        ]}>
        {title}
      </Text>
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

type TextInputTitleProps = {
  title: string;
  error?: string;
  dark: boolean;
  containerStyle?: ViewStyle;
} & TextInputProps; // Extend with PressableProps to inherit all pressable props

export const TextInputTitle: React.FC<TextInputTitleProps> = ({
  title,
  error,
  dark,
  containerStyle,
  ...textInputProps
}) => {
  const titleColour = dark ? COLOURS.white : 'black';
  return (
    <View
      style={[
        containerStyle,
        {width: '100%', alignItems: 'center', height: 96},
      ]}>
      <Text style={[commonStyles.textInputTitle, {color: titleColour}]}>
        {title}
      </Text>
      <TextInput
        style={[
          commonStyles.textInput,
          error && {borderColor: 'red', borderWidth: 1},
        ]}
        {...textInputProps}
      />
      <Text style={[commonStyles.textInputError]}>{error}</Text>
    </View>
  );
};

type DropDownMenuProps = {
  dark: boolean;
  onPress: () => void;
} & SelectListProps;

export const DropDownMenu: React.FC<DropDownMenuProps> = ({
  dark,
  onPress,
  ...selectListProps
}) => {
  return (
    <View
      style={{
        width: '80%',
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
      }}>
      <View style={{width: '85%', flexDirection: 'column'}}>
        <SelectList
          save="value"
          arrowicon={<Icon name="chevron-down" size={18} color={'black'} />}
          searchicon={<Icon name="search" size={15} color={'black'} />}
          closeicon={<Icon name="x" size={20} color={'black'} />}
          notFoundText={"Selection doesn't not exist"}
          boxStyles={{
            borderWidth: 0,
            borderRadius: 15,
            backgroundColor: 'white',
            height: 45,
          }}
          inputStyles={[commonStyles.buttonText, {paddingLeft: 5}]}
          dropdownStyles={{
            backgroundColor: 'white',
            borderRadius: 15,
            borderWidth: 0,
            position: 'absolute',
            width: '100%',
            marginTop: 53,
          }}
          dropdownTextStyles={commonStyles.buttonText}
          {...selectListProps}
        />
      </View>
      <TouchableOpacity
        style={{
          width: '15%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onPress}>
        <Icon name="plus" size={22} color={dark ? 'white' : 'black'} />
      </TouchableOpacity>
    </View>
  );
};

export const Loading = ({size = 20}: {size: number}) => {
  const loadingProgress = useSharedValue(-1);
  useEffect(() => {
    loadingProgress.value = withRepeat(
      withTiming(1, {
        duration: 350,
        easing: Easing.ease,
      }),
      -1,
      true,
    );
  }, [loadingProgress]);

  const salmonStyles = useAnimatedProps(() => ({
    marginLeft: 0 + 35 * loadingProgress.value,
  }));
  const whiteStyles = useAnimatedProps(() => ({}));
  return (
    <View style={{ alignItems: 'center'}}>
      <Animated.View
        style={[
          salmonStyles,
          {
            width: size,
            height: size,
            backgroundColor: COLOURS.salmon,
            borderRadius: 90,
          },
        ]}
      />
      <Animated.View
        style={[
          whiteStyles,
          {
            width: size,
            height: size,
            backgroundColor: 'white',
            borderRadius: 90,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      />
    </View>
  );
};
