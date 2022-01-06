<template>
<div>
    <h3>VIOLATIONS</h3>
	<table :style="tableStyle">
        <thead>
          	<tr>
           		<th :style="tableHeader">Time</th>
				<th :style="tableHeader">Type</th>
				<th :style="tableHeader">Violated Object</th>
				<th :style="tableHeader">List of Violators</th>
          	</tr>
        </thead>
        <tbody>
			<tr  v-for="(violation, index) in violations" v-on:click="onRowClick(violation, index)" :style="tableRow">
				<td :style="tableWrap">
					<span :style="redDot" v-if="clickedViolationIndex === index & toggleClickedViolation"></span> 
					{{violation.violationTime}}
				</td>
				<td :style="tableWrap">{{violation.violationType}}</td>
				<td :style="tableWrap">{{violation.violatedObj.tableText}}</td>
				<td :style="tableWrap">
					<tr v-for="(violator, index) in violation.violators">
						<td>{{violator.tableText}}</td>
					</tr>
				</td>
			</tr>
         </tbody>
    </table>
</div>
</template>

<script>
export default {
    inject: ['openmct'],
    components: {
    },
    props: {
		violations: {
            type: Array,
            required: true,
        },
	},
	data() {
        return {
			toggleClickedViolation: false,
			clickedViolationIndex: null,
			clickedViolationId: null,
			violationChange: 1,
        }
	},
    computed: {
		tableStyle() {
            return {
				'width': '100%',
                'table-layout': 'fixed',
            };
		},
		tableRow() {
            return {
                'height': '40px',
				'cursor': 'pointer',
            };
		},
		tableWrap() {
			return {
				'white-space': 'normal',
				'word-wrap': 'break-word',
			};
		},
		tableHeader() {
			return {
				'text-align': 'left',
			};
		},
		redDot() {
            return {
                'height': '5px',
				'width': '5px',
				'background-color': '#DD1C1A',
				'border-radius': '50%',
				'display': 'inline-block',
				'margin-right': '2px'
            };
        },
	},
	mounted() {
		this.resetViolationRedLine();
	},
	watch: { 
      	violations: function(newVal, oldVal) {
		  	if (newVal !== oldVal){
				this.resetViolationRedLine();
		  	}
        }
    },
	methods:{
		onRowClick: function(violation, index){
			if(this.clickedViolationIndex === index){
				this.toggleClickedViolation = !this.toggleClickedViolation;
				if(this.toggleClickedViolation === false){
					this.resetViolationRedLine();
					this.$emit('resetBounds');
					return;
				}
			} else {
				this.toggleClickedViolation = true;
			}

			const violationObj = {
				violation: violation,
				index: index,
				violationClicked: this.toggleClickedViolation,
			}

			this.$emit('clicked', violationObj)

			this.clickedViolationIndex = index;
			this.clickedViolationId = violation.violatedObj.objID;
		},
		resetViolationRedLine: function(){
			for(let i in this.violations) {
				const violationObj = {
					violation: {
						startTime: this.violations[i].violationTime,
						actionID: this.violations[i].violatedObj.objID,
						violators: this.violations[i].violators,
					},
					violationClicked: this.toggleClickedViolation,
				}
				this.$emit('loadViolations', violationObj)
			}
		},
	},
}
</script>

<style lang='scss' scoped>
</style>