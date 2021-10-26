// A simple declaration that gives us a default JSON type definition, and
// assumes that all our JSON files contain object values (not primitive values)
declare module '*.json' {
    const json: Record<string, any>
    export default json
}