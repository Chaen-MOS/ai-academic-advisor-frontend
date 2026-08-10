export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Home:
  | {
      conversationId?: string;
    }
  | undefined;
  ChatHistory: undefined;
  Settings: undefined;
  Notifications: undefined;
  ContactAdvisor: undefined;
  EditProfile: undefined;
  LecturerPortal: undefined;
  AdminPortal: undefined;
  MyTimetable: undefined;
  MyEvents: undefined;
};
