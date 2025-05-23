<script setup>

const emit = defineEmits(['change', 'onSubmit'])

const { data, fields, discard } = defineProps(['data', 'fields', 'discard'])

let thisForm = ref({
	pending: false,
	error: false,
})

let recordData = ref(data)

let record = ref({ 
	changed: false,
	original: JSON.stringify(data), 
	json: ''
})

const getValue = (key) => recordData.value[key]

const onUpdate = ({ key, value }) => {
	recordData.value[key] = value
	record.value.json = JSON.stringify(recordData.value)
	record.value.changed = record.value.original != record.value.json
	// emit('change', data)
	// console.log('emitting at DynamicFormTwo', data)
}

const submit = async () => {
	thisForm.value.pending = true
	console.log('submitting:', recordData.value)
	emit('onSubmit', { data: recordData.value })
}

const discardChanges = () => {
	console.log('discarding')
	console.log(JSON.parse(record.value.original))
	recordData.value = JSON.parse(record.value.original)
}

defineExpose({ //exposing the following methods for parents to call
	finish() {
		thisForm.value.pending = false
		thisForm.value.error = false

		record.value.original = JSON.stringify(recordData.value)
		record.value.changed = false
	},
	error() {
		thisForm.value.pending = false
		thisForm.value.error = true
	},
	reset() {
		discardChanges()
	},
})

</script>

<template>

  <form class="space-y-6 mb-12" action="#" method="POST" @submit.prevent="submit">

  	<slot name="top" />

    <div v-for="(field, i) in fields" :key="'edit_' + field.key" class="mt-6">
      <DynamicField 
      	:field="field"
      	:value="getValue(field.key)"
       	@change="onUpdate"
      />
    </div>

    <slot name="middle" />

    <button type="button" v-if="record.changed == true && discard" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400 mr-4" @click="discardChanges()">
      <span >Discard Changes</span>
    </button>

    <button 
      type="submit" 
      :disabled="thisForm.pending" 
      v-if="record.changed == true" 
      class="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
      <ButtonSpinner v-if="thisForm.pending" />
      <span v-if="!thisForm.error">Save</span>
      <span v-if="thisForm.error">Error! Please try again.</span>
    </button>

    <slot name="bottom" />

  </form>

</template>