/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import COLOURS from './constants/colours';
import TimeSelector from './src/components/TimeSelector';
import {
  Button,
  ClearButton,
  DropDownMenu,
  TextInput,
  TextInputTitle,
  WhiteButton,
} from './src/components/Button';
import {text} from 'express';
import {SelectList} from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Feather';
import {commonStyles} from './src/styles/styles';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const changeText = (text: string) => {
    console.log(text);
  };

  const [selected, setSelected] = React.useState('');

  const data = [
    {key: '2', value: 'Appliances'},
    {key: '3', value: 'Cameras'},
    {key: '5', value: 'Vegetables'},
    {key: '6', value: 'Diary Products'},
    {key: '7', value: 'Drinks'},
    {key: '8', value: 'Fruits'},
  ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? COLOURS.black : COLOURS.white,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Button title={'Swag'} />
      <WhiteButton title={'Clear'} dark={isDarkMode} />
      <TextInputTitle
        value={'dw'}
        onChangeText={changeText}
        dark={isDarkMode}
        title={'swag'}
      />

      <DropDownMenu
        data={data}
        setSelected={setSelected}
        dark={isDarkMode}
        onPress={() => console.log('pressed')}
        maxHeight={115}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
