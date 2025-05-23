
import { defineStore } from 'pinia'

const defaultPrimaryKey = '_id'

export const usePanelStore = defineStore('panelStore', {
	state: () => ({
		show: false,
		pending: false,
		error: false,
		mode: '', /* '', 'Edit', 'Create', 'Delete' */
		record: {
			data: {},
			original: null, //json of data at first, before any changes in Edit
			json: null, //json of data
			changed: null,
		},
		labels: {
			singular: '',
			plural: '',
			display: '',
		},
		fields: {
			all: [],
			identifier: {},
			label: {},
		},
		onSubmit: async ({ mode, id, data }) => {},
		onChange: async ({ key, value }) => {},
	}),
	actions: {
		init(mode, { recordData, labels, fields, onSubmit, onChange }) {
			switch (mode) {
				case 'Create':
					for (let { key } of fields) {
						this.record.data[key] = ''
					}
					break
				case 'Edit':
				case 'Delete':
					this.record.data = { ...recordData } //spread into new object, not pointed
					break				
			}
			this.mode = mode
			this.labels.singular = labels.singular
			this.labels.plural = labels.plural
			this.labels.display = labels.display
			this.fields.all = fields
			this.fields.identifier = fields.find(f => f.key == defaultPrimaryKey)
			this.fields.label = fields.find(f => f.name == this.labels.display)
			this.record.original = JSON.stringify(this.record.data) 
			this.record.json = JSON.stringify(this.record.data) 
			this.record.changed = false
			this.pending = false
			this.error = false
			this.show = true
			this.onSubmit = onSubmit
			this.onChange = onChange
		},
		deactivate() {
			this.mode = ''
			this.labels.singular = ''
			this.labels.plural = ''
			this.labels.display = ''
			this.fields.all = []
			this.fields.identifier = {}
			this.fields.label = {}
			this.record.data = {}
			this.record.original = null
			this.record.json = null
			this.record.changed = null
			this.pending = false
			this.error = false
			this.show = false
			this.onSubmit = async ({ mode, id, data }) => {}
			this.onChange = async ({ key, value }) => {}
		},
		showError() {
			this.pending = false
			this.error = true
		},
		async change({ key, value }) { //gets passed to dynamicfield, receiveds emitted event on changing of field value
			this.record.data[key] = value
			this.record.json = JSON.stringify(this.record.data)
			this.record.changed = this.record.original != this.record.json
			if (this.onChange) {
				// console.log('panel.ts change', { key, value })
				await this.onChange({ key, value })
			}
		},
		async submit() {
			this.pending = true
			const mode = this.mode
			const id = this.record.data[this.fields.identifier.key]
			const data = this.record.data
			try {
				await this.onSubmit({ mode, id, data })
				// console.log('panel.ts submit', { mode, id, data })
			}
			catch (err) {
				// console.log(err)
				this.showError()
			}
			this.deactivate()
		},
	}
})
