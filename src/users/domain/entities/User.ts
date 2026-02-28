export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  constructor(
    public readonly id: number | null,
    public username: string,
    public name: string,
    public lastName: string,
    public passwordHash: string,
    public isActive: boolean,
    public role: UserRole,
    public readonly createdAt?: Date,
  ) {}
}
