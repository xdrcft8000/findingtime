import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GroupsScreen from './GroupsScreen';
import {GroupProvider} from './context/Group';
import NewGroupScreen from './NewGroupScreen';
import JoinGroupScreen from './JoinGroupScreen';
import GroupScreen from './GroupScreen';
import ChangeAvailabilityScreen from './ChangeAvailabilityScreen';

const Groups = () => {
  const Stack = createNativeStackNavigator();
  return (
    <GroupProvider>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="GroupsScreen" component={GroupsScreen} />
        <Stack.Screen name="New Group" component={NewGroupScreen} />
        <Stack.Screen name="Join Group" component={JoinGroupScreen} />
        <Stack.Screen name="Group" component={GroupScreen} />
        <Stack.Screen
          name="Change Availability"
          component={ChangeAvailabilityScreen}
        />
      </Stack.Navigator>
    </GroupProvider>
  );
};

export default Groups;
