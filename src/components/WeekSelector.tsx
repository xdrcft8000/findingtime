import React, {useEffect, useRef, useState} from 'react';
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
import Icon from 'react-native-vector-icons/Feather';
import {useAuth} from '../Auth';
import {useUser} from '../User';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {RenderSquare} from './PressableSquare';

interface DisplayAvailibilityGridProps {
  START_HOUR: number;
  END_HOUR: number;
  containerStyle?: ViewStyle;
  containerHeight: number;
  availibility: boolean[];
  resetKey: number;
  dark?: boolean;
}

//Adjustable
const SQUARE_SIZE = 40;
const SQUARE_HEIGHT = 18;
const CORNER_RADIUS = 12;
const ZOOM_QUOTIENT = 4;

//Should be integers
// const START_HOUR = 10;
// const END_HOUR = 20;
// const DAY_LENGTH = END_HOUR - START_HOUR;

//This should end in .5
const WINDOW_SIZE = 24.5;

//Shouldn't be changed
const NUM_COLUMNS = 8;
const OFFSET = 10;
const FONT_SIZE = 41 * 0.35;

const WeekSelector: React.FC<DisplayAvailibilityGridProps> = ({
  START_HOUR,
  END_HOUR,
  containerStyle,
  containerHeight,
  resetKey,
  dark,
}) => {
  const {availability} = useUser();
  const [flatListScrollEnabled, setFlatListScrollEnabled] = useState(true);
  const scrollOffset = useRef(0);
  const flatListRef = useRef(null);
  const scrollTo = (offset: number) => {
    if (flatListRef.current != null) {
      flatListRef.current.scrollToOffset({offset: offset, animated: true});
    }
  };

  const fadeProgress = useSharedValue(1);
  const longPress = () => {
    fadeProgress.value = withSequence(
      withTiming(0.5, {duration: 150}),
      withTiming(1, {duration: 150}),
      // withTiming(1, {duration: 50}),
    );
  };
  const pressOut = () => {
    fadeProgress.value = withTiming(1, {duration: 100});
  }

  const handleScroll = event => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollOffset.current = offsetY;
  };

  const panresponderActive = useRef(false);
  // MAIN ARRAY
  const styles = dark ? darkStyles : commonStyles;
  const DAY_LENGTH = END_HOUR - START_HOUR;
  
  // SCROLLING Y
  const scrollAmount = useRef(0);
  const scrollAmountX = useRef(0);

  // SCROLLING X

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysDisplayed = useRef(
    days.slice(scrollAmountX.current, scrollAmountX.current + NUM_COLUMNS - 1),
  );

  useEffect(() => {
    setReRender(rend => !rend);
  }, [resetKey]);

  // RENDER HELPERS

  const doRender = () => {
    setReRender(rend => !rend);
  };

  // TOUCH HANDLING
  const viewRef = useRef<View>(null);
  const viewCords = useRef<number[]>([]);
  const handleLayout = () => {
    if (viewRef.current) {
      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        viewCords.current = [pageX, pageY];
      });
    }
  };

  const selecting = useRef(true);
  const scrolling = useRef(false);
  const initialTouch = useRef({x: 0, y: 0});
  const originalArray = useRef(availability.current);
  const changedArray = useRef(availability.current);
  const lastDistance = useRef(0);
  const [_reRender, setReRender] = useState(false);
  const startIndex = useRef(0);
  const touchFlag = useRef(false);
  const zoomFlag = useRef(false);
  const moveFlag = useRef(false);
  const zoomAmount = useRef(0);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => panresponderActive.current,
      onStartShouldSetPanResponderCapture: () => panresponderActive.current,
      onMoveShouldSetPanResponder: () => panresponderActive.current,
      onMoveShouldSetPanResponderCapture: () => panresponderActive.current,
      onPanResponderGrant: (evt, gestureState) => {
        const {x0, y0, numberActiveTouches} = gestureState;
        if (numberActiveTouches !== 2) {
          zoomFlag.current = false;
          originalArray.current = [...availability.current];
          const x = x0 - viewCords.current[0] - OFFSET;
          const y = y0 - viewCords.current[1] + scrollOffset.current;
          initialTouch.current = {x, y};
          const index = calculateIndex(x, y);
          // if (index % NUM_COLUMNS === 0) {
          //   initialScrollAmount.current = scrollAmount.current;
          //   scrolling.current = true;
          scrolling.current = false;
          selecting.current = !availability.current[index];
          availability.current[index] = !availability.current[index];
          doRender();
          startIndex.current = index;
          touchFlag.current = true;
        } else {
          zoomFlag.current = true;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const {x0, y0, dx, dy, numberActiveTouches} = gestureState;
        if (numberActiveTouches === 2 && !moveFlag.current) {
          zoomFlag.current = true;
          if (touchFlag.current) {
            availability.current[startIndex.current] =
              !availability.current[startIndex.current];
            touchFlag.current = false;
            doRender();
          }
          let touches = evt.nativeEvent.touches;
          const [x1, y1] = [touches[0].pageX, touches[0].pageY];
          const [x2, y2] = [touches[1].pageX, touches[1].pageY];
          const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          if (lastDistance.current !== 0) {
            if (lastDistance.current > dist) {
              zoomAmount.current--;
            } else {
              zoomAmount.current++;
            }
            doRender();
          }

          lastDistance.current = dist;
        } else {
          if (!zoomFlag.current) {
            moveFlag.current = true;
            const [x, y] = getBoundedCords(
              x0 - viewCords.current[0] + dx,
              y0 - viewCords.current[1] + dy,
            );
            if (y === containerHeight + 27 + scrollOffset.current) {
              scrollTo(scrollOffset.current + 75);
            } else if (y === 3 + scrollOffset.current) {
              scrollTo(scrollOffset.current - 75);
            }
            const minX = Math.min(initialTouch.current.x, x);
            const minY = Math.min(initialTouch.current.y, y);
            const maxX = Math.max(initialTouch.current.x, x);
            const maxY = Math.max(initialTouch.current.y, y);
            changedArray.current = [...originalArray.current];
            for (
              let i = Math.floor(minY / SQUARE_HEIGHT);
              i <= Math.floor(maxY / SQUARE_HEIGHT);
              i++
            ) {
              for (
                let j = Math.floor(minX / SQUARE_SIZE);
                j <= Math.floor(maxX / SQUARE_SIZE);
                j++
              ) {
                const index = i * NUM_COLUMNS + j;
                changedArray.current[index] = selecting.current;
              }
            }
            availability.current.forEach((value, index) => {
              availability.current[index] = changedArray.current[index];
            });
            doRender();
          }
        }
      },
      onPanResponderRelease: () => {
        // Reset the lastDistance when the pinch gesture is released.
        lastDistance.current = 0;
        moveFlag.current = false;
      },
    }),
  ).current;

  // HELPER FUNCTIONS FOR TOUCHES
  const getBoundedCords = (x: number, y: number) => {
    const fixedX = Math.min(
      Math.max(x - OFFSET, 0),
      NUM_COLUMNS * SQUARE_SIZE - 1,
    );
    const fixedY =
      Math.min(Math.max(y, 3), containerHeight + 27) + scrollOffset.current;
    return [fixedX, fixedY];
  };

  const calculateIndex = (x: number, y: number) => {
    const fixedX = Math.min(Math.max(x, 0), NUM_COLUMNS * SQUARE_SIZE - 1);
    const fixedY = Math.min(
      Math.max(y, 0),
      WINDOW_SIZE * ZOOM_QUOTIENT * SQUARE_HEIGHT - 1,
    );
    return (
      Math.floor(fixedY / SQUARE_HEIGHT) * NUM_COLUMNS +
      Math.floor(fixedX / SQUARE_SIZE)
    );
  };
  // RENDERING

  const renderItem = ({item, index}: {item: any; index: number}) => {
    const isLeftmostColumn = index % NUM_COLUMNS === 0;
    const indexVar = index % (NUM_COLUMNS * ZOOM_QUOTIENT); //32
    const hourVar = index % (NUM_COLUMNS * ZOOM_QUOTIENT); //32
    return isLeftmostColumn ? (
      <View
        style={[
          styles.hourSquare,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            borderWidth: 0,
            backgroundColor: 'rgba(255, 255, 255, 0)',
          },
        ]}>
        <Text
          style={[styles.hour, {backgroundColor: 'rgba(255, 255, 255, 0)'}]}>
          {getHour(index)}
        </Text>
      </View>
    ) : (
      <Pressable
        onPress={() => {
          availability.current[index] = !availability.current[index];
          doRender();
        }}
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
        style={({pressed}) => [
          styles.square,

          {
            backgroundColor: availability.current[index]
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
      </Pressable>
    );
  };

  const getHour = (index: number) => {
    const rawHour = index / ZOOM_QUOTIENT / NUM_COLUMNS + START_HOUR;

    if (rawHour % 1 == 0) {
      const hour = Math.floor(rawHour) + scrollAmount.current;
      //const minutes = Math.round((rawHour % 1) * 60);
      const clockHour = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? 'am' : 'pm';
      return `${clockHour}${ampm}`;
      //return `${hour}:00`;
    }
    {
      return '';
    }
    //uncomment this for :30
    //   return `${hour}:${minutes < 10 ? '0' : ''}${minutes}`;
    // } else {
    //   return `${rawHour}:00`;
    // }
  };

  // HUMAN READABLE OUTPUT

  return (
    <View style={[styles.container, containerStyle, {height: containerHeight}]}>
      <View style={styles.gridAndLabels}>
        <View style={styles.topRow}>
          {scrollAmount.current === 0 ? (
            <TouchableOpacity style={styles.topScroll} />
          ) : (
            <TouchableOpacity style={styles.topScroll}>
              <Icon
                name="chevron-up"
                size={30}
                color={dark ? 'white' : 'black'}
              />
            </TouchableOpacity>
          )}
          <View style={styles.topScrollBar}>
            <View style={styles.days}>
              <Text style={styles.day}>{daysDisplayed.current[0]}</Text>
              <Text style={styles.day}>{daysDisplayed.current[1]}</Text>
              <Text style={styles.day}>{daysDisplayed.current[2]}</Text>
              <Text style={styles.day}>{daysDisplayed.current[3]}</Text>
              <Text style={styles.day}>{daysDisplayed.current[4]}</Text>
              <Text style={styles.day}>Sat</Text>
              <Text style={styles.day}>Sun</Text>
            </View>
          </View>
        </View>
        <Animated.View style={[styles.hoursgrid, {opacity: fadeProgress}]}>
          <View style={styles.hours} />
          <View
            {...panResponder.panHandlers}
            style={[styles.grid]}
            ref={viewRef}
            onLayout={handleLayout}>
            <FlatList
              data={availability.current}
              ref={flatListRef}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={NUM_COLUMNS}
              scrollEnabled={flatListScrollEnabled}
              onScroll={handleScroll}
              initialNumToRender={NUM_COLUMNS * 4 * 5}
              getItemLayout={(data, index) => ({
                length: SQUARE_HEIGHT,
                offset: 0,
                index,
              })}
            />
          </View>
          <View style={styles.hours} />
        </Animated.View>
      </View>
      <View style={styles.bottomRow}>
        {scrollAmount.current >= DAY_LENGTH - WINDOW_SIZE ? (
          <TouchableOpacity style={styles.bottomScroll} />
        ) : (
          <TouchableOpacity style={styles.bottomScroll}>
            <Icon
              name="chevron-down"
              size={30}
              color={dark ? 'white' : 'black'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const commonStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    width: NUM_COLUMNS * SQUARE_SIZE,
    alignItems: 'center',
  },
  topScroll: {
    width: OFFSET + SQUARE_SIZE,
    alignItems: 'center',
    paddingTop: SQUARE_HEIGHT,
  },
  topScrollImg: {
    resizeMode: 'contain',
    transform: [{rotate: '180deg'}],
    marginRight: OFFSET,
  },
  topScrollBar: {
    flexDirection: 'column',
  },
  topScrollArrows: {
    flexDirection: 'row',
    height: SQUARE_HEIGHT * 3,
    justifyContent: 'center',
  },
  topScrollArrowContainer: {
    height: FONT_SIZE + SQUARE_HEIGHT,
  },
  topScrollLeft: {
    height: FONT_SIZE + SQUARE_HEIGHT,
    resizeMode: 'contain',
    transform: [{rotate: '90deg'}],
  },
  topScrollRight: {
    height: FONT_SIZE + SQUARE_HEIGHT / 2,
    resizeMode: 'contain',
    transform: [{rotate: '270deg'}],
  },
  title: {
    fontFamily: 'GowunDodum-Regular',
    paddingTop: SQUARE_HEIGHT / 2 - FONT_SIZE,
    fontSize: FONT_SIZE + 1,
  },
  days: {
    flexDirection: 'row',
    paddingBottom: SQUARE_SIZE / ZOOM_QUOTIENT,
    textAlign: 'center',
  },
  day: {
    textAlign: 'center',
    width: SQUARE_SIZE,
    fontFamily: 'GowunDodum-Regular',
    fontSize: FONT_SIZE,
  },
  gridAndLabels: {},
  grid: {
    flexDirection: 'row',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_HEIGHT,
    borderWidth: 1,
    borderColor: COLOURS.white,
  },
  hourSquare: {
    width: SQUARE_SIZE + OFFSET,
    height: SQUARE_HEIGHT,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'visible',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  hour: {
    height: SQUARE_SIZE,
    fontSize: FONT_SIZE,
    paddingTop: SQUARE_HEIGHT / 2 - FONT_SIZE,
    width: SQUARE_SIZE,
    backgroundColor: 'white',
    fontFamily: 'GowunDodum-Regular',
    overflow: 'visible',
  },
  hoursgrid: {
    flexDirection: 'row',
  },
  hours: {
    paddingTop: (SQUARE_SIZE - FONT_SIZE) / 2,
  },
  bottomRow: {
    flexDirection: 'row',
  },
  bottomScroll: {
    width: OFFSET + SQUARE_SIZE,
    alignItems: 'center',
    paddingTop: (SQUARE_HEIGHT * 2) / ZOOM_QUOTIENT,
  },
  bottomScrollImg: {
    height: FONT_SIZE + SQUARE_HEIGHT / 2,
    resizeMode: 'contain',
    marginRight: OFFSET,
  },
  resetButton: {
    paddingTop: SQUARE_HEIGHT * 0.6,
    height: SQUARE_HEIGHT * 2 + FONT_SIZE,
    fontFamily: 'GowunDodum-Regular',
    width: SQUARE_SIZE * (NUM_COLUMNS - 1),
    textAlign: 'center',
  },
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  hour: {
    ...commonStyles.hour,
    color: 'white',
  },
  day: {
    ...commonStyles.day,
    color: 'white',
  },
  title: {
    ...commonStyles.title,
    color: 'white',
  },
});

export default WeekSelector;
