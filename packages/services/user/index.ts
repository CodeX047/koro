import {
  type CreateUserWithEmailAndPasswordInputType,
  type SignInUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
  signInUserWithEmailAndPasswordInput,
} from "./model";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { hashPassword, verifyPassword, needsRehash } from "./password";
import { signUserToken, verifyUserToken } from "./token";
import {
  AppError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
} from "./errors";

class UserService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!result || result.length === 0) return null;

    return result[0];
  }

  private async getUserInfoById(id: string) {
    const user = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        profileImageUrl: usersTable.profileImageUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user || user.length === 0) throw new UserNotFoundError(`User with Id: ${id} does not exist`);

    return user[0]!;
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUserByEmail = await this.getUserByEmail(email);

    if (existingUserByEmail) throw new EmailAlreadyExistsError(email);

    const hash = await hashPassword(password);

    const userInsertResult = await db
      .insert(usersTable)
      .values({ email, fullName, password: hash, salt: null })
      .returning({
        id: usersTable.id,
      });

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id)
      throw new AppError("INTERNAL_SERVER_ERROR", "Something went wrong while creating a user");
    const userId = userInsertResult[0].id;
    const token = await signUserToken({ id: userId });

    return {
      id: userId,
      token,
    };
  }

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);

    // Same error whether the email is unknown or the password is wrong, so we
    // don't leak which emails are registered.
    if (!existingUser) throw new InvalidCredentialsError();

    if (!existingUser.password) throw new InvalidCredentialsError("Invalid authentication method");

    const passwordMatches = await verifyPassword(password, existingUser.password, existingUser.salt);

    if (!passwordMatches) throw new InvalidCredentialsError();

    // Transparently upgrade legacy (HMAC) hashes to argon2id on successful login.
    if (needsRehash(existingUser.password)) {
      const upgraded = await hashPassword(password);
      await db
        .update(usersTable)
        .set({ password: upgraded, salt: null })
        .where(eq(usersTable.id, existingUser.id));
    }

    const token = await signUserToken({ id: existingUser.id });

    return {
      id: existingUser.id,
      token,
    };
  }

  public async verifyAndDecodeUserToken(token: string) {
    const { id } = await verifyUserToken(token);

    const userInfo = await this.getUserInfoById(id);

    return { ...userInfo };
  }
}

export default UserService;
