export function verificationBadgeTitle(role: string, verificationStatus: string): string {
  if (verificationStatus !== 'VERIFIED') return 'Verification pending';
  if (role === 'DOCTOR') return 'Verified Specialist';
  if (role === 'STUDENT') return 'Verified Medical Student';
  if (role === 'INSTITUTION') return 'Verified Institution';
  return 'Verified MedMedia member';
}
