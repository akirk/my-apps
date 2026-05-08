# JSON Schemas

These schemas document the JSON shapes that My Apps reads at runtime.

| Schema | Payload |
| --- | --- |
| `app-catalog.schema.json` | Remote `apps.json` catalog keyed by blueprint path. |
| `curated-plugins.schema.json` | Remote `blueprints/my-wordpress/plugins.json` recommendations. |
| `recipes.schema.json` | Remote `blueprints/my-wordpress/recipes.json` recipe guides. |
| `playground-blueprint-consumed.schema.json` | WordPress Playground blueprint fields consumed by My Apps, including My Apps extensions such as `launcher_url` and `meta.screenshots`. |
| `custom-blueprints.schema.json` | Browser `my_apps_custom_blueprints` localStorage payload. |
| `my-apps-settings.schema.json` | `my-apps-settings.json` import/export payload. |

The WordPress Playground blueprint schema remains authoritative for complete blueprint validation. The local blueprint schema here is intentionally a companion schema for the fields this plugin reads and displays.
