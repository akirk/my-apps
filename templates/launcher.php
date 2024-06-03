<?php
/**
 * The template for displaying the app launcher.
 *
 * @package My_Apps
 */

namespace My_Apps;
?>
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title></title>
	<?php wp_head(); ?>
</head>

<body class="my-apps-launcher">
	<div class="app">
<?php
foreach ( My_Apps::get_apps() as $plugin ) {
	if ( isset( $plugin['icon_url'] ) ) {
		?>
		<div class="app-icon">
			<a href="<?php echo esc_url( $plugin['url'] ); ?>">
			<img src="<?php echo esc_attr( $plugin['icon_url'] ); ?>" alt='<?php echo esc_attr( $plugin['name'] ); ?>'>
			<p class="app-title"><?php echo esc_html( $plugin['name'] ); ?></p>
			</a>
		</div>
		<?php
	} elseif ( isset( $plugin['dashicons'] ) ) {
		?>
		<div class="app-icon">
			<a href="<?php echo esc_url( $plugin['url'] ); ?>">
			<div class="dashicons <?php echo esc_attr( $plugin['dashicons'] ); ?>"></div>
			<p class="app-title"><?php echo esc_html( $plugin['name'] ); ?></p>
			</a>
		</div>
		<?php
	}
}
?>
</div>
<?php
wp_footer();
