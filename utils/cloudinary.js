import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

cloudinary.config({ 
    cloud_name    : process.env.CLOUDINARY_CLOUD_NAME,
    api_key       : process.env.CLOUDINARY_API_KEY,
    api_secret    : process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        
        // Create a readable stream from buffer
        const stream = Readable.from(fileBuffer);
        stream.pipe(uploadStream);
    });
};

// Delete image from Cloudinary using public_id
export const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;