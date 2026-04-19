export type User = {
  id: string;
  email: string;
};

export type RequestWithUser = {
  user: User;
};
