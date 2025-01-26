import PDFDocument from "pdfkit";
import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { inputText } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "inputText is required" });
    }

    try {
      const doc = new PDFDocument();

      const fileName = `generated-${Date.now()}.pdf`;

      const pdfBuffer = [];
      doc.on("data", (chunk) => pdfBuffer.push(chunk));
      doc.on("end", async () => {
        const pdfData = Buffer.concat(pdfBuffer);

        try {
          const uploadResult = await imagekit.upload({
            file: pdfData,
            fileName: fileName,
            useUniqueFileName: true,
          });

          const pdfUrl = uploadResult.url;
          res.status(200).json({ pdfUrl });
        } catch (uploadError) {
          console.error("Error uploading to ImageKit:", uploadError);
          res.status(500).json({ error: "Failed to upload PDF to ImageKit" });
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