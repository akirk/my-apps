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
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'wp_enqueue_styles', array( $this, 'enqueue_styles' ) );
		add_action( 'admin_enqueue_styles', array( $this, 'enqueue_styles' ) );
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

	public function admin_menu() {
		add_options_page( 'My Apps', 'My Apps', 'manage_options', 'my-apps', array( $this, 'admin_page' ) );
		add_action( 'load-settings_page_my-apps', array( $this, 'process_admin' ) );
	}

	public function process_admin() {
		if ( isset( $_POST['_wpnonce'] ) && ! check_admin_referer( 'my-apps' ) ) {
			wp_die( esc_html__( 'Invalid nonce', 'my-apps' ) );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( isset( $_POST['my_apps_plugins'] ) && ! empty( $_POST['my_apps_hide_plugins'] ) ) {
			// We sanitize each item of the array.
			$sort = array_map( 'sanitize_text_field', array_flip( wp_unslash( $_POST['my_apps_plugins'] ) ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			update_option( 'my_apps_sort', $sort );

			// We sanitize each item of the array.
			$hide_plugins = array_map( 'sanitize_text_field', wp_unslash( $_POST['my_apps_hide_plugins'] ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$hide_plugins = array_diff( array_flip( $sort ), $hide_plugins );
			update_option( 'my_apps_hide_plugins', $hide_plugins );

			return;
		}

		if ( isset( $_POST['my_app_name'] ) && is_array( $_POST['my_app_name'] ) ) {
			$additional_apps = array();
			$keys = array_keys( wp_unslash( $_POST['my_app_name'] ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			foreach ( $keys as $i ) {
				$name = false;
				if ( isset( $_POST['my_app_name'][ $i ] ) ) {
					$name = sanitize_text_field( wp_unslash( $_POST['my_app_name'][ $i ] ) );
				}
				$url = false;
				if ( isset( $_POST['my_app_url'][ $i ] ) ) {
					$url = sanitize_text_field( wp_unslash( $_POST['my_app_url'][ $i ] ) );
				}

				$user = false;
				if ( isset( $_POST['my_app_user'][ $i ] ) ) {
					$user = sanitize_text_field( wp_unslash( $_POST['my_app_user'][ $i ] ) );
				}

				$icon_url = false;
				if ( ! empty( $_POST['my_app_icon_url'][ $i ] ) ) {
					$icon_url = sanitize_text_field( wp_unslash( $_POST['my_app_icon_url'][ $i ] ) );
				}

				$dashicon = false;
				if ( ! empty( $_POST['my_app_dashicon'][ $i ] ) ) {
					$dashicon = sanitize_text_field( wp_unslash( $_POST['my_app_dashicon'][ $i ] ) );
				}

				$emoji = false;
				if ( ! empty( $_POST['my_app_emoji'][ $i ] ) ) {
					$emoji = sanitize_text_field( wp_unslash( $_POST['my_app_emoji'][ $i ] ) );
				}

				if ( end( $keys ) === $i && isset( $_POST['icon_type'] ) ) {
					switch ( sanitize_text_field( wp_unslash( $_POST['icon_type'] ) ) ) {
						case 'icon':
							$dashicon = false;
							$emoji = false;
							break;
						case 'dashicon':
							$icon_url = false;
							$emoji = false;
							break;
						case 'emoji':
							$icon_url = false;
							$dashicon = false;
							break;
					}
				}

				if ( empty( $name ) || empty( $url ) || ( empty( $icon_url ) && empty( $dashicon ) && empty( $emoji ) ) ) {
					continue;
				}

				$additional_apps[] = array(
					'name'     => $name,
					'url'      => $url,
					'icon_url' => $icon_url,
					'dashicon' => $dashicon,
					'emoji'    => $emoji,
					'user'     => $user,
				);
			}

			update_option( 'my_apps_additional_apps', $additional_apps );
		}
	}


	public function admin_page() {
		wp_enqueue_script( 'plugin-install' );
		add_thickbox();
		wp_enqueue_script( 'updates' );

		$apps = self::get_apps();
		$additional_apps = get_option( 'my_apps_additional_apps', array() );
		$hide_plugins = get_option( 'my_apps_hide_plugins', array() );

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'My Apps', 'my-apps' ); ?></h1>
			<?php
				include __DIR__ . '/templates/admin-list-apps.php';
				include __DIR__ . '/templates/admin-additional-apps.php';
			?>
		</div>
		<?php
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
				$this->enqueue_styles();
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
		foreach ( $additional_apps as $data ) {
			if ( ! isset( $data['url'], $data['name'] ) ) {
				continue;
			}
			if ( ! isset( $data['icon_url'] ) && ! isset( $data['dashicon'] ) ) {
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
			$plugins[] = $data;
		}

		$hide_plugins = get_option( 'my_apps_hide_plugins', array() );
		foreach ( $hide_plugins as $plugin ) {
			$plugins[ $plugin ]['hide'] = true;
		}

		$sort = get_option( 'my_apps_sort', array() );
		uksort(
			$plugins,
			function ( $a, $b ) use ( $sort ) {
				$sort_a = 0;
				if ( isset( $sort[ $a ] ) ) {
					$sort_a = $sort[ $a ];
				}
				$sort_b = 0;
				if ( isset( $sort[ $b ] ) ) {
					$sort_b = $sort[ $b ];
				}
				return $sort_a <=> $sort_b;
			}
		);

		return $plugins;
	}
}
