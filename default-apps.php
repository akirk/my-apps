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
function seed_default_apps() {
	$additional_apps = get_option( 'my_apps_additional_apps', array() );
	$sort            = get_option( 'my_apps_sort', array() );
	$changed         = false;

	$defaults = array(
		'what_can_i_do' => array(
			'name'     => 'What can I do?',
			'url'      => home_url( '/my-apps/?recipes' ),
			'dashicon' => 'dashicons-lightbulb',
			'icon_url' => false,
			'emoji'    => false,
			'gradient' => false,
		),
	);

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
