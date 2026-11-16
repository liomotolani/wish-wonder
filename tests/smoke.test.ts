import { describe, it, expect } from 'vitest';
import type { Family, GiftEvent, Member, Gift, Claim, ClaimStatus, Notice, PickerVisit } from '@/lib/types';

describe('Domain types smoke test', () => {
  it('imports domain types correctly and validates data contract', () => {
    const claimStatus: ClaimStatus = 'reserved';
    expect(claimStatus).toBe('reserved');

    const sampleFamily: Family = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'The Williams Family',
      invite_code: 'WILLIAMS2026',
      organiser_member_id: null,
      requires_approval: true,
      created_at: new Date().toISOString(),
    };

    expect(sampleFamily.name).toBe('The Williams Family');
    expect(sampleFamily.requires_approval).toBe(true);

    const sampleEvent: GiftEvent = {
      id: '223e4567-e89b-12d3-a456-426614174000',
      family_id: sampleFamily.id,
      name: 'Christmas 2026',
      status: 'active',
      created_at: new Date().toISOString(),
    };
    expect(sampleEvent.status).toBe('active');

    const sampleMember: Member = {
      id: '423e4567-e89b-12d3-a456-426614174000',
      family_id: sampleFamily.id,
      display_name: 'Sarah',
      managed_by_member_id: null,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    expect(sampleMember.display_name).toBe('Sarah');

    const sampleGift: Gift = {
      id: '323e4567-e89b-12d3-a456-426614174000',
      event_id: sampleEvent.id,
      owner_member_id: sampleMember.id,
      name: 'Nike Air Max Trainers',
      description: 'Black, size 6',
      image_url: null,
      price_pence: 9500,
      shop_url: null,
      preferences: 'Black',
      priority: 'Really want this',
      updated_at: new Date().toISOString(),
    };
    expect(sampleGift.price_pence).toBe(9500);

    const sampleClaim: Claim = {
      id: '523e4567-e89b-12d3-a456-426614174000',
      gift_id: sampleGift.id,
      claimer_member_id: '623e4567-e89b-12d3-a456-426614174000',
      status: 'reserved',
      gift_snapshot: {
        name: sampleGift.name,
        price_pence: sampleGift.price_pence,
      },
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(sampleClaim.status).toBe('reserved');

    const sampleNotice: Notice = {
      id: '723e4567-e89b-12d3-a456-426614174000',
      member_id: sampleMember.id,
      message: 'A gift was updated',
      created_at: new Date().toISOString(),
      dismissed_at: null,
    };
    expect(sampleNotice.dismissed_at).toBeNull();

    const sampleVisit: PickerVisit = {
      id: '823e4567-e89b-12d3-a456-426614174000',
      buyer_member_id: '623e4567-e89b-12d3-a456-426614174000',
      recipient_member_id: sampleMember.id,
      seed: 42,
      created_at: new Date().toISOString(),
    };
    expect(sampleVisit.seed).toBe(42);
  });
});
