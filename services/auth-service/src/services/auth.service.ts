import * as repo from "../repositories/auth.repositories";
import { generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";


export async function login(
  email: string,
  password: string
) {
  const user = await repo.findByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.passwordHash!
  );

  if (!isPasswordValid) {
     console.log("hello6")
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  return {
    user,
    token,
  };
}

