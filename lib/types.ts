import type { GroupType } from '@/lib/groupWording';
import type { CurrencyCode } from '@/lib/currencies';

export type ClaimStatus = 'reserved' | 'purchased' | 'released';
export type MemberStatus = 'pending' | 'active';
export type EventStatus = 'active' | 'archived';

export interface Family {
  id: string;
  name: string;
  group_type: GroupType;
  invite_code: string;
  organiser_member_id: string | null;
  requires_approval: boolean;
  created_at: string;
}

export interface GiftEvent {
  id: string;
  family_id: string;
  name: string;
  status: EventStatus;
  created_at: string;
}

export interface Member {
  id: string;
  family_id: string;
  display_name: string;
  managed_by_member_id: string | null;
  status: MemberStatus;
  created_at: string;
}

export interface MemberSession {
  id: string;
  member_id: string;
  token_hash: string;
  created_at: string;
  revoked_at: string | null;
}

export interface Gift {
  id: string;
  event_id: string;
  owner_member_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  currency: CurrencyCode;
  price_pence: number | null;
  shop_url: string | null;
  preferences: string | null;
  priority: string | null;
  created_at?: string;
  updated_at: string;
}

export interface GiftSnapshot {
  name: string;
  description: string | null;
  image_url: string | null;
  currency: CurrencyCode;
  price_pence: number | null;
  shop_url: string | null;
  preferences: string | null;
  priority: string | null;
}

export interface Claim {
  id: string;
  gift_id: string;
  claimer_member_id: string;
  status: ClaimStatus;
  gift_snapshot: GiftSnapshot | Record<string, unknown> | null;
  claimed_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  member_id: string;
  message: string;
  created_at: string;
  dismissed_at: string | null;
}

export interface PickerVisit {
  id: string;
  buyer_member_id: string;
  recipient_member_id: string;
  seed: number;
  created_at: string;
}

/**
 * The signed-in member as the server understands them. Never includes a raw
 * token or a token hash, so it is safe to pass to Server Components.
 */
export interface Viewer {
  sessionId: string;
  member: {
    id: string;
    displayName: string;
    status: MemberStatus;
    managedByMemberId: string | null;
  };
  family: {
    id: string;
    name: string;
    groupType: GroupType;
    inviteCode: string;
    organiserMemberId: string | null;
    requiresApproval: boolean;
  };
  event: {
    id: string;
    name: string;
  } | null;
}

export type MysteryBoxState = 'mystery' | 'peeked' | 'taken';

export interface MysteryBoxView {
  number: number;
  state: MysteryBoxState;
}

export interface PickerGridView {
  boxes: MysteryBoxView[];
  totalCount: number;
  availableCount: number;
}

export interface RevealedGiftView {
  name: string;
  description: string | null;
  imageUrl: string | null;
  currency: CurrencyCode;
  pricePence: number | null;
  shopUrl: string | null;
  preferences: string | null;
  priority: string | null;
}

export type RevealResult =
  | { ok: true; gift: RevealedGiftView }
  | { ok: false; reason: 'taken' | 'not_found' | 'not_allowed' | 'rate_limited' };

export type ClaimFailureReason =
  | 'already_picked'
  | 'not_allowed'
  | 'not_found'
  | 'not_revealed';

export type ClaimResult =
  | { ok: true }
  | { ok: false; reason: ClaimFailureReason };

export interface FamilyInvitePreview {
  familyName: string;
  groupType: GroupType;
  requiresApproval: boolean;
  memberNames: string[];
  memberCount: number;
}

export interface DashboardMemberView {
  id: string;
  displayName: string;
  role: 'organiser' | 'member';
  managedByMemberId: string | null;
  managedByName: string | null;
}

export interface DashboardData {
  members: DashboardMemberView[];
  pendingMembers: { id: string; displayName: string }[];
  ownGiftCount: number;
  ownGiftNames: string[];
  reservedCount: number;
  purchasedCount: number;
}

export interface ManagedMemberView {
  id: string;
  displayName: string;
}

export interface FamilyMemberAdminView {
  id: string;
  displayName: string;
  status: MemberStatus;
  isOrganiser: boolean;
  managedByName: string | null;
}

export interface SettingsData {
  members: FamilyMemberAdminView[];
  pendingMembers: { id: string; displayName: string }[];
  activeEvent: { id: string; name: string } | null;
}

export interface DeviceLinkView {
  url: string;
  expiresAt: string;
  qrSvg: string;
}


export interface OwnGiftView {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  currency: CurrencyCode;
  pricePence: number | null;
  shopUrl: string | null;
  preferences: string | null;
  priority: string | null;
  updatedAt: string;
}

export interface ClaimedGiftView {
  name: string;
  description: string | null;
  imageUrl: string | null;
  currency: CurrencyCode;
  pricePence: number | null;
  shopUrl: string | null;
  preferences: string | null;
  priority: string | null;
}

export interface SecretGiftView {
  id: string;
  status: Exclude<ClaimStatus, 'released'>;
  gift: ClaimedGiftView;
  recipientName: string;
  claimedAt: string;
}

export interface DeviceGroupView {
  familyId: string;
  name: string;
  groupType: GroupType;
  memberName: string;
  isActive: boolean;
}

export interface NoticeView {
  id: string;
  message: string;
  createdAt: string;
}
