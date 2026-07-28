import type {
  NotificationCategory,
  NotificationRecord,
  ProfileData,
  SelectorOption,
  SettingRowItem,
} from '../types/app';

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
};

export const notificationCategories: NotificationCategory[] = [
  'All',
  'Courses',
  'Exams',
  'Deadlines',
  'Alerts',
];

export const notifications: NotificationRecord[] = [
  {
    id: 'course-registration',
    title: 'Course registration opens',
    description: 'Semester 2 course planning is available from 9:00 AM.',
    dateLabel: 'Today',
    timeLabel: '8:30 AM',
    category: 'Courses',
  },
  {
    id: 'midterm-schedule',
    title: 'Midterm schedule published',
    description: 'Check your exam timetable and room assignment.',
    dateLabel: 'Today',
    timeLabel: '11:45 AM',
    category: 'Exams',
  },
  {
    id: 'advisor-note',
    title: 'Advisor follow-up recommended',
    description: 'A lecturer can help review your module overload request.',
    dateLabel: 'Yesterday',
    timeLabel: '4:10 PM',
    category: 'Alerts',
  },
  {
    id: 'scholarship-deadline',
    title: 'Scholarship form deadline',
    description: 'Submit supporting documents by Friday evening.',
    dateLabel: 'This Week',
    timeLabel: 'Fri, 5:00 PM',
    category: 'Deadlines',
  },
];

export const settingsSections: {
  title: string;
  rows: SettingRowItem[];
}[] = [
  {
    title: 'ACCOUNT',
    rows: [
      {id: 'profile', label: 'Profile', icon: 'person', target: 'EditProfile'},
      {id: 'password', label: 'Change Password', icon: 'lock'},
    ],
  },
  {
    title: 'PREFERENCES',
    rows: [
      {id: 'memory', label: 'Chat Memory', icon: 'memory'},
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'bell',
        target: 'Notifications',
      },
    ],
  },
  {
    title: 'SUPPORT',
    rows: [
      {id: 'terms', label: 'Terms & Conditions', icon: 'doc'},
      {id: 'help', label: 'Help Center', icon: 'help'},
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
