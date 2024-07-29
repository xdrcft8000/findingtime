import React from 'react';
import {useUser} from './context/User';
import {useAuth} from './context/Auth';
import {TouchableOpacity, View} from 'react-native';
import {Text} from './components/Button';
import Icon2 from 'react-native-vector-icons/Feather';
import COLOURS from '../constants/colours';
import {useGroup} from './context/Group';

export default function DayLengthSelector({navigation}) {
  const user = useUser();
  const auth = useAuth();
  const group = useGroup();
  const styles = auth.styles;

  function back() {
    navigation.goBack();
  }

  return (
    <View
      style={[
        styles.container,
        {justifyContent: 'center', alignContent: 'center'},
      ]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          onPress={() => {
            back();
          }}>
          <Icon2
            name="chevron-left"
            size={25}
            color={auth.dark ? COLOURS.white : COLOURS.black}
            style={{padding: '8%'}}
          />
        </TouchableOpacity>
      </View>

      <Text darkbg={auth.dark} size={22} font={'G'}>
        Group
      </Text>
    </View>
  );
}
