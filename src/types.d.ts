/** Matches PlanningProjectSchema objects. */
interface PlanningProjectJson {
    planningProject: {
        projectInfo: {
            note?: string
            author?: string
            lastModDate?: string
            projRef: string
            modelRef: string
            configRef: string
            problemRef?: string
        }
        activityPlan?: {
            planStart: string
            planEnd: string
            actions?: TimelineAction[]
            processes?: Array<{
                note?: string
                name?: string
                uuid: string
                processType: string
                processStart: string
                processEnd: string
                parameters?: Array<{
                    name: string
                    value: string
                }>
            }>
            constraints?: Array<{
                note?: string
                uuid: string
                timepointA: {
                    timepointType: string
                    enum: 'start' | 'end'
                    instanceName: string
                    instanceID: string
                }
                timepointB: {
                    timepointType: string
                    enum: 'start' | 'end'
                    instanceName: string
                    instanceID: string
                }
                // ...TODO...
            }>
            simulationInfo?: {
                chronicles?: Array<{
                    variable: string
                    episodes: {
                        time: string
                        value: string
                    }
                }>
                violations?: Array<{
                    violationTime: string
                    violationType:
                        | 'variable-bounds'
                        | 'unsatisfied-condition'
                        | 'violated-condition'
                        | 'inconsistent-effect'
                        | 'inconsistent-assignment'
                        | 'duplicate-action'
                        | 'temporal-constraint'
                    violatedObj: TODO
                }>
            }
        }
    }
    configuration: PlanninProjectConfiguration
    interfaceModel: {
        actionTypes: ActionType[]
        modelConstants?: Array<{
            variable?: string
            value?: string
            units?: string
        }>
    }
}

interface GlobalInfo {
    modelAttributes: GlobalModelAttributes
    planningProjectSchema: TODO // Not used at the moment
}

interface GlobalModelAttributes {
    actionAttributes: ActionAttribute[]
}

interface PlanninProjectConfiguration {
    modelConfig?: TimelineModelConfig[]
    numericChronicleConfig?: TimelineNumericChronicleConfig[]
    stateChronicleConfig?: TimelineStateChronicleConfig[]
}

interface ActionType {
    name: string
    /** A string that contains a mathematical formula on how to calculate the duration for an action of the given ActionType. */
    duration: string
    parameters?: ActionParameter[]
}

interface ActionParameter {
    name: string
    units?: string
    defaultVal?: string
    modelType: {
        name: DataType
        restrictRange?: BoundedNumberJson[]
        restictSet?: unknown[]
    }
}

interface ActionAttribute {
    name: string
    units?: string
    default?: TODO
    editable?: boolean
    userRequired?: boolean
    modelType?: {
        name: DataType
        restrictRange?: BoundedNumberJson
        restictSet?: unknown[]
    }
}

type DataType = 'integer' | 'string' | '...'

interface TimelineAction {
    note?: string
    name?: string
    uuid: string
    actionType: string
    actionStart: string
    actionEnd: string
    parameters?: TimelineParameter[]
}

interface TimelineParameter {
    name: string
    value: string
}

interface TimelineModelConfig {
    actProcType: string
    colorHex: string
    textHexColor: string
    timelineLegend: string
}

interface TimelineNumericChronicleConfig {
    varName: string
    colorHex: string
}

interface TimelineStateChronicleConfig {
    varName: string
    stateColors?: Array<{
        stateVal?: string
        colorHex: string
        textColorHex: string
        showText: boolean
    }>
}

interface BoundedNumberJson {
    lowerBound?: {
        lbType?: '>' | '>='
        lbVal?: number
    }
    upperBound?: {
        ubType?: '<' | '<='
        ubVal?: number
    }
}

interface Identifier {
    key: string
    namespace: string
}

interface NewProjectData {
    models: string[]
    problems: string[]
    configurations: string[]
}

interface TimelineChronicle {
    name: string
    timelineLegend: TODO
    episodes: TODO
}

type ActionConfig = ReturnType<typeof import('./lib/timelineUtil')['default']['getActionConfig']>

interface TimelineConfig {
    startTime: string
    endTime: string
    activities: Record<string, ActionConfig>
    chronicles: TimelineChronicle[]
    violations: TODO[]
    projectInfo: TODO
}

interface TimelineDomainObject {
    configuration: TimelineConfig
    identifier: { key: string }
    composition: string[]
    location: string
    modified: number
    created: number
    name: string
    type: string
    notes: string
}

interface ActionObject {
    id: string
    // ...TODO...
}

type TODO = any
