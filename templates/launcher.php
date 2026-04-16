<?php
/**
 * The template for displaying the app launcher.
 *
 * @package My_Apps
 */

namespace My_Apps;

$apps = My_Apps::get_apps();
$hidden_apps = array_filter( $apps, function( $app ) {
	return ! empty( $app['hide'] );
} );
$can_manage = current_user_can( 'manage_options' );
?>
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
	<title><?php esc_html_e( 'My Apps', 'my-apps' ); ?></title>
	<?php wp_head(); ?>
</head>

<?php
$background = get_option( 'my_apps_background', 'gradient-purple' );
$custom_bg = get_option( 'my_apps_background_custom', '' );
$bg_style = '';
if ( $background === 'custom' && $custom_bg ) {
	$bg_style = 'style="background: ' . esc_attr( $custom_bg ) . ';"';
}
?>
<body class="my-apps-launcher bg-<?php echo esc_attr( $background ); ?>" <?php echo $bg_style; ?>>
	<div class="launcher-toolbar">
		<button type="button" class="toolbar-btn edit-btn" title="<?php esc_attr_e( 'Edit', 'my-apps' ); ?>">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
		</button>
		<button type="button" class="toolbar-btn done-btn" title="<?php esc_attr_e( 'Done', 'my-apps' ); ?>">
			<?php esc_html_e( 'Done', 'my-apps' ); ?>
		</button>
	</div>

	<div class="apps-container" id="apps-container">
		<?php
		foreach ( $apps as $slug => $_plugin ) :
			if ( isset( $_plugin['hide'] ) && $_plugin['hide'] ) {
				continue;
			}
			$icon_html = '';
			if ( ! empty( $_plugin['icon_url'] ) ) {
				$icon_html = '<img src="' . esc_attr( $_plugin['icon_url'] ) . '" alt="' . esc_attr( $_plugin['name'] ) . '">';
			} elseif ( ! empty( $_plugin['dashicon'] ) ) {
				$icon_html = '<div class="dashicons ' . esc_attr( $_plugin['dashicon'] ) . '"></div>';
			} elseif ( ! empty( $_plugin['emoji'] ) ) {
				$icon_html = '<div class="emoji">' . esc_html( $_plugin['emoji'] ) . '</div>';
			} else {
				continue;
			}
			?>
			<div class="app-icon" data-slug="<?php echo esc_attr( $slug ); ?>" data-url="<?php echo esc_url( $_plugin['url'] ); ?>">
				<button type="button" class="hide-btn" title="<?php esc_attr_e( 'Hide', 'my-apps' ); ?>"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#000" stroke="#fff" stroke-width="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></button>
				<a href="<?php echo esc_url( $_plugin['url'] ); ?>" class="app-link">
					<?php echo $icon_html; ?>
					<p class="app-title"><?php echo esc_html( $_plugin['name'] ); ?></p>
				</a>
			</div>
		<?php endforeach; ?>

		<div class="app-icon add-app-btn" title="<?php esc_attr_e( 'Add', 'my-apps' ); ?>">
			<div class="add-icon">+</div>
			<p class="app-title"><?php esc_html_e( 'Add', 'my-apps' ); ?></p>
			<div class="add-dropdown" id="add-dropdown">
				<button type="button" class="add-dropdown-item" data-action="install-software">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
					<?php esc_html_e( 'Install New App', 'my-apps' ); ?>
				</button>
				<button type="button" class="add-dropdown-item" data-action="add-link">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
					<?php esc_html_e( 'Add Link', 'my-apps' ); ?>
				</button>
			</div>
		</div>
	</div>

	<div class="bottom-toolbar">
		<button type="button" class="toolbar-btn hidden-btn" title="<?php esc_attr_e( 'Hidden Apps', 'my-apps' ); ?>" data-count="<?php echo count( $hidden_apps ); ?>">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
			<?php if ( count( $hidden_apps ) > 0 ) : ?>
			<span class="hidden-count"><?php echo count( $hidden_apps ); ?></span>
			<?php endif; ?>
		</button>
		<button type="button" class="toolbar-btn bg-btn" title="<?php esc_attr_e( 'Change Background', 'my-apps' ); ?>">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
		</button>
		<?php if ( $can_manage ) : ?>
		<div class="toolbar-btn settings-btn" role="button" tabindex="0" title="<?php esc_attr_e( 'Settings', 'my-apps' ); ?>">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
			<div class="settings-dropdown" id="settings-dropdown">
				<div class="settings-dropdown-section"><?php esc_html_e( 'Layout', 'my-apps' ); ?></div>
				<button type="button" class="settings-dropdown-item" data-action="layout-flow">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3z"/></svg>
					<?php esc_html_e( 'Flow', 'my-apps' ); ?>
				</button>
				<button type="button" class="settings-dropdown-item" data-action="layout-grid">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z"/></svg>
					<?php esc_html_e( 'Grid', 'my-apps' ); ?>
				</button>
				<div class="settings-grid-only" id="settings-grid-only">
					<div class="settings-dropdown-section"><?php esc_html_e( 'Columns', 'my-apps' ); ?> <span id="grid-columns-value"></span></div>
					<div class="settings-dropdown-slider">
						<input type="range" id="setting-grid-columns" min="3" max="12" step="1" value="6">
					</div>
				</div>
				<div class="settings-dropdown-section"><?php esc_html_e( 'Icon Size', 'my-apps' ); ?></div>
				<div class="settings-dropdown-slider">
					<input type="range" id="setting-icon-size" min="40" max="100" step="5" value="60">
				</div>
				<div class="settings-dropdown-section"><?php esc_html_e( 'Spacing', 'my-apps' ); ?></div>
				<div class="settings-dropdown-slider">
					<input type="range" id="setting-spacing" min="4" max="40" step="2" value="16">
				</div>
				<div class="settings-dropdown-divider"></div>
				<button type="button" class="settings-dropdown-item" data-action="export">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
					<?php esc_html_e( 'Export', 'my-apps' ); ?>
				</button>
				<button type="button" class="settings-dropdown-item" data-action="import">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
					<?php esc_html_e( 'Import', 'my-apps' ); ?>
				</button>
			</div>
		</div>
		<?php endif; ?>
	</div>

	<div class="hidden-popup" id="hidden-popup">
		<div class="hidden-popup-header"><?php esc_html_e( 'Hidden Apps', 'my-apps' ); ?></div>
		<div class="hidden-apps-list" id="hidden-apps-list">
			<?php if ( empty( $hidden_apps ) ) : ?>
			<div class="no-hidden-apps"><?php esc_html_e( 'No hidden apps', 'my-apps' ); ?></div>
			<?php else : ?>
			<?php foreach ( $hidden_apps as $slug => $app ) :
				$icon_html = '';
				if ( ! empty( $app['icon_url'] ) ) {
					$icon_html = '<img src="' . esc_attr( $app['icon_url'] ) . '" alt="">';
				} elseif ( ! empty( $app['dashicon'] ) ) {
					$icon_html = '<span class="dashicons ' . esc_attr( $app['dashicon'] ) . '"></span>';
				} elseif ( ! empty( $app['emoji'] ) ) {
					$icon_html = '<span class="emoji">' . esc_html( $app['emoji'] ) . '</span>';
				}
			?>
			<button type="button" class="hidden-app-item" data-slug="<?php echo esc_attr( $slug ); ?>">
				<span class="hidden-app-icon"><?php echo $icon_html; ?></span>
				<span class="hidden-app-name"><?php echo esc_html( $app['name'] ); ?></span>
				<span class="restore-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
				</span>
			</button>
			<?php endforeach; ?>
			<?php endif; ?>
		</div>
	</div>

	<div class="bg-picker-popup" id="bg-picker">
		<div class="bg-picker-section">
			<div class="bg-picker-label"><?php esc_html_e( 'Gradients', 'my-apps' ); ?></div>
			<div class="bg-options">
				<button type="button" class="bg-option bg-gradient-purple" data-bg="gradient-purple" title="Purple"></button>
				<button type="button" class="bg-option bg-gradient-blue" data-bg="gradient-blue" title="Blue"></button>
				<button type="button" class="bg-option bg-gradient-green" data-bg="gradient-green" title="Green"></button>
				<button type="button" class="bg-option bg-gradient-orange" data-bg="gradient-orange" title="Orange"></button>
				<button type="button" class="bg-option bg-gradient-pink" data-bg="gradient-pink" title="Pink"></button>
				<button type="button" class="bg-option bg-gradient-dark" data-bg="gradient-dark" title="Dark"></button>
				<button type="button" class="bg-option bg-gradient-sunset" data-bg="gradient-sunset" title="Sunset"></button>
				<button type="button" class="bg-option bg-gradient-ocean" data-bg="gradient-ocean" title="Ocean"></button>
			</div>
		</div>
		<div class="bg-picker-section">
			<div class="bg-picker-label"><?php esc_html_e( 'Solid Colors', 'my-apps' ); ?></div>
			<div class="bg-options">
				<button type="button" class="bg-option bg-solid-gray" data-bg="solid-gray" title="Gray"></button>
				<button type="button" class="bg-option bg-solid-blue" data-bg="solid-blue" title="Blue"></button>
				<button type="button" class="bg-option bg-solid-green" data-bg="solid-green" title="Green"></button>
				<button type="button" class="bg-option bg-solid-red" data-bg="solid-red" title="Red"></button>
				<button type="button" class="bg-option bg-solid-purple" data-bg="solid-purple" title="Purple"></button>
				<button type="button" class="bg-option bg-solid-dark" data-bg="solid-dark" title="Dark"></button>
			</div>
		</div>
	</div>

	<div class="context-menu" id="context-menu">
		<button type="button" data-action="open"><?php esc_html_e( 'Open', 'my-apps' ); ?></button>
		<button type="button" data-action="open-new"><?php esc_html_e( 'Open in New Tab', 'my-apps' ); ?></button>
		<hr>
		<button type="button" data-action="hide"><?php esc_html_e( 'Hide', 'my-apps' ); ?></button>
		<button type="button" data-action="move-front"><?php esc_html_e( 'Move to Front', 'my-apps' ); ?></button>
	</div>

	<div class="modal-overlay" id="add-app-modal">
		<div class="modal">
			<div class="modal-header">
				<h2><?php esc_html_e( 'Add App', 'my-apps' ); ?></h2>
				<button type="button" class="modal-close">&times;</button>
			</div>
			<div class="modal-tabs">
				<button type="button" class="modal-tab active" data-tab="admin-menu"><?php esc_html_e( 'Admin Menu', 'my-apps' ); ?></button>
				<button type="button" class="modal-tab" data-tab="custom"><?php esc_html_e( 'Custom Link', 'my-apps' ); ?></button>
			</div>
			<div class="modal-tab-content" id="tab-admin-menu">
				<div class="admin-menu-search">
					<input type="text" id="admin-menu-search" placeholder="<?php esc_attr_e( 'Search menu items...', 'my-apps' ); ?>">
				</div>
				<div class="admin-menu-tree" id="admin-menu-tree">
					<div class="admin-menu-loading"><?php esc_html_e( 'Loading...', 'my-apps' ); ?></div>
				</div>
			</div>
			<div class="modal-tab-content hidden" id="tab-custom">
				<form id="add-app-form">
					<div class="form-group">
						<label for="app-name"><?php esc_html_e( 'Name', 'my-apps' ); ?></label>
						<input type="text" id="app-name" name="name" required>
					</div>
					<div class="form-group">
						<label for="app-url"><?php esc_html_e( 'URL', 'my-apps' ); ?></label>
						<input type="url" id="app-url" name="url" required placeholder="https://">
					</div>
					<div class="form-group">
						<label><?php esc_html_e( 'Icon', 'my-apps' ); ?></label>
						<div class="icon-type-tabs">
							<button type="button" class="icon-tab active" data-type="emoji"><?php esc_html_e( 'Emoji', 'my-apps' ); ?></button>
							<button type="button" class="icon-tab" data-type="url"><?php esc_html_e( 'Image URL', 'my-apps' ); ?></button>
							<button type="button" class="icon-tab" data-type="dashicon"><?php esc_html_e( 'Dashicon', 'my-apps' ); ?></button>
						</div>
						<div class="icon-input-group">
							<input type="hidden" id="app-emoji" name="emoji">
							<div class="icon-input emoji-picker-container active">
								<div class="emoji-search">
									<input type="text" id="emoji-search" placeholder="<?php esc_attr_e( 'Search emoji...', 'my-apps' ); ?>">
								</div>
								<div class="emoji-picker" id="emoji-picker"></div>
							</div>
							<input type="url" id="app-icon-url" name="icon_url" class="icon-input" placeholder="https://example.com/icon.png">
							<input type="hidden" id="app-dashicon" name="dashicon">
							<div class="icon-input dashicon-picker-container">
								<div class="dashicon-search">
									<input type="text" id="dashicon-search" placeholder="<?php esc_attr_e( 'Search icons...', 'my-apps' ); ?>">
								</div>
								<div class="dashicon-picker" id="dashicon-picker"></div>
							</div>
						</div>
						<div class="icon-preview">
							<div class="preview-box" id="icon-preview"></div>
						</div>
					</div>
					<div class="form-actions">
						<button type="button" class="btn-cancel"><?php esc_html_e( 'Cancel', 'my-apps' ); ?></button>
						<button type="submit" class="btn-add"><?php esc_html_e( 'Add Link', 'my-apps' ); ?></button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<div class="modal-overlay" id="install-software-modal">
		<div class="modal modal-wide">
			<div class="app-store-layout">
				<nav class="app-store-sidebar" id="app-store-sidebar">
					<div class="app-store-search">
						<input type="text" id="app-store-search" placeholder="<?php esc_attr_e( 'Search', 'my-apps' ); ?>">
					</div>
					<ul class="app-store-nav" id="app-store-nav">
						<li class="app-store-nav-item active" data-category="all"><?php esc_html_e( 'All Apps', 'my-apps' ); ?></li>
					</ul>
				</nav>
				<div class="app-store-main">
					<div class="app-store-main-header">
						<h2 id="app-store-heading"><?php esc_html_e( 'All Apps', 'my-apps' ); ?></h2>
						<button type="button" class="modal-close">&times;</button>
					</div>
					<div class="app-store-content" id="app-store-content">
						<div class="app-store-loading"><?php esc_html_e( 'Loading apps...', 'my-apps' ); ?></div>
					</div>
				</div>
			</div>
		</div>
	</div>

<?php wp_footer(); ?>
</body>
</html>
