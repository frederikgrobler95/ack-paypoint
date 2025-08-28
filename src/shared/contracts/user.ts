export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  status?: 'active' | 'suspended';
  tutorialEnabled?: boolean;
  signedIn?: boolean;
};