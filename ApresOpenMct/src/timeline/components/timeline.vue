<template>
<div 
    class="root"
    @drop="handleDrop"
>
    <!-- STICKY HEADER -->
    <div class="flex flex-row w-full"
				style="height: 30px;"
    >
		<div class="w-10-10 h-full">
			<div
				class="flex align-self-center h-full"
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
        </div>
		<div class="w-9-10">
			<timeline-axis
				:viewBounds="bounds"
				:isFixed="true"
			/>
        </div>
    </div>
    <!-- SCROLLABLE CONTENT -->
    <div class="scrollable w-full">
        <div class="flex flex-row w-full">
            <div class="w-10-10">
                <!-- timeline legend labels -->
                <div>
                    <timeline-legend-label
                        v-for="(legend, index) in legends"
                        :key="'timeline-legend-label' + index"
                        :index="index"
                        :num-activities="timelineLegends[legend] && timelineLegends[legend].length"
                        :title="legend"
                    >
                        {{legend}}
                    </timeline-legend-label>
                    <timeline-legend-label
                        v-for="(legend, index) in chronicles"
                        :key="'timeline-chronicle-egend--label ' + index"
                        :index="index"
                        :num-activities="1"
                        :title="legend.name"
                        :numericHeightInfo="numericHeightInfo"
                    >
                        {{legend}}
                    </timeline-legend-label>
                </div>
            </div>
            <div ref="timeline-container" class="w-9-10 rows">
                <div
                    style="min-width: 100%; min-height: 100%; position: relative"
                >
                    <error-view
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
</div>
</template>

<style scoped>
    .root {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .scrollable {
        /* width: 100%;
        height: 100%; */
        overflow: hidden;
        overflow-y: auto;
    }

    .h-full {
        height: 100%;
    }

    .rows {
        overflow: hidden;
    }
</style>

<script>
import axios from 'axios';
import config from '../../../apresConfig.js';
import TimelineLegend from './timelineLegend.vue';
import TimelineLegendLabel from './timelineLegendLabel.vue';
import TimelineChronicleLegend from './stateChronicles/TimelineChronicleLegend.vue';
import TimelineAxis from './timeSystemAxis.vue';
import ViolationsTable from './violations/table.vue';

import timelineUtil from '../../lib/timelineUtil';

// This component was previously imported as "Error", causing code down below to
// accidentally throw Error components as exceptions instead of using the global
// Error class.
import ErrorView from './error.vue';

import cloneDeep from 'lodash/cloneDeep';
import {v4 as uuid} from 'uuid'

const PIXEL_MULTIPLIER = 0.05;
const TIMELINE_PADDING = 1000 * 60 * 15; //  mins of padding for timeline center action

export default {
    inject: ['openmct', 'objectPath', 'initialProjectJSON'],
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
		ErrorView,
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
        legends() {
            return Object.keys(this.timelineLegends);
        },
        liveDomainObject() {
            return this.domainObject;
        },
        configuration() {
            return this.liveDomainObject.configuration;
        },
        projectEndTime() {
            return this.configuration.endTime;
        },
        chronicles() {
            return this.configuration.chronicles || [];
        },
        violations() {
            return this.configuration.violations || [];
        },
        activities() {
            const actions = Object.entries(this.configuration.activities);
            const processes = Object.entries(this.configuration.processes || {});
            const activitiesArray = [];

            actions.forEach(([key, configuration]) => {
                let activityDomainObject = {
                    name: configuration.name,
                    identifier: {
                        namespace: '',
                        key: key
                    },
                    configuration
                };

                activitiesArray.push(activityDomainObject);
            });

            processes.forEach(([key, configuration]) => {
                let activityDomainObject = {
                    name: configuration.name,
                    identifier: {
                        namespace: '',
                        key: key
                    },
                    activityType: 'process',
                    configuration
                };

                activitiesArray.push(activityDomainObject);
            });

            return activitiesArray;
        },
        timelineLegends() {
            const legendsMap = {};

            this.activities.forEach((activity) => {
                const legend = activity.configuration.timelineLegend;
                if (legendsMap[legend]) {
                    legendsMap[legend].push(activity)
                } else {
                    legendsMap[legend] = [activity];
                }
                
            });

            return legendsMap;
        },
        legends() {
            return Object.keys(this.timelineLegends);
        }
    },
    data() {
        let timeSystem = this.openmct.time.timeSystem();
        let timeFormatter = this.getFormatter(timeSystem.timeFormat);

        return {
            bounds: {},
            pixelMultiplier: PIXEL_MULTIPLIER,
            errors: [],
            violationClicked: false,
            numericHeightInfo: [],
            timeSystem,
            timeFormatter,
        }
    },
    methods: {
        /**
        @param {ActivityDomainObject} actionDomainObject
        */
        addActivityToConfiguration(actionDomainObject) {
            let keystring = this.openmct.objects.makeKeyString(actionDomainObject.identifier);

            /** @type {TimelineDomainObject} */
            const timelineDomainObject = this.liveDomainObject
            const actionConfig = cloneDeep(actionDomainObject.configuration);

            // NOTE! A new actionDomainObject's startTime is set to null in
            // ApresObjectProvider.getAction to cause the value to be set to tiemline's startTime here.
            /** @type {number} */
            let startTimeMs = this.actionStart;

            if (!startTimeMs) {
                console.log('in here');
                startTimeMs = this.timeFormatter.parse(actionConfig.startTime || timelineDomainObject.configuration.startTime);
            }

            const endTimeMs  = startTimeMs + (actionConfig.duration);
            /** @type {string} */
            const startTimeFormatted = this.timeFormatter.format(startTimeMs);
            /** @type {string} */
            const endTimeFormatted = this.timeFormatter.format(endTimeMs);

            actionConfig.startTime = startTimeFormatted;
            actionConfig.endTime = endTimeFormatted;

            let mutationPath = `configuration.activities[${keystring}]`;

            this.openmct.objects.mutate(timelineDomainObject, mutationPath, actionConfig);
        },
        /**
        @param {ActivityDomainObject} activityDomainObject
        @param {boolean} skipMutate
        */
        addActivity(activityDomainObject, skipMutate) {
            const activityDomainObjectCopy = cloneDeep(activityDomainObject);

            // If its a dataset action, replace the key with a new uuid to allow multiple in one timeline.
            if (activityDomainObjectCopy.identifier.key.includes('actionsType')) {
                const key = uuid();

                activityDomainObjectCopy.identifier = {
                    key,
                    namespace: ''
                }
                activityDomainObjectCopy.configuration.uuid = key;
            }

            if (!skipMutate) {
                this.addActivityToConfiguration(activityDomainObjectCopy);
            }

            // Remove action from composition. We should allow multiple of the same action.
            this.openmct.objects.mutate(this.liveDomainObject, 'composition', []);
        },
        removeAction(payload) {
            const { actionId } = payload;
            const activitiesConfiguration = cloneDeep(this.liveDomainObject.configuration.activities);
            delete activitiesConfiguration[actionId]; // Remove action from domainObject configuration.

            this.openmct.objects.mutate(this.liveDomainObject, 'configuration.activities', activitiesConfiguration);
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
                validateTimeline: this.validateTimeline,
                deleteTimeline: this.deleteTimeline
            }
        },
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key
            }).formatter;
        },
        centerTimeline() {
            const start = this.timeFormatter.parse(this.liveDomainObject.configuration.startTime);
            const end = this.timeFormatter.parse(this.liveDomainObject.configuration.endTime);

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
        setTimeBoundsFromConfiguration(configuration = this.liveDomainObject.configuration) {
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
        /**
        @param {string} jsonString
        @returns {PlanningProjectJson | null}
        */
        parseProjectJSON(jsonString) {
            /** @type {PlanningProjectJson} */
            let planningProject;

            try {
                planningProject = JSON.parse(jsonString);
            } catch (e) {
                return null;
            }

            if (!planningProject.planningProject) {
                return null;
            }

            return planningProject;
        },
        /**
        @param {PlanningProjectAction} action
        @param {Partial<TimelineModelConfig>} config
        @param {ActivityType=} actionType
        */
        // TODO not needed?
        addActionFromFile(action, config = {}, actionType) {
            const actionConfig = timelineUtil.getActionConfig(action, config, actionType);
            const actionDomainObject = timelineUtil.getActivityDomainObject(actionConfig/*, location? TODO */);
            this.addActivity(actionDomainObject, true);
        },
        storeTimelineBounds({startTime, endTime}) {
            this.openmct.objects.mutate(this.liveDomainObject, `configuration.startTime`, startTime);
            this.openmct.objects.mutate(this.liveDomainObject, `configuration.endTime`, endTime);

            this.setTimeBoundsFromConfiguration({startTime, endTime});
        },
        processConfiguration(configuration) {
            const configObject = {};

            configuration.modelConfig.forEach((model) => {
                configObject[model.actProcType] = model;
            });

            return configObject;
        },
        /**
        @param {TODO} form
        */
        processJsonTimeline(form) {
            /** @type {string} */
            const planningProjectJson = form.selectFile.body;

            const projectJSON = this.parseProjectJSON(planningProjectJson);

            if (!projectJSON) throw new Error('Invalid planning project file.')

            const timeConfiguration = {
                startTime: projectJSON.planningProject.activityPlan.planStart,
                endTime: projectJSON.planningProject.activityPlan.planEnd
            };
            const configuration = this.processConfiguration(projectJSON.configuration);

            this.timeConfiguration = timeConfiguration;

            projectJSON.planningProject.activityPlan.actions.forEach((action) => {
                const actionType = timelineUtil.getActionTypeObject(projectJSON, action.actionType)

                if (!actionType) console.warn("TODO: All actions should have a type.");

                this.addActionFromFile(action, configuration[action.actionType], actionType);
            });

            this.storeTimelineBounds(timeConfiguration);
        },
        importTimeline() {
            this.openmct.$injector.get('dialogService')
                .getUserInput(this.getFormModel(), {}).then(this.processJsonTimeline);
        },
        validateTimeline() {
            const validateUrl = `${config['apres_service_root_url']}/validateplan`;
            const projectJSON = timelineUtil.getProjectJsonFromTimelineObject(this.liveDomainObject);

            return axios.put(validateUrl, projectJSON)
                .then(({ data }) => {
                    if (!this.openmct.editor.isEditing()) {
                        // Put application in edit mode to prevent persistence while user is validating timeline.
                        this.openmct.editor.edit();
                    }

                    const newProjectJSON = cloneDeep(this.initialProjectJSON);
                    newProjectJSON.planningProject = data;
                    
                    const domainObject = timelineUtil.getTimelineDomainObject(newProjectJSON);
                    
                    this.clearErrors();
                    this.openmct.objects.mutate(this.liveDomainObject, 'configuration', domainObject.configuration);
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        deleteTimeline() {
            const deleteUrl = `${config['apres_service_root_url']}/delete?projectname=${this.liveDomainObject.name}`;
            
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
        // FIXME ROWS: Remove this: This numericHeightInfo array seems to grow
        // and never shrink. To avoid having to do this index tracking anyway,
        // we can group legend labels with legend rows to simplify the logic and
        // markup, also removing the need for emitting an event.
        changeNumericLabelHeight(val) {
            if (this.numericHeightInfo.length === 0) {
                this.numericHeightInfo.push(val);
            } else {
                for (const chronicle of this.numericHeightInfo) {
                    if (chronicle.index === val.index) {
                        chronicle.height = val.height;
                        break;
                    }
                }

                this.numericHeightInfo.push(val);
            }
        },
        handleDrop(event) {
            const dropPosition = event.x;
            const timelineContainerRect = this.$refs['timeline-container'].getBoundingClientRect();
            const dropDiff = dropPosition - timelineContainerRect.left;

            this.actionStart = Math.floor(this.bounds.start + (dropDiff * this.pixelMultiplier));
        }
    },
    mounted() {
        this.openmct.time.on('bounds', this.initializeTimeBounds);
        this.initializeTimeBounds(this.openmct.time.bounds());
        this.timeSystem = this.openmct.timeSystem;

        const composition = this.openmct.composition.get(this.liveDomainObject);

        composition.on('add', this.addActivity);
        composition.on('reorder', this.reorderActivities);
        composition.load();

        this.unsubscribeFromComposition = () => {
            composition.off('add', this.addActivity);
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
