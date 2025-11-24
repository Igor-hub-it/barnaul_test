export type Device = {
  id: number;
  name: string;
  timestamp: string;
  wifi: 1 | 2 | 3 | 4 | 5;
  alarm: boolean;
  lat: number;
  lon: number;
  channels: number;
};

export type DeviceGroup = {
  id: string;
  name: string;
  deviceIds: number[];
};

export const groups: DeviceGroup[] = [
  {
    id: 'g1',
    name: 'Группа Север',
    deviceIds: [1, 2, 3, 4, 5],
  },
  {
    id: 'g2',
    name: 'Группа Юг',
    deviceIds: [6, 7, 8, 9, 10],
  },
];

export const devices: Record<number, Device> = {
  1: {
    id: 1,
    name: 'Регистратор Север-1',
    timestamp: '06.11.2025, 10:15:22',
    wifi: 5,
    alarm: true,
    lat: 55.7558,
    lon: 37.6173,
    channels: 16,
  },
  2: {
    id: 2,
    name: 'Регистратор Север-2',
    timestamp: '06.11.2025, 11:20:45',
    wifi: 3,
    alarm: false,
    lat: 55.8038,
    lon: 37.5823,
    channels: 8,
  },
  3: {
    id: 3,
    name: 'Регистратор Север-3',
    timestamp: '06.11.2025, 09:45:10',
    wifi: 4,
    alarm: true,
    lat: 55.7088,
    lon: 37.6653,
    channels: 12,
  },
  4: {
    id: 4,
    name: 'Регистратор Север-4',
    timestamp: '06.11.2025, 12:05:30',
    wifi: 1,
    alarm: false,
    lat: 55.7788,
    lon: 37.5903,
    channels: 4,
  },
  5: {
    id: 5,
    name: 'Регистратор Север-5',
    timestamp: '06.11.2025, 08:30:55',
    wifi: 2,
    alarm: true,
    lat: 55.7308,
    lon: 37.6103,
    channels: 16,
  },
  6: {
    id: 6,
    name: 'Регистратор Юг-1',
    timestamp: '06.11.2025, 14:10:15',
    wifi: 5,
    alarm: false,
    lat: 47.2313,
    lon: 39.7233,
    channels: 16,
  },
  7: {
    id: 7,
    name: 'Регистратор Юг-2',
    timestamp: '06.11.2025, 15:25:40',
    wifi: 4,
    alarm: true,
    lat: 47.2513,
    lon: 39.7433,
    channels: 10,
  },
  8: {
    id: 8,
    name: 'Регистратор Юг-3',
    timestamp: '06.11.2025, 13:50:20',
    wifi: 3,
    alarm: false,
    lat: 47.2113,
    lon: 39.7033,
    channels: 6,
  },
  9: {
    id: 9,
    name: 'Регистратор Юг-4',
    timestamp: '06.11.2025, 16:00:35',
    wifi: 2,
    alarm: true,
    lat: 47.2713,
    lon: 39.7633,
    channels: 16,
  },
  10: {
    id: 10,
    name: 'Регистратор Юг-5',
    timestamp: '06.11.2025, 12:40:50',
    wifi: 1,
    alarm: false,
    lat: 47.1913,
    lon: 39.6833,
    channels: 2,
  },
  11: {
    id: 11,
    name: 'Самостоятельный Регистратор A',
    timestamp: '06.11.2025, 07:15:00',
    wifi: 5,
    alarm: true,
    lat: 59.9311,
    lon: 30.3609,
    channels: 16,
  },
  12: {
    id: 12,
    name: 'Самостоятельный Регистратор B',
    timestamp: '06.11.2025, 17:30:25',
    wifi: 3,
    alarm: false,
    lat: 56.8389,
    lon: 60.6057,
    channels: 8,
  },
  13: {
    id: 13,
    name: 'Самостоятельный Регистратор C',
    timestamp: '06.11.2025, 11:55:45',
    wifi: 4,
    alarm: true,
    lat: 55.1644,
    lon: 61.4368,
    channels: 12,
  },
};

