export interface PinnedItemDTO {
  id: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SyncPinnedItemPayload {
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}
