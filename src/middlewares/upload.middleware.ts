import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import path from "path";
import { HttpError } from "../errors/http-error";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../uploads/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const fileSuffix = uuidv4();
    cb(null, `${fileSuffix}-${file.originalname}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new HttpError(400, "Invalid file type, only images are allowed!"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  fileFilter,
});

export const uploads = {
  single: (fieldName: string) => upload.single(fieldName),
  array: (fieldName: string, maxCount: number) =>
    upload.array(fieldName, maxCount),
  fields: (
    fieldsArray: { name: string; maxCount?: number }[]
  ) => upload.fields(fieldsArray),
};
