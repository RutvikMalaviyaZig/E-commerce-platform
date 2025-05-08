const {
    FS,
    FILE_CONSTANTS,
    UUID,
  } = require('../../config/constant');
  const Media = require('../../db/models/Media/Media');
  const cloudinary = require('../../config/cloudinary');
  
  const fileValidation = async (
    path,
    files,
    allowedTypes,
    allowedTypesMessage,
    sizeLimit,
    sizeLimitMessage,
    createdBy,
    compress = false,
    isPublic = true
  ) => {
    try {
      let sizeArray = [];
  
      //push the media sizes to the size array and gets array of mimeTypes
      let contentType = files.map((item) => {
        sizeArray.push(item.size);
        return item.mimetype;
      });
  
      //checks for any different content types
      let notPresent = contentType.filter((e) => !allowedTypes.includes(e));
  
      // if file format is not valid
      if (notPresent.length > 0) {
        for (item of files) {
          FS.unlink(item.path, (err) => {
            if (err) {
              throw err;
            }
          });
        }
  
        return {
          isError: true,
          data: allowedTypesMessage,
        };
      }
  
      //size validation function
      const isAboveSize = (currentValue) => currentValue > sizeLimit;
  
      //check for the file size limit
      let isFileSizeReached = sizeArray.some(isAboveSize);
  
      if (isFileSizeReached === true) {
        for (item of files) {
          FS.unlink(item.path, (err) => {
            if (err) {
              throw err;
            }
          });
        }
        return {
          isError: true,
          data: sizeLimitMessage,
        };
      }
  
      let uploadedFile = [];
  
      //loops through files
      for (item of files) {
        let convertedSize = item.size;
  
        //sets media type value
        let mediaType = FILE_CONSTANTS.TYPES.IMAGE.FLAG;
        if (FILE_CONSTANTS.TYPES.VIDEO.CONTENT_TYPES.includes(item.mimetype)) {
          mediaType = FILE_CONSTANTS.TYPES.VIDEO.FLAG;
        }
  
        //gets the file name
        let fileName = item.path.substring(item.path.lastIndexOf('/') + 1);
  
        //if compress is true then only compress image
  
        if (compress) {
          let sourcePath = item.path;
  
          //convert file name and path for webp conversation
          item.path = `${sourcePath.slice(0, sourcePath.lastIndexOf('.'))}.webp`;
          fileName = `${fileName.slice(0, fileName.lastIndexOf('.'))}.webp`;
  
          //call helper to convert image to webp format
          let convertedImage = await imageCompression(sourcePath, item.path);
  
          if (convertedImage.isError) {
            return {
              isError: true,
              data: convertedImage.data,
            };
          }
          convertedSize = convertedImage?.data?.size;
        }
  
        const cloudinaryResponse = await cloudinary.uploader.upload(item.path, {
          resource_type: "auto", // auto-detect image/video
          folder: path, // e.g. 'uploads/test'
        });
        
        if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
          throw new Error("Cloudinary upload failed");
        }

        let createMedia = {
          id: UUID(),
          url: cloudinaryResponse.secure_url,
          fileName,
          filePath: cloudinaryResponse.public_id,
          size: convertedSize,
          mediaType,
          contentType: item.mimetype,
          originalName: item.originalname,
        };
        
  
        /* when you use this in your project then uncomment below media create code */
  
        // // Create media record
        await Media.create(createMedia);
  
        uploadedFile = [...uploadedFile, createMedia];
      }
  
      return {
        isError: false,
        data: uploadedFile,
      };
    } catch (err) {
      console.log('error in upload file s3 helper', err);
      // delete file from local
      for (item of files) {
        FS.unlink(item.path, (err) => {
          if (err) {
            throw err;
          }
        });
      }
  
      return {
        isError: true,
        isServerError: true,
        data: err.message,
      };
    }
  };
  
  module.exports = { fileValidation };
  