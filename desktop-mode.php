<?php
/**
 * My Apps — Desktop Mode integration.
 *
 * Registers the My Apps launcher as a native popup window in the dock
 * and exposes every app from the my_apps_plugins filter + the
 * additional-apps option as clickable desktop icons.
 *
 * Icons without an explicit icon_url or dashicon are served as SVGs
 * via an authenticated AJAX endpoint so the desktop-mode JS renderer
 * receives a plain https:// URL it can display as an image.
 *
 * @package My_Apps
 */

namespace My_Apps;

defined( 'ABSPATH' ) || exit;

add_action( 'wp_ajax_my_apps_desktop_icon', __NAMESPACE__ . '\serve_desktop_mode_icon' );
add_action( 'plugins_loaded', __NAMESPACE__ . '\desktop_mode_register', 20 );

function desktop_mode_register() {
	if ( ! function_exists( 'desktop_mode_register_window' ) ) {
		return;
	}

	add_filter( 'desktop_mode_native_window_allowed_html', __NAMESPACE__ . '\desktop_mode_allow_iframe' );

	desktop_mode_register_window(
		'my-apps',
		array(
			'title'     => __( 'My Apps', 'my-apps' ),
			'icon'      => 'dashicons-grid-view',
			'template'  => __NAMESPACE__ . '\desktop_mode_window_template',
			'width'     => 900,
			'height'    => 640,
			'placement' => 'dock',
		)
	);

	$registered = apply_filters( 'my_apps_plugins', array() );
	$additional = get_option( 'my_apps_additional_apps', array() );
	$hidden     = (array) get_option( 'my_apps_hide_plugins', array() );
	$all_apps   = array_merge( $registered, $additional );

	$position = 10;
	foreach ( $all_apps as $slug => $app ) {
		if ( ! isset( $app['url'], $app['name'] ) ) {
			continue;
		}
		if ( in_array( $slug, $hidden, true ) ) {
			continue;
		}
		if ( ! empty( $app['icon_url'] ) && strpos( $app['icon_url'], 'data:' ) !== 0 ) {
			$icon = $app['icon_url'];
		} elseif ( ! empty( $app['dashicon'] ) ) {
			$icon = $app['dashicon'];
		} else {
			$icon = admin_url( 'admin-ajax.php?action=my_apps_desktop_icon&slug=' . rawurlencode( $slug ) );
		}
		desktop_mode_register_icon(
			sanitize_key( $slug ),
			array(
				'title'    => $app['name'],
				'icon'     => $icon,
				'url'      => $app['url'],
				'position' => $position,
			)
		);
		$position += 10;
	}
}

function serve_desktop_mode_icon() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only SVG serve, no state change.
	$slug = isset( $_GET['slug'] ) ? sanitize_text_field( wp_unslash( $_GET['slug'] ) ) : '';

	$registered = apply_filters( 'my_apps_plugins', array() );
	$additional = get_option( 'my_apps_additional_apps', array() );
	$all_apps   = array_merge( $registered, $additional );

	$app      = isset( $all_apps[ $slug ] ) ? $all_apps[ $slug ] : array();
	$name     = ! empty( $app['name'] ) ? $app['name'] : $slug;
	$emoji    = ! empty( $app['emoji'] ) ? $app['emoji'] : '';
	$icon_url = ! empty( $app['icon_url'] ) ? $app['icon_url'] : '';

	header( 'Content-Type: image/svg+xml; charset=utf-8' );
	header( 'Cache-Control: public, max-age=86400' );

	if ( strpos( $icon_url, 'data:image/svg+xml;base64,' ) === 0 ) {
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
		echo svg_with_white_bg( base64_decode( substr( $icon_url, 26 ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	} elseif ( strpos( $icon_url, 'data:image/svg+xml,' ) === 0 ) {
		echo svg_with_white_bg( urldecode( substr( $icon_url, 19 ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	} elseif ( $emoji ) {
		echo build_emoji_svg( $emoji ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- pre-escaped in builder.
	} else {
		echo build_letter_svg( $name ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- pre-escaped in builder.
	}

	exit;
}

function build_letter_svg( $name ) {
	$data      = My_Apps::letter_icon_data( $name );
	$font_size = strlen( $data['letters'] ) > 1 ? 36 : 46;
	return sprintf(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' .
		'<rect width="100" height="100" rx="22" ry="22" fill="%s"/>' .
		'<text x="50" y="50" fill="#fff" text-anchor="middle" dominant-baseline="central" ' .
		'font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" ' .
		'font-weight="600" font-size="%d">%s</text>' .
		'</svg>',
		esc_attr( $data['background'] ),
		$font_size,
		esc_html( $data['letters'] )
	);
}

function build_emoji_svg( $emoji ) {
	return sprintf(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' .
		'<rect width="100" height="100" rx="22" ry="22" fill="#fff"/>' .
		'<text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="60">%s</text>' .
		'</svg>',
		esc_html( $emoji )
	);
}

function svg_with_white_bg( $svg ) {
	return preg_replace(
		'/(<svg[^>]*>)/i',
		'$1<rect width="100%" height="100%" rx="22%" ry="22%" fill="#fff"/>',
		$svg,
		1
	);
}

function desktop_mode_window_template() {
	?>
	<iframe
		src="<?php echo esc_url( home_url( '/my-apps/' ) ); ?>"
		style="width:100%;height:100%;border:0;display:block;"
		title="<?php esc_attr_e( 'My Apps', 'my-apps' ); ?>"
	></iframe>
	<?php
}

function desktop_mode_allow_iframe( $allowed ) {
	$allowed['iframe'] = array(
		'src'             => true,
		'style'           => true,
		'title'           => true,
		'width'           => true,
		'height'          => true,
		'frameborder'     => true,
		'allowfullscreen' => true,
		'loading'         => true,
		'id'              => true,
		'class'           => true,
		'name'            => true,
		'sandbox'         => true,
		'allow'           => true,
		'referrerpolicy'  => true,
		'data-*'          => true,
	);
	return $allowed;
}
