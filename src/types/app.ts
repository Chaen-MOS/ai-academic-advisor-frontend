import type {LucideIcon} from 'lucide-react-native';

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
  avatar_url: string | null;
};

export type SettingRowItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  target?: 'EditProfile' | 'Notifications';
  type?: 'navigation' | 'switch';
};

export type SelectorOption = {
  label: string;
  value: string;
};
