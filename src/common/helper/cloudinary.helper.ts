import config from '@/config/configuration';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'drwm3i3g4',
  api_key: '154827732964851',
  api_secret: 'eZaD6pHZ5ursDKZzcOwxKtA7nCc',
  secure: true,
});

export const uploadCloud = async (
  file: any,
  folder?: string,
  type?: string,
) => {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: type,
    // folder: folder,
  });
  return result;
};

export default cloudinary;
