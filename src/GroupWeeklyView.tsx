import React, {useEffect, useRef, useState} from 'react';
import {useUser} from './User';
import {useAuth} from './Auth';
import {Dimensions, View} from 'react-native';
import {DateSelector, Loading, Text} from './components/Button';
import COLOURS from '../constants/colours';
import {useGroup} from './Group';
import {startOfWeek} from 'date-fns';
import WeeklyGroupView from './components/WeeklyGroupView';

interface GroupAvailability {
  [key: string]: boolean[];
}

export default function GroupWeeklyView() {
  const auth = useAuth();
  const user = useUser();
  const group = useGroup();
  const [loading, setLoading] = useState(true);
  const [date, setDateState] = useState<Date>(
    startOfWeek(new Date(), {weekStartsOn: 1}), // Start week on Monday
  );

  const startHour = useRef(0);
  const endHour = useRef(0);
  const [groupAvailability, setGroupAvailability] = useState<GroupAvailability>(
    {},
  );
  const [jointAvailability, setJointAvailability] = useState<number[]>([]);

  useEffect(() => {
    group.getGroupSelections().then(() => {
      const groupSelections = group.groupSelections.current;
      let jointStartHour = 0;
      let jointEndHour = 0;
      for (const selections in groupSelections) {
        const currStartHour = groupSelections[selections].startHour;
        const currEndHour = groupSelections[selections].endHour;
        if (currStartHour < jointStartHour) {
          jointStartHour = currStartHour;
        }
        if (currEndHour > jointEndHour) {
          jointEndHour = currEndHour;
        }
      }
      startHour.current = jointStartHour;
      endHour.current = jointEndHour;
      compactAvailability(date);
    });
  }, []);

  const handleDateChange = newDate => {
    compactAvailability(newDate);
    setDateState(newDate);
  };

  const compactAvailability = newDate => {
    setLoading(true);
    const groupSelections = group.groupSelections.current;
    const jointsAvailability = Array(
      (endHour.current - startHour.current) * 32,
    ).fill(0);
    const groupsAvailability: GroupAvailability = {};
    for (const selections in groupSelections) {
      const currentStartHour = groupSelections[selections].startHour;
      const selection =
        groupSelections[selections][
          user.getClosestDate(
            group.getDate(newDate),
            groupSelections[selections],
          )
        ];
      groupsAvailability[groupSelections[selections].userName] = Array(
        (endHour.current - startHour.current) * 32,
      ).fill(false);
      const startIndex = (currentStartHour - startHour.current) * 32;
      for (let i = startIndex; i < selection.length + startIndex; i++) {
        jointsAvailability[i] += selection[i - startIndex];
        groupsAvailability[groupSelections[selections].userName][i] =
          selection[i - startIndex];
      }
    }
    setGroupAvailability(groupsAvailability);
    setJointAvailability(jointsAvailability);
    setLoading(false);
  };

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
            START_HOUR={startHour.current}
            END_HOUR={endHour.current}
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
