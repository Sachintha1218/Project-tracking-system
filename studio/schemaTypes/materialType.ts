import { defineType, defineField } from 'sanity'

export const materialType = defineType({
  name: 'material',
  title: 'Material',
  type: 'object',
  fields: [
    defineField({
      name: 'fileName',
      title: 'File Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'uploadedBy',
      title: 'Uploaded By',
      type: 'string',
      options: {
        list: ['Company', 'Client'],
        layout: 'radio',
      },
      initialValue: 'Company',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'fileName', subtitle: 'uploadedBy' },
  },
})
