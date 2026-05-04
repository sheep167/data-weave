let counter = 0;
export const v4 = () => `uid_${++counter}_${Date.now().toString(36)}`;
