/**
 * Answer options for the registration form.
 *
 * These live here rather than in `app/register/actions.ts` because that file
 * is a "use server" module — it may only export async functions, so a plain
 * array exported from it arrives as `undefined` on the client.
 *
 * The same values are the authoritative list in backend/src/constants/
 * registration.ts, where the API validator and the Mongoose schema enforce them.
 */
export const YES_NO = ["Yes", "No"] as const;
export const YES_NO_MAYBE = ["Yes", "No", "Maybe"] as const;
