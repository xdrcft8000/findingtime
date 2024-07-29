/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {useAuth} from './context/Auth';
import {Dimensions, View} from 'react-native';
import {DateSelector, Loading, Text} from './components/Button';
import COLOURS from '../constants/colours';
import {useGroup} from './context/Group';
import {startOfWeek} from 'date-fns';
import WeeklyGroupView from './components/WeeklyGroupView';
import {
  formatDate,
  getClosestDate,
  trimSchedule,
  trimSelection,
} from './HelperFunctions';
import {Selection} from './Models';

export default function GroupWeeklyView() {
  const auth = useAuth();
  const group = useGroup();
  const [loading, setLoading] = useState(true);
  const [date, setDateState] = useState<Date>(
    startOfWeek(new Date(), {weekStartsOn: 1}), // Start week on Monday
  );

  const [groupAvailability, setGroupAvailability] = useState<Selection>({});
  const [jointAvailability, setJointAvailability] = useState<number[]>([]);

  const handleDateChange = (newDate: Date) => {
    compactAvailability(newDate);
    setDateState(newDate);
  };

  const compactAvailability = useCallback(
    (newDate: Date) => {
      const groupSelections = group.groupSelections.current;
      const jointsAvailability = Array(768).fill(0);
      const groupsAvailability: Selection = {};
      for (const selections in groupSelections) {
        const selection =
          groupSelections[selections][
            getClosestDate(formatDate(newDate), groupSelections[selections])
          ];
        groupsAvailability[groupSelections[selections].userName] =
          Array(768).fill(0);
        for (let i = 0; i < selection.length; i++) {
          jointsAvailability[i] += selection[i];
          groupsAvailability[groupSelections[selections].userName][i] =
            selection[i] ? 1 : 0;
        }
      }
      const {trimmedSchedule} = trimSchedule(groupsAvailability);
      const {trimmedSelection} = trimSelection(jointsAvailability);
      setGroupAvailability(trimmedSchedule);
      setJointAvailability(trimmedSelection);
      setLoading(false);
    },
    [group.groupSelections],
  );

  useEffect(() => {
    compactAvailability(date);
  }, [compactAvailability, date]);

  return (
    <View style={{flex: 1, paddingTop: '3%'}}>
      <DateSelector
        initialDate={date}
        setDate={handleDateChange}
        dark={auth.dark}
      />
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Loading size={14} />
        </View>
      ) : (
        <View style={{paddingTop: 28}}>
          <WeeklyGroupView
            START_HOUR={group.startHour}
            END_HOUR={group.endHour}
            containerHeight={Dimensions.get('window').height / 2.7}
            resetKey={0}
            dark={auth.dark}
            jointAvailability={jointAvailability}
            groupAvailability={groupAvailability}
          />
          <View style={{paddingLeft: '10%'}}>
            <View style={{flexDirection: 'row', paddingTop: 70}}>
              <View
                style={{
                  width: 20,
                  height: 10,
                  backgroundColor: COLOURS.salmon,
                  borderRadius: 5,
                  marginTop: 6,
                }}
              />
              <Text darkbg={auth.dark} size={0} font={'P'}>
                {' '}
                - Some people are free.
              </Text>
            </View>
            <View style={{flexDirection: 'row', paddingTop: '2%'}}>
              <View
                style={{
                  width: 20,
                  height: 10,
                  backgroundColor: COLOURS.teal,
                  borderRadius: 5,
                  marginTop: 6,
                }}
              />
              <Text darkbg={auth.dark} size={0} font={'P'}>
                {' '}
                - The most people are free.
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
