export function formatDutchPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  
  // Remove spaces, dashes, and other non-numeric characters except '+'
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('0031')) {
    cleaned = '+31' + cleaned.slice(4);
  } else if (cleaned.startsWith('0')) {
    cleaned = '+31' + cleaned.slice(1);
  } else if (!cleaned.startsWith('+') && cleaned.length > 0) {
    // If it doesn't start with 0 or +, assume it's a local number missing the 0 or a weird format
    // Just prepend +31 if it seems like a valid length (e.g. 9 digits left)
    if (cleaned.length === 9) {
      cleaned = '+31' + cleaned;
    }
  }

  // Optional: add a space after +31 for readability
  if (cleaned.startsWith('+31') && cleaned.length > 3) {
    cleaned = '+31 ' + cleaned.slice(3);
  }

  return cleaned;
}
