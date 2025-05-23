<script setup>

const { fields, button } = defineProps(['fields', 'button']) 
// fields: [{ key: '', name: '', type: '', ... options }, ... ]
// button: check switch below for cases... 
const emit = defineEmits(['onSubmit', 'onChange']) //alllowing this component to emit a "onSubmit"

let formData = ref({})
let formPending = ref(false)
let formError = ref(false)

let buttonClass = ''
switch (button) {
	case 'indigo':
		buttonClass = 'inline-flex ml-4 bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-500'
		break
	case 'indigo-mr':
		buttonClass = 'inline-flex mr-4 bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-500'
		break
	case 'red':
		buttonClass = 'inline-flex ml-4 bg-red-600 hover:bg-red-500 focus-visible:outline-red-500'
		break
	case 'red-mr':
		buttonClass = 'inline-flex mr-4 bg-red-600 hover:bg-red-500 focus-visible:outline-red-500'
		break
	case 'red-full':
		buttonClass = 'flex w-full bg-red-600 hover:bg-red-500 focus-visible:outline-red-500'
		break
	case 'indigo-full':
	default:
		buttonClass = 'flex w-full bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-500'
		break
}

const enableFormPending = async () => {
	formPending.value = true
}

const submit = async () => {
	enableFormPending()
	// console.log('submitting:', formData.value)
	emit('onSubmit', { data: formData.value })
}

const loadFormData = () => {
	formData = ref({})
	for (let field of fields) {
		formData[field.key] = field.value || ''
	}
}

const onUpdate = ({ key, value }) => {
  formData.value[key] = value
  // console.log('received at dynamicform', { key, value, 'formData[key]':formData.value[key] })
}

defineExpose({ //exposing the following methods for parents to call
	finish() {
		formPending.value = false
		formError.value = false
	},
	error() {
		formPending.value = false
		formError.value = true
	},
	reset() {
		loadFormData()
	},
})

loadFormData()

</script>

<template>

  <form class="space-y-6" action="#" method="POST" @submit.prevent="submit">
  	<slot name="top" />
    <div v-for="(field, i) in fields" :key="'edit_' + field.key" class="mt-6">
      <DynamicField 
      	:field="field" 
      	:value="formData[field.key]" 
      	@change="onUpdate" />
    </div>
    <slot name="middle" />
    <div>
	    <button :disabled="formPending" type="submit" :class="[buttonClass, 'justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2']">
	      <ButtonSpinner v-if="formPending" />
	      <span v-if="formError && !formPending">Error! Please try again.</span>
	      <span v-if="!formError && !formPending">Submit</span>
	    </button>
    </div>
    <slot name="bottom" />
  </form>

</template>


