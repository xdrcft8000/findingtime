import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from 'react';
import auth, {firebase} from '@react-native-firebase/auth';
import {addWeeks, differenceInWeeks, format, startOfWeek} from 'date-fns';
import firestore from '@react-native-firebase/firestore';

type UserContextData = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  availability: React.MutableRefObject<any[]>;
  availabilitySelection: React.MutableRefObject<Selection>;
  date: Date;
  setDate: (value: Date) => void;
  updateSelection: () => void;
  saveSelection: (userID: string, userName: string) => Promise<void>;
  resetKey: number;
  reset: () => void;
  changeFlag: React.MutableRefObject<boolean>;
  selectionTitle: string;
  setSelectionTitle: (value: string) => void;
  selections: SelectionData;
  getDate: () => string;
  getClosestDate: (dateKey: string, selection: {}) => string;
  loadSelection: (id: string) => void;
  checkDeletable: (id: string) => Promise<string>;
  deleteSelection: (id: string) => Promise<void>;
  clearSelection: () => void;
  mostRecentSelection: React.MutableRefObject<string | null>;
  editSelection: () => Promise<void>;
  revertSelection: () => void;
  copySelection: () => void;
  cancelSelection: () => void;
  fromGroup: React.MutableRefObject<boolean>;
  startHour: number;
  endHour: number;
  setStartHour: (hour: number) => void;
  setEndHour: (hour: number) => void;
  deleteUserData: (userID: string) => Promise<void>;
};

interface Selection {
  [date: string]: boolean[];
}

interface SelectionData {
  [id: string]: {
    [key: string]: any; // Allow additional dynamic properties
  };
}
interface CompactedAvailability {
  [key: string]: number[];
}

const UserContext = createContext<UserContextData>({} as UserContextData);
type Props = {
  children?: React.ReactNode;
};
const UserProvider: React.FC<Props> = ({children}) => {
  const [loading, setLoading] = useState(true);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(16);
  const DAY_LENGTH = endHour - startHour;
  const availability = useRef(Array(DAY_LENGTH * 8 * 4).fill(false));
  const availabilitySelection = useRef<Selection>({});
  const availabilitySelectionCopy = useRef<Selection>({});
  const [date, setDateState] = useState<Date>(
    startOfWeek(new Date(), {weekStartsOn: 1}), // Start week on Monday
  );
  const [selectionTitle, setSelectionTitle] = useState('');
  const [selections, setSelections] = useState<SelectionData>({});
  const [resetKey, setResetKey] = useState(0);
  const reset = () => {
    availability.current = Array(32 * DAY_LENGTH).fill(false);
    setResetKey(resetKey + 1);
  };
  const refresh = () => {
    setResetKey(resetKey + 1);
  };
  const mostRecentSelection = useRef<string | null>(null);
  const changeFlag = useRef(false);

  const fromGroup = useRef(false);

  useEffect(() => {
    //firebase snapshot query
    const subscriber = firestore()
      .collection('Selections')
      .where('userID', '==', auth().currentUser?.uid)
      .onSnapshot(querySnapshot => {
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
        // setSelectionTitles(titles);
      });
    return () => subscriber();
  }, []);

  const getDate = () => {
    return format(date, 'yyyy-MM-dd');
  };

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
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

  const getClosestDate: (dateKey: string, selection: {}) => string = (
    dateKey: string,
    selection: {},
  ) => {
    if (dateKey in selection) {
      return dateKey;
    }
    const selectionDates = Object.keys(selection).sort();
    let closestDate: string = '';
    for (let i = selectionDates.length - 1; i >= 0; i--) {
      if (selectionDates[i] < dateKey) {
        closestDate = selectionDates[i];
        return closestDate;
      }
    }
    return closestDate;
  };

  const updateSelection = () => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentAvailability = [...availability.current];
    // Find the closest date prior to the current date
    const closestDate = getClosestDate(dateKey, availabilitySelection.current);
    // If a closest date is found and its value is identical to currentAvailability, do nothing

    const closestDateAvailability = closestDate
      ? availabilitySelection.current[closestDate]
      : null;

    // If a closest date is found and its value is identical to currentAvailability, do nothing
    if (
      closestDate &&
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
  ): Promise<void> => {
    console.log('Saving selection');
    // Update the selection title
    updateSelection();

    // Wrap Firestore operation in a Promise
    return new Promise<void>((resolve, reject) => {
      firestore()
        .collection('Selections')
        .add({
          title: selectionTitle,
          userID: userID,
          userName: userName,
          startHour: startHour,
          endHour: endHour,
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
    const excludedFields = ['title', 'userID', 'userName']; // Specify the fields you want to exclude
    let unexcludedData = {...selections[id]};
    // Exclude specified fields
    for (const field of excludedFields) {
      delete unexcludedData[field];
    }
    availabilitySelection.current = {...unexcludedData}; // Copy all fields from selections[id]
    availability.current = [
      ...availabilitySelection.current[
        getClosestDate(getDate(), availabilitySelection.current)!
      ],
    ];
    mostRecentSelection.current = id;

    refresh();
  };

  const clearSelection = () => {
    reset();
    availabilitySelection.current = {};
    setDateState(startOfWeek(new Date(), {weekStartsOn: 1}));
  };

  const editSelection = async (): Promise<void> => {
    updateSelection();
    const updateDoc = selectionTitle
      ? {title: selectionTitle, ...availabilitySelection.current}
      : {...availabilitySelection.current};

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
    const [compactAvailability, newStartHour, newEndHour] = await getCompactedA(
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
          startHour: newStartHour,
          endHour: newEndHour,
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

  const getCompactedA = async (
    selectionIDs: string[],
    startDate: any,
    endDate: any,
  ) => {
    let newStartHour = 24;
    let newEndHour = 0;
    const selections = [];
    for (let i = 0; i < selectionIDs.length; i++) {
      const selection = await firestore()
        .collection('Selections')
        .doc(selectionIDs[i])
        .get()
        .then(doc => {
          return doc.data()!;
        });
      selections.push(selection);
      newStartHour = Math.min(newStartHour, selection.startHour);
      newEndHour = Math.max(newEndHour, selection.endHour);
    }
    const dayLength = newEndHour - newStartHour;
    const duration = differenceInWeeks(endDate.toDate(), startDate.toDate());
    const arrayOfZeros = new Array(dayLength * 32).fill(0);
    const compactedA: CompactedAvailability = {};
    const fieldsToRemove = [
      'userID',
      'startHour',
      'endHour',
      'title',
      'userName',
    ];
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      const currentName = selection.userName;
      const startIndex = (selection.startHour - newStartHour) * 32;
      fieldsToRemove.forEach(field => {
        delete selection[field];
      });
      compactedA[currentName] = [...arrayOfZeros];
      for (let j = 0; j < duration; j++) {
        const closestDateKey = getClosestDate(
          formatDate(addWeeks(startDate.toDate(), j)),
          selection,
        );
        const numberArray = selection[closestDateKey].map((value: boolean) =>
          value ? 1 : 0,
        );
        const addedArray = [...compactedA[currentName]];
        for (let k = 0; k < numberArray.length; k++) {
          addedArray[k + startIndex] =
            addedArray[k + startIndex] + numberArray[k];
        }
        compactedA[currentName] = addedArray;
      }
    }
    return [compactedA, newStartHour, newEndHour];
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
      const selectionsArray = [];
      for (let i = 0; i < group.selections.length; i++) {
        try {
          const sel = await firestore()
            .collection('Selections')
            .doc(group.selections[i])
            .get()
            .then(doc => {
              if (doc.exists) {
                return doc.data()!;
              } else {
                throw (
                  'Could not find one of the selections in group ' + group.name
                );
              }
            });
          selectionsArray.push(sel);
        } catch (e) {
          console.error('Error getting selection: ', e);
          throw e;
        }
      }

      const dayLength = group.endHour - group.startHour;
      const duration = differenceInWeeks(
        group.endDate.toDate(),
        group.startDate.toDate(),
      );
      const arrayOfZeros = new Array(dayLength * 32).fill(0);
      const compactedA: CompactedAvailability = {};
      const fieldsToRemove = [
        'userID',
        'startHour',
        'endHour',
        'title',
        'userName',
      ];
      for (let i = 0; i < selectionsArray.length; i++) {
        const sel = selectionsArray[i];
        const currentName = sel.userName;
        const startIndex = sel.startHour * 32;
        fieldsToRemove.forEach(field => {
          delete sel[field];
        });
        compactedA[currentName] = [...arrayOfZeros];
        for (let j = 0; j < duration; j++) {
          const closestDateKey = getClosestDate(
            formatDate(addWeeks(group.startDate.toDate(), j)),
            sel,
          );
          const numberArray = sel[closestDateKey].map((value: boolean) =>
            value ? 1 : 0,
          );
          const addedArray = [...compactedA[currentName]];
          for (let k = 0; k < numberArray.length; k++) {
            addedArray[k + startIndex] =
              addedArray[k + startIndex] + numberArray[k];
          }
          compactedA[currentName] = addedArray;
        }
      }

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
    availability.current = [...availabilitySelectionCopy.current[getDate()]];

    availabilitySelection.current = {...availabilitySelectionCopy.current};

    refresh();
  };

  const cancelSelection = () => {
    mostRecentSelection.current
      ? (availability.current = [
          ...selections[mostRecentSelection.current!][getDate()],
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
        getDate,
        getClosestDate,
        loadSelection,
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
