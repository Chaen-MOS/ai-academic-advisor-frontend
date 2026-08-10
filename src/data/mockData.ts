import type {
  NotificationCategory,
  NotificationRecord,
  ProfileData,
  SelectorOption,
  SettingRowItem,
} from '../types/app';
import {
  Bell,
  Brain,
  CalendarDays,
  CircleHelp,
  FileText,
  KeyRound,
  ScrollText,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';

export const quickQuestions = [
  'Attendance issue',
  'How to apply for leave?',
  'Recommended courses for next semester',
  'View my timetable',
] as const;

export const profileData: ProfileData = {
  name: 'Alex Scholar',
  email: 'ascholar@gmail.com',
  studentId: 'AA-2026-0147',
  phone: '+65 8123 4567',
  program: 'Computer Science',
  yearLevel: 'Year 2',
  academicStatus: 'Full-time',
  notificationPreference: 'Course updates and deadlines',
  avatar_url: null,
};

export const notificationCategories = [
  'All',
  'Classes',
  'Events',
] as const;

export const settingsSections: {
  title: string;
  rows: SettingRowItem[];
}[] = [
  {
    title: 'ACCOUNT',
    rows: [
      {id: 'profile', label: 'Profile', icon: UserRound, target: 'EditProfile'},
      {id: 'password', label: 'Change Password', icon: KeyRound},
      {id: 'timetable', label: 'My Timetable', icon: CalendarDays, target: 'MyTimetable'},
      {id: 'event', label: 'My Event', icon: ScrollText, target: 'MyEvents'},
    ],
  },
  {
    title: 'PREFERENCES',
    rows: [
      {
        id: 'memory',
        label: 'Chat Memory',
        icon: Brain,
        type: 'switch',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        target: 'Notifications',
      },
    ],
  },
  {
    title: 'SUPPORT',
    rows: [
      {id: 'terms', label: 'Terms & Conditions', icon: FileText},
      {id: 'help', label: 'Help Center', icon: CircleHelp, target: 'HelpCentre',},
    ],
  },
];

export const academicStatusOptions: SelectorOption[] = [
  {label: 'Full-time', value: 'full-time'},
  {label: 'Part-time', value: 'part-time'},
  {label: 'Exchange', value: 'exchange'},
];

export const yearLevelOptions: SelectorOption[] = [
  {label: 'Year 1', value: 'year-1'},
  {label: 'Year 2', value: 'year-2'},
  {label: 'Year 3', value: 'year-3'},
  {label: 'Year 4', value: 'year-4'},
];

export const notificationPreferenceOptions: SelectorOption[] = [
  {label: 'Course updates and deadlines', value: 'courses-deadlines'},
  {label: 'Exam reminders only', value: 'exams-only'},
  {label: 'Critical alerts only', value: 'alerts-only'},
];
