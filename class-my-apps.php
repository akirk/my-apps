<?php
namespace My_Apps;

defined( 'ABSPATH' ) || exit;

/**
 * Class My_Apps
 */
class My_Apps {
	const ICON_PATH = 'M6 5.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM4 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm11-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM13 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V6zm5 8.5h-3a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5zM15 13a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3zm-9 1.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5zM4 15a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3z';
	const CUSTOM_BACKGROUND = 'custom';
	const DEFAULT_RECIPES_URL = 'https://raw.githubusercontent.com/WordPress/blueprints/trunk/blueprints/my-wordpress/recipes.json';
	const APP_OVERRIDES_OPTION = 'my_apps_app_overrides';
	const APP_ICON_OVERRIDES_OPTION = 'my_apps_app_icon_overrides';
	const ROOT_REDIRECT_OPTION = 'my_apps_redirect_root';
	const PRESET_BACKGROUNDS = array(
		'gradient-dawn',
		'gradient-coral',
		'gradient-bloom',
		'gradient-meadow',
		'gradient-spring',
		'gradient-sunset',
		'gradient-dusk',
		'gradient-ember',
		'gradient-pine',
		'gradient-plum',
		'gradient-aurora',
		'gradient-midnight',
		'solid-butter',
		'solid-peach',
		'solid-blush',
		'solid-mauve',
		'solid-lilac',
		'solid-periwinkle',
		'solid-sky',
		'solid-mist',
		'solid-seafoam',
		'solid-sage',
		'solid-pistachio',
		'solid-paper',
		'solid-bone',
		'solid-linen',
		'solid-denim',
		'solid-terracotta',
		'solid-forest',
		'solid-iris',
		'solid-indigo',
		'solid-ink',
		'solid-snow',
	);
	const BACKGROUND_PRESET_CONFIG = array(
		'gradient-dawn'     => array(
			'group'      => 'gradient',
			'name'       => 'Dawn',
			'background' => 'linear-gradient(135deg, oklch(0.88 0.05 80), oklch(0.82 0.05 350))',
			'fg'         => 'dark',
		),
		'gradient-coral'    => array(
			'group'      => 'gradient',
			'name'       => 'Coral',
			'background' => 'linear-gradient(135deg, oklch(0.86 0.05 40), oklch(0.82 0.05 300))',
			'fg'         => 'dark',
		),
		'gradient-bloom'    => array(
			'group'      => 'gradient',
			'name'       => 'Bloom',
			'background' => 'linear-gradient(135deg, oklch(0.84 0.05 20), oklch(0.82 0.05 260))',
			'fg'         => 'dark',
		),
		'gradient-meadow'   => array(
			'group'      => 'gradient',
			'name'       => 'Meadow',
			'background' => 'linear-gradient(135deg, oklch(0.88 0.06 110), oklch(0.84 0.05 230))',
			'fg'         => 'dark',
		),
		'gradient-spring'   => array(
			'group'      => 'gradient',
			'name'       => 'Spring',
			'background' => 'linear-gradient(135deg, oklch(0.86 0.05 170), oklch(0.88 0.05 80))',
			'fg'         => 'dark',
		),
		'gradient-sunset' => array(
			'group'      => 'gradient',
			'name'       => 'Sunset',
			'background' => 'linear-gradient(135deg, oklch(0.88 0.05 80) 0%, oklch(0.84 0.05 20) 50%, oklch(0.82 0.05 300) 100%)',
			'fg'         => 'dark',
		),
		'gradient-dusk'     => array(
			'group'      => 'gradient',
			'name'       => 'Dusk',
			'background' => 'linear-gradient(135deg, oklch(0.82 0.05 260), oklch(0.35 0.05 250))',
			'fg'         => 'light',
		),
		'gradient-ember'    => array(
			'group'      => 'gradient',
			'name'       => 'Ember',
			'background' => 'linear-gradient(135deg, oklch(0.86 0.05 40), oklch(0.45 0.09 30))',
			'fg'         => 'light',
		),
		'gradient-pine'     => array(
			'group'      => 'gradient',
			'name'       => 'Pine',
			'background' => 'linear-gradient(135deg, oklch(0.86 0.05 140), oklch(0.40 0.07 160))',
			'fg'         => 'light',
		),
		'gradient-plum'     => array(
			'group'      => 'gradient',
			'name'       => 'Plum',
			'background' => 'linear-gradient(135deg, oklch(0.82 0.05 300), oklch(0.38 0.06 290))',
			'fg'         => 'light',
		),
		'gradient-aurora'   => array(
			'group'      => 'gradient',
			'name'       => 'Aurora',
			'background' => 'linear-gradient(135deg, oklch(0.88 0.06 110) 0%, oklch(0.82 0.05 260) 50%, oklch(0.40 0.06 290) 100%)',
			'fg'         => 'light',
		),
		'gradient-midnight' => array(
			'group'      => 'gradient',
			'name'       => 'Midnight',
			'background' => 'linear-gradient(135deg, oklch(0.82 0.05 260), oklch(0.22 0.01 250))',
			'fg'         => 'light',
		),
		'solid-butter'    => array(
			'group'      => 'solid',
			'name'       => 'Butter',
			'background' => 'oklch(0.88 0.05 80)',
			'fg'         => 'dark',
		),
		'solid-peach'     => array(
			'group'      => 'solid',
			'name'       => 'Peach',
			'background' => 'oklch(0.86 0.05 40)',
			'fg'         => 'dark',
		),
		'solid-blush'     => array(
			'group'      => 'solid',
			'name'       => 'Blush',
			'background' => 'oklch(0.84 0.05 20)',
			'fg'         => 'dark',
		),
		'solid-mauve'     => array(
			'group'      => 'solid',
			'name'       => 'Mauve',
			'background' => 'oklch(0.82 0.04 350)',
			'fg'         => 'dark',
		),
		'solid-lilac'     => array(
			'group'      => 'solid',
			'name'       => 'Lilac',
			'background' => 'oklch(0.82 0.05 300)',
			'fg'         => 'dark',
		),
		'solid-periwinkle' => array(
			'group'      => 'solid',
			'name'       => 'Periwinkle',
			'background' => 'oklch(0.82 0.05 260)',
			'fg'         => 'dark',
		),
		'solid-sky'       => array(
			'group'      => 'solid',
			'name'       => 'Sky',
			'background' => 'oklch(0.84 0.05 230)',
			'fg'         => 'dark',
		),
		'solid-mist'      => array(
			'group'      => 'solid',
			'name'       => 'Mist',
			'background' => 'oklch(0.85 0.04 200)',
			'fg'         => 'dark',
		),
		'solid-seafoam'   => array(
			'group'      => 'solid',
			'name'       => 'Seafoam',
			'background' => 'oklch(0.86 0.05 170)',
			'fg'         => 'dark',
		),
		'solid-sage'      => array(
			'group'      => 'solid',
			'name'       => 'Sage',
			'background' => 'oklch(0.86 0.05 140)',
			'fg'         => 'dark',
		),
		'solid-pistachio' => array(
			'group'      => 'solid',
			'name'       => 'Pistachio',
			'background' => 'oklch(0.88 0.06 110)',
			'fg'         => 'dark',
		),
		'solid-paper'     => array(
			'group'      => 'solid',
			'name'       => 'Paper',
			'background' => 'oklch(0.94 0.012 80)',
			'fg'         => 'dark',
		),
		'solid-bone'      => array(
			'group'      => 'solid',
			'name'       => 'Bone',
			'background' => 'oklch(0.92 0.015 60)',
			'fg'         => 'dark',
		),
		'solid-linen'     => array(
			'group'      => 'solid',
			'name'       => 'Linen',
			'background' => 'oklch(0.90 0.02 40)',
			'fg'         => 'dark',
		),
		'solid-denim'     => array(
			'group'      => 'solid',
			'name'       => 'Denim',
			'background' => 'oklch(0.55 0.08 250)',
			'fg'         => 'light',
		),
		'solid-terracotta' => array(
			'group'      => 'solid',
			'name'       => 'Terracotta',
			'background' => 'oklch(0.50 0.09 30)',
			'fg'         => 'light',
		),
		'solid-forest'    => array(
			'group'      => 'solid',
			'name'       => 'Forest',
			'background' => 'oklch(0.45 0.07 160)',
			'fg'         => 'light',
		),
		'solid-iris'      => array(
			'group'      => 'solid',
			'name'       => 'Iris',
			'background' => 'oklch(0.40 0.06 290)',
			'fg'         => 'light',
		),
		'solid-indigo'    => array(
			'group'      => 'solid',
			'name'       => 'Indigo',
			'background' => 'oklch(0.35 0.05 250)',
			'fg'         => 'light',
		),
		'solid-ink'       => array(
			'group'      => 'solid',
			'name'       => 'Ink',
			'background' => 'oklch(0.22 0.01 250)',
			'fg'         => 'light',
		),
		'solid-snow'      => array(
			'group'      => 'solid',
			'name'       => 'Snow',
			'background' => 'oklch(0.98 0.003 80)',
			'fg'         => 'dark',
		),
	);
	const VALID_BACKGROUNDS = array(
		'gradient-dawn',
		'gradient-coral',
		'gradient-bloom',
		'gradient-meadow',
		'gradient-spring',
		'gradient-sunset',
		'gradient-dusk',
		'gradient-ember',
		'gradient-pine',
		'gradient-plum',
		'gradient-aurora',
		'gradient-midnight',
		'solid-butter',
		'solid-peach',
		'solid-blush',
		'solid-mauve',
		'solid-lilac',
		'solid-periwinkle',
		'solid-sky',
		'solid-mist',
		'solid-seafoam',
		'solid-sage',
		'solid-pistachio',
		'solid-paper',
		'solid-bone',
		'solid-linen',
		'solid-denim',
		'solid-terracotta',
		'solid-forest',
		'solid-iris',
		'solid-indigo',
		'solid-ink',
		'solid-snow',
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

	/**
	 * Get background preset metadata.
	 *
	 * @param string $group Optional group filter.
	 * @return array
	 */
	public static function background_presets( $group = '' ) {
		if ( '' === $group ) {
			return self::BACKGROUND_PRESET_CONFIG;
		}

		return array_filter(
			self::BACKGROUND_PRESET_CONFIG,
			function( $preset ) use ( $group ) {
				return isset( $preset['group'] ) && $preset['group'] === $group;
			}
		);
	}

	/**
	 * Determine whether My Apps is running in WordPress Playground.
	 *
	 * @return bool
	 */
	public static function is_playground() {
		return defined( 'PLAYGROUND_AUTO_LOGIN_AS_USER' );
	}

	/**
	 * Get launcher CSS variables for light preset backgrounds.
	 *
	 * @return string
	 */
	private static function dark_launcher_text_css() {
		return implode(
			' ',
			array(
				'--ma-launcher-fg: #1f2937;',
				'--ma-launcher-text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);',
				'--ma-launcher-toolbar-bg: rgba(15, 23, 42, 0.08);',
				'--ma-launcher-toolbar-bg-hover: rgba(15, 23, 42, 0.14);',
				'--ma-launcher-done-bg: #1f2937;',
				'--ma-launcher-done-bg-hover: #111827;',
				'--ma-launcher-done-fg: #fff;',
				'--ma-launcher-soft-bg: rgba(15, 23, 42, 0.06);',
				'--ma-launcher-soft-border: rgba(15, 23, 42, 0.22);',
				'--ma-launcher-muted-border: rgba(15, 23, 42, 0.35);',
				'--ma-launcher-input-bg: rgba(255, 255, 255, 0.82);',
				'--ma-launcher-input-bg-focus: #fff;',
				'--ma-launcher-input-placeholder: rgba(15, 23, 42, 0.45);',
			)
		);
	}

	/**
	 * Build generated CSS for preset backgrounds and picker previews.
	 *
	 * @return string
	 */
	private static function preset_background_css() {
		$rules = array();

		foreach ( self::background_presets() as $slug => $preset ) {
			if ( empty( $preset['background'] ) ) {
				continue;
			}

			$class      = sanitize_html_class( 'bg-' . $slug );
			$background = $preset['background'];
			$is_dark_fg = isset( $preset['fg'] ) && 'dark' === $preset['fg'];
			$picker_css = array(
				'--ma-bg-option: ' . $background . ';',
			);

			$rules[] = '.' . $class . ', body.my-apps-launcher.' . $class . ' { background: ' . $background . '; }';

			if ( $is_dark_fg ) {
				$picker_css[] = '--ma-bg-option-border: rgba(15, 23, 42, 0.18);';
				$rules[]      = 'body.my-apps-launcher.' . $class . ' { ' . self::dark_launcher_text_css() . ' }';
			}

			$rules[] = 'body.my-apps-launcher .bg-picker-popup .bg-option.' . $class . ' { ' . implode( ' ', $picker_css ) . ' }';
		}

		return implode( "\n", $rules );
	}

	/**
	 * Get the current user's admin colour scheme as CSS tokens.
	 *
	 * @return array
	 */
	private static function admin_color_tokens() {
		$fallback = array(
			'background' => '#1d2327',
			'subtle'     => '#2c3338',
			'primary'    => '#2271b1',
			'accent'     => '#72aee6',
			'icon'       => '#a7aaad',
			'text'       => '#f0f0f1',
		);

		$slug = get_user_option( 'admin_color' );
		if ( ! $slug ) {
			$slug = 'fresh';
		}

		global $_wp_admin_css_colors;

		if ( empty( $_wp_admin_css_colors ) ) {
			require_once ABSPATH . 'wp-admin/includes/misc.php';
			if ( function_exists( 'register_admin_color_schemes' ) ) {
				register_admin_color_schemes();
			}
		}

		if ( empty( $_wp_admin_css_colors[ $slug ] ) ) {
			return $fallback;
		}

		$scheme      = $_wp_admin_css_colors[ $slug ];
		$colors      = isset( $scheme->colors ) && is_array( $scheme->colors ) ? array_values( $scheme->colors ) : array();
		$icon_colors = isset( $scheme->icon_colors ) && is_array( $scheme->icon_colors ) ? $scheme->icon_colors : array();

		if ( empty( $colors ) ) {
			$colors = array( $fallback['background'], $fallback['primary'], $fallback['accent'] );
		}

		$last_color = end( $colors );
		$colors     = array_pad( $colors, 4, $last_color );
		$background = self::sanitize_css_hex_color( $colors[0], $fallback['background'] );
		$subtle     = self::shift_hex_color( $background, self::is_light_hex_color( $background ) ? 18 : 12 );

		return array(
			'background' => $background,
			'subtle'     => $subtle,
			'primary'    => self::sanitize_css_hex_color( $colors[2], $fallback['primary'] ),
			'accent'     => self::sanitize_css_hex_color( $colors[3], $fallback['accent'] ),
			'icon'       => self::sanitize_css_hex_color( isset( $icon_colors['base'] ) ? $icon_colors['base'] : '', $fallback['icon'] ),
			'text'       => self::is_light_hex_color( $background ) ? '#1d2327' : '#f0f0f1',
		);
	}

	/**
	 * Sanitize and normalize a hex colour for inline CSS.
	 *
	 * @param string $color    The colour to sanitize.
	 * @param string $fallback Fallback colour.
	 * @return string
	 */
	private static function sanitize_css_hex_color( $color, $fallback ) {
		$color = is_string( $color ) ? trim( $color ) : '';
		if ( function_exists( 'sanitize_hex_color' ) ) {
			$sanitized = sanitize_hex_color( $color );
			if ( $sanitized ) {
				$color = $sanitized;
			}
		}

		if ( preg_match( '/^#[0-9a-fA-F]{3}$/', $color ) ) {
			return strtolower(
				sprintf(
					'#%s%s%s%s%s%s',
					$color[1],
					$color[1],
					$color[2],
					$color[2],
					$color[3],
					$color[3]
				)
			);
		}

		if ( preg_match( '/^#[0-9a-fA-F]{6}$/', $color ) ) {
			return strtolower( $color );
		}

		return $fallback;
	}

	/**
	 * Shift a hex colour toward white.
	 *
	 * @param string $color   Hex colour.
	 * @param int    $amount  Percent to mix with white.
	 * @return string
	 */
	private static function shift_hex_color( $color, $amount ) {
		$rgb    = self::hex_to_rgb( $color );
		$amount = max( 0, min( 100, (int) $amount ) ) / 100;

		return sprintf(
			'#%02x%02x%02x',
			(int) round( $rgb[0] + ( 255 - $rgb[0] ) * $amount ),
			(int) round( $rgb[1] + ( 255 - $rgb[1] ) * $amount ),
			(int) round( $rgb[2] + ( 255 - $rgb[2] ) * $amount )
		);
	}

	/**
	 * Convert a normalized hex colour to RGB components.
	 *
	 * @param string $color Hex colour.
	 * @return int[]
	 */
	private static function hex_to_rgb( $color ) {
		$color = ltrim( self::sanitize_css_hex_color( $color, '#000000' ), '#' );

		return array(
			hexdec( substr( $color, 0, 2 ) ),
			hexdec( substr( $color, 2, 2 ) ),
			hexdec( substr( $color, 4, 2 ) ),
		);
	}

	/**
	 * Determine whether a hex colour is light.
	 *
	 * @param string $color Hex colour.
	 * @return bool
	 */
	private static function is_light_hex_color( $color ) {
		$rgb = self::hex_to_rgb( $color );

		return ( ( 299 * $rgb[0] + 587 * $rgb[1] + 114 * $rgb[2] ) / 1000 ) >= 160;
	}

	public function __construct() {
		add_action( 'init', array( $this, 'my_apps_endpoint' ) );
		add_action( 'template_redirect', array( $this, 'redirect_root_to_my_apps' ) );
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
		add_filter( 'ai_assistant_ability_domains', array( $this, 'ai_assistant_ability_domains' ) );

		// AJAX handlers for launcher
		add_action( 'wp_ajax_my_apps_save_display_name', array( $this, 'ajax_save_display_name' ) );
		add_action( 'wp_ajax_my_apps_save_order', array( $this, 'ajax_save_order' ) );
		add_action( 'wp_ajax_my_apps_hide', array( $this, 'ajax_hide_app' ) );
		add_action( 'wp_ajax_my_apps_add', array( $this, 'ajax_add_app' ) );
		add_action( 'wp_ajax_my_apps_save_background', array( $this, 'ajax_save_background' ) );
		add_action( 'wp_ajax_my_apps_reset_background', array( $this, 'ajax_reset_background' ) );
		add_action( 'wp_ajax_my_apps_get_background', array( $this, 'ajax_get_background' ) );
		add_action( 'wp_ajax_my_apps_get_customization', array( $this, 'ajax_get_customization' ) );
		add_action( 'wp_ajax_my_apps_save_app_icon', array( $this, 'ajax_save_app_icon' ) );
		add_action( 'wp_ajax_my_apps_unhide', array( $this, 'ajax_unhide_app' ) );
		add_action( 'wp_ajax_my_apps_delete', array( $this, 'ajax_delete_app' ) );
		add_action( 'wp_ajax_my_apps_get_admin_menu', array( $this, 'ajax_get_admin_menu' ) );
		add_action( 'wp_ajax_my_apps_export', array( $this, 'ajax_export' ) );
		add_action( 'wp_ajax_my_apps_import', array( $this, 'ajax_import' ) );
		add_action( 'wp_ajax_my_apps_save_root_redirect', array( $this, 'ajax_save_root_redirect' ) );
		add_action( 'wp_ajax_my_apps_install_plugin', array( $this, 'ajax_install_plugin' ) );
	}

	public function enqueue_styles() {
		wp_enqueue_style( 'my-apps', plugin_dir_url( __FILE__ ) . 'style.css', array(), MY_APPS_VERSION );

		static $did_add_background_css = false;
		if ( ! $did_add_background_css ) {
			wp_add_inline_style( 'my-apps', self::preset_background_css() );
			$did_add_background_css = true;
		}
	}

	public function admin_enqueue_scripts() {
		$this->enqueue_styles();
	}

	/**
	 * Register My Apps terms with AI Assistant ability routing.
	 *
	 * @param array $domains Ability domain hints keyed by plugin slug.
	 * @return array
	 */
	public function ai_assistant_ability_domains( $domains ) {
		if ( ! is_array( $domains ) ) {
			$domains = array();
		}

		$domains['my-apps'] = 'My Apps launcher/home screen customization, shortcut names/icons/links/visibility/order, background state/changes, What can I do? guides, available WordPress activities';

		return $domains;
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
				'description' => __( 'Abilities for reading What can I do? guides and customizing the My Apps launcher.', 'my-apps' ),
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
			'my-apps/get-all',
			array(
				'label'               => __( 'Get All My Apps State', 'my-apps' ),
				'description'         => __( 'Returns the full My Apps launcher state, including background, visible app order, and app metadata.', 'my-apps' ),
				'category'            => 'my-apps',
				'output_schema'       => self::customization_output_schema(),
				'execute_callback'    => array( $this, 'ability_get_all' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'instructions' => __( 'Use this before answering questions about the user\'s My Apps launcher, launcher apps, visible app order, hidden apps, app icons, app links, or background. The result is the full current launcher state; use visible_ordered for display order and each app\'s hidden field for visibility.', 'my-apps' ),
						'readonly'     => true,
						'destructive'  => false,
						'idempotent'   => true,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'my-apps/get-what-can-i-do',
			array(
				'label'               => __( 'Get What Can I Do Guides', 'my-apps' ),
				'description'         => __( 'Returns the default My Apps What can I do? guide catalog for answering what users can do with WordPress.', 'my-apps' ),
				'category'            => 'my-apps',
				'input_schema'        => array(
					'type'                 => 'object',
					'properties'           => array(
						'slug'  => array(
							'type'        => 'string',
							'description' => __( 'Optional guide slug to return one guide.', 'my-apps' ),
						),
						'query' => array(
							'type'        => 'string',
							'description' => __( 'Optional search query matched against guide titles, descriptions, and steps.', 'my-apps' ),
						),
						'limit' => array(
							'type'        => 'integer',
							'description' => __( 'Optional maximum number of matching guides to return.', 'my-apps' ),
							'minimum'     => 1,
						),
					),
					'additionalProperties' => false,
				),
				'output_schema'       => self::recipes_output_schema(),
				'execute_callback'    => array( $this, 'ability_get_recipes' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'instructions' => __( 'Use this when the user asks what they can do with WordPress, asks for activity ideas, or asks for What can I do? guide steps. This returns only the default recipes.json catalog; it does not include browser-local custom blueprints or alternate App Store catalog sources.', 'my-apps' ),
						'readonly'     => true,
						'destructive'  => false,
						'idempotent'   => true,
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
							'description' => __( 'A preset background slug, image attachment ID, remote image URL, or safe CSS color/gradient background.', 'my-apps' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema'       => self::background_output_schema(),
				'execute_callback'    => array( $this, 'ability_set_background' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'instructions' => __( 'Use this when the user asks to change the My Apps launcher background. Pass one accepted background slug, an image attachment ID, a remote image URL, or a safe CSS color/gradient background.', 'my-apps' ),
						'readonly'     => false,
						'destructive'  => false,
						'idempotent'   => false,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'my-apps/add-app',
			array(
				'label'               => __( 'Add My Apps Icon', 'my-apps' ),
				'description'         => __( 'Adds a custom app icon to the My Apps launcher.', 'my-apps' ),
				'category'            => 'my-apps',
				'input_schema'        => array(
					'type'                 => 'object',
					'required'             => array( 'name', 'url' ),
					'properties'           => array_merge(
						array(
							'name' => array(
								'type'        => 'string',
								'description' => __( 'The app icon label shown in the launcher.', 'my-apps' ),
							),
							'url'  => array(
								'type'        => 'string',
								'description' => __( 'The URL opened by the app icon.', 'my-apps' ),
							),
						),
						self::app_icon_input_schema_properties( __( 'Optional icon. Omit all icon fields to use a generated letter icon.', 'my-apps' ) )
					),
					'additionalProperties' => false,
				),
				'output_schema'       => self::customization_output_schema(),
				'execute_callback'    => array( $this, 'ability_add_app' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'instructions' => __( 'Use this when the user asks to add or pin an app icon to the My Apps launcher. Provide a name and URL. Provide at most one icon value: icon_url, dashicon, emoji, gradient, icon { type, value }, or use_favicon.', 'my-apps' ),
						'readonly'     => false,
						'destructive'  => false,
						'idempotent'   => false,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'my-apps/set-app-details',
			array(
				'label'               => __( 'Set My Apps App Details', 'my-apps' ),
				'description'         => __( 'Renames an app or changes its link in the My Apps launcher.', 'my-apps' ),
				'category'            => 'my-apps',
				'input_schema'        => array(
					'type'                 => 'object',
					'required'             => array( 'slug' ),
					'properties'           => array(
						'slug'   => array(
							'type'        => 'string',
							'description' => __( 'The launcher app slug from my-apps/get-all.', 'my-apps' ),
						),
						'name'   => array(
							'type'        => 'string',
							'description' => __( 'The app label shown in the launcher.', 'my-apps' ),
						),
						'url'    => array(
							'type'        => 'string',
							'description' => __( 'The URL opened by the app icon.', 'my-apps' ),
						),
						'revert' => array(
							'type'        => 'boolean',
							'description' => __( 'When true, remove the custom name and URL override.', 'my-apps' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema'       => self::customization_output_schema(),
				'execute_callback'    => array( $this, 'ability_set_app_details' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'instructions' => __( 'Use this when the user asks to rename an app, change an app shortcut link, or revert a custom app name/link. First call my-apps/get-all to find the slug. Provide name and/or url, or set revert to true.', 'my-apps' ),
						'readonly'     => false,
						'destructive'  => false,
						'idempotent'   => true,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'my-apps/set-app-icon',
			array(
				'label'               => __( 'Set My Apps App Icon', 'my-apps' ),
				'description'         => __( 'Updates the icon graphic for an existing My Apps launcher app.', 'my-apps' ),
				'category'            => 'my-apps',
				'input_schema'        => array(
					'type'                 => 'object',
					'required'             => array( 'slug' ),
					'properties'           => array_merge(
						array(
							'slug'   => array(
								'type'        => 'string',
								'description' => __( 'The launcher app slug from my-apps/get-all.', 'my-apps' ),
							),
							'revert' => array(
								'type'        => 'boolean',
								'description' => __( 'When true, remove the custom icon override and return to the app-provided icon.', 'my-apps' ),
							),
						),
						self::app_icon_input_schema_properties( __( 'New icon value. Use icon type letter to force a generated letter icon.', 'my-apps' ) )
					),
					'additionalProperties' => false,
				),
				'output_schema'       => self::customization_output_schema(),
				'execute_callback'    => array( $this, 'ability_set_app_icon' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'instructions' => __( 'Use this when the user asks to change the icon for an existing My Apps launcher app. First call my-apps/get-all to find the slug. Provide exactly one icon value unless reverting.', 'my-apps' ),
						'readonly'     => false,
						'destructive'  => false,
						'idempotent'   => false,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'my-apps/set-app-visibility',
			array(
				'label'               => __( 'Set My Apps App Visibility', 'my-apps' ),
				'description'         => __( 'Shows or hides an app in the My Apps launcher.', 'my-apps' ),
				'category'            => 'my-apps',
				'input_schema'        => array(
					'type'                 => 'object',
					'required'             => array( 'slug', 'hidden' ),
					'properties'           => array(
						'slug'   => array(
							'type'        => 'string',
							'description' => __( 'The launcher app slug from my-apps/get-all.', 'my-apps' ),
						),
						'hidden' => array(
							'type'        => 'boolean',
							'description' => __( 'Whether the app should be hidden from the launcher.', 'my-apps' ),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema'       => self::customization_output_schema(),
				'execute_callback'    => array( $this, 'ability_set_app_visibility' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'instructions' => __( 'Use this when the user asks to hide, show, restore, or unhide one app in the My Apps launcher. First call my-apps/get-all to find the slug. Set hidden to true to hide the app, or false to restore it. For multiple visibility or order changes, prefer my-apps/set-visible-ordered.', 'my-apps' ),
						'readonly'     => false,
						'destructive'  => false,
						'idempotent'   => true,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'my-apps/set-visible-ordered',
			array(
				'label'               => __( 'Set My Apps Visible Ordered Apps', 'my-apps' ),
				'description'         => __( 'Sets the visible My Apps launcher icons and their order.', 'my-apps' ),
				'category'            => 'my-apps',
				'input_schema'        => array(
					'type'                 => 'object',
					'required'             => array( 'visible_ordered' ),
					'properties'           => array(
						'visible_ordered' => array(
							'type'        => 'array',
							'description' => __( 'Launcher app slugs that should be visible, in display order. Apps not listed are hidden.', 'my-apps' ),
							'items'       => array(
								'type' => 'string',
							),
						),
					),
					'additionalProperties' => false,
				),
				'output_schema'       => self::customization_output_schema(),
				'execute_callback'    => array( $this, 'ability_set_visible_ordered' ),
				'permission_callback' => array( $this, 'can_use_customization_abilities' ),
				'meta'                => array(
					'annotations'  => array(
						'instructions' => __( 'Use this when the user asks to reorder visible apps, hide multiple apps, or show only specific apps. First call my-apps/get-all to find app slugs and the current visible_ordered array. Pass visible_ordered as the complete desired visible slug list in display order; every app omitted from visible_ordered is hidden. Verify the response using visible_ordered and each app\'s hidden field.', 'my-apps' ),
						'readonly'     => false,
						'destructive'  => false,
						'idempotent'   => true,
					),
					'show_in_rest' => true,
				),
			)
		);
	}

	/**
	 * Shared input schema properties for app icon values.
	 *
	 * @param string $icon_description Description for the structured icon object.
	 * @return array
	 */
	private static function app_icon_input_schema_properties( $icon_description = '' ) {
		return array(
			'icon'     => array(
				'type'                 => 'object',
				'description'          => $icon_description,
				'properties'           => array(
					'type'  => array(
						'type'        => 'string',
						'enum'        => array( 'icon_url', 'dashicon', 'emoji', 'gradient', 'letter' ),
						'description' => __( 'The icon representation type.', 'my-apps' ),
					),
					'value' => array(
						'type'        => 'string',
						'description' => __( 'The icon value for icon_url, dashicon, emoji, or gradient.', 'my-apps' ),
					),
				),
				'additionalProperties' => false,
			),
			'icon_url' => array(
				'type'        => 'string',
				'description' => __( 'An image URL to use as the app icon.', 'my-apps' ),
			),
			'dashicon' => array(
				'type'        => 'string',
				'description' => __( 'A WordPress Dashicon class, such as dashicons-admin-site.', 'my-apps' ),
			),
			'emoji'    => array(
				'type'        => 'string',
				'description' => __( 'An emoji to use as the app icon.', 'my-apps' ),
			),
			'gradient' => array(
				'type'        => 'string',
				'description' => __( 'A safe CSS color or gradient used behind the default app glyph.', 'my-apps' ),
			),
			'use_favicon' => array(
				'type'        => 'boolean',
				'description' => __( 'Use the app URL origin favicon when no other icon value is supplied.', 'my-apps' ),
			),
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
	 * Ability: get all launcher state.
	 *
	 * @return array
	 */
	public function ability_get_all() {
		return self::customization_payload();
	}

	/**
	 * Ability: get default What can I do? guide catalog.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 */
	public function ability_get_recipes( $input = array() ) {
		return self::recipes_payload( $input );
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
	 * Ability: add a custom launcher app.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 */
	public function ability_add_app( $input = array() ) {
		$result = self::save_custom_app_from_input( $input, false );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return self::customization_payload();
	}

	/**
	 * Ability: set an app's label or URL.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 */
	public function ability_set_app_details( $input = array() ) {
		return self::save_app_details_from_input( $input );
	}

	/**
	 * Ability: set a launcher's app icon.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 */
	public function ability_set_app_icon( $input = array() ) {
		return self::save_app_icon_from_input( $input );
	}

	/**
	 * Ability: hide or restore a launcher app.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 */
	public function ability_set_app_visibility( $input = array() ) {
		return self::save_app_visibility_from_input( $input );
	}

	/**
	 * Ability: set visible launcher apps and their order.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 */
	public function ability_set_visible_ordered( $input = array() ) {
		return self::save_visible_ordered_from_input( $input );
	}

	/**
	 * Determine whether a slug points to a real launcher app.
	 *
	 * @param string $slug App slug.
	 * @param array  $apps Apps keyed by slug.
	 * @return bool
	 */
	private static function launcher_app_exists( $slug, $apps ) {
		$slug = self::normalize_app_slug( $slug );
		return '' !== $slug && isset( $apps[ $slug ] ) && ! empty( $apps[ $slug ]['url'] );
	}

	/**
	 * Normalize a launcher app slug to the string shape required by ability
	 * schemas. Older stored custom apps may have numeric array keys.
	 *
	 * @param mixed $slug App slug.
	 * @return string
	 */
	private static function normalize_app_slug( $slug ) {
		return is_scalar( $slug ) ? sanitize_text_field( (string) $slug ) : '';
	}

	/**
	 * Normalize a list of launcher app slugs.
	 *
	 * @param array $slugs App slugs.
	 * @return string[]
	 */
	private static function normalize_app_slug_list( $slugs ) {
		$normalized = array();

		if ( ! is_array( $slugs ) ) {
			return $normalized;
		}

		foreach ( $slugs as $slug ) {
			$slug = self::normalize_app_slug( $slug );
			if ( '' !== $slug ) {
				$normalized[] = $slug;
			}
		}

		return $normalized;
	}

	/**
	 * Normalize and validate a user-provided list of known app slugs.
	 *
	 * @param array|string $slugs App slugs, or a JSON-encoded slug list.
	 * @param array        $apps Apps keyed by slug.
	 * @return string[]|\WP_Error
	 */
	private static function normalize_known_app_slug_list( $slugs, $apps ) {
		if ( is_string( $slugs ) ) {
			$decoded = json_decode( $slugs, true );
			if ( ! is_array( $decoded ) ) {
				return new \WP_Error( 'my_apps_invalid_app_slug_list', __( 'Invalid app slug list.', 'my-apps' ) );
			}
			$slugs = $decoded;
		}

		if ( ! is_array( $slugs ) ) {
			return new \WP_Error( 'my_apps_invalid_app_slug_list', __( 'Invalid app slug list.', 'my-apps' ) );
		}

		$normalized = array();
		foreach ( array_values( $slugs ) as $slug ) {
			$slug = self::normalize_app_slug( $slug );

			if ( '' === $slug ) {
				return new \WP_Error( 'my_apps_invalid_app_slug', __( 'Invalid app slug.', 'my-apps' ) );
			}

			if ( in_array( $slug, $normalized, true ) ) {
				return new \WP_Error( 'my_apps_duplicate_app_slug', __( 'Duplicate app slug.', 'my-apps' ) );
			}

			if ( ! self::launcher_app_exists( $slug, $apps ) ) {
				return new \WP_Error( 'my_apps_unknown_app', __( 'App not found.', 'my-apps' ) );
			}

			$normalized[] = $slug;
		}

		return $normalized;
	}

	/**
	 * Return all current launcher app slugs in their current relative order.
	 *
	 * @param array $apps Apps keyed by slug.
	 * @return string[]
	 */
	private static function current_app_slugs( $apps ) {
		$slugs = array();

		foreach ( array_keys( $apps ) as $slug ) {
			$slug = self::normalize_app_slug( $slug );
			if ( '' !== $slug && self::launcher_app_exists( $slug, $apps ) ) {
				$slugs[] = $slug;
			}
		}

		return $slugs;
	}

	/**
	 * Save the visible launcher apps, in display order, from request-like input.
	 *
	 * @param array $input Request-like input.
	 * @return array|\WP_Error
	 */
	private static function save_visible_ordered_from_input( $input = array() ) {
		$input = is_array( $input ) ? wp_unslash( $input ) : array();

		if ( ! array_key_exists( 'visible_ordered', $input ) ) {
			return new \WP_Error( 'my_apps_missing_visible_apps', __( 'No visible apps provided.', 'my-apps' ) );
		}

		$apps    = self::get_apps();
		$visible = self::normalize_known_app_slug_list( $input['visible_ordered'], $apps );

		if ( is_wp_error( $visible ) ) {
			return $visible;
		}

		$hidden = array_values( array_diff( self::current_app_slugs( $apps ), $visible ) );
		$sort   = array_merge( $visible, $hidden );

		update_option( 'my_apps_sort', $sort );
		update_option( 'my_apps_hide_plugins', $hidden );

		return self::customization_payload();
	}

	/**
	 * Save an app label or URL override from request-like input.
	 *
	 * @param array $input Request-like input.
	 * @return array|\WP_Error
	 */
	private static function save_app_details_from_input( $input = array() ) {
		$input = is_array( $input ) ? wp_unslash( $input ) : array();
		$slug  = isset( $input['slug'] ) ? self::normalize_app_slug( $input['slug'] ) : '';

		if ( '' === $slug ) {
			return new \WP_Error( 'my_apps_empty_app_slug', __( 'No app slug provided.', 'my-apps' ) );
		}

		$apps = self::get_apps();
		if ( ! self::launcher_app_exists( $slug, $apps ) ) {
			return new \WP_Error( 'my_apps_unknown_app', __( 'App not found.', 'my-apps' ) );
		}

		$overrides = self::get_app_overrides();
		if ( ! empty( $input['revert'] ) ) {
			unset( $overrides[ $slug ] );
			update_option( self::APP_OVERRIDES_OPTION, $overrides );
			return self::customization_payload();
		}

		$has_name = isset( $input['name'] ) && is_scalar( $input['name'] ) && '' !== trim( (string) $input['name'] );
		$has_url  = isset( $input['url'] ) && is_scalar( $input['url'] ) && '' !== trim( (string) $input['url'] );

		if ( ! $has_name && ! $has_url ) {
			return new \WP_Error( 'my_apps_empty_app_details', __( 'No app details provided.', 'my-apps' ) );
		}

		$app_override = isset( $overrides[ $slug ] ) && is_array( $overrides[ $slug ] ) ? $overrides[ $slug ] : array();

		if ( $has_name ) {
			$name = sanitize_text_field( (string) $input['name'] );
			if ( '' === $name ) {
				return new \WP_Error( 'my_apps_empty_app_name', __( 'No app name provided.', 'my-apps' ) );
			}
			$app_override['name'] = $name;
		}

		if ( $has_url ) {
			$url = esc_url_raw( (string) $input['url'] );
			if ( '' === $url ) {
				return new \WP_Error( 'my_apps_invalid_app_url', __( 'Invalid app URL.', 'my-apps' ) );
			}

			$normalized_url = self::normalize_app_url( $url );
			foreach ( $apps as $existing_slug => $existing ) {
				if (
					$existing_slug !== $slug
					&& isset( $existing['url'] )
					&& self::normalize_app_url( $existing['url'] ) === $normalized_url
				) {
					return new \WP_Error( 'my_apps_duplicate_app_url', __( 'An app with that URL already exists.', 'my-apps' ) );
				}
			}

			$app_override['url'] = $url;
		}

		$overrides[ $slug ] = $app_override;
		update_option( self::APP_OVERRIDES_OPTION, $overrides );

		return self::customization_payload();
	}

	/**
	 * Save the hidden state for a launcher app from request-like input.
	 *
	 * @param array $input Request-like input.
	 * @return array|\WP_Error
	 */
	private static function save_app_visibility_from_input( $input = array() ) {
		$input = is_array( $input ) ? wp_unslash( $input ) : array();
		$slug  = isset( $input['slug'] ) ? self::normalize_app_slug( $input['slug'] ) : '';

		if ( '' === $slug ) {
			return new \WP_Error( 'my_apps_empty_app_slug', __( 'No app slug provided.', 'my-apps' ) );
		}

		$apps = self::get_apps();
		if ( ! self::launcher_app_exists( $slug, $apps ) ) {
			return new \WP_Error( 'my_apps_unknown_app', __( 'App not found.', 'my-apps' ) );
		}

		if ( ! array_key_exists( 'hidden', $input ) ) {
			return new \WP_Error( 'my_apps_missing_hidden_state', __( 'No hidden state provided.', 'my-apps' ) );
		}

		$hidden = wp_validate_boolean( $input['hidden'] );
		$hidden_apps = self::normalize_app_slug_list( get_option( 'my_apps_hide_plugins', array() ) );

		if ( $hidden ) {
			if ( ! in_array( $slug, $hidden_apps, true ) ) {
				$hidden_apps[] = $slug;
			}
		} else {
			$hidden_apps = array_values(
				array_filter(
					$hidden_apps,
					function ( $hidden_slug ) use ( $slug ) {
						return $hidden_slug !== $slug;
					}
				)
			);
		}

		update_option( 'my_apps_hide_plugins', $hidden_apps );

		return self::customization_payload();
	}

	/**
	 * Save an icon override for an existing launcher app.
	 *
	 * @param array $input Request-like input.
	 * @return array|\WP_Error
	 */
	private static function save_app_icon_from_input( $input = array() ) {
		$input = is_array( $input ) ? wp_unslash( $input ) : array();
		$slug  = isset( $input['slug'] ) ? sanitize_text_field( $input['slug'] ) : '';

		if ( '' === $slug ) {
			return new \WP_Error( 'my_apps_empty_app_slug', __( 'No app slug provided.', 'my-apps' ) );
		}

		$apps = self::get_apps();
		if ( ! isset( $apps[ $slug ] ) ) {
			return new \WP_Error( 'my_apps_unknown_app', __( 'App not found.', 'my-apps' ) );
		}

		$overrides = self::get_app_icon_overrides();
		if ( ! empty( $input['revert'] ) ) {
			unset( $overrides[ $slug ] );
			update_option( self::APP_ICON_OVERRIDES_OPTION, $overrides );
			return self::customization_payload();
		}

		$use_favicon = ! empty( $input['use_favicon'] );
		$icon_data   = self::sanitize_app_icon_input( $input, ! $use_favicon, true );
		if ( is_wp_error( $icon_data ) ) {
			return $icon_data;
		}
		if ( $use_favicon ) {
			if ( self::app_icon_data_has_value( $icon_data ) ) {
				return new \WP_Error( 'my_apps_multiple_icons', __( 'Choose only one icon type.', 'my-apps' ) );
			}
			$favicon_url = self::favicon_url_for_app_url( isset( $apps[ $slug ]['url'] ) ? $apps[ $slug ]['url'] : '' );
			if ( '' === $favicon_url ) {
				return new \WP_Error( 'my_apps_invalid_icon_url', __( 'Invalid icon URL.', 'my-apps' ) );
			}
			$icon_data['icon_url'] = $favicon_url;
		}

		$overrides[ $slug ] = $icon_data;
		update_option( self::APP_ICON_OVERRIDES_OPTION, $overrides );

		return self::customization_payload();
	}

	/**
	 * Save a background value.
	 *
	 * Accepted values are preset slugs, numeric attachment IDs, remote image
	 * URLs, or safe CSS color/gradient values. Custom values are stored as
	 * the custom background type.
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
				return new \WP_Error( 'my_apps_invalid_background', __( 'Choose or set a custom background.', 'my-apps' ) );
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

		if ( self::sanitize_custom_background_css( $value ) ) {
			return self::save_custom_background_css( $value );
		}

		return new \WP_Error( 'my_apps_invalid_background', __( 'Invalid background.', 'my-apps' ) );
	}

	/**
	 * Reset the launcher background to its unset first-run state.
	 *
	 * @return array
	 */
	private static function reset_background_value() {
		delete_option( 'my_apps_background' );
		delete_option( 'my_apps_background_custom' );
		delete_option( 'my_apps_background_image_url' );
		delete_option( 'my_apps_background_attachment_id' );

		return self::current_background_payload();
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
	 * Sideload a remote image URL when possible and save it as the custom background.
	 *
	 * @param string $url Remote image URL.
	 * @return array|\WP_Error
	 */
	private static function save_sideloaded_background( $url ) {
		$url = esc_url_raw( $url );
		if ( ! $url || ! wp_http_validate_url( $url ) ) {
			return new \WP_Error( 'my_apps_invalid_background_url', __( 'Invalid background image URL.', 'my-apps' ) );
		}

		if ( current_user_can( 'upload_files' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			$attachment_id = media_sideload_image( $url, 0, null, 'id' );
			if ( ! is_wp_error( $attachment_id ) ) {
				$result = self::save_attachment_background( $attachment_id );
				if ( ! is_wp_error( $result ) ) {
					return $result;
				}
			}
		}

		self::store_custom_background_image( $url );
		return self::current_background_payload();
	}

	/**
	 * Save a safe CSS color or gradient as the custom background.
	 *
	 * @param string $css CSS background value.
	 * @return array|\WP_Error
	 */
	private static function save_custom_background_css( $css ) {
		$css = self::sanitize_custom_background_css( $css );
		if ( '' === $css ) {
			return new \WP_Error( 'my_apps_invalid_background_css', __( 'Invalid background CSS.', 'my-apps' ) );
		}

		self::store_custom_background_css( $css );
		return self::current_background_payload();
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
	 * Store custom CSS background metadata.
	 *
	 * @param string $css CSS background value.
	 */
	private static function store_custom_background_css( $css ) {
		update_option( 'my_apps_background', self::CUSTOM_BACKGROUND );
		update_option( 'my_apps_background_custom', $css );
		update_option( 'my_apps_background_image_url', '' );
		update_option( 'my_apps_background_attachment_id', 0 );
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
	 * Sanitize a custom CSS color or gradient background value.
	 *
	 * @param string $css CSS background value.
	 * @return string
	 */
	private static function sanitize_custom_background_css( $css ) {
		$css = trim( (string) $css );
		$css = preg_replace( '/\s+/', ' ', $css );

		if ( ! is_string( $css ) || '' === $css || strlen( $css ) > 500 ) {
			return '';
		}

		if ( preg_match( '/[;{}<>\x00-\x1F\x7F]/', $css ) ) {
			return '';
		}

		if ( preg_match( '/[^a-z0-9#.,%()\/\s+-]/i', $css ) ) {
			return '';
		}

		if ( ! self::has_balanced_parentheses( $css ) ) {
			return '';
		}

		if ( preg_match( '/(?:^|[^a-z-])(?:url|var|attr|expression|image-set|cross-fade|element|paint|env|calc|min|max|clamp)\s*\(/i', $css ) ) {
			return '';
		}

		if ( preg_match( '/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $css ) ) {
			return strtolower( $css );
		}

		if ( preg_match( '/^[a-z]+$/i', $css ) ) {
			return strtolower( $css );
		}

		if ( preg_match( '/^(?:rgb|rgba|hsl|hsla)\([a-z0-9.,%\/\s+-]+\)$/i', $css ) ) {
			return $css;
		}

		if ( preg_match( '/^(?:(?:repeating-)?(?:linear|radial|conic)-gradient)\(.+\)$/i', $css ) ) {
			return $css;
		}

		return '';
	}

	/**
	 * Check whether a string has balanced parentheses.
	 *
	 * @param string $value Value to check.
	 * @return bool
	 */
	private static function has_balanced_parentheses( $value ) {
		$depth = 0;
		$len   = strlen( $value );

		for ( $i = 0; $i < $len; $i++ ) {
			if ( '(' === $value[ $i ] ) {
				$depth++;
			} elseif ( ')' === $value[ $i ] ) {
				$depth--;
				if ( $depth < 0 ) {
					return false;
				}
			}
		}

		return 0 === $depth;
	}

	/**
	 * Get the currently stored background payload.
	 *
	 * @return array
	 */
	private static function current_background_payload() {
		return array(
			'background' => self::current_background_state_payload(),
		);
	}

	/**
	 * Get the currently stored background state.
	 *
	 * @return array
	 */
	private static function current_background_state_payload() {
		$background = get_option( 'my_apps_background', '' );
		$background = is_string( $background ) && in_array( $background, self::VALID_BACKGROUNDS, true ) ? $background : '';

		$state = array(
			'slug'        => $background,
			'valid_slugs' => self::PRESET_BACKGROUNDS,
		);

		if ( self::CUSTOM_BACKGROUND === $background ) {
			$custom_bg     = get_option( 'my_apps_background_custom', '' );
			$image_url     = get_option( 'my_apps_background_image_url', '' );
			$attachment_id = absint( get_option( 'my_apps_background_attachment_id', 0 ) );

			if ( is_string( $custom_bg ) && '' !== $custom_bg ) {
				$state['custom'] = $custom_bg;
			}
			if ( is_string( $image_url ) && '' !== $image_url ) {
				$state['image_url'] = $image_url;
			}
			if ( $attachment_id ) {
				$state['attachment_id'] = $attachment_id;
			}
		}

		return $state;
	}

	/**
	 * Ensure that the admin bar is also shown in the mobile view.
	 */
	public function admin_bar_css() {
		if ( ! is_admin_bar_showing() ) {
			return;
		}
		$is_launcher = ! is_admin() && get_query_var( 'my_apps' );
		$tokens      = $is_launcher ? self::admin_color_tokens() : array();
		?>
		<style>
			<?php if ( $is_launcher ) : ?>
			body.my-apps-launcher {
				--wp-app-admin-color-background: <?php echo esc_html( $tokens['background'] ); ?>;
				--wp-app-admin-color-subtle: <?php echo esc_html( $tokens['subtle'] ); ?>;
				--wp-app-admin-color-primary: <?php echo esc_html( $tokens['primary'] ); ?>;
				--wp-app-admin-color-accent: <?php echo esc_html( $tokens['accent'] ); ?>;
				--wp-app-admin-icon-color-base: <?php echo esc_html( $tokens['icon'] ); ?>;
				--wp-app-masterbar-background: var(--wp-app-admin-color-background);
				--wp-app-masterbar-highlight: var(--wp-app-admin-color-accent);
				--wp-app-masterbar-text: <?php echo esc_html( $tokens['text'] ); ?>;
			}
			body.my-apps-launcher #wpadminbar {
				background: var(--wp-app-masterbar-background, #1d2327);
				color: var(--wp-app-masterbar-text, #f0f0f1);
			}
			body.my-apps-launcher #wpadminbar .ab-item,
			body.my-apps-launcher #wpadminbar a.ab-item,
			body.my-apps-launcher #wpadminbar > #wp-toolbar span.ab-label,
			body.my-apps-launcher #wpadminbar > #wp-toolbar span.noticon {
				color: var(--wp-app-masterbar-text, #f0f0f1);
			}
			body.my-apps-launcher #wpadminbar .ab-icon,
			body.my-apps-launcher #wpadminbar .ab-icon:before,
			body.my-apps-launcher #wpadminbar .ab-item:before,
			body.my-apps-launcher #wpadminbar .ab-item:after,
			body.my-apps-launcher #wpadminbar #adminbarsearch:before {
				color: var(--wp-app-admin-icon-color-base, #a7aaad);
			}
			body.my-apps-launcher #wpadminbar .ab-top-menu > li.hover > .ab-item,
			body.my-apps-launcher #wpadminbar.nojq .quicklinks .ab-top-menu > li > .ab-item:focus,
			body.my-apps-launcher #wpadminbar.nojs .ab-top-menu > li.menupop:hover > .ab-item,
			body.my-apps-launcher #wpadminbar:not(.mobile) .ab-top-menu > li:hover > .ab-item,
			body.my-apps-launcher #wpadminbar:not(.mobile) .ab-top-menu > li > .ab-item:focus {
				background: var(--wp-app-admin-color-subtle, #2c3338);
				color: var(--wp-app-masterbar-highlight, #72aee6);
			}
			body.my-apps-launcher #wpadminbar:not(.mobile) > #wp-toolbar li:hover span.ab-label,
			body.my-apps-launcher #wpadminbar:not(.mobile) > #wp-toolbar li.hover span.ab-label,
			body.my-apps-launcher #wpadminbar:not(.mobile) > #wp-toolbar a:focus span.ab-label,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop ul li a:hover,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop ul li a:focus,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop ul li a:hover strong,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop ul li a:focus strong,
			body.my-apps-launcher #wpadminbar .quicklinks .ab-sub-wrapper .menupop.hover > a,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop.hover ul li a:hover,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop.hover ul li a:focus,
			body.my-apps-launcher #wpadminbar.nojs .quicklinks .menupop:hover ul li a:hover,
			body.my-apps-launcher #wpadminbar.nojs .quicklinks .menupop:hover ul li a:focus,
			body.my-apps-launcher #wpadminbar li:hover .ab-icon:before,
			body.my-apps-launcher #wpadminbar li:hover .ab-item:before,
			body.my-apps-launcher #wpadminbar li a:focus .ab-icon:before,
			body.my-apps-launcher #wpadminbar li .ab-item:focus:before,
			body.my-apps-launcher #wpadminbar li .ab-item:focus .ab-icon:before,
			body.my-apps-launcher #wpadminbar li.hover .ab-icon:before,
			body.my-apps-launcher #wpadminbar li.hover .ab-item:before,
			body.my-apps-launcher #wpadminbar li:hover #adminbarsearch:before,
			body.my-apps-launcher #wpadminbar li #adminbarsearch.adminbar-focused:before {
				color: var(--wp-app-masterbar-highlight, #72aee6);
			}
			body.my-apps-launcher #wpadminbar .menupop .ab-sub-wrapper,
			body.my-apps-launcher #wpadminbar .shortlink-input {
				background: var(--wp-app-admin-color-subtle, #2c3338);
			}
			body.my-apps-launcher #wpadminbar .quicklinks .menupop ul.ab-sub-secondary,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop ul.ab-sub-secondary .ab-submenu {
				background: var(--wp-app-masterbar-background, #1d2327);
			}
			body.my-apps-launcher #wpadminbar .ab-submenu .ab-item,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop ul li a,
			body.my-apps-launcher #wpadminbar .quicklinks .menupop.hover ul li a,
			body.my-apps-launcher #wpadminbar.nojs .quicklinks .menupop:hover ul li a,
			body.my-apps-launcher #wpadminbar .shortlink-input {
				color: var(--wp-app-masterbar-text, #f0f0f1);
			}
			body.my-apps-launcher #wpadminbar > #wp-toolbar > #wp-admin-bar-top-secondary > #wp-admin-bar-search #adminbarsearch input.adminbar-input:focus {
				background: var(--wp-app-admin-color-subtle, #2c3338);
				color: var(--wp-app-masterbar-text, #f0f0f1);
			}
			<?php endif; ?>
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
	 * Determine whether the root redirect setting is enabled.
	 *
	 * @return bool
	 */
	public static function is_root_redirect_enabled() {
		if ( ! self::is_playground() ) {
			return false;
		}

		return '1' === get_option( self::ROOT_REDIRECT_OPTION, '1' );
	}

	/**
	 * Determine whether the current request is the exact site home path.
	 *
	 * @return bool
	 */
	private static function is_current_request_home_path() {
		$request_method = isset( $_SERVER['REQUEST_METHOD'] )
			? strtoupper( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) )
			: 'GET';
		if ( ! in_array( $request_method, array( 'GET', 'HEAD' ), true ) ) {
			return false;
		}

		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';
		if ( '' === $request_uri || null !== wp_parse_url( $request_uri, PHP_URL_QUERY ) ) {
			return false;
		}

		$request_path = wp_parse_url( $request_uri, PHP_URL_PATH );
		$home_path    = wp_parse_url( home_url( '/' ), PHP_URL_PATH );

		$request_path = '/' . trim( (string) $request_path, '/' );
		$home_path    = '/' . trim( (string) $home_path, '/' );

		return $request_path === $home_path;
	}

	/**
	 * Redirect the site root to the My Apps launcher when enabled.
	 */
	public function redirect_root_to_my_apps() {
		if ( ! self::is_root_redirect_enabled() || is_admin() || wp_doing_ajax() ) {
			return;
		}

		if ( function_exists( 'wp_is_json_request' ) && wp_is_json_request() ) {
			return;
		}

		if ( is_feed() || is_trackback() || is_preview() || ! is_front_page() || ! self::is_current_request_home_path() ) {
			return;
		}

		wp_safe_redirect( home_url( '/my-apps/' ), 302 );
		exit;
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

		$stored_background          = get_option( 'my_apps_background', '' );
		$has_customized_wallpaper   = is_string( $stored_background ) && '' !== $stored_background;
		$background_state           = self::current_background_state_payload();

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

		wp_enqueue_script(
			'my-apps-ai-assistant-hooks',
			plugins_url( 'assets/ai-assistant-hooks.js', __FILE__ ),
			array( 'my-apps-launcher', 'ai-assistant-chat-core' ),
			MY_APPS_VERSION,
			true
		);

		wp_localize_script(
			'my-apps-launcher',
			'myAppsConfig',
			array(
				'ajaxUrl'                   => admin_url( 'admin-ajax.php' ),
				'nonce'                     => wp_create_nonce( 'my_apps_launcher' ),
				'isPlayground'              => self::is_playground(),
				'canInstallPlugins'         => current_user_can( 'install_plugins' ),
				'canUpdatePlugins'          => current_user_can( 'update_plugins' ),
				'canUploadMedia'            => $can_upload_media,
				'aiAssistantBootstrapNonce' => wp_create_nonce( 'ai_assistant_bootstrap' ),
				'pluginInstallUrl'          => self_admin_url( 'plugin-install.php' ),
				'displayName'               => wp_get_current_user()->display_name,
				'deletableSlugs'            => self::normalize_app_slug_list( array_keys( get_option( 'my_apps_additional_apps', array() ) ) ),
				'appUrls'                   => array_values( array_unique( array_filter( $app_urls ) ) ),
				'installedPlugins'          => self::get_installed_plugin_statuses(),
				'background'                => $background_state['slug'],
				'redirectRoot'              => self::is_root_redirect_enabled(),
				'hasCustomizedWallpaper'    => $has_customized_wallpaper,
				'customBackground'          => isset( $background_state['custom'] ) ? $background_state['custom'] : '',
				'backgroundImageUrl'        => isset( $background_state['image_url'] ) ? $background_state['image_url'] : '',
				'backgroundAttachmentId'    => isset( $background_state['attachment_id'] ) ? $background_state['attachment_id'] : 0,
				'i18n'                      => array(
					'fillAllFields'         => __( 'Please fill in all fields', 'my-apps' ),
					'confirmDelete'         => __( 'Delete this app? This cannot be undone.', 'my-apps' ),
					'chooseBackgroundImage' => __( 'Choose Background Image', 'my-apps' ),
					'useBackgroundImage'    => __( 'Use as Background', 'my-apps' ),
					'mediaUnavailable'       => __( 'The media library is unavailable.', 'my-apps' ),
					'invalidBackgroundImage' => __( 'Please choose an image file.', 'my-apps' ),
					'wallpaperPrompt'        => __( 'Not feeling this?', 'my-apps' ),
					'wallpaperNamedPrompt'   => __( 'This wallpaper is %s.', 'my-apps' ),
					'wallpaperTryAnother'    => __( 'Try another.', 'my-apps' ),
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

		$sort = self::normalize_app_slug_list( array_values( $order ) );
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

		$slug = isset( $_POST['slug'] ) ? self::normalize_app_slug( wp_unslash( $_POST['slug'] ) ) : '';

		if ( '' === $slug ) {
			wp_send_json_error( 'Invalid slug' );
		}

		$hide_plugins = self::normalize_app_slug_list( get_option( 'my_apps_hide_plugins', array() ) );
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
	 * AJAX: Reset background preference.
	 */
	public function ajax_reset_background() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		wp_send_json_success( self::reset_background_value() );
	}

	/**
	 * AJAX: Get background preference.
	 */
	public function ajax_get_background() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		wp_send_json_success( self::current_background_payload() );
	}

	/**
	 * AJAX: Get launcher customization.
	 */
	public function ajax_get_customization() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		wp_send_json_success( self::customization_payload() );
	}

	/**
	 * AJAX: Save root redirect setting.
	 */
	public function ajax_save_root_redirect() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! self::is_playground() || ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not allowed' );
		}

		$enabled_raw = isset( $_POST['enabled'] ) ? sanitize_text_field( wp_unslash( $_POST['enabled'] ) ) : '0';
		$enabled     = wp_validate_boolean( $enabled_raw );

		update_option( self::ROOT_REDIRECT_OPTION, $enabled ? '1' : '0' );

		wp_send_json_success(
			array(
				'redirect_root' => $enabled,
			)
		);
	}

	/**
	 * AJAX: Save an app icon override.
	 */
	public function ajax_save_app_icon() {
		check_ajax_referer( 'my_apps_launcher', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not logged in' );
		}

		$result = self::save_app_icon_from_input( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Nonce checked above; values are sanitized in helper.

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

		$result = self::save_custom_app_from_input( $_POST, true ); // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Nonce checked above; values are sanitized in helper.

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success(
			self::app_response_payload(
				$result['slug'],
				$result['app'],
				isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '',
				isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '',
				! empty( $result['duplicate'] )
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

		$slug = isset( $_POST['slug'] ) ? self::normalize_app_slug( wp_unslash( $_POST['slug'] ) ) : '';

		if ( '' === $slug ) {
			wp_send_json_error( 'Invalid slug' );
		}

		$hide_plugins = self::normalize_app_slug_list( get_option( 'my_apps_hide_plugins', array() ) );
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

		$slug = isset( $_POST['slug'] ) ? self::normalize_app_slug( wp_unslash( $_POST['slug'] ) ) : '';

		if ( '' === $slug ) {
			wp_send_json_error( 'Invalid slug' );
		}

		$additional_apps = get_option( 'my_apps_additional_apps', array() );
		if ( ! isset( $additional_apps[ $slug ] ) ) {
			wp_send_json_error( 'App cannot be deleted' );
		}

		unset( $additional_apps[ $slug ] );
		update_option( 'my_apps_additional_apps', $additional_apps );

		$hide_plugins = self::normalize_app_slug_list( get_option( 'my_apps_hide_plugins', array() ) );
		$hide_plugins = array_values( array_filter( $hide_plugins, function( $s ) use ( $slug ) {
			return $s !== $slug;
		} ) );
		update_option( 'my_apps_hide_plugins', $hide_plugins );

		$sort = self::normalize_app_slug_list( get_option( 'my_apps_sort', array() ) );
		$sort = array_values( array_filter( $sort, function( $s ) use ( $slug ) {
			return $s !== $slug;
		} ) );
		update_option( 'my_apps_sort', $sort );

		$icon_overrides = self::get_app_icon_overrides();
		if ( isset( $icon_overrides[ $slug ] ) ) {
			unset( $icon_overrides[ $slug ] );
			update_option( self::APP_ICON_OVERRIDES_OPTION, $icon_overrides );
		}

		$app_overrides = self::get_app_overrides();
		if ( isset( $app_overrides[ $slug ] ) ) {
			unset( $app_overrides[ $slug ] );
			update_option( self::APP_OVERRIDES_OPTION, $app_overrides );
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

		$background_state  = self::current_background_state_payload();
		$background_export = array(
			'background' => isset( $background_state['slug'] ) ? $background_state['slug'] : '',
		);

		if ( isset( $background_state['custom'] ) ) {
			$background_export['custom_background'] = $background_state['custom'];
		}
		if ( isset( $background_state['image_url'] ) ) {
			$background_export['image_url'] = $background_state['image_url'];
		}
		if ( isset( $background_state['attachment_id'] ) ) {
			$background_export['attachment_id'] = $background_state['attachment_id'];
		}

		$settings_export = array(
			'sort'               => get_option( 'my_apps_sort', array() ),
			'hide_plugins'       => get_option( 'my_apps_hide_plugins', array() ),
			'additional_apps'    => get_option( 'my_apps_additional_apps', array() ),
			'app_overrides'      => self::get_app_overrides(),
			'app_icon_overrides' => self::get_app_icon_overrides(),
		);
		if ( self::is_playground() ) {
			$settings_export['redirect_root'] = self::is_root_redirect_enabled();
		}

		wp_send_json_success(
			array_merge(
				$settings_export,
				$background_export
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
		if ( isset( $data['app_overrides'] ) && is_array( $data['app_overrides'] ) ) {
			update_option( self::APP_OVERRIDES_OPTION, $data['app_overrides'] );
		}
		if ( isset( $data['app_icon_overrides'] ) && is_array( $data['app_icon_overrides'] ) ) {
			update_option( self::APP_ICON_OVERRIDES_OPTION, $data['app_icon_overrides'] );
		}
		if ( self::is_playground() && isset( $data['redirect_root'] ) && is_scalar( $data['redirect_root'] ) ) {
			update_option( self::ROOT_REDIRECT_OPTION, wp_validate_boolean( $data['redirect_root'] ) ? '1' : '0' );
		}
		if ( isset( $data['background'] ) && is_scalar( $data['background'] ) ) {
			$background = trim( (string) $data['background'] );
			if ( '' === $background ) {
				delete_option( 'my_apps_background' );
				delete_option( 'my_apps_background_custom' );
				delete_option( 'my_apps_background_image_url' );
				delete_option( 'my_apps_background_attachment_id' );
			} elseif ( 'image' === $background && ! empty( $data['background_image_id'] ) ) {
				$background_result = self::save_background_value( (string) absint( $data['background_image_id'] ) );
				if ( is_wp_error( $background_result ) ) {
					wp_send_json_error( $background_result->get_error_message() );
				}
			} elseif ( self::CUSTOM_BACKGROUND === $background && ! empty( $data['custom_background'] ) ) {
				if ( ! empty( $data['image_url'] ) ) {
					update_option( 'my_apps_background', self::CUSTOM_BACKGROUND );
					update_option( 'my_apps_background_custom', sanitize_text_field( $data['custom_background'] ) );
					update_option( 'my_apps_background_image_url', esc_url_raw( $data['image_url'] ) );
					update_option( 'my_apps_background_attachment_id', ! empty( $data['attachment_id'] ) ? absint( $data['attachment_id'] ) : 0 );
				} else {
					$background_result = self::save_custom_background_css( $data['custom_background'] );
					if ( is_wp_error( $background_result ) ) {
						wp_send_json_error( $background_result->get_error_message() );
					}
				}
			} else {
				$background_result = self::save_background_value( $background );
				if ( is_wp_error( $background_result ) ) {
					wp_send_json_error( $background_result->get_error_message() );
				}
			}
		}

		wp_send_json_success();
	}

	/**
	 * Build the output schema for recipe guide responses.
	 *
	 * @return array
	 */
	private static function recipes_output_schema() {
		return array(
			'type'                 => 'object',
			'required'             => array( 'source', 'count', 'guides' ),
			'properties'           => array(
				'source'  => array(
					'type'                 => 'object',
					'required'             => array( 'url', 'default_only', 'custom_overrides_included' ),
					'properties'           => array(
						'url'                       => array(
							'type'        => 'string',
							'description' => __( 'The default recipes.json URL used for this response.', 'my-apps' ),
						),
						'default_only'              => array(
							'type'        => 'boolean',
							'description' => __( 'Whether the response is limited to the default published guide catalog.', 'my-apps' ),
						),
						'custom_overrides_included' => array(
							'type'        => 'boolean',
							'description' => __( 'Whether browser-local custom blueprints or alternate catalog source overrides are included.', 'my-apps' ),
						),
					),
					'additionalProperties' => false,
				),
				'count'   => array(
					'type'        => 'integer',
					'description' => __( 'The number of guides returned.', 'my-apps' ),
				),
				'guides'  => array(
					'type'                 => 'object',
					'description'          => __( 'Default What can I do? guide entries keyed by guide slug.', 'my-apps' ),
					'additionalProperties' => self::recipe_output_schema(),
				),
			),
			'additionalProperties' => false,
		);
	}

	/**
	 * Build the output schema for one recipe guide entry.
	 *
	 * @return array
	 */
	private static function recipe_output_schema() {
		return array(
			'type'                 => 'object',
			'required'             => array( 'title', 'steps' ),
			'properties'           => array(
				'title'       => array(
					'type'        => 'string',
					'description' => __( 'The guide title.', 'my-apps' ),
				),
				'tagline'     => array(
					'type'        => 'string',
					'description' => __( 'A short guide summary.', 'my-apps' ),
				),
				'description' => array(
					'type'        => 'string',
					'description' => __( 'The guide description.', 'my-apps' ),
				),
				'icon'        => array(
					'type'        => 'string',
					'description' => __( 'The guide icon.', 'my-apps' ),
				),
				'gradient'    => array(
					'type'        => 'string',
					'description' => __( 'The guide display gradient.', 'my-apps' ),
				),
				'learn_more'  => array(
					'type'        => 'string',
					'description' => __( 'A URL with more information about the guide.', 'my-apps' ),
				),
				'steps'       => array(
					'type'        => 'array',
					'description' => __( 'Guide steps.', 'my-apps' ),
					'items'       => self::recipe_step_output_schema(),
				),
			),
			'additionalProperties' => false,
		);
	}

	/**
	 * Build the output schema for one recipe step.
	 *
	 * @return array
	 */
	private static function recipe_step_output_schema() {
		return array(
			'type'                 => 'object',
			'required'             => array( 'type', 'title' ),
			'properties'           => array(
				'type'        => array(
					'type'        => 'string',
					'enum'        => array( 'app', 'plugin', 'github', 'note' ),
					'description' => __( 'The guide step type.', 'my-apps' ),
				),
				'title'       => array(
					'type'        => 'string',
					'description' => __( 'The guide step title.', 'my-apps' ),
				),
				'description' => array(
					'type'        => 'string',
					'description' => __( 'The guide step description.', 'my-apps' ),
				),
				'optional'    => array(
					'type'        => 'boolean',
					'description' => __( 'Whether the guide step is optional.', 'my-apps' ),
				),
				'context'     => array(
					'type'        => 'string',
					'enum'        => array( 'self-hosted', 'playground' ),
					'description' => __( 'The environment where the step applies.', 'my-apps' ),
				),
				'path'        => array(
					'type'        => 'string',
					'description' => __( 'The app blueprint path for app steps.', 'my-apps' ),
				),
				'slug'        => array(
					'type'        => 'string',
					'description' => __( 'The WordPress.org plugin slug for plugin steps.', 'my-apps' ),
				),
				'repo'        => array(
					'type'        => 'string',
					'description' => __( 'The GitHub repository for GitHub plugin steps.', 'my-apps' ),
				),
				'url'         => array(
					'type'        => 'string',
					'description' => __( 'A supporting URL for the step.', 'my-apps' ),
				),
				'url_label'   => array(
					'type'        => 'string',
					'description' => __( 'The label for the supporting URL.', 'my-apps' ),
				),
			),
			'additionalProperties' => false,
		);
	}

	/**
	 * Build the recipe guide ability payload.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 */
	private static function recipes_payload( $input = array() ) {
		$input   = is_array( $input ) ? wp_unslash( $input ) : array();
		$recipes = self::default_recipes_catalog();

		if ( is_wp_error( $recipes ) ) {
			return $recipes;
		}

		if ( isset( $input['slug'] ) && is_scalar( $input['slug'] ) && '' !== trim( (string) $input['slug'] ) ) {
			$slug = self::normalize_recipe_slug( $input['slug'] );
			if ( '' === $slug || ! isset( $recipes[ $slug ] ) ) {
				return new \WP_Error( 'my_apps_unknown_recipe', __( 'Guide not found.', 'my-apps' ) );
			}
			$recipes = array(
				$slug => $recipes[ $slug ],
			);
		} elseif ( isset( $input['query'] ) && is_scalar( $input['query'] ) ) {
			$query = sanitize_text_field( (string) $input['query'] );
			if ( '' !== $query ) {
				$recipes = array_filter(
					$recipes,
					function ( $recipe, $slug ) use ( $query ) {
						return self::recipe_matches_query( $slug, $recipe, $query );
					},
					ARRAY_FILTER_USE_BOTH
				);
			}
		}

		if ( isset( $input['limit'] ) && is_scalar( $input['limit'] ) ) {
			$limit = absint( $input['limit'] );
			if ( $limit > 0 ) {
				$recipes = array_slice( $recipes, 0, $limit, true );
			}
		}

		return array(
			'source'  => array(
				'url'                       => self::DEFAULT_RECIPES_URL,
				'default_only'              => true,
				'custom_overrides_included' => false,
			),
			'count'   => count( $recipes ),
			'guides'  => (object) $recipes,
		);
	}

	/**
	 * Fetch and cache the default recipes catalog.
	 *
	 * @return array|\WP_Error
	 */
	private static function default_recipes_catalog() {
		$cached = get_transient( 'my_apps_default_recipes_catalog' );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$response = wp_remote_get(
			self::DEFAULT_RECIPES_URL,
			array(
				'timeout' => 10,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new \WP_Error( 'my_apps_recipes_unavailable', $response->get_error_message() );
		}

		$status = wp_remote_retrieve_response_code( $response );
		if ( $status < 200 || $status >= 300 ) {
			return new \WP_Error( 'my_apps_recipes_unavailable', __( 'Unable to load guides.', 'my-apps' ) );
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $data ) ) {
			return new \WP_Error( 'my_apps_invalid_recipes_catalog', __( 'Invalid guide catalog.', 'my-apps' ) );
		}

		$recipes = self::sanitize_recipes_catalog( $data );
		set_transient( 'my_apps_default_recipes_catalog', $recipes, HOUR_IN_SECONDS );

		return $recipes;
	}

	/**
	 * Sanitize recipes loaded from the default catalog.
	 *
	 * @param array $data Raw recipes catalog.
	 * @return array
	 */
	private static function sanitize_recipes_catalog( $data ) {
		$recipes = array();

		foreach ( $data as $slug => $recipe ) {
			$slug = self::normalize_recipe_slug( $slug );
			if ( '' === $slug || ! is_array( $recipe ) ) {
				continue;
			}

			$recipe = self::sanitize_recipe_payload( $recipe );
			if ( ! empty( $recipe['title'] ) ) {
				$recipes[ $slug ] = $recipe;
			}
		}

		return $recipes;
	}

	/**
	 * Normalize a recipe slug.
	 *
	 * @param mixed $slug Recipe slug.
	 * @return string
	 */
	private static function normalize_recipe_slug( $slug ) {
		return is_scalar( $slug ) ? sanitize_key( (string) $slug ) : '';
	}

	/**
	 * Sanitize one recipe payload.
	 *
	 * @param array $recipe Raw recipe.
	 * @return array
	 */
	private static function sanitize_recipe_payload( $recipe ) {
		$title = isset( $recipe['title'] ) && is_scalar( $recipe['title'] ) ? sanitize_text_field( (string) $recipe['title'] ) : '';
		if ( '' === $title ) {
			return array();
		}

		$payload = array(
			'title' => $title,
			'steps' => array(),
		);

		foreach ( array( 'tagline', 'icon', 'gradient' ) as $key ) {
			if ( isset( $recipe[ $key ] ) && is_scalar( $recipe[ $key ] ) ) {
				$value = sanitize_text_field( (string) $recipe[ $key ] );
				if ( '' !== $value ) {
					$payload[ $key ] = $value;
				}
			}
		}

		if ( isset( $recipe['description'] ) && is_scalar( $recipe['description'] ) ) {
			$description = sanitize_textarea_field( (string) $recipe['description'] );
			if ( '' !== $description ) {
				$payload['description'] = $description;
			}
		}

		if ( isset( $recipe['learn_more'] ) && is_scalar( $recipe['learn_more'] ) ) {
			$learn_more = esc_url_raw( (string) $recipe['learn_more'] );
			if ( '' !== $learn_more ) {
				$payload['learn_more'] = $learn_more;
			}
		}

		if ( isset( $recipe['steps'] ) && is_array( $recipe['steps'] ) ) {
			foreach ( $recipe['steps'] as $step ) {
				$step = self::sanitize_recipe_step_payload( $step );
				if ( ! empty( $step ) ) {
					$payload['steps'][] = $step;
				}
			}
		}

		return $payload;
	}

	/**
	 * Sanitize one recipe step payload.
	 *
	 * @param mixed $step Raw recipe step.
	 * @return array
	 */
	private static function sanitize_recipe_step_payload( $step ) {
		if ( ! is_array( $step ) ) {
			return array();
		}

		$type  = isset( $step['type'] ) && is_scalar( $step['type'] ) ? sanitize_key( (string) $step['type'] ) : '';
		$title = isset( $step['title'] ) && is_scalar( $step['title'] ) ? sanitize_text_field( (string) $step['title'] ) : '';
		if ( '' === $title || ! in_array( $type, array( 'app', 'plugin', 'github', 'note' ), true ) ) {
			return array();
		}

		$payload = array(
			'type'  => $type,
			'title' => $title,
		);

		if ( isset( $step['description'] ) && is_scalar( $step['description'] ) ) {
			$description = sanitize_textarea_field( (string) $step['description'] );
			if ( '' !== $description ) {
				$payload['description'] = $description;
			}
		}

		if ( array_key_exists( 'optional', $step ) ) {
			$payload['optional'] = wp_validate_boolean( $step['optional'] );
		}

		if ( isset( $step['context'] ) && is_scalar( $step['context'] ) ) {
			$context = sanitize_key( (string) $step['context'] );
			if ( in_array( $context, array( 'self-hosted', 'playground' ), true ) ) {
				$payload['context'] = $context;
			}
		}

		if ( isset( $step['path'] ) && is_scalar( $step['path'] ) ) {
			$path = sanitize_text_field( (string) $step['path'] );
			if ( preg_match( '#^apps/[A-Za-z0-9._-]+\.json$#', $path ) ) {
				$payload['path'] = $path;
			}
		}

		if ( isset( $step['slug'] ) && is_scalar( $step['slug'] ) ) {
			$slug = self::normalize_recipe_slug( $step['slug'] );
			if ( '' !== $slug ) {
				$payload['slug'] = $slug;
			}
		}

		if ( isset( $step['repo'] ) && is_scalar( $step['repo'] ) ) {
			$repo = sanitize_text_field( (string) $step['repo'] );
			if ( preg_match( '#^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$#', $repo ) ) {
				$payload['repo'] = $repo;
			}
		}

		if ( isset( $step['url'] ) && is_scalar( $step['url'] ) ) {
			$url = esc_url_raw( (string) $step['url'] );
			if ( '' !== $url ) {
				$payload['url'] = $url;
			}
		}

		if ( isset( $step['url_label'] ) && is_scalar( $step['url_label'] ) ) {
			$url_label = sanitize_text_field( (string) $step['url_label'] );
			if ( '' !== $url_label ) {
				$payload['url_label'] = $url_label;
			}
		}

		return $payload;
	}

	/**
	 * Check whether a recipe matches a search query.
	 *
	 * @param string $slug Recipe slug.
	 * @param array  $recipe Recipe payload.
	 * @param string $query Search query.
	 * @return bool
	 */
	private static function recipe_matches_query( $slug, $recipe, $query ) {
		$parts = array( $slug );

		foreach ( array( 'title', 'tagline', 'description', 'learn_more' ) as $key ) {
			if ( isset( $recipe[ $key ] ) ) {
				$parts[] = $recipe[ $key ];
			}
		}

		if ( isset( $recipe['steps'] ) && is_array( $recipe['steps'] ) ) {
			foreach ( $recipe['steps'] as $step ) {
				foreach ( array( 'type', 'title', 'description', 'context', 'path', 'slug', 'repo', 'url', 'url_label' ) as $key ) {
					if ( isset( $step[ $key ] ) ) {
						$parts[] = $step[ $key ];
					}
				}
			}
		}

		return false !== stripos( implode( ' ', $parts ), $query );
	}

	/**
	 * Build the output schema for background state responses.
	 *
	 * @return array
	 */
	private static function background_output_schema() {
		return array(
			'type'                 => 'object',
			'required'             => array( 'background' ),
			'properties'           => array(
				'background' => self::background_state_schema(),
			),
			'additionalProperties' => false,
		);
	}

	/**
	 * Build the output schema for a grouped background state object.
	 *
	 * @return array
	 */
	private static function background_state_schema() {
		return array(
			'type'                 => 'object',
			'description'          => __( 'Current launcher background state.', 'my-apps' ),
			'required'             => array( 'slug', 'valid_slugs' ),
			'properties'           => array(
				'slug'          => array(
					'type'        => 'string',
					'description' => __( 'The selected launcher background slug.', 'my-apps' ),
				),
				'custom'        => array(
					'type'        => 'string',
					'description' => __( 'Custom CSS background value, when the selected background is custom.', 'my-apps' ),
				),
				'image_url'     => array(
					'type'        => 'string',
					'description' => __( 'The selected custom background image URL.', 'my-apps' ),
				),
				'attachment_id' => array(
					'type'        => 'integer',
					'description' => __( 'The selected custom background image attachment ID, when available.', 'my-apps' ),
				),
				'valid_slugs'   => array(
					'type'        => 'array',
					'description' => __( 'Preset background slugs accepted by the launcher background setter.', 'my-apps' ),
					'items'       => array(
						'type' => 'string',
						'enum' => self::PRESET_BACKGROUNDS,
					),
				),
			),
			'additionalProperties' => false,
		);
	}

	/**
	 * Build the output schema for launcher customization.
	 *
	 * @return array
	 */
	private static function customization_output_schema() {
		return array(
			'type'                 => 'object',
			'required'             => array( 'background', 'visible_ordered', 'apps' ),
			'properties'           => array(
				'background'        => self::background_state_schema(),
				'visible_ordered'   => array(
					'type'        => 'array',
					'description' => __( 'Visible launcher app slugs in display order.', 'my-apps' ),
					'items'       => array(
						'type' => 'string',
					),
				),
				'apps'              => array(
					'type'                 => 'object',
					'description'          => __( 'Apps available to the launcher, keyed by launcher app slug.', 'my-apps' ),
					'additionalProperties' => array(
						'type'                 => 'object',
						'required'             => array( 'name', 'url', 'source', 'hidden', 'deletable' ),
						'properties'           => array(
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
							'icon_customized' => array(
								'type'        => 'boolean',
								'description' => __( 'Whether the icon is customized by a launcher override.', 'my-apps' ),
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
		$hidden          = self::normalize_app_slug_list( get_option( 'my_apps_hide_plugins', array() ) );
		$additional_apps = get_option( 'my_apps_additional_apps', array() );
		$launcher_apps   = self::get_apps();
		$icon_overrides  = self::get_app_icon_overrides();
		$apps            = array();
		$visible_ordered = array();

		$additional_apps = is_array( $additional_apps ) ? $additional_apps : array();

		foreach ( $launcher_apps as $slug => $app ) {
			$slug = self::normalize_app_slug( $slug );

			if ( '' === $slug ) {
				continue;
			}

			$apps[ $slug ] = self::customization_app_payload(
				$slug,
				$app,
				array_key_exists( $slug, $additional_apps ),
				in_array( $slug, $hidden, true ),
				isset( $icon_overrides[ $slug ] )
			);

			if ( ! in_array( $slug, $hidden, true ) ) {
				$visible_ordered[] = $slug;
			}
		}

		return array(
			'background'      => self::current_background_state_payload(),
			'visible_ordered' => $visible_ordered,
			'apps'            => (object) $apps,
		);
	}

	/**
	 * Build a customization payload for a single app.
	 *
	 * @param string $slug App slug.
	 * @param array  $app App data.
	 * @param bool   $is_custom Whether the app is stored as an additional app.
	 * @param bool   $is_hidden Whether the app is hidden.
	 * @param bool   $icon_customized Whether the app icon has a stored override.
	 * @return array
	 */
	private static function customization_app_payload( $slug, $app, $is_custom, $is_hidden, $icon_customized = false ) {
		$slug = self::normalize_app_slug( $slug );

		return array(
			'name'            => isset( $app['name'] ) ? (string) $app['name'] : $slug,
			'url'             => isset( $app['url'] ) ? (string) $app['url'] : '',
			'source'          => $is_custom ? 'custom' : 'registered',
			'hidden'          => (bool) $is_hidden,
			'deletable'       => (bool) $is_custom,
			'icon_customized' => (bool) $icon_customized,
			'icon'            => self::customization_app_icon_payload( $app ),
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
	 * Get sanitized app label/URL overrides.
	 *
	 * @return array
	 */
	private static function get_app_overrides() {
		$overrides = get_option( self::APP_OVERRIDES_OPTION, array() );
		$overrides = is_array( $overrides ) ? $overrides : array();
		$sanitized = array();

		foreach ( $overrides as $slug => $app_override ) {
			if ( ! is_array( $app_override ) ) {
				continue;
			}

			$slug   = sanitize_text_field( $slug );
			$record = array();

			if ( isset( $app_override['name'] ) && is_scalar( $app_override['name'] ) ) {
				$name = sanitize_text_field( (string) $app_override['name'] );
				if ( '' !== $name ) {
					$record['name'] = $name;
				}
			}

			if ( isset( $app_override['url'] ) && is_scalar( $app_override['url'] ) ) {
				$url = esc_url_raw( (string) $app_override['url'] );
				if ( '' !== $url ) {
					$record['url'] = $url;
				}
			}

			if ( '' !== $slug && ! empty( $record ) ) {
				$sanitized[ $slug ] = $record;
			}
		}

		return $sanitized;
	}

	/**
	 * Apply stored label/URL overrides to registered and custom apps.
	 *
	 * @param array $apps Apps keyed by slug.
	 * @return array
	 */
	private static function apply_app_overrides( $apps ) {
		foreach ( self::get_app_overrides() as $slug => $app_override ) {
			if ( ! isset( $apps[ $slug ] ) || ! is_array( $apps[ $slug ] ) ) {
				continue;
			}

			foreach ( array( 'name', 'url' ) as $key ) {
				if ( isset( $app_override[ $key ] ) ) {
					$apps[ $slug ][ $key ] = $app_override[ $key ];
				}
			}
		}

		return $apps;
	}

	/**
	 * App icon fields supported by launcher storage.
	 *
	 * @return string[]
	 */
	private static function app_icon_keys() {
		return array( 'icon_url', 'dashicon', 'emoji', 'gradient' );
	}

	/**
	 * Build an empty icon record that forces the letter fallback when saved
	 * as an override.
	 *
	 * @return array
	 */
	private static function empty_app_icon_data() {
		return array(
			'icon_url' => false,
			'dashicon' => false,
			'emoji'    => false,
			'gradient' => false,
		);
	}

	/**
	 * Determine whether an icon data record has a concrete visual value.
	 *
	 * @param array $icon_data Icon data.
	 * @return bool
	 */
	private static function app_icon_data_has_value( $icon_data ) {
		if ( ! is_array( $icon_data ) ) {
			return false;
		}

		foreach ( self::app_icon_keys() as $key ) {
			if ( ! empty( $icon_data[ $key ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Build a conventional favicon URL from an app URL.
	 *
	 * @param string $url App URL.
	 * @return string
	 */
	private static function favicon_url_for_app_url( $url ) {
		$url = is_string( $url ) && 0 === strpos( $url, '/' ) ? home_url( $url ) : $url;
		$parts = wp_parse_url( esc_url_raw( $url ) );
		if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) || ! in_array( strtolower( $parts['scheme'] ), array( 'http', 'https' ), true ) ) {
			return '';
		}

		$port = ! empty( $parts['port'] ) ? ':' . absint( $parts['port'] ) : '';
		return esc_url_raw( strtolower( $parts['scheme'] ) . '://' . $parts['host'] . $port . '/favicon.ico' );
	}

	/**
	 * Sanitize app icon input from AJAX, import data, or abilities.
	 *
	 * @param array $input        Icon input.
	 * @param bool  $require_icon Whether an explicit icon value is required.
	 * @param bool  $allow_letter Whether the structured "letter" type is allowed.
	 * @return array|\WP_Error
	 */
	private static function sanitize_app_icon_input( $input, $require_icon = false, $allow_letter = false ) {
		$input        = is_array( $input ) ? $input : array();
		$icon_data    = self::empty_app_icon_data();
		$provided     = array();
		$force_letter = false;

		if ( isset( $input['icon'] ) && is_array( $input['icon'] ) && ! empty( $input['icon']['type'] ) ) {
			$type = sanitize_key( $input['icon']['type'] );
			if ( 'letter' === $type ) {
				$force_letter = true;
			} elseif ( in_array( $type, self::app_icon_keys(), true ) ) {
				if ( ! isset( $input['icon']['value'] ) || ! is_scalar( $input['icon']['value'] ) || '' === trim( (string) $input['icon']['value'] ) ) {
					return new \WP_Error( 'my_apps_empty_icon_value', __( 'No icon value provided.', 'my-apps' ) );
				}
				$provided[ $type ] = (string) $input['icon']['value'];
			} else {
				return new \WP_Error( 'my_apps_invalid_icon_type', __( 'Invalid icon type.', 'my-apps' ) );
			}
		}

		foreach ( self::app_icon_keys() as $key ) {
			if ( isset( $input[ $key ] ) && is_scalar( $input[ $key ] ) && '' !== trim( (string) $input[ $key ] ) ) {
				$provided[ $key ] = (string) $input[ $key ];
			}
		}

		if ( $force_letter ) {
			if ( ! $allow_letter ) {
				return new \WP_Error( 'my_apps_invalid_icon_type', __( 'Invalid icon type.', 'my-apps' ) );
			}
			if ( ! empty( $provided ) ) {
				return new \WP_Error( 'my_apps_multiple_icons', __( 'Choose only one icon type.', 'my-apps' ) );
			}
			return $icon_data;
		}

		if ( count( $provided ) > 1 ) {
			return new \WP_Error( 'my_apps_multiple_icons', __( 'Choose only one icon type.', 'my-apps' ) );
		}

		if ( empty( $provided ) ) {
			if ( $require_icon ) {
				return new \WP_Error( 'my_apps_icon_required', __( 'An icon is required.', 'my-apps' ) );
			}
			return $icon_data;
		}

		$type  = key( $provided );
		$value = trim( current( $provided ) );

		if ( 'icon_url' === $type ) {
			$url = esc_url_raw( $value );
			if ( '' === $url || ! preg_match( '#^https?://#i', $url ) ) {
				return new \WP_Error( 'my_apps_invalid_icon_url', __( 'Invalid icon URL.', 'my-apps' ) );
			}
			$icon_data['icon_url'] = $url;
		} elseif ( 'dashicon' === $type ) {
			$dashicon = strtolower( sanitize_text_field( $value ) );
			$dashicon = preg_replace( '/[^a-z0-9-]/', '', $dashicon );
			if ( 0 !== strpos( $dashicon, 'dashicons-' ) ) {
				$dashicon = 'dashicons-' . $dashicon;
			}
			if ( ! preg_match( '/^dashicons-[a-z0-9-]+$/', $dashicon ) || 'dashicons-' === $dashicon ) {
				return new \WP_Error( 'my_apps_invalid_dashicon', __( 'Invalid Dashicon.', 'my-apps' ) );
			}
			$icon_data['dashicon'] = $dashicon;
		} elseif ( 'emoji' === $type ) {
			$emoji = sanitize_text_field( $value );
			if ( '' === $emoji ) {
				return new \WP_Error( 'my_apps_invalid_emoji', __( 'Invalid emoji.', 'my-apps' ) );
			}
			$icon_data['emoji'] = $emoji;
		} elseif ( 'gradient' === $type ) {
			$gradient = self::sanitize_custom_background_css( $value );
			if ( '' === $gradient ) {
				return new \WP_Error( 'my_apps_invalid_icon_gradient', __( 'Invalid icon gradient.', 'my-apps' ) );
			}
			$icon_data['gradient'] = $gradient;
		}

		return $icon_data;
	}

	/**
	 * Get sanitized app icon overrides.
	 *
	 * @return array
	 */
	private static function get_app_icon_overrides() {
		$overrides = get_option( self::APP_ICON_OVERRIDES_OPTION, array() );
		$overrides = is_array( $overrides ) ? $overrides : array();
		$sanitized = array();

		foreach ( $overrides as $slug => $icon_data ) {
			if ( ! is_array( $icon_data ) ) {
				continue;
			}
			$slug      = sanitize_text_field( $slug );
			$icon_data = self::sanitize_app_icon_input( $icon_data, false, true );
			if ( '' !== $slug && ! is_wp_error( $icon_data ) ) {
				$sanitized[ $slug ] = $icon_data;
			}
		}

		return $sanitized;
	}

	/**
	 * Apply stored icon overrides to registered and custom apps.
	 *
	 * @param array $apps Apps keyed by slug.
	 * @return array
	 */
	private static function apply_app_icon_overrides( $apps ) {
		foreach ( self::get_app_icon_overrides() as $slug => $icon_data ) {
			if ( ! isset( $apps[ $slug ] ) || ! is_array( $apps[ $slug ] ) ) {
				continue;
			}
			foreach ( self::app_icon_keys() as $key ) {
				$apps[ $slug ][ $key ] = ! empty( $icon_data[ $key ] ) ? $icon_data[ $key ] : false;
			}
		}

		return $apps;
	}

	/**
	 * Save a custom launcher app from request-like input.
	 *
	 * @param array $input        Input fields.
	 * @param bool  $require_icon Whether an explicit icon is required.
	 * @return array|\WP_Error
	 */
	private static function save_custom_app_from_input( $input, $require_icon = true ) {
		$input = is_array( $input ) ? wp_unslash( $input ) : array();
		$name  = isset( $input['name'] ) ? sanitize_text_field( $input['name'] ) : '';
		$url   = isset( $input['url'] ) ? esc_url_raw( $input['url'] ) : '';

		if ( empty( $name ) || empty( $url ) ) {
			return new \WP_Error( 'my_apps_missing_app_fields', __( 'Name and URL are required.', 'my-apps' ) );
		}

		$use_favicon = ! empty( $input['use_favicon'] );
		$icon_data   = self::sanitize_app_icon_input( $input, $require_icon && ! $use_favicon, true );
		if ( is_wp_error( $icon_data ) ) {
			return $icon_data;
		}
		if ( $use_favicon ) {
			if ( self::app_icon_data_has_value( $icon_data ) ) {
				return new \WP_Error( 'my_apps_multiple_icons', __( 'Choose only one icon type.', 'my-apps' ) );
			}
			$favicon_url = self::favicon_url_for_app_url( $url );
			if ( '' === $favicon_url ) {
				return new \WP_Error( 'my_apps_invalid_icon_url', __( 'Invalid icon URL.', 'my-apps' ) );
			}
			$icon_data['icon_url'] = $favicon_url;
		}

		$additional_apps = get_option( 'my_apps_additional_apps', array() );
		$additional_apps = is_array( $additional_apps ) ? $additional_apps : array();
		$user_id         = get_current_user_id();
		$normalized_url  = self::normalize_app_url( $url );

		foreach ( apply_filters( 'my_apps_plugins', array() ) as $existing_slug => $existing ) {
			if (
				isset( $existing['url'] )
				&& self::normalize_app_url( $existing['url'] ) === $normalized_url
			) {
				return array(
					'slug'      => $existing_slug,
					'app'       => $existing,
					'duplicate' => true,
				);
			}
		}

		foreach ( $additional_apps as $existing_slug => $existing ) {
			if (
				isset( $existing['url'] )
				&& self::normalize_app_url( $existing['url'] ) === $normalized_url
				&& ( ! isset( $existing['user'] ) || (int) $existing['user'] === (int) $user_id )
			) {
				return array(
					'slug'      => $existing_slug,
					'app'       => $existing,
					'duplicate' => true,
				);
			}
		}

		$base_slug = 'custom-' . sanitize_title( $name );
		if ( 'custom-' === $base_slug ) {
			$base_slug = 'custom-app';
		}

		$index = count( $additional_apps );
		do {
			$slug = $base_slug . '-' . $index;
			$index++;
		} while ( isset( $additional_apps[ $slug ] ) );

		$new_app = array_merge(
			array(
				'name' => $name,
				'url'  => $url,
			),
			$icon_data,
			array(
				'user' => $user_id,
			)
		);

		$additional_apps[ $slug ] = $new_app;
		update_option( 'my_apps_additional_apps', $additional_apps );

		$sort   = get_option( 'my_apps_sort', array() );
		$sort   = is_array( $sort ) ? $sort : array();
		$sort[] = $slug;
		update_option( 'my_apps_sort', $sort );

		return array(
			'slug'      => $slug,
			'app'       => $new_app,
			'duplicate' => false,
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

		$plugins = self::apply_app_overrides( $plugins );
		$plugins = self::apply_app_icon_overrides( $plugins );

		$hide_plugins = self::normalize_app_slug_list( get_option( 'my_apps_hide_plugins', array() ) );
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
		$sort = self::normalize_app_slug_list( $sort );
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
