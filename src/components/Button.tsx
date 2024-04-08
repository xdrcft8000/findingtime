import React, {forwardRef, useEffect, useState} from 'react';
import {
  TouchableOpacity,
  Text as RNText,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Pressable,
  PressableProps,
  TextInputProps,
  TextInput,
  View,
  ActivityIndicator,
  ViewProps,
  TextProps,
  Platform,
  TouchableNativeFeedback,
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
import {DateSchema} from 'yup';
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  startOfWeek,
} from 'date-fns';

const fontCodes = {
  G: 'GowunDodum-Regular',
  P: 'PlayfairDisplay-Regular',
  Psb: 'PlayfairDisplay-SemiBold',
  Psbi: 'PlayfairDisplay-SemiBoldItalic',
  Pb: 'PlayfairDisplay-Bold',
  Pbi: 'PlayfairDisplay-BoldItalic',
  Pm: 'PlayfairDisplay-Medium',
  Pmi: 'PlayfairDisplay-MediumItalic',
  Pi: 'PlayfairDisplay-Italic',
};

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  dark?: boolean;
  disabled?: boolean;
  half?: boolean;
  third?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  containerStyle,
  textStyle,
  disabled,
  half,
  third,
  loading = false,
  ...props
}) => {
  if (loading) {
    return (
      <View style={containerStyle}>
        <Loading
          size={25}
          containerStyle={{
            height: 51,
          }}
        />
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={[
        commonStyles.button,
        containerStyle,
        {width: half ? '50%' : third ? '33%' : '80%'},
      ]}
      {...props}>
      <RNText
        style={[
          commonStyles.buttonText,
          textStyle,
          {opacity: disabled ? 0.5 : 1},
        ]}>
        {title}
      </RNText>
    </TouchableOpacity>
  );
};

export const WhiteButton: React.FC<ButtonProps> = ({
  title,
  containerStyle,
  textStyle,
  dark,
  disabled,
  half,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        commonStyles.whiteButton,
        containerStyle,
        dark && {backgroundColor: COLOURS.white},
        {width: half ? '50%' : '80%'},
      ]}
      {...props}>
      <RNText
        style={[
          commonStyles.buttonText,
          textStyle,
          {opacity: disabled ? 0.5 : 1},
        ]}>
        {title}
      </RNText>
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
      <RNText
        style={[
          commonStyles.smallText,
          textStyle,
          dark && {color: COLOURS.white},
        ]}>
        {title}
      </RNText>
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
      <RNText style={[commonStyles.textInputTitle, {color: titleColour}]}>
        {title}
      </RNText>
      <TextInput
        style={[
          commonStyles.textInput,
          error && {borderColor: 'red', borderWidth: 1},
        ]}
        {...textInputProps}
      />
      <RNText style={[commonStyles.textInputError]}>{error}</RNText>
    </View>
  );
};

type TextInputClearProps = {
  font: string;
  size: number;
  dark?: boolean;
} & TextInputProps;

export const TextInputClear: React.FC<TextInputClearProps> = forwardRef<
  TextInput,
  TextInputClearProps
>(({font, size, dark, ...textInputProps}, ref) => {
  const {style, ...otherProps} = textInputProps;
  return (
    <TextInput
      ref={ref}
      style={[
        {
          fontFamily: fontCodes[font as keyof typeof fontCodes],
          fontSize: size,
          backgroundColor: dark ? COLOURS.black : COLOURS.white,
          color: dark ? COLOURS.white : COLOURS.black,
        },
        style,
      ]}
      {...otherProps}
    />
  );
});

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
        width: '100%',
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
      }}>
      <View style={{width: '85%', flexDirection: 'column'}}>
        <SelectList
          save="value"
          arrowicon={
            <Icon
              name="chevron-down"
              size={18}
              color={dark ? COLOURS.white : 'black'}
            />
          }
          searchicon={
            <Icon
              name="search"
              size={15}
              color={dark ? COLOURS.white : 'black'}
            />
          }
          closeicon={
            <Icon name="x" size={20} color={dark ? COLOURS.white : 'black'} />
          }
          notFoundText={"Press the '+' button"}
          placeholder="Select an option"
          boxStyles={{
            borderWidth: 0,
            borderRadius: 15,
            backgroundColor: dark ? 'black' : 'white',
            height: 45,
          }}
          inputStyles={[
            commonStyles.buttonText,
            {paddingLeft: 5, color: dark ? COLOURS.white : 'black'},
          ]}
          dropdownStyles={{
            backgroundColor: dark ? 'black' : 'white',
            borderRadius: 15,
            borderWidth: 0,
            position: 'absolute',
            width: '100%',
            marginTop: 53,
            zIndex: 100,
          }}
          dropdownTextStyles={{
            color: dark ? COLOURS.white : 'black',
            fontSize: 16,
            fontFamily: 'GowunDodum-Regular',
          }}
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

type LoadingProps = {
  size: number;
  containerStyle?: ViewStyle;
} & ViewProps;

export const Loading: React.FC<LoadingProps> = ({
  size,
  containerStyle,
  ...viewProps
}) => {
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
    <View style={[containerStyle, {alignItems: 'center'}]} {...viewProps}>
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

type EasyTextProps = {
  darkbg: boolean;
  size: number;
  font: string;
} & TextProps;
export const Text: React.FC<EasyTextProps> = ({
  darkbg,
  font,
  size,
  ...textProps
}) => {
  const textColour = darkbg ? COLOURS.white : COLOURS.black;
  const {style, ...otherProps} = textProps;

  return (
    <RNText
      style={[
        {
          color: textColour,
          fontSize: size,
          fontFamily: fontCodes[font as keyof typeof fontCodes],
        },
        style, // Apply additional style props
      ]}
      {...otherProps} // Spread otherProps instead of textProps
    />
  );
};

type DateSelectorProps = {
  dark: boolean;
  setDate: (date: Date) => void;
  initialDate?: Date;
} & ViewProps;

export const DateSelector: React.FC<DateSelectorProps> = ({
  dark,
  setDate,
  initialDate,
}) => {
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    initialDate ? initialDate : startOfWeek(new Date(), {weekStartsOn: 1}), // Start week on Monday
  );

  const previousWeek = () => {
    setCurrentWeekStart(prevWeekStart => addWeeks(prevWeekStart, -1));
    setDate(addWeeks(currentWeekStart, -1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(prevWeekStart => addWeeks(prevWeekStart, 1));
    setDate(addWeeks(currentWeekStart, 1));
  };
  // Calculate the end date of the week (Sunday)
  const endOfWeekDate = addDays(currentWeekStart, 6);

  // Format the start and end dates of the current week
  const startDate = format(currentWeekStart, 'dd MMM');
  const endDate = format(endOfWeekDate, 'dd MMM');

  // Determine whether to hide the back chevron
  const hideBackChevron =
    isSameDay(currentWeekStart, today) || isBefore(currentWeekStart, today);
  const hitBox = 20;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
      }}>
      {hideBackChevron ? (
        <View style={{width: 20}} />
      ) : (
        <TouchableOpacity
          onPress={previousWeek}
          hitSlop={{left: hitBox, right: hitBox, top: hitBox, bottom: hitBox}}>
          <Icon
            name="chevron-left"
            size={20}
            color={dark ? 'white' : 'black'}
          />
        </TouchableOpacity>
      )}
      <Text size={20} font="P" darkbg={dark}>
        {startDate} - {endDate}
      </Text>
      <TouchableOpacity
        onPress={nextWeek}
        hitSlop={{left: hitBox, right: hitBox, top: hitBox, bottom: hitBox}}>
        <Icon name="chevron-right" size={20} color={dark ? 'white' : 'black'} />
      </TouchableOpacity>
    </View>
  );
};

type DateDurationSelectorProps = {
  dark: boolean;
  date: Date;
  setDate: (date: Date) => void;
  initialDate?: Date;
  end?: boolean;
} & ViewProps &
  DateSelectorProps;

export const DateDurationSelector: React.FC<DateDurationSelectorProps> = ({
  dark,
  date,
  setDate,
  end,
}) => {
  const today = new Date();

  const previousWeek = () => {
    setDate(addWeeks(date, -1));
  };

  const nextWeek = () => {
    setDate(addWeeks(date, 1));
  };

  // Format the start and end dates of the current week
  const startDate = format(date, 'dd MMMMMMMMMMM yy');

  // Determine whether to hide the back chevron
  let hideBackChevron = false;

  if (end) {
    hideBackChevron =
      isSameDay(addWeeks(date, -1), today) ||
      isBefore(addWeeks(date, -1), today);
  } else {
    hideBackChevron = isSameDay(date, today) || isBefore(date, today);
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
      }}>
      {hideBackChevron ? (
        <View style={{width: 20}} />
      ) : (
        <TouchableOpacity onPress={previousWeek}>
          <Icon
            name="chevron-left"
            size={20}
            color={dark ? 'white' : 'black'}
          />
        </TouchableOpacity>
      )}
      <Text size={20} font="P" darkbg={dark}>
        {startDate}
      </Text>
      <TouchableOpacity onPress={nextWeek}>
        <Icon name="chevron-right" size={20} color={dark ? 'white' : 'black'} />
      </TouchableOpacity>
    </View>
  );
};
