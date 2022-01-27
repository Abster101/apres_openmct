<template>
    <div 
        style="display: flex; justify-content: center; position: relative; height: 100vh; width: 100vw;"
        class="app-color"
    >
        <div
            v-if="isLoading"
            style="height: 100vh; width: 100vw; position: absolute; z-index: 10001; display: flex; justify-content: center; align-content: center;"
        >
            <h2>Loading...</h2>
        </div>
        <div
            class="flex flex-column align-content-center justify-content-center" 
            v-if="!openmctStarted && !isLoading"
        >
            <img
                style="margin: 30px;"
                :src="logo" 
            />

            <div
                v-if="!newProjectData"
                style="display: flex; flex-direction: column; justify-content: center;"
            >
                
                <div style="margin-left: auto; margin-right: auto;">
                    <label for="projects">Choose a project:</label>

                    <select
                        name="projects"
                        id="projects"
                        @change="setSelectedProject"
                    >
                        <option value="new">New</option>
                        <option
                            v-for="(project, index) in projects"
                            :key="index"
                            :value="project">{{ project }}</option>
                    </select>
                </div>
                <div class="w-full flex flex-row justify-content-center mt-10">
                    <button 
                        @click="initializeApp"
                        class="primary-button"
                        style="margin-top: 20px;"
                    >
                        Start
                </button>
                </div>
            </div>

            <div
                v-else
                class="flex flex-column"
            >
                <h2 class="align-self-center">Create a New Project</h2>
                <div 
                    class="table"
                >
                    <div
                        style="margin-top: 20px;"
                        class="row"
                    >
                        <label 
                            for="configuration"
                            class="cell padding-y-10 text-right"
                        >
                            Configuration:
                        </label>

                        <select 
                            name="configuration"
                            id="configuration"
                            class="cell text-left"
                            @change="setSelectedConfiguration"
                        >
                            <option
                                v-for="(configuration, index) in newProjectData.configurations"
                                :key="index"
                                :value="configuration">{{ configuration }}</option>
                        </select>
                    </div>
                    <div 
                        style="margin-top: 20px;"
                        class="row"
                    >
                        <label 
                            for="model"
                            class="cell padding-y-10 text-right"
                        >
                            Model:
                        </label>

                        <select 
                            name="model"
                            id="model"
                            class="cell text-left"
                            @change="setSelectedModel"
                        >
                            <option
                                v-for="(model, index) in newProjectData.models"
                                :key="index"
                                :value="model">{{ model }}</option>
                        </select>
                    </div>
                    <div 
                        style="margin-top: 20px;"
                        class="row"
                    >
                        <label 
                            for="problem"
                            class="cell padding-y-10 text-right"
                        >
                            Problem:
                        </label>

                        <select 
                            name="problem"
                            id="problem"
                            class="cell text-left"
                            @change="setSelectedProblem"
                        >
                            <option
                                v-for="(problem, index) in newProjectData.problems"
                                :key="index"
                                :value="problem">{{ problem }}</option>
                        </select>
                    </div>

                    <div 
                        style="margin-top: 20px;"
                        class="row"
                    >
                        <label 
                            for="author"
                            class="cell padding-y-10 text-right"
                        >
                            Author:
                        </label>
                        <input 
                            id="author"
                            class="cell text-left"
                            @change="setAuthor"
                        />
                    </div>

                    <div 
                        style="margin-top: 20px;"
                        class="row"
                    >
                        <label
                            for="note"
                            class="cell text-right"
                        >
                            Note:
                        </label>
                        <textarea 
                            id="note"
                            class="cell padding-y-10 text-left"
                            @change="setNote"
                        />
                    </div>

                    <div 
                        style="margin-top: 20px;"
                        class="row"
                    >
                        <label 
                            for="project_name"
                            class="cell padding-y-10 text-right"
                        >
                            Project Name*:
                        </label>
                        <input 
                            id="project_name"
                            class="cell text-left"
                            :value="projectName"
                            @change="setProjectName"
                        />
                        <div 
                            style="color: red;"
                            class="timestring-error"
                        >
                            {{ errors.projectName }}
                        </div>
                    </div>
                    <div 
                        style="margin-top: 20px;"
                        class="row"
                    >
                        <label
                            for="timeline_start_time"
                            class="cell padding-y-10 text-right"
                        >
                            Timeline Start Time:
                        </label>
                        <input 
                            style="width: 200px;"
                            id="timeline_start_time"
                            class="cell text-left"
                            :value="timelineStartTime"
                            @change="setTimelineStartTime"
                        />
                        <div 
                            style="color: red;"
                            class="timestring-error"
                        >
                            {{ errors.timelineStartTime }}
                        </div>
                    </div>
                    <div
                        style="margin-top: 20px;"
                        class="row"
                    >
                        <label
                            for="timeline_end_time"
                            class="cell padding-y-10 text-right"
                        >
                            Timeline End Time:
                        </label>
                        <input 
                            style="width: 200px;"
                            id="timeline_end_time"
                            class="cell text-left"
                            :value="timelineEndTime"
                            @change="setTimelineEndTime"
                        />
                        <div 
                            style="color: red;"
                            class="timestring-error"
                        >
                            {{ errors.timelineEndTime }}
                        </div>
                    </div>
                </div>
                <div 
                    class="flex align-content-center justify-content-center mb-10"
                >
                    <button 
                        @click="clearNewProjectData"
                        class="secondary-button mr-10"
                        style="margin-top: 20px;"
                    >
                        Back
                    </button>

                    <button 
                        @click="initializeNewProject"
                        class="primary-button"
                        style="margin-top: 20px;"
                        :disabled="shouldStartBeDisabled"
                    >
                        Start
                    </button>
                </div>
            </div>
        </div>
        <div
            ref="openmct"
            :style="openmctContainerStyle"
        >
        </div>
    </div>
</template>

<script>
import openmct from 'openmct';
import axios from 'axios';
import apresTimeline from '../timeline/plugin'
import apresActivities from '../apresActivities/plugin';
import persistencePlugin from '../persistence/plugin';
import apresDataset from '../apresDataset/plugin';
import apresSessionIndicator from '../apresSessionIndicator/plugin';
import config from '../../apresConfig.js';
import domainObjectUtil from '../lib/domainObjectUtil';
import timelineUtil from '../lib/timelineUtil';
import logo from '../assets/APRES-logo.png';

const THIRTY_SECONDS = 30 * 1000;
const ONE_MINUTE = THIRTY_SECONDS * 2;
const FIVE_MINUTES = ONE_MINUTE * 5;
const FIFTEEN_MINUTES = FIVE_MINUTES * 3;
const THIRTY_MINUTES = FIFTEEN_MINUTES * 2;
const ONE_HOUR = THIRTY_MINUTES * 2;
const TWO_HOURS = ONE_HOUR * 2;
const ONE_DAY = ONE_HOUR * 24;
const TIMESTRING_ERROR = 'Please enter the correct format \n "1975-08-19T23:15:30.000Z."';
const PROJECT_NAME_ERROR = 'Please enter a project name.';
const HASH_TO_TIMELINE = '#/browse/mine/apres.timeline';

export default {
    computed: {
        openmctContainerStyle() {
            if (this.openmctStarted) {
                return {
                    'min-width': '100vw',
                    'min-height': '100vh'
                }
            } else {
                return {}
            }
        },
        shouldStartBeDisabled() {
            return this.errors.projectName || this.errors.timelineStartTime || this.errors.timelineEndTime;
        }
    },
    data() {
        return {
            /** @type {boolean} */
            openmctStarted: false,
            /** @type {string[]} */
            projects: [],
            /** @type {GlobalInfo} */
            globalAttributes: undefined,
            /** @type {boolean} */
            isLoading: true,
            /** @type {boolean} */
            newProjectData: undefined,
            timelineStartTime: undefined,
            timelineEndTime: undefined,
            /** @type {string} */
            projectName: 'new.project',
            errors: {},
            logo
        }
    },
    methods: {
        /** @param {PlanningProjectJson} projectJSON */
        initializeProject(projectJSON) {
            if (!projectJSON.planningProject.activityPlan) {
                projectJSON.planningProject.activityPlan = {
                    planStart: new Date(Date.now()).toJSON(),
                    planEnd: new Date(Date.now() + ONE_DAY).toJSON(),
                    actions: []
                }
            }

            const timelineBounds = {
                start: Date.parse(projectJSON.planningProject.activityPlan.planStart),
                end: Date.parse(projectJSON.planningProject.activityPlan.planEnd)
            }
            const mctObject = domainObjectUtil.getMctLocalStorageObject(projectJSON);

            // Only write mct object if one does not exist. On refresh, this will not be overwritten.
            if (!localStorage.getItem('mct')) {
                localStorage.setItem('mct', JSON.stringify(mctObject));
            }
            // ^ And then?.... (The 'mct' localStorage variable never seems to be used? Or there's something about OpenMCT I don't know yet.)

            this.installDefaultPlugins(timelineBounds);

            /** @type {GlobalInfo} */
            const globalAttributes = this.globalAttributes
            
            // const actionAttributes = [...defaultActionAttributes, ...globalAttributes.modelAttributes.actionAttributes];
            // const processAttributes = [...defaultProcessAttributes, ...globalAttributes.modelAttributes.processAttributes];
            const actionAttributes = [...globalAttributes.modelAttributes.actionAttributes];
            const processAttributes = [...globalAttributes.modelAttributes.processAttributes];
            const parsedProjectJSON = timelineUtil.getProjectJsonFromTimelineObject(mctObject['apres.timeline'], projectJSON.planningProject);

            openmct.install(persistencePlugin(parsedProjectJSON));
            openmct.install(apresActivities(actionAttributes, processAttributes, projectJSON));
            openmct.install(apresTimeline(projectJSON));
            openmct.install(apresDataset(projectJSON));
            openmct.install(apresSessionIndicator())

            localStorage.setItem('apres_session', true);

            this.openmctStarted = true;
            window.location.href = this.getUrlToTimeline(); // Sets url to current timeline.
            openmct.start(this.$refs.openmct);

            window.setTimeout(() => {
                this.isLoading = false;
            }, 0);
        },
        initializeNewProjectScreen(newProjectData) {
            this.isLoading = false;
            this.newProjectData = newProjectData;

            this.configuration = newProjectData.configurations[0];
            this.model =  newProjectData.models[0];
            this.problem = newProjectData.problems[0];
        },
        initializeApp() {
            const selectedProject = localStorage.getItem('apres_selected_project');

            this.isLoading = true;

            if (selectedProject && selectedProject !== 'new') {
                return this.getProjectDocs(selectedProject)
                    .then(this.initializeProject)
                    .catch(() => {
                        this.isLoading = false;
                    });
            }

            return this.getNewProjectData()
                .then(this.initializeNewProjectScreen);
        },
        /** @param {{start: number, end: number}} bounds */
        installDefaultPlugins(bounds) {
            [
                'example/eventGenerator'
            ].forEach(
                openmct.legacyRegistry.enable.bind(openmct.legacyRegistry)
            );

            openmct.install(openmct.plugins.Espresso());
            openmct.install(openmct.plugins.MyItems());
            openmct.install(openmct.plugins.Generator());
            openmct.install(openmct.plugins.ExampleImagery());
            openmct.install(openmct.plugins.UTCTimeSystem());
            openmct.install(openmct.plugins.AutoflowView({
                type: "telemetry.panel"
            }));
            openmct.install(openmct.plugins.DisplayLayout({
                showAsView: ['summary-widget', 'example.imagery']
            }));
            openmct.install(openmct.plugins.Conductor({
                menuOptions: [
                    {
                        name: "Fixed",
                        timeSystem: 'utc',
                        bounds,
                        // commonly used bounds can be stored in history
                        // bounds (start and end) can accept either a milliseconds number
                        // or a callback function returning a milliseconds number
                        // a function is useful for invoking Date.now() at exact moment of preset selection
                        presets: [
                            {
                                label: 'Last Day',
                                bounds: {
                                    start: () => Date.now() - ONE_DAY,
                                    end: () => Date.now()
                                }
                            },
                            {
                                label: 'Last 2 hours',
                                bounds: {
                                    start: () => Date.now() - TWO_HOURS,
                                    end: () => Date.now()
                                }
                            },
                            {
                                label: 'Last hour',
                                bounds: {
                                    start: () => Date.now() - ONE_HOUR,
                                    end: () => Date.now()
                                }
                            }
                        ],
                        // maximum recent bounds to retain in conductor history
                        records: 10
                        // maximum duration between start and end bounds
                        // for utc-based time systems this is in milliseconds
                        // limit: ONE_DAY
                    },
                    {
                        name: "Realtime",
                        timeSystem: 'utc',
                        clock: 'local',
                        clockOffsets: {
                            start: - THIRTY_MINUTES,
                            end: THIRTY_SECONDS
                        },
                        presets: [
                            {
                                label: '1 Hour',
                                bounds: {
                                    start: - ONE_HOUR,
                                    end: THIRTY_SECONDS
                                }
                            },
                            {
                                label: '30 Minutes',
                                bounds: {
                                    start: - THIRTY_MINUTES,
                                    end: THIRTY_SECONDS
                                }
                            },
                            {
                                label: '15 Minutes',
                                bounds: {
                                    start: - FIFTEEN_MINUTES,
                                    end: THIRTY_SECONDS
                                }
                            },
                            {
                                label: '5 Minutes',
                                bounds: {
                                    start: - FIVE_MINUTES,
                                    end: THIRTY_SECONDS
                                }
                            },
                            {
                                label: '1 Minute',
                                bounds: {
                                    start: - ONE_MINUTE,
                                    end: THIRTY_SECONDS
                                }
                            }
                        ]
                    }
                ]
            }));
            openmct.install(openmct.plugins.ObjectMigration());
            openmct.install(openmct.plugins.Timeline());
        },
        getProjectsList() {
            const listProjectsUrl = `${config['apres_service_root_url']}/listprojects`;

            return axios.get(listProjectsUrl).then((resp) => {
                if (resp && resp.data) {
                    /** @type {string[]} */
                    const data = resp.data

                    data.forEach((project) => {
                        this.projects.push(project);
                    });
                }
            })
        },
        /** @returns {Promise<void>} */
        getGlobalAttributes() {
            const globalAttributesUrl = `${config['apres_service_root_url']}/getglobalinfo`;

            return axios.get(globalAttributesUrl).then((resp) => {
                if (resp && resp.data) {
                    this.globalAttributes = resp.data;
                }
            })
        },
        setSelectedProject(event) {
            localStorage.setItem('apres_selected_project', event.target.value);
        },
        /** @returns {Promise<PlanningProjectJson>} */
        getProjectDocs(projectName) {
            const projectUrl = `${config['apres_service_root_url']}/loadproject?projectname=${projectName}`

            return axios.get(projectUrl).then((resp) => {
                if (resp && resp.data) {
                    return resp.data;
                }
            })
        },
        /** @returns {Promise<NewProjectData>} */
        getNewProjectData() {
            const newProjectDataUrl = `${config['apres_service_root_url']}/newprojectdata`;

            return axios.get(newProjectDataUrl).then((resp) => {
                if (resp && resp.data) {
                    return resp.data;
                }
            })
        },
        setSelectedProblem(event) {
            this.problem = event.target.value;
        },
        setSelectedModel(event) {
            this.model = event.target.value;
        },
        setSelectedConfiguration(event) {
            this.configuration = event.target.value;
        },
        setAuthor(event) {
            this.author = event.target.value;
        },
        setNote(event) {
            this.note = event.target.value;
        },
        setProjectName(event) {
            const projectName = event.target.value;

            if (projectName === '') {
                this.$set(this.errors, 'projectName', PROJECT_NAME_ERROR);
            } else {
                this.$set(this.errors, 'projectName', undefined);
            }

            this.projectName = projectName;
        },
        initializeNewProject() {
            this.validate();

            const initNewProjectUrl = `${config['apres_service_root_url']}/initproject`;

            /** @type {PlanningProjectJson['planningProject']} */
            const payload = {
                // $schema: "./PlanningProjectSchema.json",
                projectInfo: {
                    author: this.author,
                    note: this.note,
                    lastModDate: new Date(Date.now()).toJSON(),
                    projRef: this.projectName,
                    modelRef: this.model,
                    configRef: this.configuration,
                    problemRef: this.problem
                },
                activityPlan: {
                    planStart: this.timelineStartTime,
                    planEnd: this.timelineEndTime,
                    actions: []
                }
            };

            axios.post(initNewProjectUrl, payload)
                .then((resp) => {
                    if (resp && resp.data) {
                        this.initializeProject(resp.data);
                    }
                })
                .catch((error) => console.log(error));
        },
        clearNewProjectData() {
            this.newProjectData = undefined;
        },
        validate() {
            const errorsObject = {};

            if (!this.timelineStartTime) {
                errorsObject.timelineStartTime = 'Please enter start time'
            } else if (!this.isValidTimeString(this.timelineStartTime)) {
                errorsObject.timelineStartTime = TIMESTRING_ERROR;
            } else {
                errorsObject.timelineStartTime = undefined;
            }

            if (!this.timelineEndTime) {
                errorsObject.timelineEndTime = 'Please enter end time'
            } else if (!this.isValidTimeString(this.timelineEndTime)) {
                errorsObject.timelineEndTime = TIMESTRING_ERROR;
            } else {
                errorsObject.timelineEndTime = undefined;
            }

            if (!this.projectName) {
                errorsObject.projectName = PROJECT_NAME_ERROR;
            } else {
                errorsObject.projectName = undefined;
            }

            this.errors = errorsObject;
        },
        isValidTimeString(timeString) {
            return Boolean(Date.parse(timeString));
        },
        setTimelineStartTime(event) {
            const timeString = event.target.value;
            
            if (!this.isValidTimeString(timeString)) {
                this.$set(this.errors, 'timelineStartTime', TIMESTRING_ERROR);
            } else {
                this.$set(this.errors, 'timelineStartTime', undefined);
            }

            this.timelineStartTime = timeString;
        },
        setTimelineEndTime(event) {
            const timeString = event.target.value;
            
            if (!this.isValidTimeString(timeString)) {
                this.$set(this.errors, 'timelineEndTime', TIMESTRING_ERROR);
            } else {
                this.$set(this.errors, 'timelineEndTime', undefined);
            }

            this.timelineEndTime = timeString;
        },
        getUrlToTimeline() {
            const { protocol, host } = window.location;
            return `${protocol}//${host}/${HASH_TO_TIMELINE}`;
        }
    },
    // Vue doesn't have an onDestroy life cycle method.
    mounted() {
        const session = Boolean(localStorage.getItem('apres_session'));

        this.getGlobalAttributes().then(this.getProjectsList);


        if (session === true) {
            this.initializeApp();
        } else {
            this.isLoading = false;
        }
    }
}
</script>
