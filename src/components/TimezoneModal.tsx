/* eslint-disable react-native/no-inline-styles */
import {
  View,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  FlatList,
} from 'react-native';
import React from 'react';
import COLOURS from '../../constants/colours';
import {Text, WhiteButton} from './Button';
import Modal from 'react-native-modal';
import Icon2 from 'react-native-vector-icons/Feather';
import {useUser} from '../context/User';
import {getCurrentOffsetFromGMT} from '../HelperFunctions';

type Timezones = {
  [key: string]: string;
};

const timezones: Timezones = {
  'Pacific/Midway': 'Midway Island, Samoa',
  'Pacific/Honolulu': 'Hawaii',
  'America/Juneau': 'Alaska',
  'America/Boise': 'Mountain Time',
  'America/Dawson': 'Dawson, Yukon',
  'America/Chihuahua': 'Chihuahua, La Paz, Mazatlan',
  'America/Phoenix': 'Arizona',
  'America/Chicago': 'Central Time',
  'America/Regina': 'Saskatchewan',
  'America/Mexico_City': 'Guadalajara, Mexico City, Monterrey',
  'America/Belize': 'Central America',
  'America/Detroit': 'Eastern Time',
  'America/Bogota': 'Bogota, Lima, Quito',
  'America/Caracas': 'Caracas, La Paz',
  'America/Santiago': 'Santiago',
  'America/St_Johns': 'Newfoundland and Labrador',
  'America/Sao_Paulo': 'Brasilia',
  'America/Tijuana': 'Tijuana',
  'America/Montevideo': 'Montevideo',
  'America/Argentina/Buenos_Aires': 'Buenos Aires, Georgetown',
  'America/Godthab': 'Greenland',
  'America/Los_Angeles': 'Pacific Time',
  'Atlantic/Azores': 'Azores',
  'Atlantic/Cape_Verde': 'Cape Verde Islands',
  GMT: 'UTC',
  'Europe/London': 'Edinburgh, London',
  'Europe/Dublin': 'Dublin',
  'Europe/Lisbon': 'Lisbon',
  'Africa/Casablanca': 'Casablanca, Monrovia',
  'Atlantic/Canary': 'Canary Islands',
  'Europe/Belgrade': 'Belgrade, Bratislava, Budapest, Ljubljana, Prague',
  'Europe/Sarajevo': 'Sarajevo, Skopje, Warsaw, Zagreb',
  'Europe/Brussels': 'Brussels, Copenhagen, Madrid, Paris',
  'Europe/Amsterdam': 'Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
  'Africa/Algiers': 'West Central Africa',
  'Europe/Bucharest': 'Bucharest',
  'Africa/Cairo': 'Cairo',
  'Europe/Helsinki': 'Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
  'Europe/Athens': 'Athens',
  'Asia/Jerusalem': 'Jerusalem',
  'Africa/Harare': 'Harare, Pretoria',
  'Europe/Moscow': 'Istanbul, Minsk, Moscow, St. Petersburg, Volgograd',
  'Asia/Kuwait': 'Kuwait, Riyadh',
  'Africa/Nairobi': 'Nairobi',
  'Asia/Baghdad': 'Baghdad',
  'Asia/Tehran': 'Tehran',
  'Asia/Dubai': 'Abu Dhabi, Muscat',
  'Asia/Baku': 'Baku, Tbilisi, Yerevan',
  'Asia/Kabul': 'Kabul',
  'Asia/Yekaterinburg': 'Ekaterinburg',
  'Asia/Karachi': 'Islamabad, Karachi, Tashkent',
  'Asia/Kolkata': 'Chennai, Kolkata, Mumbai, New Delhi',
  'Asia/Kathmandu': 'Kathmandu',
  'Asia/Dhaka': 'Astana, Dhaka',
  'Asia/Colombo': 'Sri Jayawardenepura',
  'Asia/Almaty': 'Almaty, Novosibirsk',
  'Asia/Rangoon': 'Yangon Rangoon',
  'Asia/Bangkok': 'Bangkok, Hanoi, Jakarta',
  'Asia/Krasnoyarsk': 'Krasnoyarsk',
  'Asia/Shanghai': 'Beijing, Chongqing, Hong Kong SAR, Urumqi',
  'Asia/Kuala_Lumpur': 'Kuala Lumpur, Singapore',
  'Asia/Taipei': 'Taipei',
  'Australia/Perth': 'Perth',
  'Asia/Irkutsk': 'Irkutsk, Ulaanbaatar',
  'Asia/Seoul': 'Seoul',
  'Asia/Tokyo': 'Osaka, Sapporo, Tokyo',
  'Asia/Yakutsk': 'Yakutsk',
  'Australia/Darwin': 'Darwin',
  'Australia/Adelaide': 'Adelaide',
  'Australia/Sydney': 'Canberra, Melbourne, Sydney',
  'Australia/Brisbane': 'Brisbane',
  'Australia/Hobart': 'Hobart',
  'Asia/Vladivostok': 'Vladivostok',
  'Pacific/Guam': 'Guam, Port Moresby',
  'Asia/Magadan': 'Magadan, Solomon Islands, New Caledonia',
  'Asia/Kamchatka': 'Kamchatka, Marshall Islands',
  'Pacific/Fiji': 'Fiji Islands',
  'Pacific/Auckland': 'Auckland, Wellington',
  'Pacific/Tongatapu': "Nuku'alofa",
};

type TimezoneModalProps = {
  visible: boolean;
  setVisible: (visibility: boolean) => void;
  setTz: (item: string) => void;
  containerStyle?: ViewStyle;
  dark?: boolean;
  resetText?: string;
  resetTz?: string;
} & TouchableOpacityProps;

const TimezoneModal: React.FC<TimezoneModalProps> = ({
  setTz,
  dark = false,
  visible,
  setVisible,
  resetText,
  resetTz,
}) => {
  const toggleOverlay = () => {
    setVisible(!visible);
  };
  const user = useUser();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderItem = ({item, index}: {item: string; index: number}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          console.log(item);
          setTz(item);
          toggleOverlay();
        }}>
        <View
          style={{
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: COLOURS.teal,
            width: '100%',
          }}>
          <Text darkbg={dark} size={14} font={''}>
            {getCurrentOffsetFromGMT(item)} {timezones[item]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      testID={'modal'}
      isVisible={visible}
      onBackdropPress={toggleOverlay}
      useNativeDriverForBackdrop={true}
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}>
      <View
        style={{
          backgroundColor: dark ? COLOURS.black : COLOURS.white,
          borderRadius: 20,
          height: '90%',
          width: '100%',
          overflow: 'hidden',
        }}>
        <Text
          darkbg={dark}
          size={22}
          font={'P'}
          style={{
            paddingBottom: 10,
            paddingTop: 16,
            width: '100%',
            textAlign: 'center',
          }}>
          Change Timezone
        </Text>
        <TouchableOpacity
          style={{
            padding: 10,
            position: 'absolute',
            top: 8,
            left: 2,
          }}
          onPress={toggleOverlay}>
          <Icon2
            style={{}}
            name="chevron-left"
            size={26}
            color={dark ? COLOURS.white : COLOURS.black}
          />
        </TouchableOpacity>
        <FlatList data={Object.keys(timezones)} renderItem={renderItem} />
        {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '80%',
                paddingBottom: '3%',
              }}
            /> */}
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            paddingVertical: '3%',
          }}>
          <WhiteButton
            title={`${resetText} (${
              resetTz ?? getCurrentOffsetFromGMT(user.defaultTimezone)
            })`}
            onPress={() => {
              toggleOverlay();
              setTz(resetTz ?? user.defaultTimezone);
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default TimezoneModal;
