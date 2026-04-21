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
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_new_content_menu' ), 100 );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_remove_nodes' ), 999 );
		add_action( 'wp_footer', array( $this, 'admin_bar_quickadd_script' ) );
		add_action( 'admin_footer', array( $this, 'admin_bar_quickadd_script' ) );
		add_action( 'admin_footer', array( $this, 'cache_admin_menu' ), 1 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'wp_enqueue_styles', array( $this, 'enqueue_styles' ) );
		add_action( 'admin_enqueue_styles', array( $this, 'enqueue_styles' ) );

		// AJAX handlers for launcher
		add_action( 'wp_ajax_my_apps_dismiss_hint', array( $this, 'ajax_dismiss_hint' ) );
		add_action( 'wp_ajax_my_apps_save_display_name', array( $this, 'ajax_save_display_name' ) );
		add_action( 'wp_ajax_my_apps_save_order', array( $this, 'ajax_save_order' ) );
		add_action( 'wp_ajax_my_apps_hide', array( $this, 'ajax_hide_app' ) );
		add_action( 'wp_ajax_my_apps_add', array( $this, 'ajax_add_app' ) );
		add_action( 'wp_ajax_my_apps_save_background', array( $this, 'ajax_save_background' ) );
		add_action( 'wp_ajax_my_apps_unhide', array( $this, 'ajax_unhide_app' ) );
		add_action( 'wp_ajax_my_apps_delete', array( $this, 'ajax_delete_app' ) );
		add_action( 'wp_ajax_my_apps_get_admin_menu', array( $this, 'ajax_get_admin_menu' ) );
		add_action( 'wp_ajax_my_apps_get_recommended_plugins', array( $this, 'ajax_get_recommended_plugins' ) );
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
				content: "";
				display: inline-block;
				width: 20px;
				height: 20px;
				position: relative;
				top: 2px;
				background-color: currentColor;
				-webkit-mask: var(--my-apps-icon) no-repeat center / contain;
				mask: var(--my-apps-icon) no-repeat center / contain;
				--my-apps-icon: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M6 5.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM4 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm11-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM13 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V6zm5 8.5h-3a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5zM15 13a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3zm-9 1.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5zM4 15a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3z' fill-rule='evenodd' clip-rule='evenodd'/></svg>");
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
	 * AJAX: Persist the dismissal of the admin-bar hint.
	 */
	public function ajax_dismiss_hint() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );
		if ( ! is_user_logged_in() ) {
			wp_send_json_error();
		}
		update_user_meta( get_current_user_id(), 'my_apps_hint_dismissed', 1 );
		wp_send_json_success();
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
				'ajaxUrl'         => admin_url( 'admin-ajax.php' ),
				'nonce'           => wp_create_nonce( 'my_apps_launcher' ),
				'isPlayground'    => defined( 'PLAYGROUND_AUTO_LOGIN_AS_USER' ),
				'displayName'     => wp_get_current_user()->display_name,
				'deletableSlugs'  => array_keys( get_option( 'my_apps_additional_apps', array() ) ),
				'i18n'            => array(
					'fillAllFields' => __( 'Please fill in all fields', 'my-apps' ),
					'confirmDelete' => __( 'Delete this app? This cannot be undone.', 'my-apps' ),
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

		$user_id          = get_current_user_id();
		$previous_name    = wp_get_current_user()->display_name;

		wp_update_user( array(
			'ID'           => $user_id,
			'display_name' => $name,
		) );

		$current_blogname = get_option( 'blogname' );
		if ( 'My WordPress' === $current_blogname || $previous_name . "'s WordPress" === $current_blogname ) {
			update_option( 'blogname', $name . "'s WordPress" );
		}

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
	 * AJAX: Return the curated list of wp.org plugins, enriched with
	 * plugins_api data (icon, title, author, short_description) and
	 * cached per-slug in a transient.
	 */
	public function ajax_get_recommended_plugins() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$curated = $this->load_recommended_plugins_json();
		if ( empty( $curated ) ) {
			wp_send_json_success( array() );
		}

		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$out = array();
		foreach ( $curated as $key => $meta ) {
			$categories   = isset( $meta['categories'] ) && is_array( $meta['categories'] ) ? array_values( $meta['categories'] ) : array();
			$note         = isset( $meta['note'] ) ? (string) $meta['note'] : '';
			$landing_page = isset( $meta['landing_page'] ) && is_string( $meta['landing_page'] ) && 0 === strpos( $meta['landing_page'], '/' ) ? $meta['landing_page'] : '';

			// GitHub-hosted plugin: skip plugins_api, use metadata from JSON.
			if ( ! empty( $meta['github'] ) && preg_match( '#^[\w.-]+/[\w.-]+$#', $meta['github'] ) ) {
				$owner              = strtok( $meta['github'], '/' );
				$repo_key           = sanitize_title( $meta['github'] );
				$out[ 'github/' . $repo_key ] = array(
					'source'            => 'github',
					'repo'              => $meta['github'],
					'title'             => isset( $meta['title'] ) ? wp_strip_all_tags( $meta['title'] ) : $repo_key,
					'author'            => isset( $meta['author'] ) ? wp_strip_all_tags( $meta['author'] ) : $owner,
					'short_description' => '',
					'icon'              => ! empty( $meta['icon'] ) ? esc_url_raw( $meta['icon'] ) : '',
					'note'              => $note,
					'categories'        => $categories,
					'install_url'       => 'https://github.com/' . $meta['github'],
					'landing_page'      => $landing_page,
				);
				continue;
			}

			// Default: wp.org plugin keyed by slug.
			$slug = sanitize_key( $key );
			if ( '' === $slug ) {
				continue;
			}

			$info = $this->fetch_plugin_info( $slug );
			if ( ! $info ) {
				continue;
			}

			$icons = isset( $info['icons'] ) && is_array( $info['icons'] ) ? $info['icons'] : array();
			$icon  = '';
			foreach ( array( 'svg', '2x', '1x', 'default' ) as $size ) {
				if ( ! empty( $icons[ $size ] ) ) {
					$icon = $icons[ $size ];
					break;
				}
			}

			$out[ $slug ] = array(
				'source'            => 'wp.org',
				'slug'              => $slug,
				'title'             => isset( $info['name'] ) ? wp_strip_all_tags( $info['name'] ) : $slug,
				'author'            => isset( $info['author'] ) ? wp_strip_all_tags( $info['author'] ) : '',
				'short_description' => isset( $info['short_description'] ) ? wp_strip_all_tags( $info['short_description'] ) : '',
				'icon'              => $icon,
				'note'              => $note,
				'categories'        => $categories,
				'install_url'       => admin_url( 'plugin-install.php?tab=plugin-information&plugin=' . $slug ),
				'landing_page'      => $landing_page,
			);
		}

		wp_send_json_success( $out );
	}

	/**
	 * Load the shipped recommended-plugins.json. During development this is
	 * the authoritative source; later we may swap to a remote URL with this
	 * file as a local override.
	 *
	 * @return array
	 */
	private function load_recommended_plugins_json() {
		$file = plugin_dir_path( __FILE__ ) . 'recommended-plugins.json';
		if ( ! is_readable( $file ) ) {
			return array();
		}
		$raw = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$data = json_decode( $raw, true );
		return is_array( $data ) ? $data : array();
	}

	/**
	 * Call plugins_api() for a single slug and cache the result. Returns the
	 * response as an array, or null on failure.
	 *
	 * @param string $slug wp.org plugin slug.
	 * @return array|null
	 */
	private function fetch_plugin_info( $slug ) {
		$transient_key = 'my_apps_plugin_info_' . $slug;
		$cached        = get_transient( $transient_key );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$response = plugins_api(
			'plugin_information',
			array(
				'slug'   => $slug,
				'fields' => array(
					'short_description' => true,
					'icons'             => true,
					'sections'          => false,
					'tags'              => false,
					'compatibility'     => false,
					'contributors'      => false,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			set_transient( $transient_key, array( 'error' => true ), HOUR_IN_SECONDS );
			return null;
		}

		$info = (array) $response;
		set_transient( $transient_key, $info, 12 * HOUR_IN_SECONDS );
		return $info;
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
