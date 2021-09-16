<template>
    <div style="display: flex; justify-content: center;">
        <div 
            v-if="!openmctStarted"
            style="display: flex; flex-direction: column; justify-content: center;"
        >
            <h1>Welcome to APRES</h1>
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
import apresStateChronicle from '../apresStateChronicle/plugin';
import apresSessionIndicator from '../apresSessionIndicator/plugin';
import config from '../../apresConfig.js';
import domainObjectUtil from '../lib/domainObjectUtil';

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
            globalAttributes: undefined
        }
    },
    methods: {
        initializeApp() {
            const selectedProject = localStorage.getItem('apres_selected_project');

            if (selectedProject && selectedProject !== 'new') {
                this.getProjectDocs(selectedProject).then((projectJSON) => {

                    const mctObject = domainObjectUtil.getMctLocalStorageObject(projectJSON);
                    localStorage.setItem('mct', JSON.stringify(mctObject));

                    this.installDefaultPlugins();

                    openmct.install(apresActivities());
                    // openmct.install(apresStateChronicle());
                    openmct.install(apresTimeline());
                    openmct.install(apresDataset());
                    openmct.install(apresSessionIndicator())

                    this.openmctStarted = true;

                    localStorage.setItem('apres_session', true);
                    openmct.start(this.$refs.openmct);
                })
            }
        },
        installDefaultPlugins() {
            const THIRTY_SECONDS = 30 * 1000;
            const ONE_MINUTE = THIRTY_SECONDS * 2;
            const FIVE_MINUTES = ONE_MINUTE * 5;
            const FIFTEEN_MINUTES = FIVE_MINUTES * 3;
            const THIRTY_MINUTES = FIFTEEN_MINUTES * 2;
            const ONE_HOUR = THIRTY_MINUTES * 2;
            const TWO_HOURS = ONE_HOUR * 2;
            const ONE_DAY = ONE_HOUR * 24;

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
                        bounds: {
                            start: Date.now() - THIRTY_MINUTES,
                            end: Date.now()
                        },
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
        }
    }
}
</script>