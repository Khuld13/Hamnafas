export const LOCAL_MUSIC = {
  uplift: '/music/uplift.mp3',
  sunrise: '/music/sunrise.mp3',
  flow: '/music/flow.mp3',
  calm: '/music/deep-calm.mp3',
} as const;

export type LocalMusicId = keyof typeof LOCAL_MUSIC;
