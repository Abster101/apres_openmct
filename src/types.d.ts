/** Matches PlanningProjectSchema objects. */
interface PlanningProjectJson {
    planningProject: PlanningProject;
    configuration: PlanninProjectConfiguration;
    interfaceModel: {
        actionTypes: ActivityType[];
        modelConstants?: Array<{
            variable?: string;
            value?: string;
            units?: string;
        }>;
    };
}

interface PlanningProject {
    $schema: '../../../Schemas/PlanningProject.schema.json';
    projectInfo: {
        note?: string;
        author?: string;
        lastModDate?: string;
        projRef: string;
        modelRef: string;
        configRef: string;
        problemRef?: string;
    };
    activityPlan: {
        planStart: string;
        planEnd: string;
        actions: PlanningProjectAction[];
        processes: PlanningProjectProcess[];
        constraints?: Array<{
            note?: string;
            uuid: string;
            timepointA: {
                timepointType: string;
                enum: 'start' | 'end';
                instanceName: string;
                instanceID: string;
            };
            timepointB: {
                timepointType: string;
                enum: 'start' | 'end';
                instanceName: string;
                instanceID: string;
            };
            // ...TODO...
        }>;
    };
    simulationInfo?: SimulationInfo;
}

interface TimelineStateChronicle {
    name: string;
    chronicleType: string;
    timelineLegend: string;
    episodes: TimelineChronicleEpisode[];
}

interface TimelineNumericChronicle extends TimelineStateChronicle {
    endPoints: {
        min: number;
        max: number;
    };
    limits?: {
        minLimit?: number;
        maxLimit?: number;
    };
}

interface Chronicle {
    variable: string;
    episodes: ChronicleEpisode[];
}

interface ChronicleEpisode {
    time: string;
    value: string;
}

interface Violation {
    violationTime: string;
    violationType:
        | 'variable-bounds'
        | 'unsatisfied-condition'
        | 'violated-condition'
        | 'inconsistent-effect'
        | 'inconsistent-assignment'
        | 'duplicate-action'
        | 'temporal-constraint';
    violatedObj: TODO;
}

interface GlobalInfo {
    modelAttributes: GlobalModelAttributes;
    planningProjectSchema: TODO; // Not used at the moment
}

interface GlobalModelAttributes {
    actionAttributes: GlobalModelAttribute[];
    processAttributes: GlobalModelAttribute[];
}

interface PlanninProjectConfiguration {
    modelConfig: TimelineModelConfig[];
    numericChronicleConfig: TimelineNumericChronicleConfig[];
    stateChronicleConfig: TimelineStateChronicleConfig[];
}

interface ActivityType {
    name: string;
    /**
     * A string that contains a mathematical formula on how to calculate the
     * duration for an action of the given ActionType. Any time values are in
     * seconds. The duration formula itself can be a number value.
     */
    duration: string;
    parameters?: ActivityParameterType[];
}

interface ModelTypeObject {
    name: DataType;
    restrictRange?: BoundedNumberJson[];
    restictSet?: unknown[];
}

interface ActivityParameterType {
    name: string;
    units?: string;
    defaultVal?: string;
    modelType: ModelTypeObject;
}

interface GlobalModelAttribute {
    name: string;
    editable?: boolean;
    userRequired?: boolean;
    modelType?: DataType
}

interface TimelineModelAttribute {
    name: string;
    default: string;
    units?: string;
    editable?: boolean;
    userRequired?: boolean;
    modelType?: DataType | ModelTypeObject
}

type DataType = 'integer' | 'string' | 'rational' | '...';

interface PlanningProjectActivity {
    note?: string;
    uuid: string;
    parameters?: ActivityParameter[];
}

interface PlanningProjectAction extends PlanningProjectActivity {
    // name?: string; // some other workspace seems to have had "name"
    actionName: string;
    actionType: string;
    actionStart: string;
    actionEnd: string;
}

interface PlanningProjectProcess extends PlanningProjectActivity {
    processName: string;
    processType: string;
    processStart: string;
    processEnd: string;
}

interface SimulationInfo {
    stateChronicles?: Chronicle[];
    numericChronicles?: Chronicle[];
    violations?: Violation[];
}

interface ActivityParameter {
    name: string;
    value: string;
}

interface ActivityLayoutItem {
    activityType: string;
    fill: string;
    id: string;
    stroke: string;
    type: string;
}

interface TimelineModelConfig {
    actProcType: string;
    colorHex: string;
    textHexColor: string;
    timelineLegend: string;
}

interface TimelineChronicleEpisode extends ChronicleEpisode {
    colorHex: string;
    textColorHex: string;
    duration: number;
}

interface TimelineNumericChronicleConfig {
    varName: string;
    colorHex: string;
    minBound: string;
    maxBound: string;
    minLimit?: string;
    maxLimit?: string;
}

interface TimelineStateChronicleConfig {
    varName: string;
    stateColors?: Array<{
        stateVal?: string;
        colorHex: string;
        textColorHex: string;
        showText: boolean;
    }>;
}

interface BoundedNumberJson {
    lowerBound?: {
        lbType?: '>' | '>=';
        lbVal?: number;
    };
    upperBound?: {
        ubType?: '<' | '<=';
        ubVal?: number;
    };
}

interface Identifier {
    key: string;
    namespace: string;
}

interface NewProjectData {
    models: string[];
    problems: string[];
    configurations: string[];
}

interface TimelineDomainObject {
    configuration: TimelineConfig;
    identifier: { key: string; namespace: string };
    composition: string[];
    location: string;
    modified: number;
    created: number;
    name: string;
    type: string;
    notes?: string;
}

interface TimelineConfig {
    startTime: string;
    endTime: string;
    activities: Record<string, ActivityConfig>;
    processes: Record<string, ActivityConfig>;
    chronicles: TimelineStateChronicle[];
    violations: Violation[];
    projectInfo: TODO;
}

interface ActivityDomainObject {
    name?: string,
    type: 'apres.action.type',
    identifier: Identifier,
    cssClass: 'icon-activity',
    location: string,
    configuration: ActivityConfig
}

interface ActivityConfig {
    uuid: string;
    // name: actionJSON.actionName, // FIXED There is no .actionName property in the actionJSON object, but there is a .name
    name?: string;
    note?: string;
    activityType: string;
    type: string; // TODO use a union of known string values
    /** TODO: actionType can currently be undefined, but will be fixed in the backend. */
    actionTypeObject?: ActivityType;
    colorHex: string;
    timelineLegend: string;
    /**
     * Setting this startTime to null for new ActionConfigs signals for the
     * startTime to default to startTime of the timeline.
     * TODO: We should set the startTime to wherever in the timeline we drop a
     * new action.
     */
    startTime: string | null;
    endTime: string;
    parameters: ActivityParameter[];
    /** Duration in milliseconds. */
    duration: number;
    objectStyles: ObjectStyles;

    fill: string;
    id: string;
    stroke: string;
}

interface ObjectStyles {
    staticStyle: {
        // TODO import and use a CSSProperties type definition
        style: {
            backgroundColor: string,
            border: string,
            color: string
        }
    }
}

type TODO = any;
