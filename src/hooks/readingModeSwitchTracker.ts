const getPathWithoutQuery = (path: string): string => path.split('?')[0] || path;

// Stores the path where the user explicitly switched reading mode.
let userSwitchedReadingModePath: string | null = null;

export const didUserSwitchReadingMode = (currentPath?: string): boolean => {
  if (!currentPath) return Boolean(userSwitchedReadingModePath);
  return userSwitchedReadingModePath === getPathWithoutQuery(currentPath);
};

export const markUserSwitchedReadingMode = (currentPath: string): void => {
  userSwitchedReadingModePath = getPathWithoutQuery(currentPath);
};

export const resetUserSwitchFlag = (): void => {
  userSwitchedReadingModePath = null;
};
