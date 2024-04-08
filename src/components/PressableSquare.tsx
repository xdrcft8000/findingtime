import React, {useRef, useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  PanResponder,
  ViewStyle,
  Pressable,
} from 'react-native';
import COLOURS from '../../constants/colours';
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface RenderSquareProps {
  index: number;
  isLeftmostColumn: boolean;
  availability: boolean[];
  dark?: boolean;
  availabilityToggleHandler: (index: number) => void;
  setFlatListScrollEnabled: (enabled: boolean) => void;
  panresponderActive: React.MutableRefObject<boolean>;
  doRender: () => void;
  NUM_COLUMNS: number;
  ZOOM_QUOTIENT: number;
  CORNER_RADIUS: number;
  getHour: (index: number) => string;
  styles: StyleSheet.NamedStyles<any>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RenderSquare: React.FC<RenderSquareProps> = ({
  index,
  isLeftmostColumn,
  availability,
  dark,
  availabilityToggleHandler,
  setFlatListScrollEnabled,
  panresponderActive,
  doRender,
  NUM_COLUMNS,
  ZOOM_QUOTIENT,
  CORNER_RADIUS,
  getHour,
  styles,
}) => {
  const indexVar = index % (NUM_COLUMNS * ZOOM_QUOTIENT);
  const hourVar = index % (NUM_COLUMNS * ZOOM_QUOTIENT);
  const fadeProgress = useSharedValue(0.5);
  const longPress = () => {
    fadeProgress.value = withSequence(
      withTiming(0.1, {duration: 50}),
      withTiming(1, {duration: 50}),
      withTiming(0.1, {duration: 50}),
      );
    };
    //   const pressIn = () => {
    //     fadeProgress.value = withTiming(0.2, {duration: 50});
    //   };
      const pressOut = () => {
        fadeProgress.value = withTiming(1, {duration: 100});
      };
  return isLeftmostColumn ? (
    <View
      style={[
        styles.hourSquare,
        {borderWidth: 0, backgroundColor: 'rgba(255, 255, 255, 0)'},
      ]}>
      <Text style={[styles.hour, {backgroundColor: 'rgba(255, 255, 255, 0)'}]}>
        {getHour(index)}
      </Text>
    </View>
  ) : (
    <Pressable
      onPress={() => availabilityToggleHandler(index)}
      onLongPress={() => {
        longPress();
        setFlatListScrollEnabled(false);
        panresponderActive.current = true;
        doRender();
      }}
      pressRetentionOffset={{top: 10, left: 10, bottom: 10, right: 10}}
      onPressOut={() => {
        pressOut();
        setFlatListScrollEnabled(true);
        panresponderActive.current = false;
      }}
      style={({pressed}) => {
        return {
          opacity: pressed ? 0.7 : 1,
        };
      }}>
      <Animated.View
        style={[
          styles.square,
          {
            opacity: fadeProgress,
            backgroundColor: availability[index]
              ? COLOURS.teal
              : dark
              ? COLOURS.darkgrey
              : 'white',
            borderColor: dark ? 'black' : COLOURS.grey,
            borderTopWidth:
              indexVar > NUM_COLUMNS * 2
                ? indexVar < NUM_COLUMNS * 3
                  ? 1
                  : 0
                : 0,
            borderBottomWidth: indexVar > NUM_COLUMNS * 3 ? 4 : 0,
            borderTopLeftRadius: hourVar < NUM_COLUMNS ? CORNER_RADIUS : 0,
            borderTopRightRadius: hourVar < NUM_COLUMNS ? CORNER_RADIUS : 0,
            borderBottomLeftRadius:
              hourVar > NUM_COLUMNS * (ZOOM_QUOTIENT - 1) - 1
                ? CORNER_RADIUS
                : 0,
            borderBottomRightRadius:
              hourVar > NUM_COLUMNS * (ZOOM_QUOTIENT - 1) - 1
                ? CORNER_RADIUS
                : 0,
          },
        ]}>
        {/* <Text>{index}</Text> */}
      </Animated.View>
    </Pressable>
  );
};
