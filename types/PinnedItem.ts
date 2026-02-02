export enum PinnedItemTargetType {
  Ayah = 'ayah',
}

export interface PinnedItemDTO {
  id: string;
  targetType: PinnedItemTargetType;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SyncPinnedItemPayload {
  targetType: PinnedItemTargetType;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}
