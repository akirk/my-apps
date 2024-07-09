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

function settings( $apps ) {
	$apps['settings'] = array(
		'name'     => 'Settings',
		'dashicon' => 'dashicons-admin-settings',
		'url'      => admin_url( 'options-general.php?page=my-apps' ),
	);

	return $apps;
}

add_filter( 'my_apps_plugins', __NAMESPACE__ . '\write_post' );
add_filter( 'my_apps_plugins', __NAMESPACE__ . '\settings' );
