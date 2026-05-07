<?php
namespace My_Apps;

defined( 'ABSPATH' ) || exit;

/**
 * Class My_Apps
 */
class My_Apps {
	const ICON_PATH = 'M6 5.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM4 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm11-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM13 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V6zm5 8.5h-3a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5zM15 13a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3zm-9 1.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5zM4 15a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3z';
	const CUSTOM_BACKGROUND = 'custom';
	const PRESET_BACKGROUNDS = array(
		'gradient-purple',
		'gradient-blue',
		'gradient-green',
		'gradient-orange',
		'gradient-pink',
		'gradient-dark',
		'gradient-sunset',
		'gradient-ocean',
		'solid-gray',
		'solid-blue',
		'solid-green',
		'solid-red',
		'solid-purple',
		'solid-dark',
	);
	const VALID_BACKGROUNDS = array(
		'gradient-purple',
		'gradient-blue',
		'gradient-green',
		'gradient-orange',
		'gradient-pink',
		'gradient-dark',
		'gradient-sunset',
		'gradient-ocean',
		'solid-gray',
		'solid-blue',
		'solid-green',
		'solid-red',
		'solid-purple',
		'solid-dark',
		self::CUSTOM_BACKGROUND,
	);

	public static function icon_svg() {
		return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="' .
			self::ICON_PATH .
			'" fill-rule="evenodd" clip-rule="evenodd"/></svg>';
	}

	public static function icon_data_uri() {
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- SVG data URI for Desktop Mode dock rendering.
		return 'data:image/svg+xml;base64,' . base64_encode( self::icon_svg() );
	}

	public function __construct() {
		add_action( 'init', array( $this, 'my_apps_endpoint' ) );
		add_filter( 'query_vars', array( $this, 'my_apps_query_vars' ) );
		add_filter( 'template_include', array( $this, 'my_apps_template' ) );
		add_action( 'wp_head', array( $this, 'admin_bar_css' ), 50 );
		add_action( 'admin_head', array( $this, 'admin_bar_css' ), 50 );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_menu' ), 1 );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_new_content_menu' ), 100 );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_remove_nodes' ), 999 );
		add_action( 'wp_footer', array( $this, 'admin_bar_quickadd_script' ) );
		add_action( 'admin_footer', array( $this, 'admin_bar_quickadd_script' ) );
		add_action( 'admin_footer', array( $this, 'cache_admin_menu' ), 1 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'wp_enqueue_styles', array( $this, 'enqueue_styles' ) );
		add_action( 'admin_enqueue_styles', array( $this, 'enqueue_styles' ) );
		add_action( 'wp_abilities_api_categories_init', array( $this, 'register_ability_categories' ) );
		add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );

		// AJAX handlers for launcher
		add_action( 'wp_ajax_my_apps_save_display_name', array( $this, 'ajax_save_display_name' ) );
		add_action( 'wp_ajax_my_apps_save_order', array( $this, 'ajax_save_order' ) );
		add_action( 'wp_ajax_my_apps_hide', array( $this, 'ajax_hide_app' ) );
		add_action( 'wp_ajax_my_apps_add', array( $this, 'ajax_add_app' ) );
		add_action( 'wp_ajax_my_apps_save_background', array( $this, 'ajax_save_background' ) );
		add_action( 'wp_ajax_my_apps_unhide', array( $this, 'ajax_unhide_app' ) );
		add_action( 'wp_ajax_my_apps_delete', array( $this, 'ajax_delete_app' ) );
		add_action( 'wp_ajax_my_apps_get_admin_menu', array( $this, 'ajax_get_admin_menu' ) );
		add_action( 'wp_ajax_my_apps_export', array( $this, 'ajax_export' ) );
		add_action( 'wp_ajax_my_apps_import', array( $this, 'ajax_import' ) );
		add_action( 'wp_ajax_my_apps_install_plugin', array( $this, 'ajax_install_plugin' ) );
	}

	public function enqueue_styles() {
		wp_enqueue_style( 'my-apps', plugin_dir_url( __FILE__ ) . 'style.css', array(), MY_APPS_VERSION );
	}

	public function admin_enqueue_scripts() {
		$this->enqueue_styles();
	}

	/**
	 * Register the My Apps ability category.
	 */
	public function register_ability_categories() {
		if ( ! function_exists( 'wp_register_ability_category' ) ) {
			return;
		}

		wp_register_ability_category(
			'my-apps',
			array(
				'label'       => __( 'My Apps', 'my-apps' ),
				'description' => __( 'Abilities for reading and customizing the My Apps launcher.', 'my-apps' ),
			)
		);
	}

	/**
	 * Register Abilities API actions for launcher customization.
	 */
	public function register_abilities() {
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		wp_register_ability(
			'my-apps/get-customization',
			array(
				'label'               => __( 'Get My Apps Customization', 'my-apps' ),
				'description'         => __( 'Returns the server-stored customization state for the My Apps launcher.', 'my-apps' ),
				'category'            => 'my-apps',
				'output_schema'       => self::customization_output_schema(),
				'execute_callback'    => array( $this, 'ability_get_customization' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'readonly'    => true,
						'destructive' => false,
						'idempotent'  => true,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'my-apps/set-background',
			array(
				'label'               => __( 'Set My Apps Background', 'my-apps' ),
				'description'         => __( 'Updates the My Apps launcher background preference.', 'my-apps' ),
				'category'            => 'my-apps',
				'input_schema'        => array(
					'type'                 => 'object',
					'required'             => array( 'background' ),
					'properties'           => array(
						'background' => array(
							'type'        => 'string',
							'description' => __( 'A preset background slug, image attachment ID, or remote image URL to sideload.', 'my-apps' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema'       => array(
					'type'                 => 'object',
					'required'             => array( 'background', 'valid_backgrounds' ),
					'properties'           => array(
						'background'        => array(
							'type'        => 'string',
							'description' => __( 'The selected launcher background slug.', 'my-apps' ),
						),
						'valid_backgrounds' => array(
							'type'        => 'array',
							'description' => __( 'Background slugs accepted by the launcher.', 'my-apps' ),
							'items'       => array(
								'type' => 'string',
								'enum' => self::PRESET_BACKGROUNDS,
							),
						),
						'custom_background' => array(
							'type'        => 'string',
							'description' => __( 'Custom CSS background value, when the selected background is custom.', 'my-apps' ),
						),
						'image_url'         => array(
							'type'        => 'string',
							'description' => __( 'The selected custom background image URL.', 'my-apps' ),
						),
						'attachment_id'     => array(
							'type'        => 'integer',
							'description' => __( 'The selected custom background image attachment ID, when available.', 'my-apps' ),
						),
					),
					'additionalProperties' => false,
				),
				'execute_callback'    => array( $this, 'ability_set_background' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'readonly'    => false,
						'destructive' => false,
						'idempotent'  => true,
					),
					'show_in_rest' => true,
				),
			)
		);
	}

	/**
	 * Permission callback for customization abilities.
	 *
	 * @return bool
	 */
	public function can_use_customization_abilities() {
		return is_user_logged_in();
	}

	/**
	 * Ability: get launcher customization.
	 *
	 * @return array
	 */
	public function ability_get_customization() {
		return self::customization_payload();
	}

	/**
	 * Ability: set launcher background.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 */
	public function ability_set_background( $input = array() ) {
		$background = is_array( $input ) && isset( $input['background'] ) ? (string) wp_unslash( $input['background'] ) : '';

		return self::save_background_value( $background );
	}

	/**
	 * Save a background value.
	 *
	 * Accepted values are preset slugs, numeric attachment IDs, or remote
	 * image URLs. Image values are stored as the custom background type.
	 *
	 * @param string $value Background value.
	 * @return array|\WP_Error
	 */
	private static function save_background_value( $value ) {
		$value = trim( (string) $value );

		if ( '' === $value ) {
			return new \WP_Error( 'my_apps_empty_background', __( 'No background provided.', 'my-apps' ) );
		}

		if ( in_array( $value, self::VALID_BACKGROUNDS, true ) ) {
			if ( self::CUSTOM_BACKGROUND === $value && '' === get_option( 'my_apps_background_custom', '' ) ) {
				return new \WP_Error( 'my_apps_invalid_background', __( 'Choose an image for the custom background.', 'my-apps' ) );
			}

			update_option( 'my_apps_background', $value );
			return self::current_background_payload();
		}

		if ( ctype_digit( $value ) ) {
			return self::save_attachment_background( absint( $value ) );
		}

		if ( preg_match( '#^https?://#i', $value ) ) {
			return self::save_sideloaded_background( $value );
		}

		return new \WP_Error( 'my_apps_invalid_background', __( 'Invalid background.', 'my-apps' ) );
	}

	/**
	 * Save a Media Library image attachment as the custom background.
	 *
	 * @param int $attachment_id Attachment post ID.
	 * @return array|\WP_Error
	 */
	private static function save_attachment_background( $attachment_id ) {
		if ( ! $attachment_id || 'attachment' !== get_post_type( $attachment_id ) || ! wp_attachment_is_image( $attachment_id ) ) {
			return new \WP_Error( 'my_apps_invalid_background_attachment', __( 'Invalid background image.', 'my-apps' ) );
		}

		$url = wp_get_attachment_image_url( $attachment_id, 'full' );
		if ( ! $url ) {
			return new \WP_Error( 'my_apps_invalid_background_attachment', __( 'Invalid background image.', 'my-apps' ) );
		}

		self::store_custom_background_image( $url, $attachment_id );
		return self::current_background_payload();
	}

	/**
	 * Sideload a remote image URL and save it as the custom background.
	 *
	 * @param string $url Remote image URL.
	 * @return array|\WP_Error
	 */
	private static function save_sideloaded_background( $url ) {
		if ( ! current_user_can( 'upload_files' ) ) {
			return new \WP_Error( 'my_apps_cannot_upload_background', __( 'Sorry, you are not allowed to upload images.', 'my-apps' ) );
		}

		$url = esc_url_raw( $url );
		if ( ! $url || ! wp_http_validate_url( $url ) ) {
			return new \WP_Error( 'my_apps_invalid_background_url', __( 'Invalid background image URL.', 'my-apps' ) );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$attachment_id = media_sideload_image( $url, 0, null, 'id' );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		return self::save_attachment_background( $attachment_id );
	}

	/**
	 * Store custom image background metadata.
	 *
	 * @param string $url           Image URL.
	 * @param int    $attachment_id Attachment post ID.
	 */
	private static function store_custom_background_image( $url, $attachment_id = 0 ) {
		$url = esc_url_raw( $url );

		update_option( 'my_apps_background', self::CUSTOM_BACKGROUND );
		update_option( 'my_apps_background_custom', self::image_background_css( $url ) );
		update_option( 'my_apps_background_image_url', $url );
		update_option( 'my_apps_background_attachment_id', absint( $attachment_id ) );
	}

	/**
	 * Build a safe CSS background value for a custom image URL.
	 *
	 * @param string $url Image URL.
	 * @return string
	 */
	private static function image_background_css( $url ) {
		$url = str_replace(
			array( '"', '\\', "\r", "\n" ),
			array( '%22', '%5C', '', '' ),
			esc_url_raw( $url )
		);

		return 'url("' . $url . '") center center / cover no-repeat fixed';
	}

	/**
	 * Get the currently stored background payload.
	 *
	 * @return array
	 */
	private static function current_background_payload() {
		$background = get_option( 'my_apps_background', 'gradient-dark' );
		$background = is_string( $background ) && in_array( $background, self::VALID_BACKGROUNDS, true ) ? $background : 'gradient-dark';

		$payload = array(
			'background'        => $background,
			'valid_backgrounds' => self::PRESET_BACKGROUNDS,
		);

		if ( self::CUSTOM_BACKGROUND === $background ) {
			$custom_bg     = get_option( 'my_apps_background_custom', '' );
			$image_url     = get_option( 'my_apps_background_image_url', '' );
			$attachment_id = absint( get_option( 'my_apps_background_attachment_id', 0 ) );

			if ( is_string( $custom_bg ) && '' !== $custom_bg ) {
				$payload['custom_background'] = $custom_bg;
			}
			if ( is_string( $image_url ) && '' !== $image_url ) {
				$payload['image_url'] = $image_url;
			}
			if ( $attachment_id ) {
				$payload['attachment_id'] = $attachment_id;
			}
		}

		return $payload;
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
				content: "";
				display: inline-block;
				width: 20px;
				height: 20px;
				position: relative;
				top: 2px;
				background-color: currentColor;
				-webkit-mask: var(--my-apps-icon) no-repeat center / contain;
				mask: var(--my-apps-icon) no-repeat center / contain;
				--my-apps-icon: url("<?php echo esc_attr( self::icon_data_uri() ); ?>");
			}
			@media screen and (max-width: 782px) {
				#wpadminbar li#wp-admin-bar-my-apps {
					display: block;
				}
				#wpadminbar li#wp-admin-bar-my-apps a.ab-item span.ab-icon:before {
					width: 32px;
					height: 32px;
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
				'title' => '<span class="ab-icon"></span><span class="screen-reader-text">' . esc_html__( 'My Apps', 'my-apps' ) . '</span>',
				'href'  => home_url( '/my-apps/' ),
				'meta'  => array(
					'title' => __( 'My Apps', 'my-apps' ),
				),
			)
		);
	}

	/**
	 * Inject an "App" entry into the admin bar's "+ New" menu.
	 *
	 * Runs after core has registered the `new-content` parent.
	 *
	 * @param mixed $wp_admin_bar The admin bar.
	 */
	public function admin_bar_new_content_menu( $wp_admin_bar ) {
		if ( ! is_user_logged_in() ) {
			return;
		}
		if ( ! $wp_admin_bar->get_node( 'new-content' ) ) {
			return;
		}
		$wp_admin_bar->add_node(
			array(
				'parent' => 'new-content',
				'id'     => 'new-my-apps-app',
				'title'  => __( 'App Icon', 'my-apps' ),
				'href'   => home_url( '/my-apps/?add=web-link' ),
				'meta'   => array(
					'title' => __( 'Add the current page as an app icon in My Apps', 'my-apps' ),
				),
			)
		);
	}

	/**
	 * Emit a tiny interceptor so clicking "+ New → App Icon" persists the
	 * current screen as an app via AJAX, then redirects to the launcher.
	 * On admin pages we resolve the current screen to the matching admin
	 * menu entry (same data the "Add Admin Link" flow would use); on the
	 * frontend we fall back to the document title and favicon. If JS is
	 * disabled the plain href falls back to opening the web-link form.
	 */
	public function admin_bar_quickadd_script() {
		if ( ! is_admin_bar_showing() || ! is_user_logged_in() ) {
			return;
		}
		$launcher = home_url( '/my-apps/' );
		$entry    = $this->resolve_current_admin_menu_entry();
		$config   = array(
			'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'my_apps_launcher' ),
			'launcher' => $launcher,
			'entry'    => $entry,
		);
		?>
		<script>
		(function() {
			var cfg = <?php echo wp_json_encode( $config ); ?>;
			document.addEventListener('click', function(e) {
				var link = e.target.closest('#wp-admin-bar-new-my-apps-app a');
				if (!link) return;
				e.preventDefault();

				var name, url, icon;
				if (cfg.entry) {
					name = cfg.entry.name;
					url = cfg.entry.url;
					icon = cfg.entry.dashicon || '';
				} else {
					name = document.title || window.location.hostname;
					url = window.location.href;
					var iconLink = document.querySelector('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
					icon = iconLink ? iconLink.href : (new URL('/favicon.ico', window.location.origin)).href;
				}

				var formData = new FormData();
				formData.append('action', 'my_apps_add');
				formData.append('nonce', cfg.nonce);
				formData.append('name', name);
				formData.append('url', url);
				if (icon && icon.indexOf('dashicons-') === 0) {
					formData.append('dashicon', icon);
				} else if (icon && (icon.indexOf('http') === 0 || icon.indexOf('data:') === 0)) {
					formData.append('icon_url', icon);
				} else {
					formData.append('emoji', '🔖');
				}

				fetch(cfg.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: formData })
					.finally(function() { window.location.href = cfg.launcher; });
			});
		})();
		</script>
		<?php
	}

	/**
	 * Coerce a raw WP admin menu icon value into something we can safely
	 * round-trip through URL params and esc_url_raw. Dashicons classes and
	 * http(s) URLs are kept as-is; anything else (including data: URIs, which
	 * esc_url_raw strips, and internal markers like "none"/"div") falls back
	 * to a generic dashicon.
	 *
	 * @param string $icon Raw icon value from $menu[...][6].
	 * @return string
	 */
	private function normalize_menu_icon( $icon ) {
		$icon = is_string( $icon ) ? trim( $icon ) : '';
		if ( '' === $icon || 'none' === $icon || 'div' === $icon ) {
			return 'dashicons-admin-generic';
		}
		if ( 0 === strpos( $icon, 'dashicons-' ) ) {
			return $icon;
		}
		if ( 0 === strpos( $icon, 'http://' ) || 0 === strpos( $icon, 'https://' ) ) {
			return $icon;
		}
		return 'dashicons-admin-generic';
	}

	/**
	 * Resolve the current admin request to the matching $menu/$submenu entry,
	 * using the same globals WordPress itself uses to highlight the active
	 * item ($parent_file, $submenu_file, $self, $plugin_page). Returns the
	 * entry in the same shape as ajax_get_admin_menu() produces, or null if
	 * we're not in admin or no match is found.
	 *
	 * @return array|null
	 */
	private function resolve_current_admin_menu_entry() {
		if ( ! is_admin() ) {
			return null;
		}

		global $menu, $submenu, $pagenow, $parent_file, $submenu_file, $self, $plugin_page;

		if ( ! is_array( $menu ) ) {
			return null;
		}

		$parent_item = null;
		$parent_slug = '';
		foreach ( $menu as $item ) {
			if ( empty( $item[2] ) ) {
				continue;
			}
			if ( ! empty( $item[4] ) && strpos( $item[4], 'wp-menu-separator' ) !== false ) {
				continue;
			}
			if ( ! empty( $item[1] ) && ! current_user_can( $item[1] ) ) {
				continue;
			}
			$slug = $item[2];
			if ( ( $parent_file && $slug === $parent_file )
				|| ( $self && $slug === $self )
				|| ( $pagenow && $slug === $pagenow ) ) {
				$parent_item = $item;
				$parent_slug = $slug;
				break;
			}
		}

		if ( ! $parent_item ) {
			return null;
		}

		$icon = $this->normalize_menu_icon( ! empty( $parent_item[6] ) ? $parent_item[6] : '' );

		if ( ! empty( $submenu[ $parent_slug ] ) && is_array( $submenu[ $parent_slug ] ) ) {
			foreach ( $submenu[ $parent_slug ] as $sub ) {
				if ( empty( $sub[0] ) || empty( $sub[2] ) ) {
					continue;
				}
				if ( ! empty( $sub[1] ) && ! current_user_can( $sub[1] ) ) {
					continue;
				}
				$sub_slug = $sub[2];
				$match    = ( $submenu_file && $sub_slug === $submenu_file )
					|| ( $plugin_page && $sub_slug === $plugin_page );
				if ( ! $match ) {
					continue;
				}
				if ( strpos( $sub_slug, '.php' ) !== false ) {
					$sub_url = admin_url( $sub_slug );
				} elseif ( strpos( $parent_slug, '.php' ) !== false ) {
					$sub_url = admin_url( $parent_slug . '?page=' . $sub_slug );
				} else {
					$sub_url = admin_url( 'admin.php?page=' . $sub_slug );
				}
				return array(
					'name'     => wp_strip_all_tags( $sub[0] ),
					'url'      => $sub_url,
					'dashicon' => $icon,
				);
			}
		}

		if ( strpos( $parent_slug, '.php' ) !== false ) {
			$url = admin_url( $parent_slug );
		} else {
			$url = admin_url( 'admin.php?page=' . $parent_slug );
		}

		return array(
			'name'     => wp_strip_all_tags( $parent_item[0] ),
			'url'      => $url,
			'dashicon' => $icon,
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

		$can_upload_media = current_user_can( 'upload_files' );
		if ( $can_upload_media ) {
			wp_enqueue_media();
		}

		$app_urls = array();
		foreach ( self::get_apps() as $app ) {
			if ( ! empty( $app['url'] ) ) {
				$app_urls[] = self::normalize_app_url( $app['url'] );
			}
		}

		$background_payload = self::current_background_payload();

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
				'ajaxUrl'                => admin_url( 'admin-ajax.php' ),
				'nonce'                  => wp_create_nonce( 'my_apps_launcher' ),
				'isPlayground'           => defined( 'PLAYGROUND_AUTO_LOGIN_AS_USER' ),
				'canInstallPlugins'      => current_user_can( 'install_plugins' ),
				'canUpdatePlugins'       => current_user_can( 'update_plugins' ),
				'canUploadMedia'         => $can_upload_media,
				'pluginInstallUrl'       => self_admin_url( 'plugin-install.php' ),
				'displayName'            => wp_get_current_user()->display_name,
				'deletableSlugs'         => array_keys( get_option( 'my_apps_additional_apps', array() ) ),
				'appUrls'                => array_values( array_unique( array_filter( $app_urls ) ) ),
				'installedPlugins'       => self::get_installed_plugin_statuses(),
				'background'             => $background_payload['background'],
				'customBackground'       => isset( $background_payload['custom_background'] ) ? $background_payload['custom_background'] : '',
				'backgroundImageUrl'     => isset( $background_payload['image_url'] ) ? $background_payload['image_url'] : '',
				'backgroundAttachmentId' => isset( $background_payload['attachment_id'] ) ? $background_payload['attachment_id'] : 0,
				'i18n'                   => array(
					'fillAllFields'         => __( 'Please fill in all fields', 'my-apps' ),
					'confirmDelete'         => __( 'Delete this app? This cannot be undone.', 'my-apps' ),
					'chooseBackgroundImage' => __( 'Choose Background Image', 'my-apps' ),
					'useBackgroundImage'    => __( 'Use as Background', 'my-apps' ),
					'mediaUnavailable'       => __( 'The media library is unavailable.', 'my-apps' ),
					'invalidBackgroundImage' => __( 'Please choose an image file.', 'my-apps' ),
				),
			)
		);
	}

	/**
	 * AJAX: Install and activate a wordpress.org plugin by slug.
	 */
	public function ajax_install_plugin() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! current_user_can( 'install_plugins' ) && ! current_user_can( 'update_plugins' ) ) {
			wp_send_json_error(
				array(
					'errorMessage' => __( 'Sorry, you are not allowed to install plugins on this site.', 'my-apps' ),
				)
			);
		}

		$slug = isset( $_POST['slug'] ) ? sanitize_key( wp_unslash( $_POST['slug'] ) ) : '';
		if ( empty( $slug ) ) {
			wp_send_json_error(
				array(
					'errorMessage' => __( 'No plugin specified.', 'my-apps' ),
				)
			);
		}

		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

		$api = plugins_api(
			'plugin_information',
			array(
				'slug'   => $slug,
				'fields' => array(
					'sections' => false,
				),
			)
		);

		if ( is_wp_error( $api ) ) {
			wp_send_json_error(
				array(
					'slug'         => $slug,
					'errorMessage' => $api->get_error_message(),
				)
			);
		}

		$status            = install_plugin_install_status( $api );
		$already_installed = in_array( $status['status'], array( 'latest_installed', 'newer_installed', 'update_available' ), true );
		$updated           = false;

		if ( 'install' === $status['status'] ) {
			if ( ! current_user_can( 'install_plugins' ) ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'errorMessage' => __( 'Sorry, you are not allowed to install plugins on this site.', 'my-apps' ),
					)
				);
			}

			$skin     = new \WP_Ajax_Upgrader_Skin();
			$upgrader = new \Plugin_Upgrader( $skin );
			$result   = $upgrader->install( $api->download_link );

			if ( is_wp_error( $result ) ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'errorCode'    => $result->get_error_code(),
						'errorMessage' => $result->get_error_message(),
					)
				);
			} elseif ( is_wp_error( $skin->result ) ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'errorCode'    => $skin->result->get_error_code(),
						'errorMessage' => $skin->result->get_error_message(),
					)
				);
			} elseif ( $skin->get_errors()->has_errors() ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'errorMessage' => $skin->get_error_messages(),
					)
				);
			} elseif ( is_null( $result ) ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'errorCode'    => 'unable_to_connect_to_filesystem',
						'errorMessage' => __( 'Unable to connect to the filesystem. Please confirm your credentials.', 'my-apps' ),
					)
				);
			}

			wp_clean_plugins_cache();
			$status = install_plugin_install_status( $api );
		} elseif ( 'update_available' === $status['status'] ) {
			if ( ! current_user_can( 'update_plugins' ) ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'errorMessage' => __( 'Sorry, you are not allowed to update plugins on this site.', 'my-apps' ),
					)
				);
			}

			$plugin_file = ! empty( $status['file'] ) ? $status['file'] : $this->find_plugin_file_by_slug( $slug );
			if ( empty( $plugin_file ) ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'errorMessage' => __( 'The plugin is installed, but WordPress could not identify its main plugin file.', 'my-apps' ),
					)
				);
			}

			wp_update_plugins();

			$skin     = new \WP_Ajax_Upgrader_Skin();
			$upgrader = new \Plugin_Upgrader( $skin );
			$result   = $upgrader->bulk_upgrade( array( $plugin_file ) );

			if ( is_wp_error( $skin->result ) ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'plugin'       => $plugin_file,
						'errorCode'    => $skin->result->get_error_code(),
						'errorMessage' => $skin->result->get_error_message(),
					)
				);
			} elseif ( $skin->get_errors()->has_errors() ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'plugin'       => $plugin_file,
						'errorMessage' => $skin->get_error_messages(),
					)
				);
			} elseif ( is_array( $result ) && isset( $result[ $plugin_file ] ) ) {
				if ( is_wp_error( $result[ $plugin_file ] ) ) {
					wp_send_json_error(
						array(
							'slug'         => $slug,
							'plugin'       => $plugin_file,
							'errorCode'    => $result[ $plugin_file ]->get_error_code(),
							'errorMessage' => $result[ $plugin_file ]->get_error_message(),
						)
					);
				}

				$updated = true !== $result[ $plugin_file ];
			} elseif ( false === $result ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'plugin'       => $plugin_file,
						'errorCode'    => 'unable_to_connect_to_filesystem',
						'errorMessage' => __( 'Unable to connect to the filesystem. Please confirm your credentials.', 'my-apps' ),
					)
				);
			} elseif ( is_null( $result ) ) {
				wp_send_json_error(
					array(
						'slug'         => $slug,
						'plugin'       => $plugin_file,
						'errorCode'    => 'unable_to_connect_to_filesystem',
						'errorMessage' => __( 'Unable to connect to the filesystem. Please confirm your credentials.', 'my-apps' ),
					)
				);
			}

			wp_clean_plugins_cache();
			$status = install_plugin_install_status( $api );
		}

		$plugin_file = ! empty( $status['file'] ) ? $status['file'] : $this->find_plugin_file_by_slug( $slug );
		if ( empty( $plugin_file ) ) {
			wp_send_json_error(
				array(
					'slug'         => $slug,
					'errorMessage' => __( 'The plugin was installed, but WordPress could not identify its main plugin file.', 'my-apps' ),
				)
			);
		}

		$activated      = false;
		$already_active = is_plugin_active( $plugin_file );

		if ( ! $already_active ) {
			if ( current_user_can( 'activate_plugin', $plugin_file ) ) {
				$activation = activate_plugin( $plugin_file );
				if ( is_wp_error( $activation ) ) {
					wp_send_json_error(
						array(
							'slug'         => $slug,
							'plugin'       => $plugin_file,
							'errorMessage' => $activation->get_error_message(),
						)
					);
				}
				$activated = true;
			}
		}

		wp_send_json_success(
			array(
				'slug'             => $slug,
				'plugin'           => $plugin_file,
				'pluginName'       => isset( $api->name ) ? $api->name : $slug,
				'alreadyInstalled' => $already_installed,
				'activated'        => $activated,
				'alreadyActive'    => $already_active,
				'updated'          => $updated,
				'updateAvailable'  => 'update_available' === $status['status'],
				'status'           => $status['status'],
				'version'          => ! empty( $status['version'] ) ? $status['version'] : '',
			)
		);
	}

	/**
	 * Get installed plugin status keyed by directory slug for launcher UI.
	 *
	 * @return array
	 */
	private static function get_installed_plugin_statuses() {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$statuses = array();
		foreach ( get_plugins() as $plugin_file => $data ) {
			$slug = dirname( $plugin_file );
			if ( '.' === $slug ) {
				$slug = basename( $plugin_file, '.php' );
			}

			$statuses[ $slug ] = array(
				'plugin'          => $plugin_file,
				'name'            => isset( $data['Name'] ) ? $data['Name'] : $slug,
				'version'         => isset( $data['Version'] ) ? $data['Version'] : '',
				'active'          => is_plugin_active( $plugin_file ),
				'updateAvailable' => false,
				'newVersion'      => '',
			);
		}

		$update_plugins = get_site_transient( 'update_plugins' );
		if ( isset( $update_plugins->response ) ) {
			foreach ( (array) $update_plugins->response as $plugin_file => $plugin ) {
				$slug = ! empty( $plugin->slug ) ? $plugin->slug : dirname( $plugin_file );
				if ( ! isset( $statuses[ $slug ] ) ) {
					$statuses[ $slug ] = array(
						'plugin'  => $plugin_file,
						'name'    => $slug,
						'version' => '',
						'active'  => is_plugin_active( $plugin_file ),
					);
				}

				$statuses[ $slug ]['updateAvailable'] = true;
				$statuses[ $slug ]['newVersion']      = isset( $plugin->new_version ) ? $plugin->new_version : '';
			}
		}

		return $statuses;
	}

	/**
	 * Find the main plugin file inside an installed plugin directory.
	 *
	 * @param string $slug Plugin directory slug.
	 * @return string
	 */
	private function find_plugin_file_by_slug( $slug ) {
		$installed = get_plugins( '/' . $slug );
		if ( empty( $installed ) ) {
			return '';
		}

		$files = array_keys( $installed );
		$file  = reset( $files );
		return $file ? $slug . '/' . $file : '';
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

		$user_id          = get_current_user_id();
		$previous_name    = wp_get_current_user()->display_name;

		wp_update_user( array(
			'ID'           => $user_id,
			'display_name' => $name,
		) );

		$current_blogname = get_option( 'blogname' );
		$default_titles   = array( 'My WordPress', 'My WordPress Website', $previous_name . "'s WordPress" );
		$new_blogname     = null;
		if ( in_array( $current_blogname, $default_titles, true ) ) {
			$new_blogname = $name . "'s WordPress";
			update_option( 'blogname', $new_blogname );
		}

		wp_send_json_success(
			array(
				'display_name' => $name,
				'blogname'     => $new_blogname,
			)
		);
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

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Parsed and validated by save_background_value().
		$background = isset( $_POST['background'] ) ? (string) wp_unslash( $_POST['background'] ) : '';
		$result     = self::save_background_value( $background );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success( $result );
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
		$user_id         = get_current_user_id();
		$normalized_url  = self::normalize_app_url( $url );

		// De-dup: the launcher fires this AJAX optimistically the moment a
		// user clicks "Install", before knowing whether the blueprint
		// install succeeded. Repeated clicks (or retries after a failed
		// install) would otherwise leave duplicate icons. Match registered
		// apps globally, and user-added apps for the current user.
		foreach ( apply_filters( 'my_apps_plugins', array() ) as $existing_slug => $existing ) {
			if (
				isset( $existing['url'] )
				&& self::normalize_app_url( $existing['url'] ) === $normalized_url
			) {
				wp_send_json_success( self::app_response_payload( $existing_slug, $existing, $name, $url, true ) );
			}
		}

		foreach ( $additional_apps as $existing_slug => $existing ) {
			if (
				isset( $existing['url'] )
				&& self::normalize_app_url( $existing['url'] ) === $normalized_url
				&& ( ! isset( $existing['user'] ) || (int) $existing['user'] === (int) $user_id )
			) {
				wp_send_json_success( self::app_response_payload( $existing_slug, $existing, $name, $url, true ) );
			}
		}

		$slug = 'custom-' . sanitize_title( $name ) . '-' . count( $additional_apps );

		$new_app = array(
			'name'     => $name,
			'url'      => $url,
			'icon_url' => $icon_url ?: false,
			'dashicon' => $dashicon ?: false,
			'emoji'    => $emoji ?: false,
			'gradient' => $gradient ?: false,
			'user'     => $user_id,
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
				'gradient' => $gradient ?: null,
			)
		);
	}

	/**
	 * Snapshot $menu / $submenu on every admin page load so we can serve
	 * the AJAX admin-menu request with the same menu the user actually sees
	 * in wp-admin — including plugin entries that guard their registration
	 * with `! wp_doing_ajax()` and therefore wouldn't appear if we tried to
	 * rebuild the menu from within an AJAX request.
	 */
	public function cache_admin_menu() {
		global $menu, $submenu;
		if ( ! is_user_logged_in() || ! is_array( $menu ) || empty( $menu ) ) {
			return;
		}
		set_transient(
			'my_apps_admin_menu_' . get_current_user_id(),
			array(
				'menu'    => $menu,
				'submenu' => is_array( $submenu ) ? $submenu : array(),
			),
			HOUR_IN_SECONDS
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

		// Prefer the cached snapshot from the user's last admin visit —
		// that's the menu they actually saw in the sidebar.
		$cached = get_transient( 'my_apps_admin_menu_' . get_current_user_id() );
		if ( is_array( $cached ) && ! empty( $cached['menu'] ) ) {
			$menu    = $cached['menu'];
			$submenu = isset( $cached['submenu'] ) ? $cached['submenu'] : array();
		} elseif ( empty( $menu ) ) {
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

		// Follow WP's own rendering: iterate by position key, not insertion.
		ksort( $menu );

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
			$menu_icon = $this->normalize_menu_icon( ! empty( $item[6] ) ? $item[6] : '' );

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
				ksort( $submenu[ $menu_slug ] );
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
			$app      = $apps[ $slug ];
			$icon_url = ! empty( $app['icon_url'] ) ? $app['icon_url'] : null;
			$dashicon = ! empty( $app['dashicon'] ) ? $app['dashicon'] : null;
			$emoji    = ! empty( $app['emoji'] ) ? $app['emoji'] : null;
			$payload  = array(
				'slug'     => $slug,
				'name'     => $app['name'],
				'url'      => $app['url'],
				'icon_url' => $icon_url,
				'dashicon' => $dashicon,
				'emoji'    => $emoji,
			);
			if ( ! $icon_url && ! $dashicon && ! $emoji ) {
				$payload['letter_icon'] = self::letter_icon_data( $app['name'] );
			}
			wp_send_json_success( $payload );
		}

		wp_send_json_success();
	}

	/**
	 * AJAX: Delete a user-added app.
	 *
	 * Only custom apps (stored in my_apps_additional_apps) can be deleted — apps
	 * registered via the my_apps_plugins filter come from plugin code and would
	 * just reappear.
	 */
	public function ajax_delete_app() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$slug = isset( $_POST['slug'] ) ? sanitize_text_field( wp_unslash( $_POST['slug'] ) ) : '';

		if ( empty( $slug ) ) {
			wp_send_json_error( 'Invalid slug' );
		}

		$additional_apps = get_option( 'my_apps_additional_apps', array() );
		if ( ! isset( $additional_apps[ $slug ] ) ) {
			wp_send_json_error( 'App cannot be deleted' );
		}

		unset( $additional_apps[ $slug ] );
		update_option( 'my_apps_additional_apps', $additional_apps );

		$hide_plugins = get_option( 'my_apps_hide_plugins', array() );
		$hide_plugins = array_values( array_filter( $hide_plugins, function( $s ) use ( $slug ) {
			return $s !== $slug;
		} ) );
		update_option( 'my_apps_hide_plugins', $hide_plugins );

		$sort = get_option( 'my_apps_sort', array() );
		$sort = array_values( array_filter( $sort, function( $s ) use ( $slug ) {
			return $s !== $slug;
		} ) );
		update_option( 'my_apps_sort', $sort );

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

		$background_payload = self::current_background_payload();
		unset( $background_payload['valid_backgrounds'] );

		wp_send_json_success(
			array_merge(
				array(
					'sort'            => get_option( 'my_apps_sort', array() ),
					'hide_plugins'    => get_option( 'my_apps_hide_plugins', array() ),
					'additional_apps' => get_option( 'my_apps_additional_apps', array() ),
				),
				$background_payload
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

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Decoded below; supported keys are validated individually before saving.
		$data = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : null;

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
		if ( isset( $data['background'] ) && is_scalar( $data['background'] ) ) {
			if ( 'image' === $data['background'] && ! empty( $data['background_image_id'] ) ) {
				$background_result = self::save_background_value( (string) absint( $data['background_image_id'] ) );
				if ( is_wp_error( $background_result ) ) {
					wp_send_json_error( $background_result->get_error_message() );
				}
			} elseif ( self::CUSTOM_BACKGROUND === $data['background'] && ! empty( $data['custom_background'] ) ) {
				update_option( 'my_apps_background', self::CUSTOM_BACKGROUND );
				update_option( 'my_apps_background_custom', sanitize_text_field( $data['custom_background'] ) );
				update_option( 'my_apps_background_image_url', ! empty( $data['image_url'] ) ? esc_url_raw( $data['image_url'] ) : '' );
				update_option( 'my_apps_background_attachment_id', ! empty( $data['attachment_id'] ) ? absint( $data['attachment_id'] ) : 0 );
			} else {
				$background_result = self::save_background_value( (string) $data['background'] );
				if ( is_wp_error( $background_result ) ) {
					wp_send_json_error( $background_result->get_error_message() );
				}
			}
		}

		wp_send_json_success();
	}

	/**
	 * Build the output schema for launcher customization.
	 *
	 * @return array
	 */
	private static function customization_output_schema() {
		return array(
			'type'                 => 'object',
			'required'             => array( 'background', 'valid_backgrounds', 'sort', 'hidden', 'apps' ),
			'properties'           => array(
				'background'        => array(
					'type'        => 'string',
					'description' => __( 'The selected launcher background slug.', 'my-apps' ),
				),
				'custom_background' => array(
					'type'        => 'string',
					'description' => __( 'Custom CSS background value, when the selected background is custom.', 'my-apps' ),
				),
				'image_url'         => array(
					'type'        => 'string',
					'description' => __( 'The selected custom background image URL.', 'my-apps' ),
				),
				'attachment_id'     => array(
					'type'        => 'integer',
					'description' => __( 'The selected custom background image attachment ID, when available.', 'my-apps' ),
				),
				'valid_backgrounds' => array(
					'type'        => 'array',
					'description' => __( 'Preset background slugs accepted by the launcher background setter.', 'my-apps' ),
					'items'       => array(
						'type' => 'string',
						'enum' => self::PRESET_BACKGROUNDS,
					),
				),
				'sort'              => array(
					'type'        => 'array',
					'description' => __( 'Stored launcher app order as app slugs.', 'my-apps' ),
					'items'       => array(
						'type' => 'string',
					),
				),
				'hidden'            => array(
					'type'        => 'array',
					'description' => __( 'Stored hidden launcher app slugs.', 'my-apps' ),
					'items'       => array(
						'type' => 'string',
					),
				),
				'apps'              => array(
					'type'        => 'array',
					'description' => __( 'Apps available to the launcher with customization metadata.', 'my-apps' ),
					'items'       => array(
						'type'                 => 'object',
						'required'             => array( 'slug', 'name', 'url', 'source', 'hidden', 'deletable' ),
						'properties'           => array(
							'slug'      => array(
								'type'        => 'string',
								'description' => __( 'The launcher app slug.', 'my-apps' ),
							),
							'name'      => array(
								'type'        => 'string',
								'description' => __( 'The launcher app display name.', 'my-apps' ),
							),
							'url'       => array(
								'type'        => 'string',
								'description' => __( 'The launcher app URL.', 'my-apps' ),
							),
							'source'    => array(
								'type'        => 'string',
								'enum'        => array( 'registered', 'custom' ),
								'description' => __( 'Whether the app comes from plugin registration or launcher customization.', 'my-apps' ),
							),
							'hidden'    => array(
								'type'        => 'boolean',
								'description' => __( 'Whether the app is hidden from the launcher.', 'my-apps' ),
							),
							'deletable' => array(
								'type'        => 'boolean',
								'description' => __( 'Whether the app can be deleted from launcher customization.', 'my-apps' ),
							),
							'icon'      => array(
								'type'                 => 'object',
								'required'             => array( 'type', 'value' ),
								'properties'           => array(
									'type'       => array(
										'type'        => 'string',
										'enum'        => array( 'icon_url', 'dashicon', 'emoji', 'gradient', 'letter' ),
										'description' => __( 'The app icon representation type.', 'my-apps' ),
									),
									'value'      => array(
										'type'        => 'string',
										'description' => __( 'The app icon value.', 'my-apps' ),
									),
									'background' => array(
										'type'        => 'string',
										'description' => __( 'The generated letter icon background.', 'my-apps' ),
									),
								),
								'additionalProperties' => false,
							),
						),
						'additionalProperties' => false,
					),
				),
			),
			'additionalProperties' => false,
		);
	}

	/**
	 * Build the launcher customization payload.
	 *
	 * @return array
	 */
	private static function customization_payload() {
		$hidden          = (array) get_option( 'my_apps_hide_plugins', array() );
		$additional_apps = get_option( 'my_apps_additional_apps', array() );
		$launcher_apps   = self::get_apps();
		$sort            = get_option( 'my_apps_sort', array() );
		$apps            = array();

		$additional_apps = is_array( $additional_apps ) ? $additional_apps : array();

		if ( ! is_array( $sort ) ) {
			$sort = array();
		}

		foreach ( $launcher_apps as $slug => $app ) {
			$apps[] = self::customization_app_payload(
				$slug,
				$app,
				isset( $additional_apps[ $slug ] ),
				in_array( $slug, $hidden, true )
			);
		}

		return array_merge(
			self::current_background_payload(),
			array(
				'sort'   => array_values( array_map( 'sanitize_text_field', $sort ) ),
				'hidden' => array_values( array_map( 'sanitize_text_field', $hidden ) ),
				'apps'   => $apps,
			)
		);
	}

	/**
	 * Build a customization payload for a single app.
	 *
	 * @param string $slug App slug.
	 * @param array  $app App data.
	 * @param bool   $is_custom Whether the app is stored as an additional app.
	 * @param bool   $is_hidden Whether the app is hidden.
	 * @return array
	 */
	private static function customization_app_payload( $slug, $app, $is_custom, $is_hidden ) {
		return array(
			'slug'      => $slug,
			'name'      => isset( $app['name'] ) ? (string) $app['name'] : $slug,
			'url'       => isset( $app['url'] ) ? (string) $app['url'] : '',
			'source'    => $is_custom ? 'custom' : 'registered',
			'hidden'    => (bool) $is_hidden,
			'deletable' => (bool) $is_custom,
			'icon'      => self::customization_app_icon_payload( $app ),
		);
	}

	/**
	 * Build a normalized app icon payload.
	 *
	 * @param array $app App data.
	 * @return array
	 */
	private static function customization_app_icon_payload( $app ) {
		if ( ! empty( $app['icon_url'] ) ) {
			return array(
				'type'  => 'icon_url',
				'value' => (string) $app['icon_url'],
			);
		}

		if ( ! empty( $app['dashicon'] ) ) {
			return array(
				'type'  => 'dashicon',
				'value' => (string) $app['dashicon'],
			);
		}

		if ( ! empty( $app['emoji'] ) ) {
			return array(
				'type'  => 'emoji',
				'value' => (string) $app['emoji'],
			);
		}

		if ( ! empty( $app['gradient'] ) ) {
			return array(
				'type'  => 'gradient',
				'value' => (string) $app['gradient'],
			);
		}

		$letter_icon = self::letter_icon_data( isset( $app['name'] ) ? $app['name'] : '' );
		return array(
			'type'       => 'letter',
			'value'      => $letter_icon['letters'],
			'background' => $letter_icon['background'],
		);
	}

	/**
	 * Derive letters + deterministic HSL background for an app that didn't
	 * ship an icon. Single-word names get one letter; multi-word names get
	 * the first letter of each of the first two words.
	 *
	 * @param string $name App display name.
	 * @return array{letters:string,background:string}
	 */
	public static function letter_icon_data( $name ) {
		$name    = trim( wp_strip_all_tags( (string) $name ) );
		$words   = preg_split( '/[\s_\-]+/u', $name, -1, PREG_SPLIT_NO_EMPTY );
		if ( empty( $words ) ) {
			$letters = '?';
		} elseif ( count( $words ) >= 2 ) {
			$letters = mb_strtoupper( mb_substr( $words[0], 0, 1 ) . mb_substr( $words[1], 0, 1 ) );
		} else {
			$letters = mb_strtoupper( mb_substr( $words[0], 0, 1 ) );
		}

		// djb2-ish byte hash folded to 32 bits, for a hue in 0..359.
		$hash = 5381;
		$key  = strtolower( $name );
		$len  = strlen( $key );
		for ( $i = 0; $i < $len; $i++ ) {
			$hash = ( ( $hash * 33 ) + ord( $key[ $i ] ) ) & 0xFFFFFFFF;
		}
		$hue = $hash % 360;

		return array(
			'letters'    => $letters,
			'background' => 'hsl(' . $hue . ', 55%, 45%)',
			'hue'        => $hue,
		);
	}

	/**
	 * Render an SVG letter-based fallback icon. Using SVG with a 1:1
	 * viewBox guarantees the rendered tile is square regardless of any
	 * CSS cascade surprises.
	 *
	 * @param string $name      App display name.
	 * @param string $modifiers Extra CSS classes (e.g. 'app-letter-icon-small').
	 */
	public static function letter_icon_html( $name, $modifiers = '' ) {
		$data      = self::letter_icon_data( $name );
		$classes   = trim( 'app-letter-icon ' . $modifiers );
		$font_size = strlen( $data['letters'] ) > 1 ? 36 : 46;
		return sprintf(
			'<svg class="%1$s" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' .
				'<rect width="100" height="100" rx="22" ry="22" fill="%2$s"/>' .
				'<text x="50" y="50" fill="#fff" text-anchor="middle" dominant-baseline="central" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="600" font-size="%3$d">%4$s</text>' .
			'</svg>',
			esc_attr( $classes ),
			esc_attr( $data['background'] ),
			$font_size,
			esc_html( $data['letters'] )
		);
	}

	/**
	 * Normalize launcher URLs for duplicate detection.
	 *
	 * @param string $url App URL.
	 * @return string
	 */
	private static function normalize_app_url( $url ) {
		return untrailingslashit( esc_url_raw( $url ) );
	}

	/**
	 * Build the AJAX payload for an app.
	 *
	 * @param string $slug App slug.
	 * @param array  $app App data.
	 * @param string $fallback_name Fallback name.
	 * @param string $fallback_url Fallback URL.
	 * @param bool   $duplicate Whether this payload describes an existing app.
	 * @return array
	 */
	private static function app_response_payload( $slug, $app, $fallback_name = '', $fallback_url = '', $duplicate = false ) {
		$name    = isset( $app['name'] ) ? $app['name'] : $fallback_name;
		$payload = array(
			'slug'      => $slug,
			'name'      => $name,
			'url'       => isset( $app['url'] ) ? $app['url'] : $fallback_url,
			'icon_url'  => isset( $app['icon_url'] ) ? ( $app['icon_url'] ?: null ) : null,
			'dashicon'  => isset( $app['dashicon'] ) ? ( $app['dashicon'] ?: null ) : null,
			'emoji'     => isset( $app['emoji'] ) ? ( $app['emoji'] ?: null ) : null,
			'gradient'  => isset( $app['gradient'] ) ? ( $app['gradient'] ?: null ) : null,
			'duplicate' => $duplicate,
		);

		if (
			$name
			&& ! $payload['icon_url']
			&& ! $payload['dashicon']
			&& ! $payload['emoji']
			&& ! $payload['gradient']
		) {
			$payload['letter_icon'] = self::letter_icon_data( $name );
		}

		return $payload;
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
		$my_apps_filters = isset( $wp_filter['my_apps_plugins'] ) ? $wp_filter['my_apps_plugins'] : array();
		foreach ( $my_apps_filters as $priority => $callbacks ) {
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
