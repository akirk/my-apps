<?php
/*
Plugin Name: My Apps
Description: WordPress apps launcher
*/

class My_Apps {

	public function __construct() {
		add_action( 'init', array( $this, 'my_apps_endpoint' ) );
		add_filter( 'query_vars', array( $this, 'my_apps_query_vars' ) );
		add_filter( 'template_include', array( $this, 'my_apps_template' ) );
		// ensure that the icon is also shown in mobile view
		add_action( 'wp_head', array( $this, 'admin_bar_css' ), 50 );
		add_action( 'admin_head', array( $this, 'admin_bar_css' ), 50 );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_menu' ), 1 );
	}


	public function admin_bar_css() {
		?><style>
#wpadminbar li#wp-admin-bar-my-apps {
	margin-top: 2px;
}
@media screen and (max-width: 782px) {
	#wpadminbar li#wp-admin-bar-my-apps {
	display: block;
	}
}
</style>
					<?php
	}

	public function admin_bar_menu( $wp_admin_bar ) {
		$wp_admin_bar->add_node(
			array(
				'id'    => 'my-apps',
				'title' => '<span class="ab-icon dashicons dashicons-grid-view"></span>',
				'href'  => home_url( '/my-apps/' ),
			)
		);
	}

	public function my_apps_endpoint() {
		add_rewrite_rule( '^my-apps/?$', 'index.php?my_apps=1', 'top' );
	}

	public function my_apps_query_vars( $query_vars ) {
		$query_vars[] = 'my_apps';
		return $query_vars;
	}

	public function my_apps_template( $template ) {
		global $wp_query;
		if ( isset( $wp_query->query_vars['my_apps'] ) ) {
			if ( is_user_logged_in() ) {
				include plugin_dir_path( __FILE__ ) . 'templates/launcher.php';
				exit;
			} else {
				wp_redirect( wp_login_url() );
				exit;
			}
		}
		return $template;
	}

	public static function get_apps() {
		$plugins = array();
		foreach ( apply_filters( 'my_apps_plugins', array() ) as $plugin => $data ) {
			if ( ! isset( $data['icon_url'], $data['url'], $data['name'] ) ) {
				continue;
			}
			$plugins[ $plugin ] = $data;

		}
		ksort( $plugins );
		return $plugins;
	}
}

// Instantiate the class
new My_Apps();
