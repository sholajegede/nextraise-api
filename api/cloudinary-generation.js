import PDFDocument from "pdfkit";
import cloudinary from "cloudinary";
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET, 
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { inputText } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "inputText is required" });
    }

    try {
      const doc = new PDFDocument();

      const fileName = `generated-${Date.now()}`;

      const pdfBuffer = [];
      doc.on("data", (chunk) => pdfBuffer.push(chunk));
      doc.on("end", async () => {
        const pdfData = Buffer.concat(pdfBuffer);

        try {
          const result = await cloudinary.v2.uploader.upload_stream(
            { resource_type: "raw", public_id: fileName },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                return res
                  .status(500)
                  .json({ error: "Failed to upload to Cloudinary" });
              }

              const pdfUrl = result.secure_url;
              res.status(200).json({ pdfUrl });
            }
          );

          result.end(pdfData);
        } catch (uploadError) {
          console.error("Error uploading to Cloudinary:", uploadError);
          res.status(500).json({ error: "Failed to upload PDF to Cloudinary" });
        }
      });

      doc.fontSize(12).text(inputText, 50, 50);

      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};