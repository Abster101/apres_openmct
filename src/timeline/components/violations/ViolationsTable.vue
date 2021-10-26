<template>
<div :style="divStyle">
    <h3>VIOLATIONS</h3>
	<table>
        <thead>
          	<tr>
           		<th>Time</th>
				<th>Type</th>
				<th>Violated Object</th>
				<th>Violated Object Value</th>
				<th>List of Violators'</th>
          	</tr>
        </thead>
        <tbody>
			<tr  v-for="(violation, index) in violations" v-on:click="onRowClick(violation, index)" :style="tableRow">
				<td style="padding-top: 15px">
					<span :style="redDot" v-if="clickedViolationId === violation.violatedObj.objID & toggleClickedViolation"></span> 
					{{violation.violationTime}}
				</td>
				<td style="padding-top: 15px">{{violation.violationType}}</td>
				<td style="padding-top: 15px">{{violation.violatedObj.tableText}}</td>
				<td style="padding-top: 15px">{{violation.violatedObjValue}}</td>
				<td style="padding-top: 15px">
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
	emits: [
		'resetBounds',
		'clicked',
		'loadViolations',
	],
	data() {
        return {
			toggleClickedViolation: false,
			clickedViolationIndex: null,
			clickedViolationId: null,
			violationChange: 1,
        }
	},
    computed: {
		divStyle() {
            return {
				'max-height': '20%',
                'margin-top': 'auto',
				'overflow-y': 'auto',
            };
		},
		tableRow() {
            return {
                'height': '40px',
				'cursor': 'pointer',
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
	watch: { 
      	violations: function(newVal, oldVal) {
		  	if (newVal !== oldVal){
				this.resetViolationRedLine();
		  	}
        }
    },
	methods:{
		onRowClick: function(violation, index){
			if(this.clickedViolationId === violation.violatedObj.objID){
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
	.testing-violations {
		font-size: 1000px;
	}
</style>