<?php
/**
 * Plugin Name: My Apps
 * Plugin author: Alex Kirk
 * Plugin URI: https://github.com/akirk/my-apps
 * Version: 1.3.0
 * Requires PHP: 5.6
 * Description: WordPress apps launcher
 *
 * License: GPL2
 * Text Domain: my-apps
 *
 * @package My_Apps
 */

namespace My_Apps;

defined( 'ABSPATH' ) || exit;

define( 'MY_APPS_VERSION', '1.3.0' );

require_once __DIR__ . '/class-my-apps.php';
require_once __DIR__ . '/default-apps.php';

register_activation_hook( __FILE__, __NAMESPACE__ . '\seed_default_apps' );

new My_Apps();
