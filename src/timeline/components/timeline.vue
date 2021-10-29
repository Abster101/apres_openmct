<template>
<div :style="containerStyle">
	<div class="flex flex-row w-full">
		<div
			class="w-10-10"
		>
			<!-- 30px div to match timeline-axis -->
			<div
				class="flex align-self-center"
				style="min-height: 30px;"
			>
				<button
					class="c-icon-button c-icon-button--major icon-plus"
					title="zoom in"
					@click="zoomIn"
				></button>
				<button
					class="c-icon-button c-icon-button--major icon-minus"
					title="zoom out"
					@click="zoomOut"
				></button>
			</div>
			<!-- timeline legend labels -->
			<div>
				<timeline-legend-label
					v-for="(legend, index) in legends"
					:key="'timeline-legend-label' + index"
					:num-activities="timelineLegends[legend] && timelineLegends[legend].length"
					:title="legend"
				>
					{{legend}}
				</timeline-legend-label>
                <timeline-legend-label
					v-for="(legend, index) in chronicles"
					:key="'timeline-chronicle-egend--label ' + index"
                    :num-activities="1"
					:title="legend.name"
                    :numericHeightInfo="numericHeightInfo"
				>
					{{legend}}
				</timeline-legend-label>
			</div>
		</div>
		<div
			ref="timeline-container"
			class="w-9-10"
			:style="style"
		>
			<timeline-axis
				:bounds="bounds"
				:time-system="timeSystem"
				:content-height="50"
				:rendering-engine="'svg'"
			/>
			<div
				style="min-width: 100%; min-height: 100%; position: relative"
			>
				<Error 
					v-for="(error, index) in errors"
					:key="`error-${index}`"
					:startTime="error.startTime"
					:startBounds="bounds.start"
					:pixelMultiplier="pixelMultiplier"
					:formatter="timeFormatter"
				/>
				<timeline-legend
					v-for="(legend, index) in legends"
					:key="'timeline-legend-' + index"
					:title="legend"
					:activities="timelineLegends[legend]"
					:parentDomainObject="liveDomainObject"
					:index="index"
					:isEditing="isEditing"
					:startBounds="bounds.start"
					:endBounds="bounds.end"
					:pixelMultiplier="pixelMultiplier"
					:formatter="timeFormatter"
                    :errors="errors"
                    :violationClicked="violationClicked"
                    @removeAction="removeAction"
				/>
                <timeline-chronicle-legend
					v-for="(chronicle, index) in chronicles"
					:key="'timeline-chronicle-legend-' + index"
					:title="chronicle.name"
					:chronicle="chronicle"
					:parentDomainObject="liveDomainObject"
					:index="index"
					:isEditing="isEditing"
					:startBounds="bounds.start"
					:endBounds="bounds.end"
                    :projectEndTime="projectEndTime"
					:pixelMultiplier="pixelMultiplier"
					:formatter="timeFormatter"
                    :errors="errors"
                    :violationClicked="violationClicked"
                    @changeNumericHeight="changeNumericLabelHeight"
				/>
			</div>
		</div>
	</div>
	<violations-table
        :violations="violations"
		@loadViolations="addErrorsOnLoad" 
        @resetBounds="resetTimeBoundsFromViolationClick"
		@clicked="onViolationClicked"
		@violationClear="clearErrorsWithUpdates"
	/>
</div>
</template>

<script>
import axios from 'axios';
import config from '../../../apresConfig.js';
import TimelineLegend from './timelineLegend.vue';
import TimelineLegendLabel from './timelineLegendLabel.vue';
import TimelineChronicleLegend from './stateChronicles/TimelineChronicleLegend.vue';
import TimelineAxis from './timeSystemAxis.vue';
import ViolationsTable from './violations/table.vue';

import timelineUtil from '../../lib/timelineUtil';

import Error from './error.vue';
import lodash from 'lodash';
import uuid from 'uuid'

const PIXEL_MULTIPLIER = 0.05;
const TIMELINE_PADDING = 1000 * 60 * 15; //  mins of padding for timeline center action

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
    components: {
        TimelineLegend,
        TimelineLegendLabel,
        TimelineAxis,
		Error,
		ViolationsTable,
        TimelineChronicleLegend,
    },
    computed: {
        inBoundErrors() {
            return this.errors.filter(error => {
                return (error.startTime <= this.bounds.end &&
                    error.startTime >= this.bounds.start);
            });
        },
        style() {
            return {
                'overflow': 'hidden'
            }
		},
		containerStyle(){
			return {
				'width': '100%',
                'height': '100%',
                'display': 'flex',
    			'flex-direction': 'column',
            }
		},
        legends() {
            return Object.keys(this.timelineLegends);
        },
        liveDomainObject() {
            return this.domainObject;
        },
        projectEndTime() {
            return this.domainObject.configuration.endTime;
        },
    },
    data() {
        let timeSystem = this.openmct.time.timeSystem();
        let timeFormatter = this.getFormatter(timeSystem.timeFormat);

        return {
            activities: [],
            timelineLegends: {},
            chronicles: [],
            savedBounds: {},
            bounds: {},
            pixelMultiplier: PIXEL_MULTIPLIER,
            errors: [],
            violations: [],
            violationClicked: false,
            numericHeightInfo: [],
            timeSystem,
            timeFormatter,
        }
    },
    methods: {
        addActivityToConfiguration(activityDomainObject, fromFile) {
            let keystring = this.openmct.objects.makeKeyString(activityDomainObject.identifier);

            if (!this.domainObject.configuration.activities[keystring]) {
                const configuration = lodash.cloneDeep(activityDomainObject.configuration);
                let startTime;

                if (!fromFile) {
                    configuration.startTime = this.timeFormatter.parse(this.domainObject.configuration.startTime);
                }

                this.openmct.objects.mutate(this.domainObject, `configuration.activities[${keystring}]`, configuration);
            }
        },
        addActivity(activityDomainObject, fromFile) {
             let activityDomainObjectCopy = lodash.cloneDeep(activityDomainObject);

            // If its a dataset action, replace the key with a new uuid to allow multiple in one timeline.
            if (activityDomainObjectCopy.identifier.key.includes('actionsType')) {
                const key = uuid();

                activityDomainObjectCopy.identifier = {
                    key,
                    namespace: ''
                }
                activityDomainObjectCopy.configuration.uuid = key;
            }

            this.addActivityToConfiguration(activityDomainObjectCopy, fromFile);

            this.activities.push(activityDomainObjectCopy);

            const activityTimelineLegend = activityDomainObjectCopy.configuration.timelineLegend;

            if (this.timelineLegends[activityTimelineLegend]) {
                this.timelineLegends[activityTimelineLegend].push(activityDomainObjectCopy);
            } else {
                this.$set(this.timelineLegends, activityTimelineLegend, [activityDomainObjectCopy]);
            }
            

            // Remove action from composition. We should allow multiple of the same action.
            this.openmct.objects.mutate(this.domainObject, 'composition', []);
        },
        removeAction(payload) {
            const { actionId, legendId } = payload;
            const filteredLegendActivities = this.timelineLegends[legendId].filter((activity) => activity.identifier.key !== actionId);
            const activitiesConfiguration = lodash.cloneDeep(this.domainObject.configuration.activities);
            delete activitiesConfiguration[actionId]; // Remove action from domainObject configuration.

            // If no actions remain in legend, remove legend. Else set filtered actions array to legend.
            if (filteredLegendActivities.length === 0) {
                const copiedLegends = lodash.cloneDeep(this.timelineLegends);
                delete copiedLegends[legendId];
                this.timelineLegends = copiedLegends;
            } else {
                this.$set(this.timelineLegends, legendId, filteredLegendActivities);
            }

            // Remove action from activities array.
            this.activities = this.activities.filter((activity) => activity.identifier.key !== actionId);
            this.openmct.objects.mutate(this.domainObject, 'configuration.activities', activitiesConfiguration);
        },
        addActivitiesFromConfiguration() {
            Object.entries(this.domainObject.configuration.activities).forEach(([key, configuration]) => {
                let activityDomainObject = {
                    name: configuration.name,
                    identifier: {
                        namespace: '',
                        key: key
                    },
                    configuration
                };

                this.addActivity(activityDomainObject);
            });
        },
        addError(errorObject) {
            this.errors.push(errorObject);
		},
		clearErrors() {
			this.errors = [];
        },
        reorderActivities(reorderPlan) {
            let oldActivities = this.activities.slice();

            reorderPlan.forEach((reorderEvent) => {
                this.$set(this.activities, reorderEvent.newIndex, oldActivities[reorderEvent.oldIndex]);
            });
        },
        initializeTimeBounds(timeBounds, tick) {
            if (tick) {
                return;
            }

            this.bounds = timeBounds;

            this.initializePixelMultiplier();
        },
        initializePixelMultiplier() {
            let container = this.$refs['timeline-container'];
            let boundingClientRect = container.getBoundingClientRect();
            let width = boundingClientRect.width;
            let boundsDiff = this.bounds.end - this.bounds.start;

            this.pixelMultiplier = boundsDiff / width;
        },
        getViewContext() {
            return {
                type: 'timeline-component',
                centerTimeline: this.setTimeBoundsFromConfiguration,
                zoomIn: this.zoomIn,
                zoomOut: this.zoomOut,
                importTimeline: this.importTimeline,
                saveTimeline: this.saveTimeline,
                deleteTimeline: this.deleteTimeline
            }
        },
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key
            }).formatter;
        },
        getTimelineCenterBounds() {
            if (!this.activities.length) {
                return;
            }

            let start = 0;
            let end = 0;

            this.activities.forEach((activity, index) => {
                const keystring = this.openmct.objects.makeKeyString(activity.identifier);
                const configuration = this.domainObject.configuration.activities[keystring]
                const startTime = this.timeFormatter.parse(configuration.startTime);
                const endTime = startTime + configuration.duration;

                if (index === 0) {
                    start = startTime;
                    end = endTime;
                } else {
                    if (startTime < start) {
                        start = startTime;
                    }

                    if (endTime > end) {
                        end = endTime;
                    }
                }
            });

            start = Math.floor(start - TIMELINE_PADDING);
            end = Math.ceil(end + TIMELINE_PADDING);

            return [start, end];
        },
        centerTimeline() {
            const [start, end] = this.getTimelineCenterBounds();

            this.openmct.time.bounds({start, end});
        },
        zoomIn() {
            const zoomFactor = 0.1 * (this.bounds.end - this.bounds.start)
            const start = this.bounds.start + zoomFactor;
            const end = this.bounds.end - zoomFactor;

            this.openmct.time.bounds({start, end});
        },
        zoomOut() {
            const zoomFactor = 0.1 * (this.bounds.end - this.bounds.start)
            const start = this.bounds.start - zoomFactor;
            const end = this.bounds.end + zoomFactor;

            this.openmct.time.bounds({start, end});
        },
        setTimeBoundsFromConfiguration(configuration = this.domainObject.configuration) {
            if (configuration.startTime && configuration.endTime) {
                this.openmct.time.bounds({
                    start: this.timeFormatter.parse(configuration.startTime),
                    end: this.timeFormatter.parse(configuration.endTime)
                });
            } else {
                this.centerTimeline();
            }
		},
        addErrorsOnLoad(value) {
            this.addError(value.violation);
                this.violationClicked = value.violationClicked;
        },
        onViolationClicked(value) {
                let violationTime = this.timeFormatter.parse(value.violation.violationTime);
                let end = Math.ceil(violationTime + TIMELINE_PADDING);
                let start = Math.floor(violationTime - TIMELINE_PADDING);

                this.openmct.time.bounds({start, end});
            this.clearErrors();
                this.violationClicked = value.violationClicked;
            this.addError({
            startTime: value.violation.violationTime,
                    actionID: value.violation.violatedObj.objID,
            violators: value.violation.violators,
                });
        },
            resetTimeBoundsFromViolationClick(value) {
                this.centerTimeline();
            },
        clearErrorsWithUpdates(value){
            this.clearErrors();
        },
        getFormModel() {
            return {
                name: "Import Timeline",
                sections: [
                    {
                        name: "Import A JSON File",
                        rows: [
                            {
                                name: 'Select File',
                                key: 'selectFile',
                                control: 'file-input',
                                required: true,
                                text: 'Select File...'
                            }
                        ]
                    }
                ]
            };
        },
        parseProjectJSON(jsonString) {
            let timelineObject;

            try {
                timelineObject = JSON.parse(jsonString);
            } catch (e) {
                return null;
            }

            if (!timelineObject.planningProject) {
                return null;
            }

            return timelineObject;
        },
        addActionFromFile(action, config = {}) {
            let colorHex = config.colorHex || '#4f6ffe';
            let timelineLegend = config.timelineLegend || 'Default';
            const startTime = this.timeFormatter.parse(action.actionStart);
            const endTime = this.timeFormatter.parse(action.actionEnd)

            const configuration = {
                name: action.actionName,
                colorHex: colorHex,
                timelineLegend: timelineLegend,
                startTime: action.actionStart,
                parameters: action.parameters,
                duration: endTime - startTime,
                objectStyles: {
                    staticStyle: {
                        style: {
                            backgroundColor: colorHex,
                            border: `1px solid ${colorHex}`,
                            color: '#aaaaaa'
                        }
                    }
                }
            };
            const domainObject = {
                name: action.actionName,
                type: 'apres.action.type',
                identifier: {
                    namespace: '',
                    key: action.uuid
                },
                configuration
            };

            this.addActivity(domainObject, true);
        },
        storeTimelineBounds({startTime, endTime}) {
            this.openmct.objects.mutate(this.domainObject, `configuration.startTime`, startTime);
            this.openmct.objects.mutate(this.domainObject, `configuration.endTime`, endTime);

            this.setTimeBoundsFromConfiguration({startTime, endTime});
        },
        processConfiguration(configuration) {
            const configObject = {};

            configuration.modelConfig.forEach((model) => {
                configObject[model.actProcType] = model;
            });

            return configObject;
        },
        processJsonTimeline(form) {
            const timelineJSON = form.selectFile.body;
            const projectBundle = this.parseProjectJSON(timelineJSON);
            const timeConfiguration = {
                startTime: projectBundle.planningProject.activityPlan.planStart,
                endTime: projectBundle.planningProject.activityPlan.planEnd
            };
            const configuration = this.processConfiguration(projectBundle.configuration);

            this.timeConfiguration = timeConfiguration;

            projectBundle.planningProject.activityPlan.actions.forEach((action) => {
                this.addActionFromFile(action, configuration[action.actionType]);
            });

            this.storeTimelineBounds(timeConfiguration);
        },
        importTimeline() {
            this.openmct.$injector.get('dialogService')
                .getUserInput(this.getFormModel(), {}).then(this.processJsonTimeline);
        },
        saveTimeline() {
            const saveUrl = `${config['apres_service_root_url']}/save`;
            const projectJSON = timelineUtil.getProjectJsonFromTimelineObject(this.domainObject);

            axios.put(saveUrl, projectJSON).then((success) => {
                this.openmct.notifications.info('Success: Project Saved to APRES Service.');
            });
        },
        deleteTimeline() {
            const deleteUrl = `${config['apres_service_root_url']}/delete?projectname=${this.domainObject.name}`;
            
            const dialog = this.openmct.overlays.dialog({
                iconClass: 'alert',
                message: "Are you sure you want to delete this project?",
                buttons: [
                    {
                        label: "Yes",
                        emphasis: true,
                        callback: () => {
                            axios.delete(deleteUrl).then((success) => {
                                localStorage.clear();
                                this.openmct.destroy();
                                window.location.reload();
                            }).catch(error => console.log(error));
                        }
                    },
                    {
                        label: "No",
                        emphasis: false,
                        callback: () => {
                            dialog.dismiss();
                        }
                    }
                ]
            });
        },
        changeNumericLabelHeight(val) {
            if (this.numericHeightInfo.length === 0) {
                this.numericHeightInfo.push(val);
            } else {
                for (const chronicle of this.numericHeightInfo) {
                    if (chronicle.name === val.name) {
                        chronicle.height = val.height;
                        break;
                    }
                }
            }
        },
    },
    mounted() {
        this.openmct.time.on('bounds', this.initializeTimeBounds);
        this.initializeTimeBounds(this.openmct.time.bounds());
        this.timeSystem = this.openmct.timeSystem;

        const composition = this.openmct.composition.get(this.domainObject);

        composition.on('add', this.addActivity);
        composition.on('reorder', this.reorderActivities);
        composition.load();

        this.unsubscribeFromComposition = () => {
            composition.off('add', this.addActivity);
        }
        
        this.addActivitiesFromConfiguration();

        if (this.domainObject.configuration.violations) {
            this.violations = this.domainObject.configuration.violations;
        }

        if (this.domainObject.configuration.chronicles) {
            this.chronicles = this.domainObject.configuration.chronicles;
        }
    },
    beforeDestroy() {
        this.unsubscribeFromComposition();
        this.openmct.time.off('bounds', (this.initializeTimeBounds));
    }
}
</script>

<style lang="scss">
</style>
