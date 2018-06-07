import multer from 'multer';

export const storage =  multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname.replace(/\s+/g, ''));
    }
  })


export const imageFileFilter = (req, file, cb) => {
  // reject a file
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {

    cb(new Error('INVALID_TYPE'));
  } else {

    cb(null, true);
  }
};



