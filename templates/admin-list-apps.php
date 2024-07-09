<?php
/**
 * The template for displaying the app launcher.
 *
 * @package My_Apps
 */

namespace My_Apps;

?>
<h2><?php esc_html_e( 'App List', 'my-apps' ); ?></h2>
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
				<?php foreach ( $apps as $_plugin => $data ) : ?>
					<tr>
						<td>
							<input type="checkbox" name="my_apps_hide_plugins[]" value="<?php echo esc_attr( $_plugin ); ?>" id="my_apps_hide_plugins_<?php echo esc_attr( $_plugin ); ?>" <?php checked( ! in_array( $_plugin, $hide_plugins ) ); ?>>
						</td>
						<td>
						<input type="hidden" name="my_apps_plugins[]" value="<?php echo esc_attr( $_plugin ); ?>">
						<button href="" class="move-up">&uarr;</button>
						<button href="" class="move-down">&darr;</button>
						</td>
						<td>
							<?php if ( ! empty( $data['icon_url'] ) ) : ?>
								<img src="<?php echo esc_attr( $data['icon_url'] ); ?>" alt='<?php echo esc_attr( $data['name'] ); ?>' width="24" height="24">
							<?php elseif ( ! empty( $data['dashicon'] ) ) : ?>
								<div class="dashicons <?php echo esc_attr( $data['dashicon'] ); ?>"></div>
							<?php elseif ( ! empty( $data['emoji'] ) ) : ?>
								<div class="emoji"><?php echo esc_html( $data['emoji'] ); ?>"></div>
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
										'tab'       => 'plugin-information',
										'plugin'    => $data['plugin']['slug'],
										'TB_iframe' => true,
									),
									admin_url( 'plugin-install.php' )
								);

								?>
								<a href="<?php echo esc_url( $url ); ?>" class="thickbox open-plugin-details-modal plugin" target="_blank"><?php echo esc_html( $data['plugin']['Name'] ); ?></a>
							<?php elseif ( isset( $data['user'] ) ) : ?>
								<?php echo esc_html( $data['user']->display_name ); ?>
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
