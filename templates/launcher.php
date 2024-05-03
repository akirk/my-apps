<?php
/*
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
	<link rel="stylesheet" href="styles.css">
	<title></title>
	<?php wp_head(); ?>
	<style>
body {
	margin: 2em 0;
	padding: 0;
	font-family: Arial, sans-serif;
	background-color: rgba(52, 152, 219, 0.5);
}

.app {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
}

.app-icon {
	width: 100px;
	text-align: center;
	margin: 10px;
	border-radius: 10px;
	cursor: pointer;
}

.app-icon img {
	width: 80px;
	height: 80px;
	border-radius: 10px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	background-color: #fff;
}

.app-title {
	font-size: 16px;
	color: #fff;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	margin: 0;
	margin-top: 5px;
}

a {
	text-decoration: none;
}



	</style>
</head>

<body>
	<div class="app">
<?php
foreach ( My_Apps::get_apps() as $plugin ) {
	?>
		<div class="app-icon">
			<a href="<?php echo esc_url( $plugin['url'] ); ?>">
			<img src="<?php echo esc_attr( $plugin['icon_url'] ); ?>" alt='<?php echo esc_attr( $plugin['name'] ); ?>'>
			<p class="app-title"><?php echo esc_html( $plugin['name'] ); ?></p>
			</a>
		</div>
		<?php
}
?>
</div>
<?php
wp_footer();
