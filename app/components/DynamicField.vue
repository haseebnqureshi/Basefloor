<script setup>

const emit = defineEmits(['change'])

const { field, value } = defineProps(['field', 'value'])

let entryData = ref({})

const onChange = ({ key, value }) => {
	// console.log('received at dynamicfield', { key, value })
  // console.log('emitting at dynamicfield', { key, value })
	emit('change', { key, value })
}

</script>

<template>

	<DynamicFieldText @change="onChange" :field="field" :value="value" />
	<DynamicFieldDate @change="onChange" :field="field" :value="value" />
	<DynamicFieldEmail @change="onChange" :field="field" :value="value" />
	<DynamicFieldPhone @change="onChange" :field="field" :value="value" />
	<DynamicFieldMoney @change="onChange" :field="field" :value="value" />
	<DynamicFieldTextarea @change="onChange" :field="field" :value="value" />
	<DynamicFieldCode @change="onChange" :field="field" :value="value" />
	<DynamicFieldEditor @change="onChange" :field="field" :value="value" />
	<DynamicFieldDropdown @change="onChange" :field="field" :value="value" />
	<DynamicFieldDropdownSimple @change="onChange" :field="field" :value="value" />
	<DynamicFieldArray @change="onChange" :field="field" :value="value" />
	<DynamicFieldRadio @change="onChange" :field="field" :value="value" />
	<DynamicFieldForeign @change="onChange" :field="field" :value="value" />
	<DynamicFieldForeignArray @change="onChange" :field="field" :value="value" />
	<DynamicFieldForeignObject @change="onChange" :field="field" :value="value" />
	<DynamicFieldBoolean @change="onChange" :field="field" :value="value" />
	<DynamicFieldImage @change="onChange" :field="field" :value="value" />
	<!-- <DynamicFieldUpload @change="onChange" :field="field" :value="value" /> -->
	<DynamicFieldUploadArray @change="onChange" :field="field" :value="value" />
	<DynamicFieldUploadObject @change="onChange" :field="field" :value="value" />
	<DynamicFieldUploadNotes @change="onChange" :field="field" :value="value" />

</template>