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

	foreach ( $defaults as $slug => $data ) {
		if ( ! isset( $additional_apps[ $slug ] ) ) {
			$additional_apps[ $slug ] = $data;
			$changed                  = true;
		} elseif (
			// Existing installs stored the default before it had tile colours:
			// add them as long as the icon itself is still the default one.
			! isset( $additional_apps[ $slug ]['icon_background'] )
			&& isset( $additional_apps[ $slug ]['dashicon'] )
			&& $additional_apps[ $slug ]['dashicon'] === $data['dashicon']
		) {
			foreach ( array( 'icon_background', 'icon_color', 'icon_shadow' ) as $style_key ) {
				$additional_apps[ $slug ][ $style_key ] = $data[ $style_key ];
			}
			$changed = true;
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
