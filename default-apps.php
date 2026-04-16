<?php
namespace My_Apps;

function write_post( $apps ) {
	$apps['write_post'] = array(
		'name'     => 'New Post',
		'dashicon' => 'dashicons-welcome-write-blog',
		'url'      => admin_url( 'post-new.php' ),
	);

	return $apps;
}

function about( $apps ) {
	$welcome = get_page_by_path( 'welcome' );
	if ( $welcome && 'publish' === $welcome->post_status ) {
		$apps['about'] = array(
			'name'     => $welcome->post_title,
			'dashicon' => 'dashicons-info-outline',
			'url'      => get_permalink( $welcome ),
		);
	}

	return $apps;
}

add_filter( 'my_apps_plugins', __NAMESPACE__ . '\write_post' );
add_filter( 'my_apps_plugins', __NAMESPACE__ . '\about' );
