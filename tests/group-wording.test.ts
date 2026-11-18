import { describe, expect, it } from 'vitest';
import {
  GROUP_TYPES,
  groupTypeLabel,
  groupWording,
  isGroupType,
} from '@/lib/groupWording';

describe('group wording', () => {
  it('uses the PRD words for a family', () => {
    expect(groupWording('family')).toEqual({
      groupWord: 'family',
      inviteButton: 'Invite your family',
      emptyDashboard: 'Share the link so everyone in the family can add their wishes',
      joinPage: "You're invited to join the family",
      nameExample: 'e.g. Williams Family Christmas',
    });
  });

  it('uses the PRD words for friends', () => {
    expect(groupWording('friends')).toEqual({
      groupWord: 'friends',
      inviteButton: 'Invite your friends',
      emptyDashboard: 'Share the link so all your friends can add their wishes',
      joinPage: "You're invited by your friends",
      nameExample: 'e.g. Uni Friends Christmas',
    });
  });

  it('uses team words for colleagues', () => {
    expect(groupWording('colleagues')).toEqual({
      groupWord: 'team',
      inviteButton: 'Invite your team',
      emptyDashboard: 'Share the link so everyone on the team can add their wishes',
      joinPage: "You're invited to join the team",
      nameExample: 'e.g. Marketing Team Secret Santa',
    });
  });

  it('uses neutral words for something else', () => {
    expect(groupWording('other')).toEqual({
      groupWord: 'group',
      inviteButton: 'Invite people',
      emptyDashboard: 'Share the link so everyone can add their wishes',
      joinPage: "You're invited to join",
      nameExample: 'e.g. Book Club Christmas',
    });
  });

  it('says group before a group exists or when the type is unknown', () => {
    expect(groupWording(null).groupWord).toBe('group');
    expect(groupWording(undefined).groupWord).toBe('group');
    expect(groupWording(null).inviteButton).toBe('Invite people');
  });

  it('labels each type for the create, switcher and settings screens', () => {
    expect(GROUP_TYPES.map(groupTypeLabel)).toEqual([
      'Family',
      'Friends',
      'Colleagues',
      'Something else',
    ]);
    expect(isGroupType('team')).toBe(false);
    expect(isGroupType('colleagues')).toBe(true);
  });
});
