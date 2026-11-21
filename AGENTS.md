# Agents

This kit is built on `@ui-sdk/core` and `@ui-sdk/web` at the version pinned in `package.json`. Read `node_modules/@ui-sdk/web/docs/llms.txt` before changing a primitive, a part, or a token. Import public entries only. Do not read `dist/*.js` to learn an API.

Interactive tags re-register SDK primitives. Editorial tags are `definePrimitive` parts in `src/primitives.ts`, registered in `src/register.ts`. Style with `[data-slot]` in `src/theme.css`. A root's slot is the primitive name; every other slot is `name-slot`.

`ra-toggle-group` keeps its full api, including `internal`, in a `WeakMap` filled from the owner `render` hook. `instanceOf` is not a public export, and importing it from a second copy of the adapter cannot see the group.
