import type { Request, Response, NextFunction } from "express";

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        success: false,
        message: "ImgBB API key is not configured",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image to upload",
      });
      return;
    }

    const formData = new FormData();

    const imageData = new Uint8Array(req.file.buffer);

    const imageBlob = new Blob([imageData], {
      type: req.file.mimetype,
    });
    formData.append("image", imageBlob);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.data.url,
    });
  } catch (error) {
    next(error);
  }
}
