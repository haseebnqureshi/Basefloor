<script setup>

/*
On API end, needs Array(ObjectID) data type.
This requires additional information to be retrived on each
file item by its _id (ObjectID). The presumption is that
there is enough time in the UX and resources available for
retrieving that information (as opposed to needing only a 
CDN url very quickly) AND additional file information would
be required for these uploads to be useful, more than a 
simple CDN url for an image (although not always, as 
acknowledged).
*/

/*
TODO: While uploading a large file (so there are progress
updates), removing a upload at an index causes the state
to fail -- because it was relying on modifying data at that
specific index, and now it changed. 
*/

let { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

const isEnabled = () => field.type == 'uploadarray' ? true : false
const isDragAndDropEnabled = () => field.options?.dragAndDrop === true

let onRemove, onAdd, onRemoveFile, files
let onChange = () => {}
let triggerFileInput = () => {}
let onDragOver = () => {}
let onDragLeave = () => {}
let onDrop = () => {}

let newRow = (i) => ({ idle: true, message: '', label: ``, isDragging: false })

let rows = ref([newRow(0)])

let fileInput = ref([])

if (isEnabled()) {
  const appStore = useAppStore()
  files = useFilesStore()
  files.setToken(appStore.token)

  if (value) {
    // we have an array with _ids as values
    const _ids = value

    for (let i in _ids) {
      let _id = _ids[i]
      try {
        let row = await files.get({ _id })
        rows.value[i] = { ...row, ...newRow(i) }
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
    const label = rows.value[index].label
    rows.value[index] = newRow(index)
    rows.value[index].label = label
    fileInput.value[index].value = '' //otherwise, input doesn't change if same file gets uploaded
  }

  triggerFileInput = (index) => {
    fileInput.value[index].click()
  }
  
  onDragOver = (event, index) => {
    if (!isDragAndDropEnabled()) return
    event.preventDefault()
    rows.value[index].isDragging = true
  }
  
  onDragLeave = (event, index) => {
    if (!isDragAndDropEnabled()) return
    event.preventDefault()
    rows.value[index].isDragging = false
  }
  
  onDrop = async (event, index) => {
    if (!isDragAndDropEnabled()) return
    event.preventDefault()
    rows.value[index].isDragging = false
    
    const files = event.dataTransfer.files
    if (files.length > 0) {
      // Create a synthetic event object that mimics the structure expected by onChange
      const syntheticEvent = {
        target: {
          files: files
        }
      }
      await onChange(syntheticEvent, index)
    }
  }
}

const rowsToValue = () => {
  val.value = {}
  for (let i in rows.value) {
    let row = rows.value[i]
    val.value[i] = row._id
  }
}

const emit = defineEmits(['change'])

onChange = async (event, i) => {
  // console.log('onChange', event, i)

  try {

    /*
    UPLOADING THE FILE
    */

    rows.value[i].idle = false
    rows.value[i].message = 'Uploading...'
    const fileObject = await files.create({ 
      file: event.target.files[0],
      onProgress: ({ progress }) => {
        if (progress < 100) {
          rows.value[i].message = `Uploaded ${progress}%...`
        } else {
          rows.value[i].message = `Processing...`
        }
      }
    })


    /*
    CONVERTING THE FILE
    */

    rows.value[i].message = `Processing...`
    const fileFiles = await files.convert({ 
      fileId: fileObject._id 
    })
    console.log('fileFiles', fileFiles)
    rows.value[i].message = `Finishing...`

    // rows.value[i] = fileObject
    rows.value[i].idle = true
    rows.value[i] = { ...rows.value[i], ...fileObject }


    rowsToValue()
    // console.log('emitting at uploadobject (change)', { key: field.key, value: val.value })
    emit('change', { 
      key: field.key, 
      value: val.value 
    })
  }
  catch (err) {
    console.log(err)
    rows.value[i].message = 'Error! Please try again.'
  }
}


</script>

<template>

  <div v-if="isEnabled()">

    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>

    <div v-for="(row, index) in rows" class="upload-container mt-2 relative block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">

      <div v-if="row.flattened_url" class="overflow-scroll no-scrollbar pl-8 pr-12 pb-0 h-64">
        <img :src="row.flattened_url" />
      </div>

      <button @click="onAdd(index)" type="button" 
        class="absolute right-3 top-3.5 button-add text-sm bg-white hover:bg-gray-100 rounded p-1 font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </button>

      <button @click="onRemove(index)" type="button" v-if="rows.length > 1" 
        class="absolute right-12 top-3.5 button-remove text-sm bg-white hover:bg-gray-100 rounded p-1 font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </button>

      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span class="text-gray-500 text-xs sm:text-xs">{{index+1}}</span>
      </div>


      <div :class="['ml-8 my-2 relative', rows.length == 1 ? 'mr-14' : 'mr-24']">

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

              <a :href="row.url" class="cursor-pointer p-2" rel="noreferrer" target="_blank">
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

            <span 
              v-if="!row.name" 
              :class="[
                row.name ? 'col-auto grid' : 'col-span-4 grid',
                isDragAndDropEnabled() && row.isDragging ? 'drop-zone-active' : ''
              ]"
              @dragover="onDragOver($event, index)"
              @dragleave="onDragLeave($event, index)"
              @drop="onDrop($event, index)"
            >
              <div 
                @click="triggerFileInput(index)" 
                :disabled="!row.idle"
                :class="[
                  'cursor-pointer w-full px-2 py-2 h-full text-center rounded bg-white text-xs font-semibold ring-inset ring-gray-300 hover:bg-gray-50',
                  isDragAndDropEnabled() ? 'drop-zone border-2 border-dashed border-gray-300' : 'shadow-sm ring-1'
                ]"
              >
                <span v-if="row.idle">
                  <template v-if="isDragAndDropEnabled()">
                    <div>Drag and drop file or click to browse</div>
                  </template>
                  <template v-else>
                    <div>Select and Upload File</div>
                  </template>
                </span>
                <span v-if="!row.idle">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="animate-spin size-4 inline mr-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span class="text-xs">{{row.message}}</span>
                </span>
              </div>
            </span>

          </div>


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
.drop-zone {
  transition: all 0.2s ease;
}

.drop-zone:hover {
  border-color: #d1d5db;
}

.drop-zone-active {
  border-color: #6366f1 !important;
  background-color: rgba(99, 102, 241, 0.05);
}
</style>
