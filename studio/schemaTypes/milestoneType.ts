import { defineType, defineField } from 'sanity'

export const milestoneType = defineType({
  name: 'milestone',
  title: 'Milestone',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['Pending', 'Current', 'Done', 'In Revision'],
        layout: 'radio',
      },
      initialValue: 'Pending',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
    }),
    defineField({
      name: 'clientComment',
      title: 'Client Comment',
      type: 'text',
      rows: 3,
      description: 'Feedback submitted by the client',
    }),
    defineField({
      name: 'materials',
      title: 'Materials & References',
      type: 'array',
      of: [{ type: 'material' }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'status' },
  },
})
