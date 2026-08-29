<?php
namespace My_Apps;

defined( 'ABSPATH' ) || exit;

/**
 * Seed the apps every user starts out with.
 *
 * These go into the site options on purpose: entries without a `user` key are
 * shared, and the site-level sort order is the fallback for users who have not
 * arranged their own home screen yet. Users who already have one keep it, and a
 * newly seeded app shows up at the end of their launcher.
 */
function default_apps() {
	return array(
		'what_can_i_do' => array(
			'name'            => 'What can I do?',
			'url'             => home_url( '/my-apps/?recipes' ),
			'dashicon'        => 'dashicons-lightbulb',
			'icon_url'        => false,
			'emoji'           => false,
			'gradient'        => false,
			'icon_background' => 'linear-gradient(135deg, #f7b733, #fc4a1a)',
			'icon_color'      => '#fff',
			'icon_shadow'     => true,
		),
	);
}

/**
 * Tile styling for a seeded app whose stored copy predates icon styling.
 *
 * Seeding only runs on activation, so an existing site keeps the record it
 * stored back then. As long as that record still shows the default Dashicon,
 * the default colours apply to it.
 *
 * @param string $slug Additional app slug.
 * @param array  $app  Stored app record.
 * @return array Zero or more of icon_background, icon_color, icon_shadow.
 */
function default_app_icon_style( $slug, $app ) {
	$defaults = default_apps();
	if ( ! isset( $defaults[ $slug ] ) || ! is_array( $app ) ) {
		return array();
	}
	foreach ( array( 'icon_background', 'icon_color', 'icon_shadow' ) as $key ) {
		if ( isset( $app[ $key ] ) ) {
			return array();
		}
	}
	if ( empty( $app['dashicon'] ) || $app['dashicon'] !== $defaults[ $slug ]['dashicon'] ) {
		return array();
	}
	return array_intersect_key( $defaults[ $slug ], array_flip( array( 'icon_background', 'icon_color', 'icon_shadow' ) ) );
}

function seed_default_apps() {
	$additional_apps = get_option( 'my_apps_additional_apps', array() );
	$sort            = get_option( 'my_apps_sort', array() );
	$changed         = false;
	$defaults        = default_apps();

	foreach ( $defaults as $slug => $data ) {
		if ( ! isset( $additional_apps[ $slug ] ) ) {
			$additional_apps[ $slug ] = $data;
			$changed                  = true;
		}
		if ( ! in_array( $slug, $sort, true ) ) {
			$sort[]  = $slug;
			$changed = true;
		}
	}

	if ( ! $changed ) {
		return;
	}

	update_option( 'my_apps_additional_apps', $additional_apps );
	update_option( 'my_apps_sort', $sort );
}
