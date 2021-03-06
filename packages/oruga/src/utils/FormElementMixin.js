import config from '../utils/config'
import { isVueComponent, getValueByPath } from './helpers'

export default {
    inject: {
        $field: { name: '$field', default: false },
        $elementRef: { name: '$elementRef', default: false }
    },
    props: {
        size: String,
        expanded: Boolean,
        loading: Boolean,
        rounded: Boolean,
        icon: String,
        iconPack: String,
        // Native options to use in HTML5 validation
        autocomplete: String,
        maxlength: [Number, String],
        useHtml5Validation: {
            type: Boolean,
            default: () => {
                return getValueByPath(config, 'useHtml5Validation', true)
            }
        },
        statusIcon: {
            type: Boolean,
            default: () => {
                return getValueByPath(config, 'statusIcon', true)
            }
        },
        validationMessage: String
    },
    data() {
        return {
            isValid: true,
            isFocused: false,
            newIconPack: this.iconPack
        }
    },
    computed: {
        parentField() {
            return this.$field
        },

        /**
         * Get the type prop from parent if it's a Field.
         */
        statusVariant() {
            if (!this.parentField) return
            if (!this.parentField.newVariant) return
            if (typeof this.parentField.newVariant === 'string') {
                return this.parentField.newVariant
            } else {
                for (const key in this.parentField.newVariant) {
                    if (this.parentField.newVariant[key]) {
                        return key
                    }
                }
            }
        },

        /**
         * Get the message prop from parent if it's a Field.
         */
        statusMessage() {
            if (!this.parentField) return

            return this.parentField.newMessage || this.parentField.$slots.message
        }
    },
    methods: {
        /**
         * Focus method that work dynamically depending on the component.
         */
        focus() {
            const el = this.getElement()
            if (el === undefined) return

            this.$nextTick(() => {
                if (el) el.focus()
            })
        },

        onBlur($event) {
            this.isFocused = false
            this.$emit('blur', $event)
            this.checkHtml5Validity()
        },

        onFocus($event) {
            this.isFocused = true
            this.$emit('focus', $event)
        },

        getElement() {
            let el = this.$refs[this.$elementRef]
            while (isVueComponent(el)) {
                el = el.$refs[el.$elementRef]
            }
            return el
        },

        setInvalid() {
            const variant = 'danger'
            const message = this.validationMessage || this.getElement().validationMessage
            this.setValidity(variant, message)
        },

        setValidity(variant, message) {
            this.$nextTick(() => {
                if (this.parentField) {
                    // Set type only if not defined
                    if (!this.parentField.variant) {
                        this.parentField.newVariant = variant
                    }
                    // Set message only if not defined
                    if (!this.parentField.message) {
                        this.parentField.newMessage = message
                    }
                }
            })
        },

        /**
         * Check HTML5 validation, set isValid property.
         * If validation fail, send 'danger' type,
         * and error message to parent if it's a Field.
         */
        checkHtml5Validity() {
            if (!this.useHtml5Validation) return

            const el = this.getElement()
            if (el === undefined) return

            if (!el.checkValidity()) {
                this.setInvalid()
                this.isValid = false
            } else {
                this.setValidity(null, null)
                this.isValid = true
            }

            return this.isValid
        }
    }
}
