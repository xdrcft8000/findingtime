import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from 'react';
import auth from '@react-native-firebase/auth';
import {format, startOfWeek} from 'date-fns';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Selection, SelectionData} from '../Models';
import {
  addNewUserToDB,
  formatDate,
  getClosestDate,
  getCompactedA,
  reTrimSchedule,
  trimSchedule,
  untrimSchedule,
  updateScheduleTo24,
} from '../HelperFunctions';
import {useAuth} from './Auth';

type UserContextData = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  availability: React.MutableRefObject<number[]>;
  availabilitySelection: React.MutableRefObject<Selection>;
  date: Date;
  setDate: (value: Date) => void;
  updateSelection: () => void;
  saveSelection: (
    userID: string,
    userName: string,
    timezone: string,
  ) => Promise<void>;
  resetKey: number;
  reset: () => void;
  changeFlag: React.MutableRefObject<boolean>;
  selectionTitle: string;
  setSelectionTitle: (value: string) => void;
  selections: SelectionData;
  loadSelection: (id: string) => void;
  loadSelectionForEdit: (newStartHour: number, newEndHour: number) => void;
  checkDeletable: (id: string) => Promise<string>;
  deleteSelection: (id: string) => Promise<void>;
  clearSelection: () => void;
  mostRecentSelection: React.MutableRefObject<string | null>;
  editSelection: (timezone: string) => Promise<void>;
  revertSelection: () => void;
  copySelection: () => void;
  cancelSelection: () => void;
  fromGroup: React.MutableRefObject<boolean>;
  startHour: number;
  endHour: number;
  setStartHour: (hour: number) => void;
  setEndHour: (hour: number) => void;
  deleteUserData: (userID: string) => Promise<void>;
  defaultTimezone: string;
  setDefaultTimezone: (timezone: string, updateDB: boolean) => void;
  useTimezones: boolean;
};

const UserContext = createContext<UserContextData>({} as UserContextData);
type Props = {
  children?: React.ReactNode;
};
const UserProvider: React.FC<Props> = ({children}) => {
  const {authData} = useAuth();
  const [loading, setLoading] = useState(true);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(16);
  const DAY_LENGTH = endHour - startHour;
  const availability = useRef(Array(DAY_LENGTH * 32).fill(0));
  const availabilitySelection = useRef<Selection>({});
  const availabilitySelectionCopy = useRef<Selection>({});
  const [date, setDateState] = useState<Date>(
    startOfWeek(new Date(), {weekStartsOn: 1}), // Start week on Monday
  );
  const [selectionTitle, setSelectionTitle] = useState('');
  const [selections, setSelections] = useState<SelectionData>({});
  const [resetKey, setResetKey] = useState(0);
  const [defaultTimezone, _setDefaultTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const setDefaultTimezone = (timezone: string, updateDB?: boolean) => {
    _setDefaultTimezone(timezone);
    AsyncStorage.setItem('@UseTimezones', 'true');
    AsyncStorage.setItem('@DefaultTimezone', timezone);
    if (updateDB) {
      firestore()
        .doc('Users/' + auth().currentUser?.uid)
        .update({
          timezone: timezone,
        });
    }
  };
  const [useTimezones, setUseTimezones] = useState<boolean>(false);

  const reset = () => {
    availability.current = Array(32 * DAY_LENGTH).fill(0);
    setResetKey(resetKey + 1);
  };
  const refresh = () => {
    setResetKey(resetKey + 1);
  };
  const mostRecentSelection = useRef<string | null>(null);
  const changeFlag = useRef(false);

  const fromGroup = useRef(false);

  useEffect(() => {
    setLoading(true);
    const loadDataAndSubscribe = async () => {
      await loadStorageData();
      // firestore()
      //   .collection('Users')
      //   .doc(auth().currentUser?.uid)
      //   .get()
      //   .then(doc => {
      //     if (!doc.exists) {
      //       addNewUserToDB(authData!.id, authData!.name, authData!.email);
      //     } else {
      //       if (!doc.data()!.timezone) {
      //         doc.ref.set({timezone: defaultTimezone}, {merge: true});
      //       } else {
      //         if (doc.data()!.timezone !== defaultTimezone) {
      //           setUseTimezones(true);
      //           setDefaultTimezone(doc.data()!.timezone);
      //         }
      //       }
      //     }
      //   })
      //   .catch(e => {
      //     console.error('Error getting user from DB: possibly no internet.', e);
      //   });
      addNewUserToDB(authData!.id, authData!.name, authData!.email);
      // Firebase snapshot query
      try {
        let timezoneCompare = '';
        const subscriber = firestore()
          .collection('Selections')
          .where('userID', '==', auth().currentUser?.uid)
          .onSnapshot(querySnapshot => {
            for (const doc of querySnapshot.docs) {
              const docData = doc.data();
              if (!docData.timezone) {
                doc.ref.set({timezone: defaultTimezone}, {merge: true});
                docData.timezone = defaultTimezone;
              } else if (
                docData.timezone !== timezoneCompare &&
                !useTimezones
              ) {
                AsyncStorage.setItem('@UseTimezones', 'true');
                setUseTimezones(true);
              }
              timezoneCompare = docData.timezone;
              if (docData.startHour !== undefined) {
                console.log('updating schedule to new format');
                addNewUserToDB(authData!.id, authData!.name, authData!.email);
                updateScheduleTo24(doc);
              }
            }
            const data: SelectionData = querySnapshot.docs.reduce(
              (acc: SelectionData, doc) => {
                acc[doc.id] = {
                  ...doc.data(),
                };
                return acc;
              },
              {},
            );
            setSelections(data);
            setLoading(false);
          });
        return subscriber;
      } catch (error) {
        console.error('Error getting selections: ', error);
      }
    };

    const subscriberPromise = loadDataAndSubscribe();

    return () => {
      subscriberPromise.then(subscriber => {
        if (subscriber) {
          subscriber();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStorageData = async () => {
    try {
      const value = await AsyncStorage.getItem('@UseTimezones');
      if (value) {
        //CHANGE TO TRUE TO ENABLE TIMEZONES
        setUseTimezones(true);
        const value2 = await AsyncStorage.getItem('@DefaultTimezone');
        if (value2) {
          setDefaultTimezone(value2);
        }
      }
    } catch (e) {
      console.error('Error loading storage data:', e);
    }
  };

  const setDate = (value: Date, withoutUpdate = false) => {
    if (!withoutUpdate) {
      updateSelection();
    }
    // Convert the date to a string key
    const dateKey = format(value, 'yyyy-MM-dd');
    // Check if the date exists in availabilitySelection
    const closestDate = getClosestDate(dateKey, availabilitySelection.current);
    closestDate &&
      (availability.current = [...availabilitySelection.current[closestDate]]);
    // Set the new date state
    setDateState(value);
    refresh();
  };

  const updateSelection = () => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentAvailability = [...availability.current];

    // Find the closest date prior to the current date
    const closestDate = getClosestDate(dateKey, availabilitySelection.current);

    const closestDateAvailability = availabilitySelection.current[closestDate];

    // If a closest date value is identical to currentAvailability, do nothing
    if (
      JSON.stringify(closestDateAvailability) ===
      JSON.stringify(currentAvailability)
    ) {
      return;
    }
    // If the date doesn't exist or its value is different from currentAvailability, add it as a new key-value pair
    availabilitySelection.current[dateKey] = currentAvailability;
  };

  const saveSelection = async (
    userID: string,
    userName: string,
    timezone: string,
  ): Promise<void> => {
    console.log('Saving selection');
    // Update the selection title
    updateSelection();
    if (timezone !== defaultTimezone) {
      AsyncStorage.setItem('@UseTimezones', 'true');
      setUseTimezones(true);
    }
    availabilitySelection.current = untrimSchedule(
      availabilitySelection.current,
      startHour,
      endHour,
    );
    // Wrap Firestore operation in a Promise
    return new Promise<void>((resolve, reject) => {
      firestore()
        .collection('Selections')
        .add({
          title: selectionTitle,
          userID: userID,
          userName: userName,
          timezone: timezone,
          ...availabilitySelection.current,
        })
        .then(docRef => {
          console.log('Document written with ID: ', docRef.id);
          mostRecentSelection.current = docRef.id;
          setDate(startOfWeek(new Date(), {weekStartsOn: 1}), true);
          resolve(); // Resolve the Promise
        })
        .catch(error => {
          console.error('Error saving availability:', error);
          reject(error); // Reject the Promise with the error
        });
    });
  };

  const checkDeletable = async (id: string): Promise<string> => {
    mostRecentSelection.current = null;

    try {
      // Check if the selection is in use
      const querySnapshot = await firestore()
        .collection('Groups')
        .where('selections', 'array-contains', id)
        .get();

      if (!querySnapshot.empty) {
        const groupsUsing = querySnapshot.docs.map(doc => doc.data().name);
        let message = 'This selection is still in use by ';
        if (groupsUsing.length === 1) {
          message += groupsUsing[0] + '.';
        } else if (groupsUsing.length === 2) {
          message += groupsUsing.join(' and ') + '.';
        } else {
          const lastGroup = groupsUsing.pop();
          message += groupsUsing.join(', ') + ', and ' + lastGroup + '.';
        }
        throw message;
      }

      // If not in use, delete the selection
      const doc = await firestore().collection('Selections').doc(id).get();
      if (doc.exists) {
        const name = doc.data()!.name;
        setSelectionTitle('');
        console.log('Deleted ' + name);
        return 'Deleted ' + name;
      } else {
        console.error('No such document exists');
        throw 'No such document exists';
      }
    } catch (error) {
      console.error('Error deleting or getting document: ', error);
      throw error;
    }
  };

  const deleteSelection = async (id: string): Promise<void> => {
    firestore().collection('Selections').doc(id).delete();
  };

  const loadSelection = (id: string) => {
    const excludedFields = ['title', 'userID', 'userName', 'timezone']; // Specify the fields you want to exclude
    let unexcludedData = {...selections[id]};
    // Exclude specified fields
    for (const field of excludedFields) {
      delete unexcludedData[field];
    }
    const {trimmedSchedule, newStartHour, newEndHour} =
      trimSchedule(unexcludedData);
    availabilitySelection.current = {...trimmedSchedule}; // Copy all fields from selections[id]
    setStartHour(newStartHour);
    setEndHour(newEndHour);
    availability.current = [
      ...availabilitySelection.current[
        getClosestDate(formatDate(date), availabilitySelection.current)!
      ],
    ];
    mostRecentSelection.current = id;
    refresh();
  };

  const loadSelectionForEdit = (newStartHour: number, newEndHour: number) => {
    availabilitySelection.current = reTrimSchedule(
      availabilitySelection.current,
      startHour,
      endHour,
      newStartHour,
      newEndHour,
    );
    availability.current = [
      ...availabilitySelection.current[
        getClosestDate(formatDate(date), availabilitySelection.current)!
      ],
    ];
    console.log('availability.current: ', availability.current.length);
    setStartHour(newStartHour);
    setEndHour(newEndHour);
  };

  const clearSelection = () => {
    reset();
    availabilitySelection.current = {};
    setDateState(startOfWeek(new Date(), {weekStartsOn: 1}));
  };

  const editSelection = async (timezone: string): Promise<void> => {
    updateSelection();
    if (timezone !== defaultTimezone) {
      AsyncStorage.setItem('@UseTimezones', 'true');
      setUseTimezones(true);
    }

    const untrimmedSchedule = untrimSchedule(
      availabilitySelection.current,
      startHour,
      endHour,
    );
    const updateDoc = selectionTitle
      ? {title: selectionTitle, ...untrimmedSchedule, timezone}
      : {...untrimmedSchedule, timezone};

    console.log(updateDoc);
    // Wrap Firestore operation in a Promise
    return new Promise<void>((resolve, reject) => {
      if (mostRecentSelection.current) {
        firestore()
          .collection('Selections')
          .doc(mostRecentSelection.current)
          .update(updateDoc)
          .then(() => {
            console.log('Availability saved');
            updateGroups(mostRecentSelection.current!).then(() => resolve());
          })
          .catch(error => {
            console.error('Error saving availability:', error);
            reject(error); // Reject the Promise with the error
          });
      } else {
        // If mostRecentSelection.current is not set, resolve the Promise immediately
        console.log('No recent selection found');
        reject();
      }
    });
  };

  const leaveGroup = async (
    selectionID: string,
    userID: string,
    groupID: string,
    groupSelections: string[],
    groupStartDate: Date,
    groupEndDate: Date,
  ): Promise<boolean> => {
    if (groupSelections.length === 1) {
      deleteGroup(groupID);
      return true;
    }
    const newSelectionIDs = groupSelections.filter(
      item => item !== selectionID,
    );
    const [compactAvailability] = await getCompactedA(
      newSelectionIDs,
      groupStartDate,
      groupEndDate,
    );
    try {
      await firestore()
        .collection('Groups')
        .doc(groupID)
        .update({
          userIDs: firestore.FieldValue.arrayRemove(userID),
          selections: firestore.FieldValue.arrayRemove(selectionID),
          compactedAvailability: compactAvailability,
        });
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      return false;
    }
  };

  const deleteGroup = async (groupID: string): Promise<boolean> => {
    try {
      await firestore().collection('Groups').doc(groupID).delete();
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  };

  const updateGroups = async (selectionID: string): Promise<void> => {
    const groups: any = [];
    try {
      await firestore()
        .collection('Groups')
        .where('selections', 'array-contains', selectionID)
        .get()
        .then(querySnapshot => {
          if (querySnapshot.empty) {
            console.log('No groups found');
            return;
          }
          querySnapshot.forEach(doc => {
            groups.push({
              ...doc.data(),
              id: doc.id,
            });
          });
        });
    } catch (error) {
      console.error('Error getting groups: ', error);
      throw error;
    }
    for (const group of groups) {
      const selectionIDs = group.selections;
      const [compactedA] = await getCompactedA(
        selectionIDs,
        group.startDate,
        group.endDate,
      );
      try {
        await firestore()
          .collection('Groups')
          .doc(group.id)
          .update({compactedAvailability: compactedA});
      } catch (error) {
        console.error('Error updating group: ', error);
        throw error;
      }
    }
  };

  const revertSelection = () => {
    const closestDate = getClosestDate(
      formatDate(date),
      availabilitySelectionCopy.current,
    );
    availability.current = [...availabilitySelectionCopy.current[closestDate]];

    availabilitySelection.current = {...availabilitySelectionCopy.current};

    refresh();
  };

  const cancelSelection = () => {
    mostRecentSelection.current
      ? (availability.current = [
          ...selections[mostRecentSelection.current!][formatDate(date)],
        ])
      : reset();
  };

  const copySelection = () => {
    availabilitySelectionCopy.current = {...availabilitySelection.current};
  };

  const deleteUserData = async (userID: string): Promise<void> => {
    const groups: any[] = [];
    console.log('searching for groups with userID: ', userID);

    try {
      await firestore()
        .collection('Groups')
        .where('userIDs', 'array-contains', userID)
        .get()
        .then(snapshot => {
          if (snapshot.empty) {
            console.log('No groups found');
            return;
          }
          console.log('Found ', snapshot.size, ' groups');
          snapshot.forEach(doc => {
            groups.push({
              ...doc.data(),
              id: doc.id,
            });
          });
        });
      console.log('added groups: ', groups);
    } catch (e) {
      console.error('Error getting groups: ', e);
      throw e;
    }
    const userSelections = Object.keys(selections);
    for (const group of groups) {
      let userSelection = '';
      const groupSelections = group.selections;
      groupSelections.forEach((selID: string) => {
        if (userSelections.includes(selID)) {
          console.log('found', selID, ' in group ', group.name);
          userSelection = selID;
          userSelections.splice(userSelections.indexOf(userSelection), 1);
        }
      });
      leaveGroup(
        userSelection,
        userID,
        group.id,
        group.selections,
        group.startDate,
        group.endDate,
      );
      try {
        await firestore().collection('Selections').doc(userSelection).delete();
      } catch (e) {
        console.error('Error deleting selection: ', e);
        throw e;
      }
    }
    for (const sel of userSelections) {
      try {
        console.log('deleteing selection: ', sel);
        await firestore().collection('Selections').doc(sel).delete();
      } catch (e) {
        console.error('Error deleting selection: ', sel, e);
        throw e;
      }
    }
  };

  return (
    //This component will be used to encapsulate the whole App,
    //so all components will have access to the Context
    <UserContext.Provider
      value={{
        loading,
        setLoading,
        availability,
        availabilitySelection,
        updateSelection,
        saveSelection,
        date,
        setDate,
        resetKey,
        changeFlag,
        reset,
        selectionTitle,
        setSelectionTitle,
        selections,
        loadSelection,
        loadSelectionForEdit,
        checkDeletable,
        deleteSelection,
        clearSelection,
        mostRecentSelection,
        editSelection,
        revertSelection,
        copySelection,
        cancelSelection,
        fromGroup,
        startHour,
        endHour,
        setStartHour,
        setEndHour,
        deleteUserData,
        defaultTimezone,
        setDefaultTimezone,
        useTimezones,
      }}>
      {children}
    </UserContext.Provider>
  );
};

function useUser(): UserContextData {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within an UserProvider');
  }

  return context;
}

export {UserContext, UserProvider, useUser};
