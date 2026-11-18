/**
 * One source of truth for the words users see for their group. The code and
 * database keep calling it a family; only the copy changes with its type.
 */

export const GROUP_TYPES = ['family', 'friends', 'colleagues', 'other'] as const;

export type GroupType = (typeof GROUP_TYPES)[number];

export interface GroupWording {
  /** The noun used wherever the group is named, for example "family". */
  groupWord: string;
  inviteButton: string;
  emptyDashboard: string;
  joinPage: string;
  nameExample: string;
}

const WORDING: Record<GroupType, GroupWording> = {
  family: {
    groupWord: 'family',
    inviteButton: 'Invite your family',
    emptyDashboard: 'Share the link so everyone in the family can add their wishes',
    joinPage: "You're invited to join the family",
    nameExample: 'e.g. Williams Family Christmas',
  },
  friends: {
    groupWord: 'friends',
    inviteButton: 'Invite your friends',
    emptyDashboard: 'Share the link so all your friends can add their wishes',
    joinPage: "You're invited by your friends",
    nameExample: 'e.g. Uni Friends Christmas',
  },
  colleagues: {
    groupWord: 'team',
    inviteButton: 'Invite your team',
    emptyDashboard: 'Share the link so everyone on the team can add their wishes',
    joinPage: "You're invited to join the team",
    nameExample: 'e.g. Marketing Team Secret Santa',
  },
  other: {
    groupWord: 'group',
    inviteButton: 'Invite people',
    emptyDashboard: 'Share the link so everyone can add their wishes',
    joinPage: "You're invited to join",
    nameExample: 'e.g. Book Club Christmas',
  },
};

/** Before a group exists, or when its type is unknown, use neutral wording. */
const NEUTRAL: GroupWording = {
  ...WORDING.other,
  groupWord: 'group',
};

export function isGroupType(value: unknown): value is GroupType {
  return typeof value === 'string' && GROUP_TYPES.includes(value as GroupType);
}

export function groupWording(groupType?: GroupType | null): GroupWording {
  return groupType ? WORDING[groupType] : NEUTRAL;
}

export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  family: 'Family',
  friends: 'Friends',
  colleagues: 'Colleagues',
  other: 'Something else',
};

export function groupTypeLabel(groupType?: GroupType | null): string {
  return groupType ? GROUP_TYPE_LABELS[groupType] : 'Group';
}

/** "family" → "Family", "friends" → "Friends", "team" → "Team". */
export function capitaliseGroupWord(groupType?: GroupType | null): string {
  const word = groupWording(groupType).groupWord;
  return word.charAt(0).toUpperCase() + word.slice(1);
}
