/**
 * Profanity, Adult Content & Bot Spam Protection Engine
 */

const ADULT_AND_SPAM_KEYWORDS = [
  'casino', 'viagra', 'porn', 'sex', 'gambling', 'poker', 'crypto', 'bitcoin',
  'escort', 'dating', 'adult', 'nude', 'xxx', 'hentai', 'cash', 'loan',
  'http://', 'https://', 'www.', '.com', '.ru', '.cn', 'telegram', 'whatsapp link'
];

export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

export function checkReviewContent(title: string, comment: string, reviewerName: string): SpamCheckResult {
  const combinedText = `${title} ${comment} ${reviewerName}`.toLowerCase();

  // 1. Check for adult content and spam keywords
  for (const keyword of ADULT_AND_SPAM_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      return {
        isSpam: true,
        reason: `Your submission contains prohibited content or links ("${keyword}").`
      };
    }
  }

  // 2. Check for excessive length or spam characters
  if (comment.length < 10) {
    return {
      isSpam: true,
      reason: 'Please provide a more detailed review experience (at least 10 characters).'
    };
  }

  return { isSpam: false };
}
