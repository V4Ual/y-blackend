import multer from "multer";
import { createWriteStream } from "fs";
import path from "path";

export const imageUtils = {
  uploadImage: (req, res) => {
    return multer({
      fileFilter: (req, file, cb) => {
        const allowFileType = ["image/jpeg", "image/png"];
        if (allowFileType.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    });
  },

  createImage: (dirName, buffer, imageName) => {
    const write = createWriteStream(
      path.resolve(`./public/${dirName}/${imageName}`)
    );
    write.write(buffer);
    write.close();
  },
};

console.log(path.resolve("./public"));
