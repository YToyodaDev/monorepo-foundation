export type Role = 'admin' | 'manager';

export type GetUserType = {
  uid: string;
  roles: Role[];
};

export type BaseComponent = {
  children?: React.ReactNode;
  className?: string;
};

export type FormState = {
  data?: any | null;
  error?: string | null;
};
