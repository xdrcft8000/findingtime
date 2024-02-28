import React from 'react';
import {View} from 'react-native';
import {useAuth} from './Auth';
import SignInScreen from './SignInScreen';
import {Loading} from './components/Button';
import IntroScreen from './IntroScreen';
import Home from './Home';

export const Router = () => {
  const {authData, initializing, styles, firstTime} = useAuth();
  return (
    <>
      {initializing ? (
        <View style={[styles.container, {justifyContent: 'center'}]}>
          <Loading size={22} />
        </View>
      ) : authData ? (
        firstTime ? (
          <IntroScreen />
        ) : (
          <Home />
        )
      ) : (
        <SignInScreen />
      )}
    </>
  );
};
