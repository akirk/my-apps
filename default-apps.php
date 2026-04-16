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
	$apps['about'] = array(
		'name'     => 'About',
		'dashicon' => 'dashicons-info-outline',
		'url'      => home_url( '/welcome/' ),
	);

	return $apps;
}

add_filter( 'my_apps_plugins', __NAMESPACE__ . '\write_post' );
add_filter( 'my_apps_plugins', __NAMESPACE__ . '\about' );
