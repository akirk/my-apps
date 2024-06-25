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
		?><style>
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

	public function admin_menu() {
		add_options_page( 'My Apps', 'My Apps', 'manage_options', 'my-apps', array( $this, 'admin_page' ) );
		add_action( 'load-settings_page_my-apps', array( $this, 'process_admin' ) );
	}

	public function process_admin() {
		if ( ! isset( $_POST['my_apps_plugins'] ) || ! isset( $_POST['my_apps_hide_plugins'] ) ) {
			return;
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! check_admin_referer( 'my-apps' ) ) {
			return;
		}

		// We sanitize each item of the array.
		$sort = array_map( 'sanitize_text_field', array_flip( wp_unslash( $_POST['my_apps_plugins'] ) ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		update_option( 'my_apps_sort', $sort );

		// We sanitize each item of the array.
		$hide_plugins = array_map( 'sanitize_text_field', wp_unslash( $_POST['my_apps_hide_plugins'] ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$hide_plugins = array_diff( array_flip( $sort ), $hide_plugins );
		update_option( 'my_apps_hide_plugins', $hide_plugins );
	}


	public function admin_page() {
		wp_enqueue_script( 'plugin-install' );
		add_thickbox();
		wp_enqueue_script( 'updates' );

		$apps = self::get_apps();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'My Apps', 'my-apps' ); ?></h1>
			<p>
				<?php
				echo wp_kses(
					sprintf(
						// translators: %s: URL to the Launcher.
						__( 'Here you can configure the apps that are shown in the <a href=%s>My Apps launcher</a>.', 'my-apps' ),
						home_url( '/my-apps/' )
					),
					array( 'a' => array( 'href' => array() ) )
				);
				echo ' ';
				echo wp_kses(
					__( 'It can also be accessed with the icon on the top left <span class="dashicons dashicons-grid-view"></span>.', 'my-apps' ),
					array( 'span' => array( 'class' => array() ) )
				);
				echo ' ';
				echo wp_kses(
					sprintf(
						// translators: %s: URL to the Wiki.
						__( 'Apps can register themselves like <a href=%s>described in the Wiki</a>.', 'my-apps' ),
						'https://github.com/akirk/my-apps/wiki/my_apps_plugins'
					),
					array( 'a' => array( 'href' => array() ) )
				);
				?>
			</p>
			<form method="post">
				<?php wp_nonce_field( 'my-apps' ); ?>

				<table class="wp-list-table widefat fixed striped">
					<thead>
						<tr>
						<th class="checkbox"><?php echo esc_html_x( 'Show', 'Show the app', 'my-apps' ); ?></th>
						<th class="move"><?php echo esc_html_x( 'Move', 'Move the app', 'my-apps' ); ?></th>
						<th class="icon"><?php esc_html_e( 'Icon', 'my-apps' ); ?></th>
						<th class="app"><?php esc_html_e( 'App', 'my-apps' ); ?></th>
						<th class="plugin"><?php echo esc_html_x( 'Added by', 'Added by this plugin', 'my-apps' ); ?></th>
					</thead>
					<tbody>
							<?php foreach ( $apps as $plugin => $data ) : ?>
								<tr>
									<td>
										<input type="checkbox" name="my_apps_hide_plugins[]" value="<?php echo esc_attr( $plugin ); ?>" id="my_apps_hide_plugins_<?php echo esc_attr( $plugin ); ?>" <?php checked( ! in_array( $plugin, get_option( 'my_apps_hide_plugins', array() ) ) ); ?>>
									</td>
									<td>
									<input type="hidden" name="my_apps_plugins[]" value="<?php echo esc_attr( $plugin ); ?>">
									<button href="" class="move-up">&uarr;</button>
									<button href="" class="move-down">&darr;</button>
									</td>
									<td>
										<?php if ( isset( $data['icon_url'] ) ) : ?>
											<img src="<?php echo esc_attr( $data['icon_url'] ); ?>" alt='<?php echo esc_attr( $data['name'] ); ?>' width="24" height="24">
										<?php elseif ( isset( $data['dashicons'] ) ) : ?>
											<div class="dashicons <?php echo esc_attr( $data['dashicons'] ); ?>"></div>
										<?php endif; ?>
									</td>
									<td>
										<a href="<?php echo esc_url( $data['url'] ); ?>"><?php echo esc_html( $data['name'] ); ?></a>
									</td>
									<td class="plugin">
										<?php
										if ( isset( $data['plugin']['Name'] ) ) :
											$url = add_query_arg(
												array(
													'tab' => 'plugin-information',
													'plugin' => $data['plugin']['slug'],
													'TB_iframe' => true,
												),
												admin_url( 'plugin-install.php' )
											);

											?>
											<a href="<?php echo \esc_url_raw( $url ); ?>" class="thickbox open-plugin-details-modal plugin" target="_blank"><?php echo esc_html( $data['plugin']['Name'] ); ?></a>
										<?php else : ?>
											<?php esc_html_e( 'Unknown', 'my-apps' ); ?>
										<?php endif; ?>
									</td>
								</tr>
							<?php endforeach; ?>
					</tbody>
				</table>
				<?php submit_button(); ?>
			</form>
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
		$plugins = get_plugins();
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
			if ( ! isset( $data['icon_url'] ) && ! isset( $data['dashicons'] ) ) {
				continue;
			}
			if ( isset( $which_app[ $plugin ] ) ) {
				$data['plugin'] = $which_app[ $plugin ];
			} else {
				$data['plugin'] = 'unknown';
			}

			$plugins[ $plugin ] = $data;
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
