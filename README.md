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
- **Display settings** live in the launcher itself (no admin page): icon size, spacing, grid columns, layout toggle, and an optional personalized greeting. Settings are stored per-device while in edit mode.
- **App Store** for installing new apps: browse a curated catalog, view app detail pages, and install via WordPress Playground blueprints. Paste a custom blueprint JSON from the clipboard to install anything.
- **Auto-registered icons** after a blueprint install — if the installed plugin doesn't register its own icon, one is generated with a category-colored gradient.
- **Import/export** your launcher configuration from the settings dropdown.
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

## Screenshots

1. The Launcher
2. The App Store

