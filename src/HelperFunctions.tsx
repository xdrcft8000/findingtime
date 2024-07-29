import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {addWeeks, differenceInWeeks, format} from 'date-fns';
import {CompactedAvailability, Selection, SelectionObject} from './Models';
import {getTimezoneOffset} from 'date-fns-tz';

export const addNewUserToDB = async (
  userID: string,
  name: string,
  email: string,
): Promise<Boolean> => {
  const userDoc = {
    id: userID,
    name: name,
    email: email,
    createdAt: new Date(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  try {
    await firestore()
      .collection('Users')
      .doc(userID)
      .get()
      .then(async doc => {
        if (doc.exists) {
          console.log('User already existed');
        } else {
          await firestore()
            .collection('Users')
            .doc(userID)
            .set(userDoc)
            .then(() => {
              console.log('New user created in db');
            });
        }
      });
    return true;
  } catch (e: any) {
    console.log(e.message);
    throw e;
  }
};

export const getClosestDate: (dateKey: string, selection: {}) => string = (
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
  return selectionDates[0];
};

export const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

export const getCompactedA = async (
  selectionIDs: string[],
  startDate: any,
  endDate: any,
) => {
  const duration = differenceInWeeks(endDate.toDate(), startDate.toDate());
  const arrayOfZeros = new Array(768).fill(0);
  const compactedA: CompactedAvailability = {};
  const fieldsToRemove = ['userID', 'title', 'userName', 'timezone'];

  for (let i = 0; i < selectionIDs.length; i++) {
    const untzselection = await firestore()
      .collection('Selections')
      .doc(selectionIDs[i])
      .get()
      .then(async doc => {
        if (doc.exists) {
          if (doc.data()!.startHour !== undefined) {
            console.log('updating schedule to 24');
            return await updateScheduleTo24(doc);
          }
          return doc.data();
        } else {
          return null;
        }
      })
      .catch(error => {
        console.log('error', error);
      });
    if (untzselection === null) {
      continue;
    }
    const selection = timezoneSelection(untzselection!, 'GMT');
    const currentName = selection.userName;
    fieldsToRemove.forEach(field => {
      if (selection[field]) {
        delete selection[field];
      }
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
        addedArray[k] = addedArray[k] + numberArray[k];
      }
      compactedA[currentName] = addedArray;
    }
  }
  return [compactedA];
};

const fixCalcutta = (timezone: string) => {
  if (timezone === 'Asia/Kolkata') {
    return 'Asia/Calcutta';
  }
  return timezone;
};

function timezoneDifference(timezone1: string, timezone2: string): number {
  //returns the difference in hours between two timezones
  timezone1 = fixCalcutta(timezone1);
  timezone2 = fixCalcutta(timezone2);
  const now = new Date();
  const offset1 = getTimezoneOffset(timezone1, now);
  const offset2 = getTimezoneOffset(timezone2, now);
  return (offset1 - offset2) / (1000 * 60 * 60);
}

export function getCurrentOffsetFromGMT(timezone: string): string {
  const now = new Date();
  timezone = fixCalcutta(timezone);
  const offsetMilliseconds = getTimezoneOffset(timezone, now);
  const offsetMinutes = offsetMilliseconds / (1000 * 60);
  // offsetMinutes is in minutes, convert it to hours and minutes
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetRemainingMinutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';

  // Format the offset as +hh:mm or -hh:mm
  const formattedOffset = `${sign}${String(offsetHours).padStart(
    2,
    '0',
  )}:${String(offsetRemainingMinutes).padStart(2, '0')}`;

  // Return the formatted string
  return `GMT${formattedOffset}`;
}

export function timezoneCompactedAvailability(
  compactedA: CompactedAvailability,
  toTz: string,
) {
  const newCompactedA: CompactedAvailability = {};
  const difference = timezoneDifference('GMT', toTz);
  if (difference === 0) {
    return compactedA;
  }
  const indexDifference = Math.abs(difference * 4);

  for (const name in compactedA) {
    const selection = transposeMatrix(compactedA[name]);
    if (difference < 0) {
      // The new timezone is ahead of the old timezone
      //the squares are moving forward in time
      const repeatedSlice = selection.slice(672 - indexDifference);
      newCompactedA[name] = untransposeMatrix([
        ...repeatedSlice,
        ...selection.slice(0, 672 - indexDifference),
      ]);
    } else {
      // The new timezone is behind the old timezone
      //the squares are moving backwards in time
      const repeatedSlice = selection.slice(0, indexDifference);
      newCompactedA[name] = untransposeMatrix([
        ...selection.slice(indexDifference),
        ...repeatedSlice,
      ]);
    }
  }

  return newCompactedA;
}

export function timezoneSelection(selection: SelectionObject, toTz: string) {
  const {title, userID, userName, timezone, ...selectionDates} = selection;
  const zonedSelection = timezoneSchedule(selectionDates, timezone, toTz);
  return {
    title,
    userID,
    userName,
    timezone,
    ...zonedSelection,
  } as SelectionObject;
}

export function timezoneSchedule(
  selectionDates: {[key: string]: number[]},
  fromTz: string,
  toTz: string,
) {
  const difference = timezoneDifference(fromTz, toTz);

  if (difference === 0) {
    return selectionDates;
  }

  const newSchedule: SelectionObject = {};

  const indexDifference = Math.abs(difference * 4);

  const dates = Object.keys(selectionDates).sort();

  if (difference < 0) {
    // The new timezone is ahead of the old timezone
    let hangingSlice: number[] = new Array(indexDifference).fill(0);
    for (const date of dates) {
      const parsedSelection = transposeMatrix(selectionDates[date] as number[]);
      const length = parsedSelection.length;
      const pushedSelection = parsedSelection.slice(
        0,
        length - indexDifference,
      );

      newSchedule[date] = untransposeMatrix([
        ...hangingSlice,
        ...pushedSelection,
      ]);
      hangingSlice = parsedSelection.slice(length - indexDifference);
      // const hangingSlice = parsedSelection.slice(length - indexDifference);
      const oneWeekAfter = formatDate(addWeeks(date, 1));

      if (selectionDates[oneWeekAfter] === undefined) {
        newSchedule[oneWeekAfter] = untransposeMatrix([
          ...hangingSlice,
          ...parsedSelection.slice(0, length - indexDifference),
        ]);
      }
    }
  } else {
    let repeatedSlice = new Array(672 - indexDifference).fill(0);
    // The new timezone is behind the old timezone
    for (const date of dates) {
      const parsedSelection = transposeMatrix(selectionDates[date]);
      const length = parsedSelection.length;
      const hangingSlice = parsedSelection.slice(0, indexDifference);
      const oneWeekBefore = formatDate(addWeeks(date, -1));
      if (selectionDates[oneWeekBefore] === undefined) {
        newSchedule[oneWeekBefore] = untransposeMatrix([
          ...repeatedSlice,
          ...hangingSlice,
        ]);
      } else {
        newSchedule[oneWeekBefore] = untransposeMatrix([
          ...transposeMatrix(newSchedule[oneWeekBefore]).slice(
            0,
            length - indexDifference,
          ),
          ...hangingSlice,
        ]);
      }
      repeatedSlice = parsedSelection.slice(indexDifference);

      newSchedule[date] = untransposeMatrix([
        ...repeatedSlice,
        ...hangingSlice,
      ]);
    }
  }
  return newSchedule;
}

export const trimSelection = (selection: number[]) => {
  let startIndex = 0;
  let endIndex = 0;
  for (let i = 0; i < selection.length; i++) {
    if (selection[i] !== 0) {
      startIndex = Math.floor(i / 32) * 32;
      break;
    }
  }
  for (let i = selection.length - 1; i >= 0; i--) {
    if (selection[i] !== 0) {
      endIndex = Math.floor(i / 32) * 32 + 32;
      break;
    }
  }
  const trimmedSelection = selection.slice(startIndex, endIndex);
  const startHour = Math.floor(startIndex / 32);
  const endHour = Math.floor(endIndex / 32);
  return {trimmedSelection, startHour, endHour};
};

export const trimSchedule = (schedule: Selection | CompactedAvailability) => {
  const trimmedSchedule: Selection = {};
  let newStartIndex = 768;
  let newEndIndex = 0;
  for (const date in schedule) {
    const selection = schedule[date];
    for (let i = 0; i < selection.length; i++) {
      if (selection[i] !== 0) {
        const startIndex = Math.floor(i / 32) * 32;
        newStartIndex = Math.min(newStartIndex, startIndex);
        break;
      }
    }
    for (let i = selection.length - 1; i >= 0; i--) {
      if (selection[i] !== 0) {
        const endIndex = Math.floor(i / 32) * 32 + 32;
        newEndIndex = Math.max(newEndIndex, endIndex);
        break;
      }
    }
  }

  for (const date in schedule) {
    trimmedSchedule[date] = schedule[date].slice(newStartIndex, newEndIndex);
  }
  const newStartHour = Math.floor(newStartIndex / 32);
  const newEndHour = Math.floor(newEndIndex / 32);

  return {trimmedSchedule, newStartHour, newEndHour};
};

export const untrimSelection = (
  selection: number[],
  startHour: number,
  endHour: number,
) => {
  const startArray = new Array(startHour * 32).fill(0);
  const endArray = new Array((24 - endHour) * 32).fill(0);
  const newSelection = [...startArray, ...selection, ...endArray];
  return newSelection;
};

export const untrimSchedule = (
  schedule: Selection,
  startHour: number,
  endHour: number,
) => {
  const newSchedule: Selection = {};
  for (const date in schedule) {
    newSchedule[date] = untrimSelection(schedule[date], startHour, endHour);
  }
  return newSchedule;
};

export const reTrimSchedule = (
  schedule: Selection,
  oldStartHour: number,
  oldEndHour: number,
  newStartHour: number,
  newEndHour: number,
) => {
  const newSchedule: Selection = {};
  for (const date in schedule) {
    const selection = schedule[date];
    const untrimmedSelection = untrimSelection(
      selection,
      oldStartHour,
      oldEndHour,
    );
    const newStartIndex = newStartHour * 32;
    const newEndIndex = newEndHour * 32;
    const trimmedSelection = untrimmedSelection.slice(
      newStartIndex,
      newEndIndex,
    );
    newSchedule[date] = trimmedSelection;
  }
  return newSchedule;
};

export const updateScheduleTo24 = async (
  doc:
    | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
    | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
) => {
  const {startHour, endHour, title, userID, userName, ...rest} = doc.data()!;

  const newSchedules: SelectionObject = {};

  for (const key of Object.keys(rest)) {
    const selection = rest[key];
    const mappedSelection = selection.map((value: boolean | number) =>
      value === true ? 1 : 0,
    );
    const newSelection = [
      ...new Array(startHour * 32).fill(0),
      ...mappedSelection,
      ...new Array((24 - endHour) * 32).fill(0),
    ];
    newSchedules[key] = newSelection;
  }

  const newDoc = {
    title,
    userID,
    userName,
    ...newSchedules,
  };
  await doc.ref.set(newDoc);
  return newDoc;
};

const transposeMatrix = (matrix: number[]) => {
  const rows = 96;
  const cols = 8;
  const transposed: number[] = new Array(matrix.length);
  for (let i = 0; i < matrix.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const newIndex = col * rows + row;
    transposed[newIndex] = matrix[i];
  }
  return transposed.slice(96);
};

const untransposeMatrix = (matrix: number[]) => {
  const rows = 96;
  const cols = 8;
  const untransposed: number[] = new Array(768);
  matrix = [...new Array(96).fill(0), ...matrix];
  for (let i = 0; i < 768; i++) {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const newIndex = row * cols + col;
    untransposed[newIndex] = matrix[i];
  }
  return untransposed;
};
