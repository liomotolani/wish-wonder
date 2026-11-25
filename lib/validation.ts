import { z } from 'zod';
import { GROUP_TYPES } from '@/lib/groupWording';
import { CURRENCY_CODES, DEFAULT_CURRENCY } from '@/lib/currencies';

export const PRIORITY_REALLY_WANT = 'really_want';

const nameSchema = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .max(max, `${label} is too long.`);

const groupTypeSchema = z.enum(GROUP_TYPES);

export const createFamilySchema = z.object({
  familyName: nameSchema('a group name', 80),
  groupType: groupTypeSchema.default('family'),
  memberName: nameSchema('your name', 40),
  requiresApproval: z.boolean(),
  mysteryBoxes: z.boolean().default(true),
});

export const joinFamilySchema = z.object({
  memberName: nameSchema('your name', 40),
});

export const managedMemberSchema = z.object({
  displayName: nameSchema('their name', 40),
});

export const familySettingsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Enter a group name.')
      .max(80, 'The group name is too long.')
      .optional(),
    groupType: groupTypeSchema.optional(),
    requiresApproval: z.boolean().optional(),
    mysteryBoxes: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.groupType !== undefined ||
      value.requiresApproval !== undefined ||
      value.mysteryBoxes !== undefined,
    'There is nothing to save.',
  );

const optionalUrlSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  },
  z
    .string()
    .max(500, 'That link is too long.')
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return false;
      }
    }, 'Enter a link starting with http:// or https://.')
    .nullable(),
);

export const giftInputSchema = z.object({
  name: nameSchema('a gift name', 120),
  description: z.string().trim().max(600, 'The description is too long.').nullable(),
  currency: z.enum(CURRENCY_CODES).default(DEFAULT_CURRENCY),
  pricePence: z
    .number()
    .int('Enter a whole number of pounds and pence.')
    .min(0, 'The price cannot be negative.')
    .max(100_000_000, 'That price is too high.')
    .nullable(),
  shopUrl: optionalUrlSchema,
  imageUrl: optionalUrlSchema,
  preferences: z.string().trim().max(200, 'Keep preferences under 200 characters.').nullable(),
  priority: z.boolean(),
});

export const revealSchema = z.object({
  visitId: z.uuid('That picker visit is not valid.'),
  number: z.number().int().min(1).max(500),
});

export const claimSchema = z.union([
  z.object({
    visitId: z.uuid('That picker visit is not valid.'),
    number: z.number().int().min(1).max(500),
  }),
  z.object({
    giftId: z.uuid('That gift is not valid.'),
  }),
]);

export const claimUpdateSchema = z.object({
  action: z.enum(['purchase', 'release']),
});

export const inviteCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-f0-9]{16}$/, 'That invite link is not valid.');

/** Extract a code from either a full invite link or a pasted code. */
export function extractInviteCode(value: string): string | null {
  const trimmed = value.trim();
  const match = trimmed.match(/\/join\/([a-f0-9]{16})(?:[/?#]|$)/i);
  const candidate = match ? match[1] : trimmed;
  const parsed = inviteCodeSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function formatValidationError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Please check the details and try again.';
}

/** Convert a pounds text field to integer pence. Returns null for blank input. */
export function poundsToPence(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }

  return Math.round(Number(trimmed) * 100);
}

/** Render integer pence as a plain pounds input value. */
export function penceToPoundsInput(pence: number | null): string {
  if (pence === null) {
    return '';
  }

  return pence % 100 === 0 ? String(pence / 100) : (pence / 100).toFixed(2);
}
