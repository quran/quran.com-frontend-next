/* eslint-disable import/prefer-default-export */
import adhan from 'adhan';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { geo } = req;

  // @ts-ignore
  const coordinates = new adhan.Coordinates(geo.latitude, geo.longitude);
  const date = new Date();
  const params = adhan.CalculationMethod.MuslimWorldLeague();
  const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

  return new Response(
    JSON.stringify({
      geo,
      prayerTimes: {
        fajrTime: prayerTimes.fajr,
        sunriseTime: prayerTimes.sunrise,
        dhuhrTime: prayerTimes.dhuhr,
        asrTime: prayerTimes.asr,
        maghribTime: prayerTimes.maghrib,
        ishaTime: prayerTimes.isha,
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
