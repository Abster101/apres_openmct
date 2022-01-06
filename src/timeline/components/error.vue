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
            return {
                'position': 'absolute',
                'left': '0',
                // Modifying transform instead of left prevents pixel aliasing.
                'transform': `translateX(${this.leftPosition}px)`,
                'background': 'red',
                'min-height': '100%',
				'width': '1px',
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