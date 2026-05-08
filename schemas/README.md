# JSON Schemas

These schemas document the JSON shapes that My Apps reads at runtime.

| Schema | Payload |
| --- | --- |
| `apps.schema.json` | Remote `apps.json` catalog keyed by blueprint path. |
| `plugins.schema.json` | Remote `blueprints/my-wordpress/plugins.json` recommendations. |
| `recipes.schema.json` | Remote `blueprints/my-wordpress/recipes.json` recipe guides. |
| `my-apps-settings.schema.json` | `my-apps-settings.json` import/export payload. |

Blueprints are validated with the official WordPress Playground schema at `https://playground.wordpress.net/blueprint-schema.json`, published from [WordPress/wordpress-playground](https://github.com/WordPress/wordpress-playground/blob/trunk/packages/playground/blueprints/public/blueprint-schema.json).
