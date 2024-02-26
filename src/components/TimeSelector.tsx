import React, {useRef, useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  PanResponder,
  Image,
} from 'react-native';
import COLOURS from '../../constants/colours';
import Icon from 'react-native-vector-icons/Feather';

interface TimeSelectorProps {
  START_HOUR: number;
  END_HOUR: number;
  availibility: boolean[];
  dark?: boolean;
}

//Adjustable
const SQUARE_SIZE = 50;
const SQUARE_HEIGHT = 40;
const CORNER_RADIUS = 15;
const SQUARE_SPACING = 5;

const WINDOW_SIZE = 10;

//Shouldn't be changed
const NUM_COLUMNS = 4;
const FONT_SIZE = 41 * 0.35;

const TimeSelector: React.FC<TimeSelectorProps> = ({
  START_HOUR,
  END_HOUR,
  availibility,
  dark,
}) => {
  // MAIN ARRAY
  const styles = dark ? darkStyles : commonStyles;
  const DAY_LENGTH = END_HOUR - START_HOUR;

  const squaresState = useRef(Array(DAY_LENGTH * 4).fill(false));
  // SCROLLING Y
  const scrollAmount = useRef(0);

  const windowState = useRef(
    squaresState.current.slice(
      scrollAmount.current * 4,
      scrollAmount.current * 4 + WINDOW_SIZE * 4,
    ),
  );
  const saveWindow = () => {
    squaresState.current.splice(
      scrollAmount.current * NUM_COLUMNS,
      windowState.current.length,
      ...windowState.current,
    );
  };
  const loadWindow = () => {
    windowState.current = squaresState.current.slice(
      scrollAmount.current * 4,
      scrollAmount.current * 4 + WINDOW_SIZE * 4,
    );

    doRender();
  };

  const scrollUp = () => {
    saveWindow();
    scrollAmount.current--;
    loadWindow();
  };

  const scrollDown = () => {
    saveWindow();
    scrollAmount.current++;
    loadWindow();
  };

  // SCROLLING X

  // RENDER HELPERS
  const reset = () => {
    squaresState.current = Array(DAY_LENGTH * 4).fill(false);
    loadWindow();
  };

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

  // VARIABLES FOR KEEPING TRACKS OF THINGS WHILE TOUCH HAPPENS
  const selecting = useRef(true);
  const scrolling = useRef(false);
  const initialScrollAmount = useRef(0);
  const initialTouch = useRef({x: 0, y: 0});
  const originalArray = useRef(windowState.current);
  const changedArray = useRef(windowState.current);
  const lastDistance = useRef(0);
  const [_reRender, setReRender] = useState(false);
  const startIndex = useRef(0);
  const touchFlag = useRef(false);
  const zoomFlag = useRef(false);
  const moveFlag = useRef(false);
  const zoomAmount = useRef(0);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const {x0, y0, numberActiveTouches} = gestureState;
        if (numberActiveTouches !== 2) {
          zoomFlag.current = false;
          originalArray.current = [...windowState.current];
          const x = x0 - viewCords.current[0];
          const y = y0 - viewCords.current[1];
          initialTouch.current = {x, y};
          const index = calculateIndex(x, y);
          //   if (index % NUM_COLUMNS === 0) {
          //     initialScrollAmount.current = scrollAmount.current;
          //     scrolling.current = true;
          scrolling.current = false;
          selecting.current = !windowState.current[index];
          windowState.current[index] = !windowState.current[index];
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
            windowState.current[startIndex.current] =
              !windowState.current[startIndex.current];
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
          if (scrolling.current) {
            let dyp =
              dy >= 0
                ? dy + 100 + SQUARE_HEIGHT / 4
                : dy - 100 - SQUARE_HEIGHT / 4;
            const scrollChange =
              Math.floor(-dyp / SQUARE_HEIGHT / 4) +
              initialScrollAmount.current;
            if (scrollAmount.current !== scrollChange) {
              if (!(dyp > 0 && scrollAmount.current === 0)) {
                if (
                  !(dyp < 0 && scrollAmount.current >= DAY_LENGTH - WINDOW_SIZE)
                ) {
                  saveWindow();
                  scrollAmount.current = Math.max(
                    0,
                    Math.min(scrollChange, DAY_LENGTH - WINDOW_SIZE + 0.5),
                  );
                  loadWindow();
                }
              }
            }
          } else if (!zoomFlag.current) {
            moveFlag.current = true;
            const [x, y] = getBoundedCords(
              x0 - viewCords.current[0] + dx,
              y0 - viewCords.current[1] + dy,
            );
            const minX = Math.min(initialTouch.current.x, x);
            const minY = Math.min(initialTouch.current.y, y);
            const maxX = Math.max(initialTouch.current.x, x);
            const maxY = Math.max(initialTouch.current.y, y);

            changedArray.current = [...originalArray.current];
            for (
              let i = Math.floor(minY / (SQUARE_HEIGHT + SQUARE_SPACING));
              i <= Math.floor(maxY / (SQUARE_HEIGHT + SQUARE_SPACING));
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
            windowState.current.forEach((value, index) => {
              windowState.current[index] = changedArray.current[index];
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
    const fixedX = Math.min(Math.max(x, 0), NUM_COLUMNS * SQUARE_SIZE - 1);
    const fixedY = Math.min(
      Math.max(y, 0),
      WINDOW_SIZE * 4 * (SQUARE_HEIGHT + SQUARE_SPACING) - 1,
    );
    return [fixedX, fixedY];
  };

  const calculateIndex = (x: number, y: number) => {
    const fixedX = Math.min(Math.max(x, 0), NUM_COLUMNS * SQUARE_SIZE - 1);
    const fixedY = Math.min(
      Math.max(y, 0),
      WINDOW_SIZE * 4 * (SQUARE_HEIGHT + SQUARE_SPACING) - 1,
    );
    return (
      Math.floor(fixedY / (SQUARE_HEIGHT + SQUARE_SPACING)) * NUM_COLUMNS +
      Math.floor(fixedX / SQUARE_SIZE)
    );
  };

  // RENDERING
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderItem = ({item, index}: {item: any; index: number}) => {
    const isLeftmostColumn = index % NUM_COLUMNS === 0;
    const isRightmostColumn = index % NUM_COLUMNS === NUM_COLUMNS - 1;

    const indexVar = index % (NUM_COLUMNS * 4); //32
    const hourVar = index % (NUM_COLUMNS * 4); //32
    return (
      <TouchableOpacity
        style={[
          styles.square,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            backgroundColor: windowState.current[index]
              ? COLOURS.lightgreen
              : dark
              ? COLOURS.darkgrey
              : COLOURS.grey,
            borderColor: dark ? 'black' : COLOURS.white,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderTopLeftRadius: isLeftmostColumn ? CORNER_RADIUS : 0,
            borderBottomLeftRadius: isLeftmostColumn ? CORNER_RADIUS : 0,
            borderRightWidth: isLeftmostColumn ? 0 : 1,
            borderTopRightRadius: isRightmostColumn ? CORNER_RADIUS : 0,
            borderBottomRightRadius: isRightmostColumn ? CORNER_RADIUS : 0,
            borderLeftWidth: isRightmostColumn ? 0 : 1,
            marginBottom: SQUARE_SPACING / 2,
            marginTop: SQUARE_SPACING / 2,
          },
        ]}>
        {/* <Text>{index}</Text> */}
      </TouchableOpacity>
    );
  };

  const getHour = (index: number) => {
    const rawHour = index / 4 / NUM_COLUMNS + START_HOUR;

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

  const formatHour = (rawHour: number): string => {
    console.log(rawHour);
    if (rawHour === 24) {
      return '12am';
    }
    if (rawHour === 12) {
      return '12pm';
    }
    if (rawHour === 0) {
      return '12am';
    }
    if (rawHour > 12) {
      return `${(rawHour -= 12)}pm`;
    } else {
      return `${rawHour}am`;
    }
  };

  const format24Hour = (rawHour: number): string => {
    if (rawHour === 24) {
      return '00:00';
    }
    if (rawHour === 12) {
      return '12:00';
    }
    if (rawHour === 0) {
      return '00:00';
    }
    if (rawHour < 10) {
      return `0${rawHour}:00`;
    } else {
      return `${rawHour}:00`;
    }
  };

  const JSXHours = () => {
    const hours = [];
    for (let i = 0; i < Math.min(DAY_LENGTH, WINDOW_SIZE); i++) {
      hours.push(
        <View style={styles.hourContainer} key={i}>
          <Text style={styles.hour}>
            {format24Hour(i + scrollAmount.current + START_HOUR)}
          </Text>
        </View>,
      );
    }
    return hours;
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridAndLabels}>
        <View style={styles.topRow}>
          {scrollAmount.current === 0 ? (
            <TouchableOpacity style={styles.topScroll} />
          ) : (
            <TouchableOpacity onPress={scrollUp} style={styles.topScroll}>
              <Icon
                name="chevron-up"
                size={30}
                color={dark ? 'white' : 'black'}
              />
            </TouchableOpacity>
          )}
          <View style={styles.topScrollBar}>
            <View style={styles.days}>
              <Text style={styles.day}>:15</Text>
              <Text style={styles.day}>:30</Text>
              <Text style={styles.day}>:45</Text>
            </View>
          </View>
        </View>
        <View style={styles.hoursgrid}>
          <View style={styles.hours}>{JSXHours()}</View>
          <View
            {...panResponder.panHandlers}
            style={styles.grid}
            ref={viewRef}
            onLayout={handleLayout}>
            <FlatList
              data={windowState.current}
              renderItem={renderItem}
              keyExtractor={(_item, index) => index.toString()}
              numColumns={NUM_COLUMNS}
              scrollEnabled={false}
              getItemLayout={(_data, index) => ({
                length: SQUARE_HEIGHT,
                offset: 0,
                index,
              })}
            />
          </View>
        </View>
      </View>
      <View style={styles.bottomRow}>
        {scrollAmount.current >= DAY_LENGTH - WINDOW_SIZE ? (
          <TouchableOpacity style={styles.bottomScroll} />
        ) : (
          <TouchableOpacity onPress={scrollDown} style={styles.bottomScroll}>
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
    width: SQUARE_SIZE,
    alignItems: 'center',
    height: SQUARE_HEIGHT,
    justifyContent: 'flex-end',
  },
  topScrollImg: {
    resizeMode: 'contain',
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
    fontFamily: 'Poppins-Regular',
    paddingTop: SQUARE_HEIGHT / 2 - FONT_SIZE,
    fontSize: FONT_SIZE + 1,
  },
  days: {
    flexDirection: 'row',
    textAlign: 'center',
    marginLeft: 10,
  },
  day: {
    textAlign: 'right',
    width: SQUARE_SIZE,
    fontFamily: 'GowunDodum-Regular',
    fontSize: FONT_SIZE - 1,
    color: 'grey',
  },
  gridAndLabels: {},
  grid: {
    flexDirection: 'row',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_HEIGHT,
    borderWidth: 1,
    borderColor: 'white',
  },
  hourSquare: {
    width: SQUARE_SIZE,
    height: SQUARE_HEIGHT,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'visible',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  hoursgrid: {
    flexDirection: 'row',
  },
  hours: {
    width: SQUARE_SIZE + 5,
    height: SQUARE_HEIGHT * WINDOW_SIZE + SQUARE_SPACING * WINDOW_SIZE,
    flexDirection: 'column',
  },
  hourContainer: {
    width: SQUARE_SIZE,
    height: SQUARE_HEIGHT,
    justifyContent: 'center',
    marginBottom: SQUARE_SPACING / 2,
    marginTop: SQUARE_SPACING / 2,
  },
  hour: {
    fontSize: FONT_SIZE + 2,
    fontFamily: 'GowunDodum-Regular',
    overflow: 'visible',
  },
  bottomRow: {
    width: NUM_COLUMNS * SQUARE_SIZE + SQUARE_SIZE + 5,
    flexDirection: 'row',
  },
  bottomScroll: {
    width: SQUARE_SIZE,
    alignItems: 'center',
    height: SQUARE_HEIGHT,
  },
  bottomScrollImg: {
    height: FONT_SIZE + SQUARE_HEIGHT / 2,
    resizeMode: 'contain',
  },
  resetButton: {
    paddingTop: SQUARE_HEIGHT * 0.6,
    height: SQUARE_HEIGHT * 2 + FONT_SIZE,
    fontFamily: 'Poppins-Regular',
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

export default TimeSelector;
