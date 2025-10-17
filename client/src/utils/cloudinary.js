import axios from "axios";


export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const CLOUDNAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const PRESETNAME = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", PRESETNAME);

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDNAME}/image/upload`,
      formData
    );
    return res.data.secure_url; 
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return null;
  }
};
