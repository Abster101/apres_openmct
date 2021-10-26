<template>
    <div class="c-inspector__properties c-inspect-properties">
        <div class="c-inspect-properties__header">{{label}}</div>
        <li class="c-inspect-properties__row">
            <div 
                v-if="!isEditable"
                class="c-inspect-properties__label"
                style="white-space: nowrap;"
            >
                {{value}}
            </div>
            <div 
                v-if="isEditable"
            >
                <input
                    class="c-input--datetime"
                    type="text"
                    :value="value"
                    @blur="onBlur"
                />
                <div 
                    v-if="error"
                    class="c-inspect-properties__value"
                    style="color: red;"
                >
                    {{error}}
                </div>
            </div>
        </li>
        
    </div>
</template>
<script>
export default {
    props: {
        label: {
            type: String,
            required: true,
            default: () => {
                return '';
            }
        },
        value: {
            type: String,
            required: true,
            default: () => {
                return '';
            }
        },
        isEditable: {
            type: Boolean,
            required: true,
            default: () => {
                return false;
            }
        },
        error: {
            type: String,
            required: false
        }
    },
    emits: ['valueChanged'],
    methods: {
        onBlur(event) {
            const value = event.target.value;

            this.$emit('valueChanged', this.label, value);
        }
    },
}
</script>
