export enum AnnouncementType {
  AuthOnboarding = 'auth-onboarding',
  CollectionsAnnouncement = 'collections-announcement',
}

type Announcement = {
  id: string;
  type: AnnouncementType;
};

export default Announcement;
