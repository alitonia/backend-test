export const extractMentionedEmails = (text: string) => {
  return (text.match(/@[\w-.]+@([\w-]+\.)+[\w-]{2,4}/g) || []).map(
    (email: string) => `'${email.substring(1)}'`,
  );
};
