export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("No file provided for upload");

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Failed to upload image");

    const data = await res.json();
    return data.secure_url; 
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
