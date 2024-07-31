<?php
/**
 * Plugin Name: My Apps
 * Plugin author: Alex Kirk
 * Plugin URI: https://github.com/akirk/my-apps
 * Version: 1.0.0
 * Requires PHP: 5.6
 * Description: WordPress apps launcher
 *
 * License: GPL2
 * Text Domain: my-apps
 *
 * @package My_Apps
 */

namespace My_Apps;

define( 'MY_APPS_VERSION', '1.0.0' );

require_once __DIR__ . '/class-my-apps.php';
require_once __DIR__ . '/default-apps.php';

new My_Apps();
