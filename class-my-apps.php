<?php
namespace My_Apps;

/**
 * Class My_Apps
 */
class My_Apps {

	public function __construct() {
		add_action( 'init', array( $this, 'my_apps_endpoint' ) );
		add_filter( 'query_vars', array( $this, 'my_apps_query_vars' ) );
		add_filter( 'template_include', array( $this, 'my_apps_template' ) );
		add_action( 'wp_head', array( $this, 'admin_bar_css' ), 50 );
		add_action( 'admin_head', array( $this, 'admin_bar_css' ), 50 );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_menu' ), 1 );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_remove_nodes' ), 999 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'wp_enqueue_styles', array( $this, 'enqueue_styles' ) );
		add_action( 'admin_enqueue_styles', array( $this, 'enqueue_styles' ) );

		// AJAX handlers for launcher
		add_action( 'wp_ajax_my_apps_save_display_name', array( $this, 'ajax_save_display_name' ) );
		add_action( 'wp_ajax_my_apps_save_order', array( $this, 'ajax_save_order' ) );
		add_action( 'wp_ajax_my_apps_hide', array( $this, 'ajax_hide_app' ) );
		add_action( 'wp_ajax_my_apps_add', array( $this, 'ajax_add_app' ) );
		add_action( 'wp_ajax_my_apps_save_background', array( $this, 'ajax_save_background' ) );
		add_action( 'wp_ajax_my_apps_unhide', array( $this, 'ajax_unhide_app' ) );
		add_action( 'wp_ajax_my_apps_get_admin_menu', array( $this, 'ajax_get_admin_menu' ) );
		add_action( 'wp_ajax_my_apps_export', array( $this, 'ajax_export' ) );
		add_action( 'wp_ajax_my_apps_import', array( $this, 'ajax_import' ) );
	}

	public function enqueue_styles() {
		wp_enqueue_style( 'my-apps', plugin_dir_url( __FILE__ ) . 'style.css', array(), MY_APPS_VERSION );
	}

	public function admin_enqueue_scripts() {
		wp_enqueue_script( 'my-apps', plugin_dir_url( __FILE__ ) . 'admin.js', array( 'jquery' ), MY_APPS_VERSION, true );
		$this->enqueue_styles();
	}

	/**
	 * Ensure that the admin bar is also shown in the mobile view.
	 */
	public function admin_bar_css() {
		if ( ! is_admin_bar_showing() ) {
			return;
		}
		?>
		<style>
			#wpadminbar li#wp-admin-bar-my-apps a.ab-item span.ab-icon:before {
				line-height: 24px;
				font-size: 20px;
			}
			@media screen and (max-width: 782px) {
				#wpadminbar li#wp-admin-bar-my-apps {
					display: block;
				}
				#wpadminbar li#wp-admin-bar-my-apps a.ab-item span.ab-icon:before {
					font-size: 32px;
				}
			}
		</style>
		<?php
	}

	/**
	 * Add the My Apps menu item to the admin bar.
	 *
	 * @param mixed $wp_admin_bar The admin bar.
	 */
	public function admin_bar_menu( $wp_admin_bar ) {
		$wp_admin_bar->add_node(
			array(
				'id'    => 'my-apps',
				'title' => '<span class="ab-icon dashicons dashicons-grid-view"></span>',
				'href'  => home_url( '/my-apps/' ),
			)
		);
	}

	/**
	 * Remove noisy nodes from the admin bar.
	 *
	 * @param mixed $wp_admin_bar The admin bar.
	 */
	public function admin_bar_remove_nodes( $wp_admin_bar ) {
		foreach ( array( 'site-editor' ) as $node_id ) {
			$wp_admin_bar->remove_node( $node_id );
		}
	}

	/**
	 * Add the my-apps endpoint.
	 */
	public function my_apps_endpoint() {
		$existing_rules = get_option( 'rewrite_rules' );
		$rule = '^my-apps/?$';

		add_rewrite_rule( $rule, 'index.php?my_apps=1', 'top' );

		if ( empty( $existing_rules[ $rule ] ) ) {
			global $wp_rewrite;
			$wp_rewrite->flush_rules();
		}
	}

	/**
	 * Add the my_apps query var.
	 *
	 * @param array $query_vars The query vars.
	 * @return array The modifiedquery vars.
	 */
	public function my_apps_query_vars( $query_vars ) {
		$query_vars[] = 'my_apps';
		return $query_vars;
	}

	/**
	 * Load the my-apps template.
	 *
	 * @param string $template The template.
	 * @return string The modified template.
	 */
	public function my_apps_template( $template ) {
		global $wp_query;
		if ( isset( $wp_query->query_vars['my_apps'] ) ) {
			if ( is_user_logged_in() ) {
				$this->enqueue_launcher_assets();
				include plugin_dir_path( __FILE__ ) . 'templates/launcher.php';
				exit;
			} else {
				wp_safe_redirect( wp_login_url() );
				exit;
			}
		}
		return $template;
	}

	/**
	 * Enqueue launcher assets (scripts and styles).
	 */
	public function enqueue_launcher_assets() {
		$this->enqueue_styles();

		wp_enqueue_style( 'dashicons' );

		wp_enqueue_script(
			'sortablejs',
			plugin_dir_url( __FILE__ ) . 'sortable.min.js',
			array(),
			'1.15.6',
			true
		);

		wp_enqueue_script(
			'my-apps-launcher',
			plugin_dir_url( __FILE__ ) . 'launcher.js',
			array( 'sortablejs' ),
			MY_APPS_VERSION,
			true
		);

		wp_localize_script(
			'my-apps-launcher',
			'myAppsConfig',
			array(
				'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
				'nonce'        => wp_create_nonce( 'my_apps_launcher' ),
				'isPlayground' => defined( 'PLAYGROUND_AUTO_LOGIN_AS_USER' ),
				'displayName'  => wp_get_current_user()->display_name,
				'i18n'         => array(
					'fillAllFields' => __( 'Please fill in all fields', 'my-apps' ),
				),
			)
		);
	}

	/**
	 * AJAX: Save display name.
	 */
	public function ajax_save_display_name() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$name = isset( $_POST['display_name'] ) ? sanitize_text_field( wp_unslash( $_POST['display_name'] ) ) : '';

		if ( empty( $name ) ) {
			wp_send_json_error( 'Empty name' );
		}

		$user_id = get_current_user_id();
		wp_update_user( array(
			'ID'           => $user_id,
			'display_name' => $name,
		) );

		wp_send_json_success( array( 'display_name' => $name ) );
	}

	/**
	 * AJAX: Save app order.
	 */
	public function ajax_save_order() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$order = isset( $_POST['order'] ) ? json_decode( sanitize_text_field( wp_unslash( $_POST['order'] ) ), true ) : array();

		if ( ! is_array( $order ) ) {
			wp_send_json_error( 'Invalid order' );
		}

		$sort = array_map( 'sanitize_text_field', array_values( $order ) );
		update_option( 'my_apps_sort', $sort );
		wp_send_json_success();
	}

	/**
	 * AJAX: Hide an app.
	 */
	public function ajax_hide_app() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$slug = isset( $_POST['slug'] ) ? sanitize_text_field( wp_unslash( $_POST['slug'] ) ) : '';

		if ( empty( $slug ) ) {
			wp_send_json_error( 'Invalid slug' );
		}

		$hide_plugins = get_option( 'my_apps_hide_plugins', array() );
		if ( ! in_array( $slug, $hide_plugins, true ) ) {
			$hide_plugins[] = $slug;
			update_option( 'my_apps_hide_plugins', $hide_plugins );
		}

		wp_send_json_success();
	}

	/**
	 * AJAX: Save background preference.
	 */
	public function ajax_save_background() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$background = isset( $_POST['background'] ) ? sanitize_text_field( wp_unslash( $_POST['background'] ) ) : '';

		$valid_backgrounds = array(
			'gradient-purple', 'gradient-blue', 'gradient-green', 'gradient-orange',
			'gradient-pink', 'gradient-dark', 'gradient-sunset', 'gradient-ocean',
			'solid-gray', 'solid-blue', 'solid-green', 'solid-red', 'solid-purple', 'solid-dark',
		);

		if ( ! in_array( $background, $valid_backgrounds, true ) ) {
			wp_send_json_error( 'Invalid background' );
		}

		update_option( 'my_apps_background', $background );
		wp_send_json_success();
	}

	/**
	 * AJAX: Add a new app.
	 */
	public function ajax_add_app() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$name = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
		$url = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';
		$icon_url = isset( $_POST['icon_url'] ) ? esc_url_raw( wp_unslash( $_POST['icon_url'] ) ) : '';
		$dashicon = isset( $_POST['dashicon'] ) ? sanitize_text_field( wp_unslash( $_POST['dashicon'] ) ) : '';
		$emoji = isset( $_POST['emoji'] ) ? sanitize_text_field( wp_unslash( $_POST['emoji'] ) ) : '';
		$gradient = isset( $_POST['gradient'] ) ? sanitize_text_field( wp_unslash( $_POST['gradient'] ) ) : '';

		if ( empty( $name ) || empty( $url ) ) {
			wp_send_json_error( 'Name and URL are required' );
		}

		if ( empty( $icon_url ) && empty( $dashicon ) && empty( $emoji ) && empty( $gradient ) ) {
			wp_send_json_error( 'An icon is required' );
		}

		$additional_apps = get_option( 'my_apps_additional_apps', array() );

		$slug = 'custom-' . sanitize_title( $name ) . '-' . count( $additional_apps );

		$new_app = array(
			'name'     => $name,
			'url'      => $url,
			'icon_url' => $icon_url ?: false,
			'dashicon' => $dashicon ?: false,
			'emoji'    => $emoji ?: false,
			'gradient' => $gradient ?: false,
			'user'     => get_current_user_id(),
		);

		$additional_apps[ $slug ] = $new_app;
		update_option( 'my_apps_additional_apps', $additional_apps );

		// Give the new app a sort position at the end.
		$sort = get_option( 'my_apps_sort', array() );
		$sort[] = $slug;
		update_option( 'my_apps_sort', $sort );

		wp_send_json_success(
			array(
				'slug'     => $slug,
				'name'     => $name,
				'url'      => $url,
				'icon_url' => $icon_url ?: null,
				'dashicon' => $dashicon ?: null,
				'emoji'    => $emoji ?: null,
			)
		);
	}

	/**
	 * AJAX: Get admin menu structure for the launcher.
	 */
	public function ajax_get_admin_menu() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		global $menu, $submenu, $_wp_menu_nopriv, $_wp_submenu_nopriv, $_registered_pages, $_parent_pages;

		// Menu isn't loaded during AJAX, so we need to trigger it
		if ( empty( $menu ) ) {
			global $pagenow;

			// Initialize required globals before including any menu files
			$menu = array();
			$submenu = array();
			$_wp_menu_nopriv = array();
			$_wp_submenu_nopriv = array();
			$_registered_pages = array();
			$_parent_pages = array();

			// Load required admin includes
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
			require_once ABSPATH . 'wp-admin/includes/screen.php';
			require_once ABSPATH . 'wp-admin/includes/class-wp-screen.php';

			// Set up screen
			set_current_screen( 'dashboard' );

			// Set $pagenow to a valid admin page so that
			// user_can_access_admin_page() in menu.php doesn't wp_die().
			$orig_pagenow = $pagenow;
			$pagenow = 'index.php';

			// Build the admin menu - this populates $menu and $submenu
			// and fires admin_menu action for plugins.
			// Wrap in try/catch because some plugins register admin_menu
			// callbacks that aren't fully loaded during AJAX context.
			try {
				require ABSPATH . 'wp-admin/menu.php';
			} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
				// Menu was partially built, continue with what we have.
			}

			$pagenow = $orig_pagenow;
		}

		$menu_data = array();

		if ( ! is_array( $menu ) ) {
			wp_send_json_success( $menu_data );
		}

		foreach ( $menu as $position => $item ) {
			if ( empty( $item[0] ) || empty( $item[2] ) ) {
				continue;
			}

			// Skip separators
			if ( ! empty( $item[4] ) && strpos( $item[4], 'wp-menu-separator' ) !== false ) {
				continue;
			}

			// Check capability
			if ( ! empty( $item[1] ) && ! current_user_can( $item[1] ) ) {
				continue;
			}

			$menu_slug = $item[2];
			$menu_name = wp_strip_all_tags( $item[0] );
			$menu_icon = ! empty( $item[6] ) ? $item[6] : 'dashicons-admin-generic';

			// Handle special icon values
			if ( 'none' === $menu_icon || 'div' === $menu_icon ) {
				$menu_icon = 'dashicons-admin-generic';
			}

			// Build URL
			if ( strpos( $menu_slug, '.php' ) !== false ) {
				$menu_url = admin_url( $menu_slug );
			} else {
				$menu_url = admin_url( 'admin.php?page=' . $menu_slug );
			}

			$menu_entry = array(
				'name'     => $menu_name,
				'url'      => $menu_url,
				'dashicon' => $menu_icon,
				'children' => array(),
			);

			// Get submenus
			if ( ! empty( $submenu[ $menu_slug ] ) && is_array( $submenu[ $menu_slug ] ) ) {
				foreach ( $submenu[ $menu_slug ] as $sub_item ) {
					if ( empty( $sub_item[0] ) || empty( $sub_item[2] ) ) {
						continue;
					}

					// Check capability
					if ( ! empty( $sub_item[1] ) && ! current_user_can( $sub_item[1] ) ) {
						continue;
					}

					$sub_name = wp_strip_all_tags( $sub_item[0] );
					$sub_slug = $sub_item[2];

					// Build submenu URL
					if ( strpos( $sub_slug, '.php' ) !== false ) {
						$sub_url = admin_url( $sub_slug );
					} elseif ( strpos( $menu_slug, '.php' ) !== false ) {
						$sub_url = admin_url( $menu_slug . '?page=' . $sub_slug );
					} else {
						$sub_url = admin_url( 'admin.php?page=' . $sub_slug );
					}

					$menu_entry['children'][] = array(
						'name'     => $sub_name,
						'url'      => $sub_url,
						'dashicon' => $menu_icon,
					);
				}
			}

			$menu_data[] = $menu_entry;
		}

		wp_send_json_success( $menu_data );
	}

	/**
	 * AJAX: Unhide an app.
	 */
	public function ajax_unhide_app() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$slug = isset( $_POST['slug'] ) ? sanitize_text_field( wp_unslash( $_POST['slug'] ) ) : '';

		if ( empty( $slug ) ) {
			wp_send_json_error( 'Invalid slug' );
		}

		$hide_plugins = get_option( 'my_apps_hide_plugins', array() );
		$hide_plugins = array_filter( $hide_plugins, function( $s ) use ( $slug ) {
			return $s !== $slug;
		} );
		update_option( 'my_apps_hide_plugins', array_values( $hide_plugins ) );

		$apps = self::get_apps();
		if ( isset( $apps[ $slug ] ) ) {
			$app = $apps[ $slug ];
			wp_send_json_success(
				array(
					'slug'     => $slug,
					'name'     => $app['name'],
					'url'      => $app['url'],
					'icon_url' => ! empty( $app['icon_url'] ) ? $app['icon_url'] : null,
					'dashicon' => ! empty( $app['dashicon'] ) ? $app['dashicon'] : null,
					'emoji'    => ! empty( $app['emoji'] ) ? $app['emoji'] : null,
				)
			);
		}

		wp_send_json_success();
	}

	/**
	 * AJAX: Export settings.
	 */
	public function ajax_export() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not allowed' );
		}

		wp_send_json_success(
			array(
				'sort'            => get_option( 'my_apps_sort', array() ),
				'hide_plugins'    => get_option( 'my_apps_hide_plugins', array() ),
				'additional_apps' => get_option( 'my_apps_additional_apps', array() ),
				'background'      => get_option( 'my_apps_background', 'gradient-purple' ),
			)
		);
	}

	/**
	 * AJAX: Import settings.
	 */
	public function ajax_import() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not allowed' );
		}

		$data = isset( $_POST['data'] ) ? json_decode( sanitize_text_field( wp_unslash( $_POST['data'] ) ), true ) : null;

		if ( ! is_array( $data ) ) {
			wp_send_json_error( 'Invalid data' );
		}

		if ( isset( $data['sort'] ) && is_array( $data['sort'] ) ) {
			update_option( 'my_apps_sort', $data['sort'] );
		}
		if ( isset( $data['hide_plugins'] ) && is_array( $data['hide_plugins'] ) ) {
			update_option( 'my_apps_hide_plugins', $data['hide_plugins'] );
		}
		if ( isset( $data['additional_apps'] ) && is_array( $data['additional_apps'] ) ) {
			update_option( 'my_apps_additional_apps', $data['additional_apps'] );
		}
		if ( isset( $data['background'] ) && is_string( $data['background'] ) ) {
			update_option( 'my_apps_background', $data['background'] );
		}

		wp_send_json_success();
	}

	/**
	 * Get the apps to be displayed.
	 *
	 * @return array
	 */
	public static function get_apps() {
		/**
		 * Register your app here.
		 *
		 * The key is the plugin slug.
		 * The value is an array with the following keys:
		 * - name: The name of the app.
		 * - icon_url: The URL to the icon.
		 * - url: The URL to the app.
		 *
		 * @param array $apps The apps.
		 * @return array The modified apps.
		 *
		 * Example:
		 * ```php
		 * add_filter( 'my_apps_plugins', function( $apps ) {
		 *   $apps['plugin-slug'] = array(
		 *       'name' => 'Plugin Name',
		 *       'icon_url' => 'https://example.com/icon.png',
		 *       'url' => 'https://example.com/plugin-url',
		 *   );
		 *   return $apps;
		 * } );
		 * ```
		 */
		$registered_plugins = apply_filters( 'my_apps_plugins', array() );

		global $wp_filter;
		$plugins = \get_plugins();
		$which_app = array();
		foreach ( $wp_filter['my_apps_plugins'] as $priority => $callbacks ) {
			foreach ( $callbacks as $callback ) {

				if ( ! isset( $callback['function'] ) ) {
					continue;
				}

				$function = $callback['function'];
				if ( ! is_callable( $function ) ) {
					continue;
				}

				$which = 'unknown';
				if ( is_array( $function ) ) {
					if ( is_object( $function[0] ) ) {
						$reflection = new \ReflectionClass( $function[0] );
						$which = $reflection->getFileName();
					}
				} elseif ( is_string( $function ) ) {
					$reflection = new \ReflectionFunction( $function );
					$which = $reflection->getFileName();
				} elseif ( is_object( $function ) ) {
					if ( 'Closure' === get_class( $function ) ) {
						$reflection = new \ReflectionFunction( $function );
						$which = $reflection->getFileName();
					} else {
						$reflection = new \ReflectionClass( $function );
						$which = $reflection->getFileName();
					}
				}

				if ( str_ends_with( $which, '.php' ) ) {
					$which = ltrim( str_replace( WP_PLUGIN_DIR, '', $which ), '/' );
					$which = strtok( $which, '/' ) . '/';

					// Look up the plugin name from the file path via the plugins array.
					foreach ( $plugins as $plugin => $data ) {
						if ( str_starts_with( $plugin, $which ) ) {
							$which = $data;
							$which['slug'] = strtok( $plugin, '/' );
							break;
						}
					}
				}

				foreach ( $function( array() ) as $plugin => $data ) {
					$which_app[ $plugin ] = $which;
				}
			}
		}

		$plugins = array();
		foreach ( $registered_plugins as $plugin => $data ) {
			if ( ! isset( $data['url'], $data['name'] ) ) {
				continue;
			}
			if ( ! empty( $data['icon_url'] ) && ! empty( $data['dashicon'] ) && ! empty( $data['emoji'] ) ) {
				continue;
			}
			if ( isset( $which_app[ $plugin ] ) ) {
				$data['plugin'] = $which_app[ $plugin ];
			} else {
				$data['plugin'] = 'unknown';
			}

			$plugins[ $plugin ] = $data;
		}

		$additional_apps = get_option( 'my_apps_additional_apps', array() );
		foreach ( $additional_apps as $slug => $data ) {
			if ( ! isset( $data['url'], $data['name'] ) ) {
				continue;
			}
			if ( ! isset( $data['icon_url'] ) && ! isset( $data['dashicon'] ) && empty( $data['gradient'] ) && empty( $data['emoji'] ) ) {
				continue;
			}
			$data['plugin'] = 'unknown';
			if ( isset( $data['user'] ) ) {
				$u = get_user_by( 'ID', $data['user'] );
				if ( $u && ! is_wp_error( $u ) ) {
					$data['user'] = $u;
				} else {
					unset( $data['user'] );
				}
			}
			$plugins[ $slug ] = $data;
		}

		$hide_plugins = get_option( 'my_apps_hide_plugins', array() );
		foreach ( $hide_plugins as $plugin ) {
			$plugins[ $plugin ]['hide'] = true;
		}

		$sort = get_option( 'my_apps_sort', array() );
		// Support both array format [slug, slug, ...] and legacy hash {slug: position}
		if ( ! empty( $sort ) && ! isset( $sort[0] ) ) {
			// Legacy hash format — convert to array
			asort( $sort );
			$sort = array_keys( $sort );
			update_option( 'my_apps_sort', $sort );
		}
		$sort_index = array_flip( $sort );
		$max = count( $sort );
		uksort(
			$plugins,
			function ( $a, $b ) use ( $sort_index, $max ) {
				$sort_a = isset( $sort_index[ $a ] ) ? $sort_index[ $a ] : $max;
				$sort_b = isset( $sort_index[ $b ] ) ? $sort_index[ $b ] : $max;
				return $sort_a <=> $sort_b;
			}
		);

		return $plugins;
	}
}
