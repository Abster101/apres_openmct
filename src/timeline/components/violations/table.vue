<template>
<div :style="testingStyle">
    <h3 v-on:click="onViolationChange()">VIOLATIONS {{violationChange}}</h3>
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
	},
	data() {
        return {
			violations: [],
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
	methods:{
		onRowClick: function(violation, index){
			this.$emit('clicked', violation)

			if(this.clickedViolationId === violation.violatedObj.objID){
				this.toggleClickedViolation = !this.toggleClickedViolation;
				if(this.toggleClickedViolation === false){
					this.resetViolationRedLine();
				}
			} else {
				this.toggleClickedViolation = true;
			}

			this.clickedViolationIndex = index;
			this.clickedViolationId = violation.violatedObj.objID;
		},
		onViolationChange: function(){
			this.$emit("violationClear");

			if(this.violationChange === 1){
				this.violationChange = this.violationChange + 1;
				this.violations = simpleDrill2.simulationInfo.violations
			}else if(this.violationChange === 2){
				this.violationChange = this.violationChange + 1;
				this.violations = simpleDrill3.simulationInfo.violations
			}else if(this.violationChange === 3){
				this.violationChange = this.violationChange + 1;
				this.violations = simpleDrill4.simulationInfo.violations
			}else{
				this.violationChange = 1;
				this.violations = simpleDrill.simulationInfo.violations
			}

			this.resetViolationRedLine();

			const match = this.violations.filter(violation => {
				return violation.violatedObj.objID === this.clickedViolationId
			})

			if (match.length === 0) {
				this.clickedViolationIndex = null;
				this.clickedViolationId = null;
			}
		},
		resetViolationRedLine: function(){
			for(let i in this.violations) {
				const violationObj = {
					startTime: this.violations[i].violationTime,
					actionID: this.violations[i].violatedObj.objID,
				}
				this.$emit('loadViolations', violationObj)
			}
		},
	},
	mounted(){
		this.violations = simpleDrill.simulationInfo.violations;
		this.resetViolationRedLine();

		console.log(this.violations);
	},
}
</script>

<style lang='scss' scoped>
	.testing-violations {
		font-size: 1000px;
	}
</style>