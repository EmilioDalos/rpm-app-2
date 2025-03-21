import React, { forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'

interface TiptapProps {
  content: string
  onUpdate: (content: string) => void
  placeholder?: string
}

export interface TiptapRef {
  editor: Editor | null
}

const Tiptap = forwardRef<TiptapRef, TiptapProps>(({ content, onUpdate, placeholder }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[100px] p-2',
      },
    },
  })

  useImperativeHandle(ref, () => ({
    editor,
  }))

  if (!editor) {
    return null
  }

  const toolbarButtons = [
    { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { label: 'U', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
    { label: '• List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { label: '1. List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
  ]

  return (
    <div className="border rounded-md">
      <div className="flex space-x-2 p-2 border-b bg-gray-100">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            className={`px-2 py-1 rounded ${button.active ? 'bg-gray-300' : ''}`}
          >
            {button.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  )
})

Tiptap.displayName = 'Tiptap'

export default Tiptap

