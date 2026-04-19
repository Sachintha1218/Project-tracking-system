import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Get project and its milestones
app.get('/api/project/:id', async (req, res) => {
  const projectId = req.params.id;

  try {
    const projectInfo = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: {
          orderBy: { id: 'asc' },
          include: {
            materials: { orderBy: { createdAt: 'desc' } }
          }
        }
      }
    });

    if (projectInfo) {
      // Check if project exists (but do NOT return data yet — password required)
      setTimeout(() => res.json({ exists: true }), 300);
    } else {
      setTimeout(() => res.status(404).json({ message: 'Project not found' }), 300);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify project ID + password and return full project data
app.post('/api/project/verify', async (req, res) => {
  const { projectId, password } = req.body;

  if (!projectId || !password) {
    return res.status(400).json({ message: 'Project ID and password are required' });
  }

  try {
    const projectInfo = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: {
          orderBy: { id: 'asc' },
          include: {
            materials: { orderBy: { createdAt: 'desc' } }
          }
        }
      }
    });

    if (!projectInfo) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projectInfo.password !== password) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    // Strip the password before sending to client
    const { password: _pw, ...safeProject } = projectInfo;
    setTimeout(() => res.json(safeProject), 400);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Admin endpoint: Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { milestones: true }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update milestone client comment
app.put('/api/milestones/:id/comment', async (req, res) => {
  const milestoneId = parseInt(req.params.id);
  const { comment, isRevision } = req.body;
  try {
    const updateData = { clientComment: comment };
    if (isRevision) {
      updateData.status = 'In Revision';
    }
    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin endpoint: Update milestone status
app.put('/api/milestones/:id/status', async (req, res) => {
  const milestoneId = parseInt(req.params.id);
  const { status } = req.body;
  try {
    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload material for milestone
app.post('/api/milestones/:id/materials', upload.single('file'), async (req, res) => {
  const milestoneId = parseInt(req.params.id);
  const { uploadedBy } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const material = await prisma.material.create({
      data: {
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        uploadedBy: uploadedBy || 'Client',
        milestoneId
      }
    });
    res.json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete material
app.delete('/api/materials/:id', async (req, res) => {
  const materialId = req.params.id;
  try {
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (material) {
      const filePath = path.join(__dirname, 'uploads', path.basename(material.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await prisma.material.delete({ where: { id: materialId } });
      res.json({ message: 'Material deleted successfully' });
    } else {
      res.status(404).json({ message: 'Material not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
