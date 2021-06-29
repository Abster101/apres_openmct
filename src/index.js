import openmct from 'openmct';
import apresTimeline from './timeline/plugin'
import apresActivities from './apresActivities/plugin';
import apresDataset from './apresDataset/plugin';
import apresStateChronicle from './apresStateChronicle/plugin';
import { activityTypes } from '../config/action_types';
<<<<<<< HEAD
=======
import {state_types} from "../config/state_types";
import apresLogin from './apresLogin/plugin';
>>>>>>> 267327c534f02a19378004f48af6ced1c021fd60

function initializeApp() {
    installDefaultPlugins();

    openmct.install(apresLogin());
    openmct.install(apresActivities(activityTypes));
    openmct.install(apresStateChronicle(activityTypes));
    openmct.install(apresTimeline());
    openmct.install(apresDataset());
    openmct.start();
}

function installDefaultPlugins() {
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
    openmct.install(openmct.plugins.SummaryWidget());
    openmct.install(openmct.plugins.Notebook());
    openmct.install(openmct.plugins.LADTable());
    openmct.install(openmct.plugins.Filters(['table', 'telemetry.plot.overlay']));
    openmct.install(openmct.plugins.ObjectMigration());
    openmct.install(openmct.plugins.ClearData(
        ['table', 'telemetry.plot.overlay', 'telemetry.plot.stacked'],
        {indicator: true}
    ));
    openmct.install(openmct.plugins.Timeline());
}

document.addEventListener('DOMContentLoaded', initializeApp);
