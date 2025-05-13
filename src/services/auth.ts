import { UserSchema } from "@/schemas/user";

import {
  postForgotPassword,
  postLogin,
  postLogout,
  postRegister,
  postResetPassword,
} from "@/api/auth";

import $bus from "type-safe-event-bus";
import type { z } from "zod";

const LoginSchema = UserSchema.pick({ email: true, password: true }).required();
type LoginCredentials = z.infer<typeof LoginSchema>;

const RegisterSchema = UserSchema.omit({ id: true })
  .required({
    password: true,
    password_confirmation: true,
  })
  .refine(
    (data) => {
      return data.password === data.password_confirmation;
    },
    {
      message: "Password and password confirmation must match",
    }
  );
type RegisterCredentials = z.infer<typeof RegisterSchema>;

export const authService = {
  async login(
    email?: LoginCredentials["email"],
    password?: LoginCredentials["password"]
  ) {
    const parsedData = LoginSchema.parse({ email, password });

    await postLogin({ ...parsedData, remember: true });

    $bus.$emit("logged_in");
  },

  async logout() {
    await postLogout();
    $bus.$emit("logged_out");
  },

  async register(userData: RegisterCredentials) {
    const parsedData = RegisterSchema.parse(userData);
    await postRegister(parsedData);
    $bus.$emit("registered");
  },

  async sendPasswordResetEmail(email: string) {
    await postForgotPassword({ email });
    $bus.$emit("sent_reset_password_email", { email });
  },

  async sendPasswordReset(email: string, token: string, password: string) {
    await postResetPassword({
      email,
      token,
      password,
      password_confirmation: password,
    });
    $bus.$emit("reset_password", { email });
  },
};
