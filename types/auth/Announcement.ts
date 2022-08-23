export enum AnnouncementType {
  AuthOnboarding = 'auth-onboarding',
}

type Announcement = {
  id: string;
  type: AnnouncementType;
};

export default Announcement;
