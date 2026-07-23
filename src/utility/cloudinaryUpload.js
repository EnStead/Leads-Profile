export const uploadToCloudinary = async (file) => {
  if (!file) {
    throw new Error("No file selected for upload.");
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary upload configuration.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message =
      errorPayload?.error?.message ||
      "Unable to upload proof to Cloudinary.";
    throw new Error(message);
  }

  const data = await response.json();
  if (!data?.secure_url) {
    throw new Error("Cloudinary did not return a secure URL.");
  }

  return data;
};
