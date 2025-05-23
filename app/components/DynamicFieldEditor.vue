<script setup>

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'

const { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

val.value = field.default ? field.default : value

const isEnabled = () => field.type === 'editor' ? true : false

const emit = defineEmits(['change'])

let editor = ref()

if (isEnabled()) {
	editor = useEditor({
		content: val.value,
		extensions: [StarterKit, Highlight, Typography],
		onUpdate: () => {
			val.value = editor.value.getHTML()
		  
		  // console.log('emitting at editor', { key: field.key, value: val.value })
		  emit('change', { 
		    key: field.key, 
		    value: val.value 
		  })
		}
	})
}

</script>

<template>

  <div v-if="isEnabled() && editor">

    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>
    <div class="mt-2 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600">

	    <BubbleMenu
	      class="bubble-menu"
	      :tippy-options="{ duration: 120 }"
	      :editor="editor"
	    >
	      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
	        <strong>Bold</strong>
	      </button>
	      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
	        <em>Italic</em>
	      </button>
	      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
	        <s>Strike</s>
	      </button>
	      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
	        H1
	      </button>
	      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
	        H2
	      </button>
	      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
	        H3
	      </button>
	      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
	        **
	      </button>
	      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
	        1)
	      </button>
	    </BubbleMenu>


    	<EditorContent
    		:editor="editor"
    	/>

	  </div>
    <p v-if="field.description" class="mt-2 pr-4 text-gray-600 text-xs italic">{{field.description}}</p>
  </div>

</template>

<style lang="scss">
/* Basic editor styles */
.tiptap {
	overflow: hidden;
	padding: 0.75rem;

  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 0.5rem;
    margin-bottom: 0.8rem;
    text-wrap: pretty;
		font-weight: 700;
  }

  h1,
  h2 {
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.6rem;
  }

  h3 {
    font-size: 1.2rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  mark {
    background-color: #FAF594;
    border-radius: 0.4rem;
    box-decoration-break: clone;
    padding: 0.1rem 0.3rem;
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }
}


/* Bubble menu */
.bubble-menu {
	background: #fff;
	border: solid 2px rgb(79 70 229);
	--tw-ring-opacity: 0;
	border-radius: 0.6rem;
	overflow: hidden;

  display: flex;
  
  button {
  	padding: 0.25rem 0.5rem;
  	font-weight: 400;
  	font-size: 0.9rem;
  	color: rgb(79 70 229);
  	border-radius: none;
		box-shadow: none !important;

    &:hover {
  
    }

    &.is-active {
  		background: rgb(79 70 229);
  		color: white;
  		padding-left: 0.6rem;
  		padding-right: 0.6rem;

      &:hover {
  
      }
    }
  }
}

</style>
