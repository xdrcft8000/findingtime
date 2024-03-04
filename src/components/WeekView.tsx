import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet, Text, ViewStyle} from 'react-native';
import COLOURS from '../../constants/colours';
import {useAuth} from '../Auth';
import { useUser } from '../User';

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
const SQUARE_HEIGHT = 12;
const CORNER_RADIUS = 12;
const ZOOM_QUOTIENT = 4;

//Shouldn't be changed
const NUM_COLUMNS = 8;
const OFFSET = 10;
const FONT_SIZE = 41 * 0.35;

const WeekView: React.FC<DisplayAvailibilityGridProps> = ({
  START_HOUR,
  containerStyle,
  containerHeight,
  resetKey,
  dark,
}) => {
  const {availability} = useUser();
  const styles = dark ? darkStyles : commonStyles;

  useEffect(() => {
    setReRender(rend => !rend);
  }, [resetKey]);

  const [_reRender, setReRender] = useState(false);

  // RENDERING
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <View
        style={[
          styles.square,
          // eslint-disable-next-line react-native/no-inline-styles
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
      </View>
    );
  };

  const getHour = (index: number) => {
    const rawHour = index / ZOOM_QUOTIENT / NUM_COLUMNS + START_HOUR;

    if (rawHour % 1 == 0) {
      const hour = Math.floor(rawHour);
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
          <View style={styles.topScroll} />
          <View style={styles.topScrollBar}>
            <View style={styles.days}>
              <Text style={styles.day}>Mon</Text>
              <Text style={styles.day}>Tue</Text>
              <Text style={styles.day}>Wed</Text>
              <Text style={styles.day}>Thu</Text>
              <Text style={styles.day}>Fri</Text>
              <Text style={styles.day}>Sat</Text>
              <Text style={styles.day}>Sun</Text>
            </View>
          </View>
        </View>
        <View style={styles.hoursgrid}>
          <View style={styles.hours} />
          <View style={styles.grid}>
            <FlatList
              data={availability.current}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={NUM_COLUMNS}
              initialNumToRender={NUM_COLUMNS * 4 * 5}
              getItemLayout={(data, index) => ({
                length: SQUARE_HEIGHT,
                offset: 0,
                index,
              })}
            />
          </View>
          <View style={styles.hours} />
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.bottomScroll} />
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

export default WeekView;
