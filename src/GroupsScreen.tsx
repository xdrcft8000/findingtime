import React from 'react';
import { View} from 'react-native';
import {useAuth} from './Auth';
import { Text } from './components/Button';

const GroupsScreen = () => {
  const auth = useAuth();
  const styles = auth.styles;
  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: 'center',
        },
      ]}>
      <Text darkbg={auth.dark} size={20} font={'P'}>
        Groups Screen
      </Text>
    </View>
  );
};

export default GroupsScreen;
