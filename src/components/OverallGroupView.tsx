import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import COLOURS from '../../constants/colours';
import {useGroup} from '../context/Group';
import {interpolateColor} from 'react-native-reanimated';
import Modal from 'react-native-modal';
import {Text as EasyText} from './Button';
import Icon2 from 'react-native-vector-icons/Feather';
import {useAuth} from '../context/Auth';
import { set } from 'date-fns';

interface DisplayAvailibilityGridProps {
  START_HOUR: number;
  END_HOUR: number;
  containerStyle?: ViewStyle;
  containerHeight: number;
  availibility: boolean[];
  resetKey: number;
  dark: boolean;
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

const OverallGroupView: React.FC<DisplayAvailibilityGridProps> = ({
  START_HOUR,
  END_HOUR,
  containerStyle,
  containerHeight,
  resetKey,
  dark,
}) => {
  const group = useGroup();
  const {authData} = useAuth();
  const duration = group.group!.duration;
  const names = Object.keys(group.compactedAvailability);
  const dayLength = END_HOUR - START_HOUR;
  const array = Array(dayLength * 32).fill(0);
  const styles = dark ? darkStyles : commonStyles;
  const maxScore = duration * names.length;
  let bestScore = useRef(0);
  const totalScores = useRef(
    new Array(group.compactedAvailability[names[0]].length).fill(0),
  );
  const jointScores = useRef(
    new Array(group.compactedAvailability[names[0]].length).fill(0),
  );

  const [_reRender, setReRender] = useState(false);
  useEffect(() => {
    totalScores.current = new Array(
      group.compactedAvailability[names[0]].length,
    ).fill(0);

    for (let i = 0; i < jointScores.current.length; i++) {
      const scores = [];
      for (let j = 0; j < names.length; j++) {
        scores.push(group.compactedAvailability[names[j]][i]);
        totalScores.current[i] += group.compactedAvailability[names[j]][i];
      }
      jointScores.current[i] = Math.min(...scores);
    }
    bestScore.current = Math.max(...jointScores.current);
  }, []);

  useEffect(() => {
    setReRender(rend => !rend);
  }, [resetKey]);

  const days = [
    'placeholder',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };
  const currentIndex = useRef(0);

  const renderScoresModal = () => {
    const namesAndScores = [];
    for (const [name, score] of Object.entries(group.compactedAvailability)) {
      let userName = name;
      if (name === authData?.name) {
        userName = 'You';
      }
      namesAndScores.push(
        <View
          style={{flexDirection: 'row', paddingVertical: 5}}
          key={`${name}`}>
          <EasyText darkbg={dark} size={18} font={'G'}>
            {userName} can make{' '}
          </EasyText>
          <EasyText darkbg={dark} size={18} font={'P'}>
            {score[currentIndex.current]}/{duration}{' '}
          </EasyText>
          <EasyText darkbg={dark} size={18} font={'G'}>
            weeks
          </EasyText>
        </View>,
      );
    }
    return (
      <Modal
        testID={'modal'}
        isVisible={modalVisible}
        onSwipeComplete={toggleModal}
        onBackdropPress={toggleModal}
        useNativeDriverForBackdrop={true}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}
        animationInTiming={200}
        animationOutTiming={200}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            backgroundColor: dark ? COLOURS.black : COLOURS.white,
            borderRadius: 20,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{position: 'absolute', top: 5, right: 5, padding: 10}}
            onPress={toggleModal}>
            <Icon2 size={30} name="x" color={'gray'} />
          </TouchableOpacity>
          <View style={{paddingVertical: '5%'}}>
            <EasyText darkbg={dark} size={24} font={'P'}>
              {days[currentIndex.current % 8]} {getTime(currentIndex.current)}
            </EasyText>
          </View>
          {bestScore.current !== 0 &&
          jointScores.current[currentIndex.current] === bestScore.current ? (
            <View
              style={{
                backgroundColor: COLOURS.teal,
                borderRadius: 15,
                paddingHorizontal: 15,
                paddingVertical: 10,
              }}>
              <EasyText darkbg={false} size={18} font={'G'}>
                Ideal slot
              </EasyText>
            </View>
          ) : (
            <EasyText darkbg={dark} size={18} font={'G'} />
          )}
          <View style={{paddingVertical: 20}}>{namesAndScores}</View>
        </View>
      </Modal>
    );
  };

  const handleSquarePress = (index: number) => {
    currentIndex.current = index;
    setModalVisible(true);
  };

  // RENDERING
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderItem = ({item, index}: {item: any; index: number}) => {
    const isLeftmostColumn = index % NUM_COLUMNS === 0;
    const indexVar = index % (NUM_COLUMNS * ZOOM_QUOTIENT); //32
    const hourVar = index % (NUM_COLUMNS * ZOOM_QUOTIENT); //32
    let jointScore = jointScores.current[index];
    let score = totalScores.current[index];

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
      <TouchableOpacity
        onPress={() => handleSquarePress(index)}
        style={[
          styles.square,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            backgroundColor:
              jointScore === 0
                ? interpolateColor(
                    score,
                    [0, maxScore * 1.2],
                    [dark ? COLOURS.darkgrey : 'white', COLOURS.salmon],
                  )
                : jointScore === bestScore.current && bestScore.current > 0
                ? COLOURS.teal
                : interpolateColor(
                    jointScore,
                    [0, duration * 1.2],
                    [dark ? COLOURS.darkgrey : 'white', COLOURS.teal],
                  ),
            borderColor: dark ? 'black' : COLOURS.lightgrey,
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
        {/* <Text>{maxScore} {score}</Text> */}
      </TouchableOpacity>
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
  };

  const getTime = (index: number) => {
    const rawHour = Math.floor(index / 8);

    const hour = Math.floor(rawHour / 4) + START_HOUR;
    //const minutes = Math.round((rawHour % 1) * 60);
    const clockHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour < 12 ? 'am' : 'pm';
    const mins = (rawHour % 4) * 15;
    if (mins === 0) {
      return `${clockHour}${ampm}`;
    }
    const timeString = `${clockHour}:${mins}${ampm}`;
    return timeString;
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
              data={array}
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
      {renderScoresModal()}
    </View>
  );
};

const commonStyles = StyleSheet.create({
  container: {
    paddingTop: 28,
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

export default OverallGroupView;
