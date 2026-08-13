import type {LucideIcon} from 'lucide-react-native';
import { RootStackParamList } from './navigation';

type NoParamRouteName = {
  [K in keyof RootStackParamList]:
    RootStackParamList[K] extends undefined
      ? K
      : never;
}[keyof RootStackParamList];

export type NotificationCategory =
  | 'All'
  | 'Classes'
  | 'Events';

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
  target?: NoParamRouteName;
  type?: 'navigation' | 'switch';
};

export type SelectorOption = {
  label: string;
  value: string;
};
