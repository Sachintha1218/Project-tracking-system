import { defineType, defineField } from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'projectId',
      title: 'Project ID',
      type: 'slug',
      description: 'Unique ID shared with client (e.g. PRJ-001)',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: ['Web Design', 'Mobile App', 'Branding', 'SEO', 'E-Commerce', 'Other'],
      },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['In Progress', 'Completed', 'On Hold'],
        layout: 'radio',
      },
      initialValue: 'In Progress',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'progress',
      title: 'Progress (%)',
      type: 'number',
      validation: Rule => Rule.min(0).max(100),
      initialValue: 0,
    }),
    defineField({
      name: 'password',
      title: 'Access Password',
      type: 'string',
      description: 'Password given to the client to access their project portal',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'milestones',
      title: 'Milestones',
      type: 'array',
      of: [{ type: 'milestone' }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'projectId.current', status: 'status' },
    prepare({ title, subtitle, status }) {
      return { title, subtitle: `${subtitle} · ${status}` }
    },
  },
})
