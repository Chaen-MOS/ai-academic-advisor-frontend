export type NotificationCategory =
  | 'All'
  | 'Courses'
  | 'Exams'
  | 'Deadlines'
  | 'Alerts';

export type NotificationRecord = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  timeLabel: string;
  category: Exclude<NotificationCategory, 'All'>;
};

export type ProfileData = {
  name: string;
  email: string;
  studentId: string;
  phone: string;
  program: string;
  yearLevel: string;
  academicStatus: string;
  notificationPreference: string;
};

export type SettingRowItem = {
  id: string;
  label: string;
  icon: string;
  target?: 'EditProfile' | 'Notifications';
};

export type SelectorOption = {
  label: string;
  value: string;
};
