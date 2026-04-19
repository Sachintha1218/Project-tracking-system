import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Project Tracking System',

  // ⚠️ Replace with your Sanity Project ID (found in sanity.io/manage)
  projectId: 'uo3plezl',
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
})
