<script setup>

const { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

val.value = field.default ? field.default : value

let money = ref('')

const emit = defineEmits(['change'])
const onChange = (event) => {
  val.value = toNumberFormat(money)
  // console.log('emitting at money', { money, key: field.key, value: val.value })

  emit('change', { 
    key: field.key, 
    value: val.value 
  })
}

const isEnabled = () => field.type === 'money' ? true : false

const toMoneyFormat = (str) => {
  return Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(str)
}

const toNumberFormat = (str) => {
  return Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping: false,
  }).format(str.replace(/\,/gmi, ''))
}

if (isEnabled()) {
  money = toMoneyFormat(val.value)



}

</script>

<template>

  <div v-if="isEnabled()">
    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>
    <div class="mt-2 rounded-md shadow-sm relative">
    	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
    		<span class="text-gray-500 sm:text-sm">$</span>
    	</div>
      <input 
        type="text"
        :disabled="field.disabled === true ? true : false" 
        :name="field.key" 
        v-model="money"
        :id="field.key + '-field'" 
        @input="onChange"
        class="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
        :placeholder="field.placeholder || '0.00' " 
        :aria-describedby="field.key + '-hint'" />
      <!-- <div class="absolute inset-y-0 right-0 flex items-center">
      	<label for="currency" class="sr-only">Currency</label>
      	<select id="currency" name="currency" class="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
      		<option>USD</option>
      		<option>CAD</option>
      		<option>EUR</option>
      	</select>
      </div> -->
    </div>
    <p 
      v-if="field.hint"
      class="mt-2 text-sm text-gray-500" 
      :id="field.key + '-hint'">
      {{field.hint}}
    </p>
  </div>

</template>