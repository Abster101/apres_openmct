<template>
<div class="c-indicator c-indicator--clickable icon-save s-status-caution">
    <span class="label c-indicator__label">
        <button @click="destroyOpenmct">Go back to project picker</button>
    </span>
</div>
</template>

<script>
export default {
    methods: {
        destroyOpenmct() {
            localStorage.clear();
            window.location = '/';
        }
    }
};
</script>