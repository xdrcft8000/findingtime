import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileScreen from './ProfileScreen';
import NewSelectionScreen from './NewSelectionScreen';
import EditSelectionScreen from './EditSelectionScreen';

const Profile = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="New Selection" component={NewSelectionScreen} />
      <Stack.Screen name="Edit Selection" component={EditSelectionScreen} />
    </Stack.Navigator>
  );
};

export default Profile;
