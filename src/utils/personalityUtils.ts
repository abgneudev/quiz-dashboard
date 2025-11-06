export const personalityEmojis: Record<number, string> = {
  1: '🧘', // The Quiet Observer - meditation pose
  2: '⚡', // The Action Driver - lightning bolt for energy
  3: '🎨', // The Imaginative Dreamer - art palette
  4: '🤝', // The Social Connector - handshake
};

export const getPersonalityEmoji = (personalityId: number): string => {
  return personalityEmojis[personalityId] || '✨';
};
