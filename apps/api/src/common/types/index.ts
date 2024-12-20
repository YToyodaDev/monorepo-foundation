export type Role = 'admin' | 'manager';
// TODO: add more roles if needed
// export type Role = 'admin' | 'manager' | 'valet'

export type GetUserType = {
  uid: string;
  roles: Role[];
};
