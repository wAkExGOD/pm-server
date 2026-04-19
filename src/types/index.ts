export type User = {
  id: number;
  email: string;
};

export type RequestWithUser = {
  user: User;
  params: Record<string, string>;
};
