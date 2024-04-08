import React, {useEffect} from 'react';
import {useAuth} from './Auth';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import COLOURS from '../constants/colours';
import Icon from 'react-native-vector-icons/FontAwesome';
import Profile from './Profile';
import Animated, {useSharedValue, withTiming} from 'react-native-reanimated';
import Groups from './Groups';

const Home = () => {
  const {dark, firstTime} = useAuth();
  const Tab = createBottomTabNavigator();
  const fadeIn = useSharedValue(1);

  const fadeInAnimation = () => {
    fadeIn.value = withTiming(0, {
      duration: 1000,
    });
  };

  useEffect(() => {
    firstTime ? fadeInAnimation() : null;
  }, []);

  return (
    <>
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
            component={Profile}
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
            component={Groups}
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
      {firstTime ? (
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'black',
            opacity: fadeIn,
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </>
  );
};

export default Home;
