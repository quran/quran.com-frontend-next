export const SURAH = 112;
export const VIDEO_ORIENTATION = "LANDSCAPE";

export function getNormalizedIntervals(start, end) {
  const FRAMES = 30;
  const normalizedStart = (start / 1000) * FRAMES;
  const normalizedEnd = (end / 1000) * FRAMES;
  const durationInFrames = normalizedEnd - normalizedStart;

  return {
    start: normalizedStart,
    end: normalizedEnd,
    durationInFrames: durationInFrames,
  };
}

export function getNormalizedTimestamps(audio) {
  let result = [];
  for (let i = 0; i < audio.verseTimings.length; i++) {
    const currentVerse = audio.verseTimings[i];
    const nextVerse = audio.verseTimings[i + 1] || undefined;
    let start = 0;
    let end = 0;
    if (i === 0) {
      start = 0;
      if (nextVerse) {
        end = nextVerse.timestampFrom;
      }
    } else if (i === audio.verseTimings.length - 1) {
      start = currentVerse.timestampFrom;
      end = audio.duration + 500;
    } else if (nextVerse) {
      start = currentVerse.timestampFrom;
      end = nextVerse.timestampFrom;
    }

    result.push(getNormalizedIntervals(start, end));
  }
  return result;
}

export function getVideoURL() {
  const staticVideos = [
    "https://static.videezy.com/system/resources/previews/000/046/939/original/waterfall_and_flowers.mp4",
    "https://static.videezy.com/system/resources/previews/000/046/143/original/Peach_Flower_Tree_2.mp4",
    "https://static.videezy.com/system/resources/previews/000/035/955/original/4k-2018.12.02-SUNSET-LIGHT-ADJUST.mp4",
  ];
  return staticVideos[Math.floor(Math.random() * staticVideos.length)];
}

export function getBackground() {
  const styles = {
    justifyContent: "center",
    color: "#111",
    width: VIDEO_ORIENTATION === "LANDSCAPE" ? "70%" : "85%",
    height: VIDEO_ORIENTATION === "LANDSCAPE" ? "70%" : "50%",
    margin: "auto",
    border: "2px gray solid",
    borderRadius: "20px",
    alignItems: "center",
  };
  const backgrounds = [
    {
      backgroundColor: "rgb(229,227,255)",
      background:
        "linear-gradient(0deg, rgba(229,227,255,1) 0%, rgba(230,246,235,1) 50%, rgba(215,249,255,1) 100%)",
    },
    {
      backgroundColor: "rgb(244,255,227)",
      background:
        "linear-gradient(0deg, rgba(244,255,227,1) 0%, rgba(255,229,215,1) 100%)",
    },
    {
      backgroundColor: "rgb(202,166,255)",
      background:
        "linear-gradient(330deg, rgba(202,166,255,1) 0%, rgba(152,255,148,1) 100%)",
    },
  ];
  return {
    ...styles,
    ...backgrounds[Math.floor(Math.random() * backgrounds.length)],
  };
}

export const DEFAULT_API_PARAMS = {
  wordFields: 'verse_key,verse_id,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs',
  translations: [131, 97]
}

export const stls = getBackground();