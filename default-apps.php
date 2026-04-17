<?php
namespace My_Apps;

function seed_default_apps() {
	$additional_apps = get_option( 'my_apps_additional_apps', array() );
	$sort            = get_option( 'my_apps_sort', array() );

	$defaults = array(
		'write_post' => array(
			'name'     => 'New Post',
			'url'      => admin_url( 'post-new.php' ),
			'dashicon' => 'dashicons-welcome-write-blog',
			'icon_url' => false,
			'emoji'    => false,
			'gradient' => false,
		),
		'all_posts'  => array(
			'name'     => 'All Posts',
			'url'      => admin_url( 'edit.php' ),
			'dashicon' => 'dashicons-admin-post',
			'icon_url' => false,
			'emoji'    => false,
			'gradient' => false,
		),
	);

	$welcome = get_page_by_path( 'welcome-to-your-wordpress' );
	if ( $welcome && 'publish' === $welcome->post_status ) {
		$defaults['about'] = array(
			'name'     => $welcome->post_title,
			'url'      => get_permalink( $welcome ),
			'dashicon' => 'dashicons-info-outline',
			'icon_url' => false,
			'emoji'    => false,
			'gradient' => false,
		);
	}

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
