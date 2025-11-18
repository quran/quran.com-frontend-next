export interface SsoPlatform {
  readonly id: string;
  readonly url: string;
  readonly enabled: boolean;
}

export interface SsoPlatformConfig {
  readonly id: string;
  readonly envKey: string;
  readonly enabled: boolean;
}
