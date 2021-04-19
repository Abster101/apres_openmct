<template>
  <div>
    <h2>{{ domainObject.name }}</h2>
    <div>
        <ol>
            <li
                v-for="(attribute, index) in Object.keys(domainObject.configuration)"
                :key="attribute"
            >
                <span>{{ `${index}. ${attribute}: ` }}</span>
                <span>{{ domainObject.configuration[attribute] }}</span>
            </li>
        </ol>
    </div>
  </div>
</template>

<script>
export default {
    inject: ['openmct', 'objectPath'],
    props: {
        isEditing: {
            type: Boolean
        },
        domainObject: {
            type: Object
        }
    },
    data() {
        return {};
    },
    mounted() {

    }
}
</script>

<style>

</style>