import { z } from "zod";

export const TextOptionSchema = z.object({
  id: z.string().or(z.number()),
  type: z.literal('text'),
  text: z.string().min(1, 'Text is required'),
  fontFamily: z.string().min(1, 'Font family is required'),
  fontSize: z.number().min(1, 'Font size must be positive'),
  color: z.string().min(1, 'Color is required'),
  bold: z.boolean(),
  italic: z.boolean(),
  underline: z.boolean(),
  x: z.number(),
  y: z.number(),
  dragging: z.boolean(),
  offsetX: z.number(),
  offsetY: z.number(),
});

export const ImageOptionSchema = z.object({
  id: z.string().or(z.number()),
  type: z.literal('image'),
  imageUrl: z.string().url('Image URL must be valid'),
  width: z.number().min(1, 'Width must be positive'),
  height: z.number().min(1, 'Height must be positive'),
  scale: z.number().min(0.01, 'Scale must be positive'),
  maintainAspectRatio: z.boolean(),
  x: z.number(),
  y: z.number(),
  dragging: z.boolean(),
  offsetX: z.number(),
  offsetY: z.number(),
});

export const LayerSchema = z.object({
  id: z.string().or(z.number()),
  canvasId: z.string().min(1, 'Canvas ID is required'),
  type: z.string().min(1, 'Type is required'),
  zIndex: z.number().int('zIndex must be an integer'),
  isVisible: z.boolean(),
  createdAt: z.union([z.string(), z.date()]),
  content: z.record(z.any()),
});

export const CanvasSchema = z.object({
  id: z.string().min(1, 'Canvas ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  backgroundColor: z.string().min(1, 'Background color is required'),
  createdAt: z.union([z.string(), z.date()]),
  lastModified: z.union([z.string(), z.date()]),
  layers: z.array(LayerSchema),
});

export const ProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  createdAt: z.union([z.string(), z.date()]),
  status: z.string().min(1, 'Status is required'),
  genre: z.string().min(1, 'Genre is required'),
  previewImageUrl: z.string().url('Preview image URL must be valid'),
  name: z.string().min(1, 'Name is required'),
  garmentColor: z.string().min(1, 'Garment color is required'),
  garmentSize: z.string().min(1, 'Garment size is required'),
  lastModified: z.union([z.string(), z.date()]),
  canvas: CanvasSchema,
});
