# My Apps

- Contributors: akirk
- Tags: apps
- Requires at least: 5.0
- Tested up to: 7.0
- License: GPL-2.0-or-later
- Stable tag: 1.3.0

A WordPress app launcher.

## Description

This plugin adds a `/my-apps/` route to your WordPress so that it can act as your personal apps launcher — a dashboard that feels like a mobile phone home screen, so you don't have to navigate wp-admin to reach the apps you use.

Apps can be plugins that register their own icon, custom links you add yourself, or plugins you install on demand from the built-in app store.

### Features

- **Launcher** at `/my-apps/` with grid or flow layouts, drag-to-reorder, and an edit mode for customization.
- **Display settings** live in the launcher itself (no admin page): icon size, spacing, grid columns, layout toggle, background color/image, optional personalized greeting, and, in WordPress Playground, a default-on per-user redirect from `/` to `/my-apps/` plus a default-on simplified WordPress mode that hides legacy admin shortcuts, plugin recommendations, manual add links, and core WordPress guides behind a reveal button. Device-specific display settings are stored per-device while in edit mode, and app-level options live in a dedicated My Apps Settings window.
- **App Store** for installing new apps: browse a curated catalog, view app detail pages, and install via WordPress Playground blueprints. Paste a custom blueprint JSON from the clipboard to install anything.
- **Plugin-provided launcher icons**: installed apps appear in My Apps when the plugin registers through `my_apps_plugins`.
- **Mobile-friendly**: full-screen app store, three icons per row, and a My Apps link in the admin bar on the frontend.

### Adding an app from a plugin

Plugins can register their own launcher icon by filtering `my_apps_plugins`:

    add_filter( 'my_apps_plugins', function ( $apps ) {
        // Add your app to the array. These three keys are mandatory:
        $apps['friends'] = array(
            // Name: The name that will be displayed.
            'name'     => __( 'Friends', 'friends' ),
            // The icon as a URL. You can also use a local URL inside a plugin, using `plugins_url()`.
            'icon_url' => 'https://ps.w.org/friends/assets/icon-256x256.png',
            // The URL this should link to.
            'url'      => home_url( '/friends/' ),
        );
        return $apps;
    } );

### Temporarily adding an app from a blueprint

You can add your own app to the App Store by pasting a complete WordPress Playground `blueprint.json`. Open My Apps, choose Add, then paste the blueprint anywhere in the App Store. On mobile, focus the Search field and paste the blueprint there.

My Apps reads the blueprint's `meta.title`, `meta.description`, and `meta.author` fields to create the app-store entry. If the title matches an existing app, you can temporarily override that app with your pasted blueprint. Custom and modified blueprint entries are stored in this browser, appear in the Custom section, and can be removed or reverted from their badge in the App Store. When you paste multiple versions for the same entry, My Apps keeps a short version list so you can switch between them from the App Store.

To test App Store catalog, What can I do? guide, or plugin recommendation changes from another blueprints source without changing this plugin, paste a `WordPress/blueprints` PR number, a PR URL, or a GitHub fork branch URL anywhere in the App Store. On mobile, paste it into Search. Use the x next to the source indicator to return to the default catalog.

To test an app or plugin change from GitHub, paste a PR URL, commit URL, or PR changes URL for the repository installed by an existing app blueprint, such as `https://github.com/example-user/example-plugin/pull/117`, `https://github.com/example-user/example-plugin/commit/0123456789abcdef0123456789abcdef01234567`, or `https://github.com/example-user/example-plugin/pull/144/changes/fedcba9876543210fedcba9876543210fedcba98`. My Apps will point the matching blueprint or recommended GitHub plugin at the PR branch or commit. Reverting that modified entry also clears its pasted version list.

Example:

```json
{
	"$schema": "https://playground.wordpress.net/blueprint-schema.json",
	"meta": {
		"title": "My Custom App",
		"description": "Installs my custom WordPress app.",
		"author": "Your Name"
	},
	"landingPage": "/wp-admin/",
	"steps": [
		{
			"step": "installPlugin",
			"pluginData": {
				"resource": "wordpress.org/plugins",
				"slug": "gutenberg"
			}
		}
	]
}
```

### Short install links

For QR-code-friendly shares, link to the site root with `install=<app-slug>` or the shorter `i=<app-slug>`. My Apps redirects the request into `/my-apps/`, installs the matching App Store entry if needed, and opens the app's landing page with the remaining query parameters preserved.

Example:

```
https://my.wordpress.net/?i=wordcamp-companion&schedule=https%3A%2F%2Fexample.com%2Fschedule.json
```

`wordcamp-companion` resolves to `apps/wordcamp-companion.json`. You can also use `?install=1&app=wordcamp-companion` when an `app` parameter is easier to generate.

### Abilities API

When the WordPress Abilities API is available, My Apps registers a `my-apps` category with App Store search, What can I do? guide discovery, and launcher customization abilities:

- `my-apps/get-all` returns the full launcher state, including grouped background metadata, visible apps in display order, and app customization metadata.
- `my-apps/get-what-can-i-do` returns the default My Apps What can I do? guide catalog for questions like "what can I do?". It intentionally excludes browser-local custom blueprints and alternate App Store catalog sources; the backing catalog file remains `recipes.json`.
- `my-apps/search-app-store` searches or browses the default My Apps App Store catalog, including curated installable apps and optional curated plugin recommendations. It intentionally excludes browser-local custom blueprints and alternate App Store catalog sources.
- `my-apps/set-background` updates the launcher background using a preset slug, an image attachment ID, a remote image URL to sideload or use directly if sideloading fails, or a safe CSS color/gradient value.
- `my-apps/add-app` creates a custom app icon with a name, URL, and optional icon. Icons can be an image URL, Dashicon, emoji, gradient, generated letter tile, or the app URL's conventional `/favicon.ico`.
- `my-apps/set-app-details` renames an existing launcher app, changes its URL, or reverts those name/URL overrides.
- `my-apps/set-app-icon` updates or reverts the icon for an existing launcher app by slug.
- `my-apps/set-visible-ordered` sets the complete `visible_ordered` launcher app list; apps omitted from this list are hidden.
- `my-apps/set-app-visibility` hides or restores a launcher app by slug.

When the AI Assistant plugin is available, My Apps also registers domain hints so questions about the My Apps App Store, app catalog search/browsing, installable apps/plugins, What can I do? guides, what WordPress can do, the launcher, app icons, hidden apps, app order, and launcher backgrounds are routed to these abilities.

## Screenshots

1. The Launcher
   ![The Launcher](https://ps.w.org/my-apps/assets/screenshot-1.png)
2. Launcher settings: layout, icon size, spacing, and app-level options
   ![Launcher settings](https://ps.w.org/my-apps/assets/screenshot-2.png)
3. The App Store
   ![The App Store](https://ps.w.org/my-apps/assets/screenshot-3.png)
4. The What can I do? overview — curated multi-step guides for getting the most out of WordPress
   ![The What can I do? overview](https://ps.w.org/my-apps/assets/screenshot-4.png)
5. A What can I do? detail with numbered steps and one-click installs
   ![A What can I do? detail](https://ps.w.org/my-apps/assets/screenshot-5.png)
6. Another What can I do? detail — Bring Your Data In
   ![Another What can I do? detail](https://ps.w.org/my-apps/assets/screenshot-6.png)
7. Adding an admin link — browse and search all wp-admin menu items
   ![Adding an admin link](https://ps.w.org/my-apps/assets/screenshot-7.png)
8. Adding a web link with a custom emoji, image URL, or Dashicon
   ![Adding a web link](https://ps.w.org/my-apps/assets/screenshot-8.png)
