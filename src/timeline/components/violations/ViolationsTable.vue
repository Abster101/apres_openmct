<template>
<div :style="testingStyle">
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
				<td>
					<span :style="redDot" v-if="clickedViolationId === violation.violatedObj.objID & toggleClickedViolation"></span> 
					{{violation.violationTime}}
				</td>
				<td>{{violation.violationType}}</td>
				<td>{{violation.violatedObj.tableText}}</td>
				<td>{{violation.violatedObjValue}}</td>
				<td>
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
import simpleDrill from '../../../../config/SimpleDrillViolated_EpSim_Output.json';
import simpleDrill2 from '../../../../config/SimpleDrillViolated2_EpSim_Output.json';
import simpleDrill3 from '../../../../config/SimpleDrillViolated3_EpSim_Output.json';
import simpleDrill4 from '../../../../config/SimpleDrillViolated4_EpSim_Output.json';

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
		// 'violationClear',
		'violationClear',
		'loadViolations',
	],
	data() {
        return {
			// violations: [],
			toggleClickedViolation: false,
			clickedViolationIndex: null,
			clickedViolationId: null,
			violationChange: 1,
        }
	},
    computed: {
		testingStyle() {
            return {
                'margin-top': 'auto',
            };
		},
		tableRow() {
            return {
                'height': '40px',
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
		// onViolationChange: function(){
		// 	this.$emit("violationClear");

		// 	if(this.violationChange === 1){
		// 		this.violationChange = this.violationChange + 1;
		// 		this.violations = simpleDrill2.simulationInfo.violations
		// 	}else if(this.violationChange === 2){
		// 		this.violationChange = this.violationChange + 1;
		// 		this.violations = simpleDrill3.simulationInfo.violations
		// 	}else if(this.violationChange === 3){
		// 		this.violationChange = this.violationChange + 1;
		// 		this.violations = simpleDrill4.simulationInfo.violations
		// 	}else{
		// 		this.violationChange = 1;
		// 		this.violations = simpleDrill.simulationInfo.violations
		// 	}

		// 	const match = this.violations.filter(violation => {
		// 		return violation.violatedObj.objID === this.clickedViolationId
		// 	})

		// 	if (match.length === 0) {
		// 		this.toggleClickedViolation = false;
		// 		this.clickedViolationIndex = null;
		// 		this.clickedViolationId = null;
		// 	}

		// 	this.resetViolationRedLine();
		// },
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