import React from 'react';
import {Text, View} from 'react-native';
import {useAuth} from './Auth';
import {Button} from './components/Button';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ProfileScreen from './ProfileScreen';
import GroupsScreen from './GroupsScreen';
import COLOURS from '../constants/colours';
import Icon from 'react-native-vector-icons/FontAwesome';

const Home = () => {
  const {dark} = useAuth();
  const Tab = createBottomTabNavigator();
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // Hide headers
          tabBarStyle: {
            backgroundColor: dark ? COLOURS.black : COLOURS.white,
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: dark ? COLOURS.white : COLOURS.black,
        }}>
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon
                name="user"
                size={size}
                color={color}
                style={{marginBottom: -12}}
              />
            ),
            tabBarLabel: '',
          }}
        />
        <Tab.Screen
          name="Groups"
          component={GroupsScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon
                name="users"
                size={size}
                color={color}
                style={{marginBottom: -10}}
              />
            ),
            tabBarLabel: '',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Home;
