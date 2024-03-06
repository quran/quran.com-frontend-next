export const SURAH = 112;

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

export const getAllBackgrounds = (alpha = '1') => {
  return  [
    {
      id: 1,
      background:
        `linear-gradient(0deg, rgba(229,227,255,${alpha}) 0%, rgba(230,246,235,${alpha}) 50%, rgba(215,249,255,${alpha}) 100%)`,
    },
    {
      id: 2,
      background:
        `linear-gradient(0deg, rgba(244,255,227,${alpha}) 0%, rgba(255,229,215,${alpha}) 100%)`,
    },
    {
      id: 3,
      background:
        `linear-gradient(330deg, rgba(202,166,255,${alpha}) 0%, rgba(152,255,148,${alpha}) 100%)`,
    },
    {
      id: 4,
      background: `linear-gradient(to bottom,rgba(219, 225, 111, ${alpha}), rgba(248, 119, 40, ${alpha}))`
    },
    {
      id: 5,
      background: `linear-gradient(to bottom,rgba(157, 106, 32, ${alpha}),rgba(68, 155, 169, ${alpha}))`
    },
    {
      id: 6,
      background: `linear-gradient(to bottom,rgba(144, 240, 134, ${alpha}),rgba(232, 60, 194, ${alpha}))`
    },
    {
      id: 7,
      background: `linear-gradient(to top,rgba(111, 62, 26, ${alpha}),rgba(6, 81, 104, ${alpha}))`
    },
    {
      id: 8,
      background: `linear-gradient(to top,rgba(103, 243, 206, ${alpha}),rgba(16, 125, 64, ${alpha}))`
    },
  ];
};

export function getStyles(dimensions) {
  return {
    justifyContent: "center",
    color: "#111",
    minWidth: dimensions === "landscape" ? "70%" : "60%",
    minHeight: dimensions === "landscape" ? "60%" : '25%',
    width: "fit-content",
    height: "fit-content",
    margin: "auto",
    border: "2px gray solid",
    borderRadius: "20px",
    alignItems: "center",
  };
}

export const DEFAULT_API_PARAMS = {
  wordFields: 'verse_key,verse_id,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs',
  translations: [131, 97]
}

export const stls = getStyles('landscape');