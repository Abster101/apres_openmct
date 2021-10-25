// A default type definition for all .vue files to give us at least some
// intellisense in editors that support TypeScript. It won't provide
// intellisense for custom props, only for APIs common to all Vue components.
//
// Based on this, we can imagine how to define `.d.ts` files for any specific
// .vue file if we want to have better types.
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
