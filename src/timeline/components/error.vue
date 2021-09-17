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
            type: String
        },
        startBounds: {
            type: Number
        },
        pixelMultiplier: {
            type: Number
        },
        formatter: {
            type: Object
        }
    },
    computed: {
        style() {
            // console.log(this.startTime)
            return {
                'position': 'absolute',
                'left': `${this.leftPosition}px`,
                'background': 'red',
                'min-height': '100%',
				'min-width': '2px',
				'z-index': '1',
            }
        },
        leftPosition() {
            const start = this.formatter.parse(this.startTime);

            return Math.floor((start - this.startBounds) / this.pixelMultiplier);
        }
    }
}
</script>