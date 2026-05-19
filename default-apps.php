<?php
namespace My_Apps;

defined( 'ABSPATH' ) || exit;

function seed_default_apps() {
	$additional_apps = get_option( 'my_apps_additional_apps', array() );
	$sort            = get_option( 'my_apps_sort', array() );

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
		}
		if ( ! in_array( $slug, $sort, true ) ) {
			$sort[] = $slug;
		}
	}

	update_option( 'my_apps_additional_apps', $additional_apps );
	update_option( 'my_apps_sort', $sort );
}
