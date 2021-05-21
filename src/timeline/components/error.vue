<template>
    <div
        :style="style"
    >
    </div>
</template>
<script>
export default {
    props: {
        startTime: {
            type: Number
        },
        startBounds: {
            type: Number
        },
        endBounds: {
            type: Number
        },
        pixelMultiplier: {
            type: Number
        }
    },
    computed: {
        style() {
            return {
                'position': 'absolute',
                'left': `${this.leftPosition}px`,
                'background': 'red',
                'min-height': '100%',
                'min-width': '2px'
            }
        },
        leftPosition() {
            return (this.startTime - this.startBounds) * this.pixelMultiplier;
        }
    }
}
</script>