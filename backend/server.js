import express from 'express';
import cors from 'cors';
import Replicate from 'replicate';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 3001;

// Ensure the generated-images directory exists
const publicDir = path.join(__dirname, 'public');
const generatedImagesDir = path.join(publicDir, 'generated-images');
fs.ensureDirSync(publicDir);
fs.ensureDirSync(generatedImagesDir);

app.use(cors({
  origin: 'http://localhost:5173', // Vite's default development port
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use('/public', express.static('public'));

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

async function downloadImage(url) {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });

    const timestamp = Date.now();
    const filename = `thumbnail-${timestamp}.webp`;
    const filepath = path.join(generatedImagesDir, filename);
    
    await fs.writeFile(filepath, response.data);
    return `/public/generated-images/${filename}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

app.post('/api/generate-thumbnail', async (req, res) => {
  try {
    const { title } = req.body;
    
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `YouTube thumbnail for video titled "${title}", professional, high quality, engaging, 4K resolution, vibrant colors`,
          num_outputs: 1,
          width: 1280,
          height: 720,
          aspect_ratio: "16:9"
        }
      }
    );

    console.log('Raw Replicate API response:', output);

    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error('Invalid response format:', output);
      throw new Error('No valid images in API response');
    }

    // Download all images and get local URLs
    const localUrls = await Promise.all(output.map(url => downloadImage(url)));

    res.json({
      success: true,
      images: localUrls,
      metadata: {
        model: "black-forest-labs/flux-schnell",
        width: 1280,
        height: 720,
        aspect_ratio: "16:9"
      }
    });

  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate thumbnail' 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Generated images will be saved in: ${generatedImagesDir}`);
});