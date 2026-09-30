export const isPasswordAcceptable = (password) =>
  typeof password === "string" && password.length >= 8 && Buffer.byteLength(password, "utf8") <= 72;