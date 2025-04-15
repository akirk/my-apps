# My Apps

- Contributors: akirk
- Tags: apps
- Requires at least: 5.0
- Tested up to: 6.8
- License: GPL-2.0-or-later
- Stable tag: 1.0.0

A WordPress app launcher.

## Description

This plugin adds a `/my-apps/` route to your WordPress so that it can act as your personal apps launcher.

You can use your own WordPress as the place where you host apps in form of plugins. It can be hard to launch them since you have to navigate wp-admin. This adds a dashboard like an mobile phone launcher to your WordPress.

Plugin "Apps" can register their own icons but you can add your own links.

### Code Example

```php

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
```

## Screenshots

1. The Launcher
2. Settings

