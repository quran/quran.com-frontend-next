export type PrayerTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type Geo = {
  city?: string;
  country?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
};

export type HijriDateData = {
  dayName: string;
  month: number;
  date: number;
  year: number;
};

export type PrayerTimesData = {
  geo: Geo;
  prayerTimes: PrayerTimes;
  hijriDate: string;
  hijriDateData: HijriDateData;
};
