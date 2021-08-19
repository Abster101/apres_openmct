<template>
<div>
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
          	<tr>
           		<td>2022-08-14T13:00:00Z</td>
				<td>unsatisfied-condition</td>
				<td>
					<tr>
						<th>actProcName</th>
						<th>condStart</th>
						<th>condExpr</th>
					</tr>
					<tr>
						<td>auger1</td>
						<td>2022-08-14T13:00:00Z</td>
						<td>DrillArm_sys == unstowed</td>
					</tr>
				</td>
				<td>Violated Object Value</td>
				<td>
					<tr>
						<th>Violator Name</th>
						<th>Action or Procedure Violator</th>
					</tr>
					<tr>
						<td>initial conditions</td>
						<td>text</td>
					</tr>
					<tr>
						<td>initial conditions</td>
						<td>text</td>
					</tr>
				</td>
          	</tr>
			<tr>
           		<td>2022-08-14T13:00:00Z</td>
				<td>unsatisfied-condition</td>
				<td>
					<tr>
						<th>actProcName</th>
						<th>condStart</th>
						<th>condExpr</th>
					</tr>
					<tr>
						<td>auger1</td>
						<td>2022-08-14T13:00:00Z</td>
						<td>DrillArm_sys == unstowed</td>
					</tr>
				</td>
				<td>Violated Object Value</td>
				<td>
					<tr>
						<th>Violator Name</th>
						<th>Action or Procedure Violator</th>
					</tr>
					<tr>
						<td>initial conditions</td>
						<td>text</td>
					</tr>
					<tr>
						<td>initial conditions</td>
						<td>text</td>
					</tr>
					<tr>
						<td>initial conditions</td>
						<td>text</td>
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
    },
    computed: {
    }
}
</script>