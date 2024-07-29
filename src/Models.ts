interface Selection {
  [date: string]: number[];
}

interface SelectionObject {
  [key: string]: any;
}

interface SelectionData {
  [id: string]: {
    [key: string]: any;
  };
}

interface CompactedAvailability {
  [name: string]: number[];
}

interface GroupData {
  [id: string]: {
    [key: string]: any; // Allow additional dynamic properties
  };
}

interface Group {
  adminIDs: string[];
  id: string;
  name: string;
  startDate: any;
  endDate: any;
  selections: string[];
  userIDs: string[];
  duration: number;
  code: string;
  compactedAvailability: CompactedAvailability;
  lastUpdated: Date;
}

export type {
  Selection,
  SelectionObject,
  SelectionData,
  CompactedAvailability,
  GroupData,
  Group,
};
