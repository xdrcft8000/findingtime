/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React from 'react';
import {Router} from './src/Router';
import {AuthProvider} from './src/context/Auth';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const App = () => {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Router />
      </SafeAreaProvider>
    </AuthProvider>
  );
};

export default App;
