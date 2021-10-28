<template>
    <div 
        style="display: flex; justify-content: center; position: relative;"
    >
        <div 
            v-if="isLoading"
            style="height: 100vh; width: 100vw; position: absolute; z-index: 10001; background: white; display: flex; justify-content: center;"
        >
            <h1>Loading...</h1>
        </div>
        <div 
            v-if="!openmctStarted && !isLoading"
        >
            <h1>Welcome to APRES</h1>

            <div 
                v-if="!newProjectData"
                style="display: flex; flex-direction: column; justify-content: center;"
            >
                
                <div>
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
                <button 
                    @click="initializeApp"
                    style="margin-top: 20px;"
                >
                    Start
                </button>
            </div>

            <div v-else>
                <h2>Create a New Project</h2>
                <div style="margin-top: 20px;">
                    <label for="configuration">Configuration:</label>

                    <select 
                        name="configuration"
                        id="configuration"
                        @change="setSelectedConfiguration"
                    >
                        <option
                            v-for="(configuration, index) in newProjectData.configurations"
                            :key="index"
                            :value="configuration">{{ configuration }}</option>
                    </select>
                </div>
                <div style="margin-top: 20px;">
                    <label for="model">Model:</label>

                    <select 
                        name="model"
                        id="model"
                        @change="setSelectedModel"
                    >
                        <option
                            v-for="(model, index) in newProjectData.models"
                            :key="index"
                            :value="model">{{ model }}</option>
                    </select>
                </div>
                <div style="margin-top: 20px;">
                    <label for="problem">Problem:</label>

                    <select 
                        name="problem"
                        id="problem"
                        @change="setSelectedProblem"
                    >
                        <option
                            v-for="(problem, index) in newProjectData.problems"
                            :key="index"
                            :value="problem">{{ problem }}</option>
                    </select>
                </div>

                <div style="margin-top: 20px;">
                    <label for="author">Author:</label>
                    <input 
                        id="author"
                        @change="setAuthor"
                    />
                </div>

                <div style="margin-top: 20px;">
                    <label for="note">Note:</label>
                    <textarea 
                        id="note"
                        @change="setNote"
                    />
                </div>

                <div style="margin-top: 20px;">
                    <label for="project_name">Project Name:</label>
                    <input 
                        id="project_name"
                        @change="setProjectName"
                    />
                </div>

                <button 
                    @click="initializeNewProject"
                    style="margin-top: 20px;"
                >
                    Start
                </button>
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
import apresDataset from '../apresDataset/plugin';
import apresSessionIndicator from '../apresSessionIndicator/plugin';
import config from '../../apresConfig.js';
import domainObjectUtil from '../lib/domainObjectUtil';

const THIRTY_SECONDS = 30 * 1000;
const ONE_MINUTE = THIRTY_SECONDS * 2;
const FIVE_MINUTES = ONE_MINUTE * 5;
const FIFTEEN_MINUTES = FIVE_MINUTES * 3;
const THIRTY_MINUTES = FIFTEEN_MINUTES * 2;
const ONE_HOUR = THIRTY_MINUTES * 2;
const TWO_HOURS = ONE_HOUR * 2;
const ONE_DAY = ONE_HOUR * 24;

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
        }
    },
    data() {
        return {
            openmctStarted: false,
            projects: [],
            globalAttributes: undefined,
            isLoading: true,
            newProjectData: undefined
        }
    },
    methods: {
        initializeOpenMctProject(projectJSON) {
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

            this.installDefaultPlugins(timelineBounds);
            
            const actionAttributes = this.globalAttributes.modelAttributes && this.globalAttributes.modelAttributes.actionAttributes;

            openmct.install(apresActivities(actionAttributes));
            // openmct.install(apresStateChronicle());
            openmct.install(apresTimeline());
            openmct.install(apresDataset(projectJSON.configuration));
            openmct.install(apresSessionIndicator())

            localStorage.setItem('apres_session', true);
            
            this.openmctStarted = true;
            openmct.start(this.$refs.openmct);

            window.setTimeout(() => {
                this.isLoading = false;
            }, 2000);
        },
        initializeApp() {
            const selectedProject = localStorage.getItem('apres_selected_project');

            this.isLoading = true;

            if (selectedProject && selectedProject !== 'new') {
                return this.getProjectDocs(selectedProject).then(this.initializeOpenMctProject);
            }
            
            this.getNewProjectData().then((newProjectData) => {
                this.isLoading = false;
                this.newProjectData = newProjectData;

                this.configuration = newProjectData.configurations[0];
                this.model =  newProjectData.models[0];
                this.problem = newProjectData.problems[0];
            });
        },
        installDefaultPlugins(bounds) {
            [
                'example/eventGenerator'
            ].forEach(
                openmct.legacyRegistry.enable.bind(openmct.legacyRegistry)
            );

            openmct.install(openmct.plugins.LocalStorage());
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
                    resp.data.forEach((project) => {
                        this.projects.push(project);
                    });
                }
            })
        },
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
        getProjectDocs(projectName) {
            const projectUrl = `${config['apres_service_root_url']}/loadproject?projectname=${projectName}`

            return axios.get(projectUrl).then((resp) => {
                if (resp && resp.data) {
                    return resp.data;
                }
            })
        },
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
            this.projectName = event.target.value;
        },
        initializeNewProject() {
            const initNewProjectUrl = `${config['apres_service_root_url']}/initproject`;
            const payload = {
                $schema: "./PlanningProjectSchema.json",
                projectInfo: {
                    author: this.author,
                    note: this.note,
                    lastModDate: Date.now(),
                    projRef: this.projectName,
                    modelRef: this.model,
                    configRef: this.configuration,
                    problemRef: this.problem
                }
            };

            axios.post(initNewProjectUrl, payload)
                .then((resp) => {
                    if (resp && resp.data) {
                        this.initializeOpenMctProject(resp.data);
                    }
                })
                .catch((error) => console.log(error));
        }
    },
    onDestroy() {
        openmct.onDestroy();
    },
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