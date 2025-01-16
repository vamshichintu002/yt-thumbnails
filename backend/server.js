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

// Function to call Groq API for image analysis
async function analyzeImageWithGroq(imageUrl) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: "Analyze this YouTube thumbnail and provide a creative, detailed description that would help in generating a new, unique thumbnail while keeping the main theme. Focus on the visual style, composition, and key elements." },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image with Groq:', error);
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

// Handle image-based thumbnail generation
app.post('/api/generate-from-image', async (req, res) => {
  try {
    const { imageText, imageUrl } = req.body;
    
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `YouTube thumbnail based on the image with text: "${imageText}", professional, high quality, engaging, 4K resolution, vibrant colors`,
          image: imageUrl,
          num_outputs: 1,
          width: 1280,
          height: 720,
          aspect_ratio: "16:9"
        }
      }
    );

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('No valid images in API response');
    }

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
    console.error('Error generating thumbnail from image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate thumbnail from image' 
    });
  }
});

// Handle YouTube-based thumbnail generation
app.post('/api/generate-from-youtube', async (req, res) => {
  try {
    const { youtubeUrl, customText } = req.body;
    
    // Extract video ID from YouTube URL
    const videoId = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Get YouTube thumbnail as reference
    const youtubeThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Analyze the YouTube thumbnail using Groq Vision API
    const imageDescription = await analyzeImageWithGroq(youtubeThumbnailUrl);

    // Use the Groq description to generate a new thumbnail with Flux
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `${imageDescription} ${customText}`,
          image: youtubeThumbnailUrl,
          width: 1280,
          height: 720,
          aspect_ratio: "16:9",
          num_outputs: 1
        }
      }
    );

    // Download the generated images
    const localUrls = await Promise.all(output.map(url => downloadImage(url)));

    res.json({ 
      success: true, 
      images: localUrls,
      metadata: {
        model: "black-forest-labs/flux-schnell",
        width: 1280,
        height: 720,
        aspect_ratio: "16:9",
        description: imageDescription
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate thumbnail from YouTube video' 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Generated images will be saved in: ${generatedImagesDir}`);
});