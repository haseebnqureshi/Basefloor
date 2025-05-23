<script setup>

/*
On API end, needs Object(ObjectID) data type.
Why? Beacuse these uploads have decsriptions that
are specific for the file within its context. The
context matters, and so that's why it's here in the 
key of the keyvalue pair, and not with the file
object item.

{ 'Notes or some comment.' : ObjectID(_id of a file item) }
*/

let { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

const isEnabled = () => field.type == 'uploadnotes' ? true : false

let onRemove, onAdd, onRemoveFile, files
let onChange = () => {}
let onTextChange = () => {}
let triggerFileInput = () => {}

let newRow = (i) => ({ idle: true, message: '', note: `` })

let rows = ref([newRow(0)])

let fileInput = ref([])

if (isEnabled()) {
  const appStore = useAppStore()
  files = useFilesStore()
  files.setToken(appStore.token)

  if (value) {
    // we have an object with notes as keys and _ids as values
    const notes = Object.keys(value)
    const _ids = Object.values(value)

    for (let i in _ids) {
      let _id = _ids[i]
      try {
        let row = await files.get({ _id })
        rows.value[i] = { ...row, ...newRow(i) }
        rows.value[i].note = notes[i]
      }
      catch (err) {

      }
    }
  }

  onRemove = (index) => {
    rows.value = [ ...rows.value.slice(0, index), ...rows.value.slice(index+1) ]
  }

  onAdd = (index) => {
    if (rows.length === index+1) {
      rows.value.push(newRow(index))
    } else {
      rows.value = [ ...rows.value.slice(0, index+1), newRow(index), ...rows.value.slice(index+1) ]
    }
  }

  onRemoveFile = (index) => {
    const note = rows.value[index].note
    rows.value[index] = newRow(index)
    rows.value[index].note = note
    onTextChange()
    fileInput.value[index].value = '' //otherwise, input doesn't change if same file gets uploaded
  }

  triggerFileInput = (index) => {
    fileInput.value[index].click()
  }
}

const rowsToValue = () => {
  val.value = {}
  for (let i in rows.value) {
    let row = rows.value[i]
    let note = row.note != '' ? row.note : `#${(Number(i)+1).toString()}`
    val.value[note] = row._id || null //@todo: if file is removed, have null -- but the API doesn't accept null, and so we lose the note. Want to keep the note for saving drafts that are precisely accurate.
  }
}

const emit = defineEmits(['change'])

onChange = async (event, i) => {
  // console.log('onChange', event, i)

  try {
    rows.value[i].idle = false
    rows.value[i].message = 'Processing...'

    const file = event.target.files[0]
    const fileObject = await files.create({ file })
    
    rows.value[i].message = 'Uploading...'
    const fileFiles = await files.convert({ 
      fileId: fileObject._id,
      onProgress: ({ progress }) => {
        if (progress < 100) {
          rows.value[i].message = `Uploaded ${progress}%...`
        } else {
          rows.value[i].message = `Processing...`
        }
      }
    })

    rows.value[i].message = `Finishing...`
    
    // Update row with file object data
    rows.value[i].idle = true
    rows.value[i] = { ...rows.value[i], ...fileObject }

    rowsToValue()
    emit('change', { 
      key: field.key, 
      value: val.value 
    })
  }
  catch (err) {
    console.error('Error uploading file:', err)
    rows.value[i].message = 'Error! Please try again.'
  }
}

onTextChange = async (event) => {
  rowsToValue()
  // console.log('emitting at uploadobject (textchange)', { key: field.key, value: val.value })
  emit('change', { 
    key: field.key, 
    value: val.value 
  })
}


</script>

<template>

  <div v-if="isEnabled()">

    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>

    <div v-for="(row, index) in rows" class="mt-2 relative block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">

      <button @click="onAdd(index)" type="button" 
        class="absolute right-3 bottom-3 button-add text-sm bg-white hover:bg-gray-100 rounded p-1 font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </button>

      <button @click="onRemove(index)" type="button" v-if="rows.length > 1" 
        class="absolute right-3 top-3.5 button-remove text-sm bg-white hover:bg-gray-100 rounded p-1 font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </button>

      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span class="text-gray-500 text-xs sm:text-xs">{{index+1}}</span>
      </div>


      <div class="ml-8 mr-14 my-2 relative">

        <div class="w-full relative block">
          <input 
            type="file"
            :ref="(el) => fileInput[index] = el"
            :disabled="field.disabled === true ? true : false" 
            :name="field.key" 
            :id="field.key + '-field'" 
            @change="event => onChange(event, index)"
            class="hidden w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
            :placeholder="field.placeholder" 
            :aria-describedby="field.key + '-hint'" 
          />

          <div class="my-2 grid grid-cols-4 gap-2">

            <span v-if="row.name" class="col-span-3 px-2 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold flex">

              <span class="text-ellipsis truncate py-2">
                {{row.name}}
              </span>

              <a :href="row.url" class="cursor-pointer p-2" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-4">
                  <!-- <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /> -->

                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>

                </svg>
              </a>

            </span>

            <span v-if="row.name && row.idle" class="col-auto grid">
              <button 
                @click="onRemoveFile(index)" 
                type="button" 
                class="cursor-pointer w-full px-2 py-2 h-full text-center rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <span>Remove</span>
              </button>
            </span>

            <span v-if="!row.name" :class="row.name ? 'col-auto grid' : 'col-span-4 grid'">
              <button 
                @click="triggerFileInput(index)" 
                :disabled="!row.idle"
                type="button" 
                class="cursor-pointer w-full px-2 py-2 h-full text-center rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <span v-if="row.idle">Select and Upload File</span>
                <span v-if="!row.idle">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="animate-spin size-4 inline mr-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span class="text-xs">{{row.message}}</span>
                </span>
              </button>
            </span>

          </div>

          <textarea 
            v-model="row.note"
            @keyup="event => onTextChange(event)"
            class="w-full relative block rounded-md border-0 bg-transparent py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Please provide notes or comments"
          ></textarea>

        </div>

      </div>

      
    </div>

    <p 
      v-if="field.hint"
      class="mt-2 text-sm text-gray-500" 
      :id="field.key + '-hint'">
      {{field.hint}}
    </p>

  </div>

</template>

<style scoped>

</style>
