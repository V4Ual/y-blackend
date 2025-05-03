import * as bcrypt from "bcrypt";

export const bcryptUtil = {
  hasPassword: async (textPassword) => {
    return await bcrypt.hash(textPassword, 10);
  },

  comparePassword: async (plainText, encryptPassword) => {
    return await bcrypt.compareSync(plainText, encryptPassword);
  },
};
