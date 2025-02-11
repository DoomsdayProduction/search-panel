// pages/api/upload.js

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Adjust the size as needed
    },
  },
};

export default function handler(req, res) {
  res.status(200).json({ message: "API route with custom bodyParser size limit" });
}
