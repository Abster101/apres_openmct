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
    <div class="flex justify-content-center h-40 w-full mt-10 js-style-receiver">
      {{domainObject.name}}
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
  },
  hasCompelted(activityDomainObject) {
    const activityTimelineName = activityDomainObject.configuration.var;
  }
}
</script>

<style>
</style>
