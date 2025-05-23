<script setup>

/*
On API end, needs Object(ObjectID) data type.
Why? Because typically, these database objects need fast
access to the static image. Storing as a Object(ObjectID) 
gets us the CDN url, together with the File object, also.

For example, what is stored is:
{ 'https://somecdn.com/url' : ObjectID(_id of a file item) }

This way, additional information can be retrieved on the 
image, but still making way to very fast -- and low logic
and resource need -- access to the CDN url.
*/


let { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

const isEnabled = () => field.type == 'image' ? true : false

let onRemove, onAdd, onRemoveFile, files
let onChange = () => {}
let triggerFileInput = () => {}

let newRow = (i) => ({ idle: true, message: '' })

let rows = ref([newRow(0)])

let fileInput = ref([])

if (isEnabled()) {
  const appStore = useAppStore()
  files = useFilesStore()
  files.setToken(appStore.token)

  if (value) {
    // we have an object with url as keys and _ids as values
    const urls = Object.keys(value)
    const _ids = Object.values(value)

    for (let i in _ids) {
      let _id = _ids[i]
      try {
        let fetchedFiles = await files.get({ _id })
        let row = fetchedFiles[0]
        rows.value[i] = { ...row, ...newRow(i) }
      }
      catch (err) {

      }
    }
  }

  // onRemove = (index) => {
  //   rows.value = [ ...rows.value.slice(0, index), ...rows.value.slice(index+1) ]
  // }

  // onAdd = (index) => {
  //   if (rows.length === index+1) {
  //     rows.value.push(newRow(index))
  //   } else {
  //     rows.value = [ ...rows.value.slice(0, index+1), newRow(index), ...rows.value.slice(index+1) ]
  //   }
  // }

  onRemoveFile = (index) => {
    rows.value[index] = newRow(index)
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
    let url = row.url
    val.value[url] = row._id || null //@todo: if file is removed, have null -- but the API doesn't accept null, and so we lose the label. Want to keep the label for saving drafts that are precisely accurate.
  }
}

const emit = defineEmits(['change'])

onChange = async (event, i) => {
  // console.log('onChange', event, i)

  try {
    rows.value[i].idle = false
    rows.value[i].message = 'Processing...'

    const file = event.target.files[0]
    const fileObject = await files.create({ 
      file,
      onProgress: ({ progress }) => {
        if (progress < 100) {
          rows.value[i].message = `Uploaded ${progress}%...`
        } else {
          rows.value[i].message = `Processing...`
        }
      }
    })

    // Skip conversion for images
    rows.value[i].message = 'Finishing...'
    
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
    console.error('Error uploading image:', err)
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

    <div v-for="(row, index) in rows" class="mt-2 relative block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">

<!--       <button @click="onAdd(index)" type="button" 
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
 -->
      <!-- <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span class="text-gray-500 text-xs sm:text-xs">{{index+1}}</span>
      </div> -->


      <div class="ml-4 mr-4 my-2 relative">

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
            accept="image/*"
          />

          <div v-if="row.name" class="my-2 grid grid-cols-4 gap-2">

            <span class="col-span-1">
              <img :src="row.url" :alt="row.name" class="rounded-lg object-cover w-full h-20" v-if="row.url" />
              <img :src="row.flattened_url" :alt="row.name" class="rounded-lg object-cover w-full h-20" v-else-if="row.flattened_url" />
            </span>


            <span class="col-span-3">
              <div class="rounded-md bg-gray-100 text-gray-600 text-xs font-semibold flex px-2">
                <span class="text-ellipsis truncate py-3">
                  {{row.name}}
                </span>

                <a :href="row.url" class="cursor-pointer py-3 px-2" rel="noreferrer" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-4">
                    <!-- <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /> -->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </svg>
                </a>
              </div>

              <div v-if="row.idle" class="col-auto grid mt-2">
                <button 
                  @click="onRemoveFile(index)" 
                  type="button" 
                  class="cursor-pointer w-full px-2 py-2 h-full text-center rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <span>Remove</span>
                </button>
              </div>


            </span>

          </div>

          <div v-if="!row.name" class="col-span-4">
            <button 
              @click="triggerFileInput(index)" 
              :disabled="!row.idle"
              type="button" 
              class="cursor-pointer w-full px-2 py-2 h-full text-center rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <span v-if="row.idle">Select and Upload Image</span>
              <span v-if="!row.idle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="animate-spin size-4 inline mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span class="text-xs">{{row.message}}</span>
              </span>
            </button>
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

