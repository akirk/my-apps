(function() {
	'use strict';

	const container = document.getElementById('apps-container');
	const editBtn = document.querySelector('.edit-btn');
	const doneBtn = document.querySelector('.done-btn');
	const contextMenu = document.getElementById('context-menu');
	const addAppForm = document.getElementById('add-app-form');
	const bgPicker = document.getElementById('bg-picker');
	const bgBtn = document.querySelector('.bg-btn');
	const settingsBtn = document.querySelector('.settings-btn');
	const settingsDropdown = document.getElementById('settings-dropdown');
	const hiddenPopup = document.getElementById('hidden-popup');
	const hiddenBtn = document.querySelector('.hidden-btn');
	const hiddenAppsList = document.getElementById('hidden-apps-list');
	const body = document.body;
	const adminMenuTree = document.getElementById('admin-menu-tree');
	const adminMenuSearch = document.getElementById('admin-menu-search');

	const installSoftwareModal = document.getElementById('install-software-modal');
	const appStoreContent = document.getElementById('app-store-content');
	const adminLinkView = document.getElementById('admin-link-view');
	const webLinkView = document.getElementById('web-link-view');

	let isEditMode = false;
	let adminMenuData = null;
	let appStoreData = null;
	let sortable = null;
	let longPressTimer = null;
	let contextTarget = null;
	// Tracks a deep-link target picked up by checkDeepLink so loadAppStore
	// can render the detail page directly instead of flashing the grid first.
	let pendingDeepLink = null;
	let deepLinkRendered = false;
	const LONG_PRESS_DURATION = 500;
	// Single base for the blueprints repo we read apps, recipes and the
	// curated plugin list from. Currently points at akirk/blueprints
	// branch add-recipes; after the upstream PR merges, change this one
	// line to WordPress/blueprints/trunk/.
	const BLUEPRINTS_BASE_URL = 'https://raw.githubusercontent.com/akirk/blueprints/add-recipes/';
	const APPS_INDEX_URL = BLUEPRINTS_BASE_URL + 'apps.json';
	const RECIPES_URL = BLUEPRINTS_BASE_URL + 'blueprints/my-wordpress/recipes.json';
	const PLUGINS_URL = BLUEPRINTS_BASE_URL + 'blueprints/my-wordpress/plugins.json';
	const WP_ORG_PLUGIN_INFO_URL = 'https://api.wordpress.org/plugins/info/1.2/';
	const isPlayground = !!(typeof myAppsConfig !== 'undefined' && myAppsConfig.isPlayground);
	let recipes = {};
	let hasRecipes = false;
	let recipesLoadState = 'idle'; // idle | loading | loaded | failed
	// Stash a recipe slug picked up from ?recipe= so we can render the
	// detail once recipes finish fetching.
	let pendingRecipe = null;

	// ── Custom Blueprint Storage (localStorage) ─────────────
	var CUSTOM_BLUEPRINTS_KEY = 'my_apps_custom_blueprints';

	function getCustomBlueprints() {
		try {
			return JSON.parse(localStorage.getItem(CUSTOM_BLUEPRINTS_KEY)) || {};
		} catch (e) {
			return {};
		}
	}

	function saveCustomBlueprint(path, meta, blueprint, overrides) {
		var custom = getCustomBlueprints();
		custom[path] = { meta: meta, blueprint: blueprint, overrides: overrides || null };
		localStorage.setItem(CUSTOM_BLUEPRINTS_KEY, JSON.stringify(custom));
	}

	function deleteCustomBlueprint(path) {
		var custom = getCustomBlueprints();
		delete custom[path];
		localStorage.setItem(CUSTOM_BLUEPRINTS_KEY, JSON.stringify(custom));
	}

	function mergeCustomBlueprints(data) {
		var custom = getCustomBlueprints();
		Object.keys(custom).forEach(function(path) {
			var entry = custom[path];
			// If this overrides an existing app, replace it
			if (entry.overrides && data[entry.overrides]) {
				delete data[entry.overrides];
			}
			data[path] = entry.meta;
			data[path]._custom = true;
			if (entry.overrides) {
				data[path]._overrides = entry.overrides;
			}
		});
		return data;
	}

	function getBlueprintUrl(path) {
		var custom = getCustomBlueprints();
		if (custom[path]) {
			return 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(custom[path].blueprint))));
		}
		return BLUEPRINTS_BASE_URL + path;
	}

	function showToast(message) {
		var existing = document.querySelector('.my-apps-toast');
		if (existing) existing.remove();
		var toast = document.createElement('div');
		toast.className = 'my-apps-toast';
		toast.textContent = message;
		document.body.appendChild(toast);
		setTimeout(function() { toast.classList.add('visible'); }, 10);
		setTimeout(function() {
			toast.classList.remove('visible');
			setTimeout(function() { toast.remove(); }, 300);
		}, 3000);
	}

	// ── Auto-add icon for blueprint/plugin installs ──
	function addAppFromBlueprint(app, blueprint, gradient) {
		var landingPage = blueprint && blueprint.landingPage;
		if (!landingPage) return Promise.resolve(false);

		var appUrl = landingPage.indexOf('http') === 0
			? landingPage
			: window.location.origin + landingPage;

		var formData = new FormData();
		formData.append('action', 'my_apps_add');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('name', app.title);
		formData.append('url', appUrl);
		if (app._icon) {
			formData.append('icon_url', app._icon);
		} else {
			formData.append('gradient', gradient || 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)');
		}

		return fetch(myAppsConfig.ajaxUrl, { method: 'POST', body: formData })
			.then(function(res) { return res.json(); })
			.then(function(data) { return !!(data && data.success); })
			.catch(function() { return false; });
	}

	function resolveBlueprintFromUrl(blueprintUrl) {
		var customBlueprints = getCustomBlueprints();
		var blueprintPath = null;
		Object.keys(customBlueprints).forEach(function(path) {
			if (getBlueprintUrl(path) === blueprintUrl) {
				blueprintPath = path;
			}
		});
		if (blueprintPath && customBlueprints[blueprintPath]) {
			return Promise.resolve(customBlueprints[blueprintPath].blueprint);
		}
		return fetch(blueprintUrl).then(function(res) { return res.json(); });
	}

	function addAppFromBlueprintUrl(app, blueprintUrl, gradient) {
		return resolveBlueprintFromUrl(blueprintUrl)
			.then(function(blueprint) { return addAppFromBlueprint(app, blueprint, gradient); })
			.catch(function() { return false; });
	}

	var emojis = [
		{ emoji: '📱', keywords: 'phone mobile smartphone device' },
		{ emoji: '💻', keywords: 'laptop computer mac pc device' },
		{ emoji: '🖥️', keywords: 'desktop computer monitor screen' },
		{ emoji: '⌨️', keywords: 'keyboard type' },
		{ emoji: '🖱️', keywords: 'mouse click' },
		{ emoji: '📧', keywords: 'email mail envelope message' },
		{ emoji: '✉️', keywords: 'email mail envelope letter' },
		{ emoji: '📨', keywords: 'email mail incoming' },
		{ emoji: '📝', keywords: 'note write memo edit document' },
		{ emoji: '📄', keywords: 'document page file paper' },
		{ emoji: '📁', keywords: 'folder file directory' },
		{ emoji: '📂', keywords: 'folder open file' },
		{ emoji: '🗂️', keywords: 'folders files index dividers' },
		{ emoji: '📊', keywords: 'chart graph bar analytics stats' },
		{ emoji: '📈', keywords: 'chart graph up trending analytics' },
		{ emoji: '📉', keywords: 'chart graph down analytics' },
		{ emoji: '📋', keywords: 'clipboard list tasks' },
		{ emoji: '📌', keywords: 'pin pushpin location mark' },
		{ emoji: '📎', keywords: 'paperclip attachment clip' },
		{ emoji: '🔗', keywords: 'link chain url' },
		{ emoji: '🌐', keywords: 'globe web world internet' },
		{ emoji: '🔍', keywords: 'search magnifying glass find' },
		{ emoji: '🔎', keywords: 'search magnifying glass find' },
		{ emoji: '⚙️', keywords: 'settings gear cog config' },
		{ emoji: '🔧', keywords: 'settings wrench tool config fix' },
		{ emoji: '🔨', keywords: 'hammer tool build' },
		{ emoji: '🛠️', keywords: 'tools hammer wrench build' },
		{ emoji: '⚡', keywords: 'lightning fast power electric' },
		{ emoji: '🔥', keywords: 'fire hot trending popular' },
		{ emoji: '💡', keywords: 'idea lightbulb tip' },
		{ emoji: '💰', keywords: 'money bag cash finance' },
		{ emoji: '💵', keywords: 'money dollar cash finance' },
		{ emoji: '💳', keywords: 'credit card payment' },
		{ emoji: '🏦', keywords: 'bank finance money building' },
		{ emoji: '🛒', keywords: 'shopping cart store buy' },
		{ emoji: '🛍️', keywords: 'shopping bags store buy' },
		{ emoji: '🏪', keywords: 'store shop convenience' },
		{ emoji: '🏠', keywords: 'home house building' },
		{ emoji: '🏢', keywords: 'office building work' },
		{ emoji: '🏗️', keywords: 'construction building crane' },
		{ emoji: '📍', keywords: 'location pin map place' },
		{ emoji: '🗺️', keywords: 'map world location' },
		{ emoji: '🚀', keywords: 'rocket launch fast startup' },
		{ emoji: '✈️', keywords: 'airplane plane travel flight' },
		{ emoji: '🚗', keywords: 'car auto vehicle drive' },
		{ emoji: '🚌', keywords: 'bus transit transport' },
		{ emoji: '🚲', keywords: 'bike bicycle cycle' },
		{ emoji: '📅', keywords: 'calendar date schedule' },
		{ emoji: '📆', keywords: 'calendar date schedule' },
		{ emoji: '⏰', keywords: 'clock alarm time' },
		{ emoji: '🕐', keywords: 'clock time hour' },
		{ emoji: '⏱️', keywords: 'stopwatch timer time' },
		{ emoji: '☀️', keywords: 'sun weather bright' },
		{ emoji: '🌙', keywords: 'moon night dark' },
		{ emoji: '⭐', keywords: 'star favorite rating' },
		{ emoji: '🌟', keywords: 'star glow shine sparkle' },
		{ emoji: '❤️', keywords: 'heart love favorite red' },
		{ emoji: '💜', keywords: 'heart love purple' },
		{ emoji: '💙', keywords: 'heart love blue' },
		{ emoji: '💚', keywords: 'heart love green' },
		{ emoji: '🧡', keywords: 'heart love orange' },
		{ emoji: '💛', keywords: 'heart love yellow' },
		{ emoji: '👤', keywords: 'user person profile account' },
		{ emoji: '👥', keywords: 'users people group team' },
		{ emoji: '👨‍💻', keywords: 'developer programmer coder tech man' },
		{ emoji: '👩‍💻', keywords: 'developer programmer coder tech woman' },
		{ emoji: '👨‍💼', keywords: 'business man office work' },
		{ emoji: '👩‍💼', keywords: 'business woman office work' },
		{ emoji: '🤖', keywords: 'robot bot ai automation' },
		{ emoji: '👾', keywords: 'game alien monster' },
		{ emoji: '🎮', keywords: 'game controller play gaming' },
		{ emoji: '🎯', keywords: 'target goal dart bullseye' },
		{ emoji: '🎨', keywords: 'art palette paint design' },
		{ emoji: '🖼️', keywords: 'picture frame image photo' },
		{ emoji: '📷', keywords: 'camera photo picture' },
		{ emoji: '📸', keywords: 'camera flash photo' },
		{ emoji: '🎥', keywords: 'camera video movie film' },
		{ emoji: '📹', keywords: 'video camera record' },
		{ emoji: '🎬', keywords: 'movie film clapper action' },
		{ emoji: '📺', keywords: 'tv television screen watch' },
		{ emoji: '🎵', keywords: 'music note audio sound' },
		{ emoji: '🎶', keywords: 'music notes audio sound' },
		{ emoji: '🎧', keywords: 'headphones music audio listen' },
		{ emoji: '🎤', keywords: 'microphone audio voice podcast' },
		{ emoji: '📻', keywords: 'radio audio broadcast' },
		{ emoji: '📚', keywords: 'books library read study' },
		{ emoji: '📖', keywords: 'book read open' },
		{ emoji: '📓', keywords: 'notebook journal diary' },
		{ emoji: '✏️', keywords: 'pencil write edit' },
		{ emoji: '🖊️', keywords: 'pen write' },
		{ emoji: '✅', keywords: 'check done complete yes' },
		{ emoji: '❌', keywords: 'x cross no cancel delete' },
		{ emoji: '⚠️', keywords: 'warning alert caution' },
		{ emoji: '🚫', keywords: 'prohibited forbidden no ban' },
		{ emoji: 'ℹ️', keywords: 'info information' },
		{ emoji: '❓', keywords: 'question help ask' },
		{ emoji: '❗', keywords: 'exclamation alert important' },
		{ emoji: '🔔', keywords: 'bell notification alert' },
		{ emoji: '🔕', keywords: 'bell mute silent notification' },
		{ emoji: '🔒', keywords: 'lock secure private' },
		{ emoji: '🔓', keywords: 'unlock open unsecure' },
		{ emoji: '🔑', keywords: 'key password access' },
		{ emoji: '🗝️', keywords: 'key old vintage' },
		{ emoji: '💬', keywords: 'chat message speech bubble comment' },
		{ emoji: '💭', keywords: 'thought bubble thinking' },
		{ emoji: '🗨️', keywords: 'speech bubble chat' },
		{ emoji: '🗣️', keywords: 'speaking head voice talk' },
		{ emoji: '👍', keywords: 'thumbs up like good yes' },
		{ emoji: '👎', keywords: 'thumbs down dislike bad no' },
		{ emoji: '👏', keywords: 'clap applause praise' },
		{ emoji: '🙌', keywords: 'hands raised celebration' },
		{ emoji: '🤝', keywords: 'handshake deal agreement' },
		{ emoji: '✨', keywords: 'sparkles magic new shine' },
		{ emoji: '🎉', keywords: 'party celebration tada' },
		{ emoji: '🎊', keywords: 'confetti celebration party' },
		{ emoji: '🎁', keywords: 'gift present box' },
		{ emoji: '🏆', keywords: 'trophy winner award prize' },
		{ emoji: '🥇', keywords: 'medal gold first winner' },
		{ emoji: '📢', keywords: 'megaphone announce loud' },
		{ emoji: '📣', keywords: 'megaphone cheering announce' },
		{ emoji: '🔊', keywords: 'speaker volume loud audio' },
		{ emoji: '🔇', keywords: 'speaker mute silent audio' },
		{ emoji: '☁️', keywords: 'cloud weather storage' },
		{ emoji: '⬆️', keywords: 'arrow up upload' },
		{ emoji: '⬇️', keywords: 'arrow down download' },
		{ emoji: '➡️', keywords: 'arrow right next forward' },
		{ emoji: '⬅️', keywords: 'arrow left back previous' },
		{ emoji: '🔄', keywords: 'refresh reload sync arrows' },
		{ emoji: '➕', keywords: 'plus add new' },
		{ emoji: '➖', keywords: 'minus remove subtract' },
		{ emoji: '🏷️', keywords: 'tag label price' },
		{ emoji: '📤', keywords: 'outbox send upload' },
		{ emoji: '📥', keywords: 'inbox receive download' },
		{ emoji: '📦', keywords: 'package box shipping' },
		{ emoji: '🗄️', keywords: 'cabinet files storage' },
		{ emoji: '🗑️', keywords: 'trash delete bin garbage' },
		{ emoji: '☕', keywords: 'coffee drink cafe' },
		{ emoji: '🍵', keywords: 'tea drink cup' },
		{ emoji: '🍺', keywords: 'beer drink alcohol' },
		{ emoji: '🍕', keywords: 'pizza food' },
		{ emoji: '🍔', keywords: 'burger food hamburger' },
		{ emoji: '🌮', keywords: 'taco food mexican' },
		{ emoji: '🍣', keywords: 'sushi food japanese' },
		{ emoji: '🥗', keywords: 'salad food healthy' },
		{ emoji: '🐱', keywords: 'cat pet animal' },
		{ emoji: '🐶', keywords: 'dog pet animal' },
		{ emoji: '🦊', keywords: 'fox animal' },
		{ emoji: '🐻', keywords: 'bear animal' },
		{ emoji: '🦁', keywords: 'lion animal' },
		{ emoji: '🐼', keywords: 'panda animal' },
		{ emoji: '🌈', keywords: 'rainbow colors pride' },
		{ emoji: '🔴', keywords: 'red circle dot' },
		{ emoji: '🟠', keywords: 'orange circle dot' },
		{ emoji: '🟡', keywords: 'yellow circle dot' },
		{ emoji: '🟢', keywords: 'green circle dot' },
		{ emoji: '🔵', keywords: 'blue circle dot' },
		{ emoji: '🟣', keywords: 'purple circle dot' },
		{ emoji: '⚫', keywords: 'black circle dot' },
		{ emoji: '⚪', keywords: 'white circle dot' },
		{ emoji: '🟤', keywords: 'brown circle dot' }
	];

	var dashicons = [
		'admin-site', 'admin-site-alt', 'admin-site-alt2', 'admin-site-alt3',
		'dashboard', 'admin-post', 'admin-media', 'admin-links',
		'admin-page', 'admin-comments', 'admin-appearance', 'admin-plugins',
		'admin-users', 'admin-tools', 'admin-settings', 'admin-network',
		'admin-home', 'admin-generic', 'admin-collapse', 'filter',
		'admin-customizer', 'admin-multisite', 'welcome-write-blog', 'welcome-view-site',
		'welcome-widgets-menus', 'welcome-comments', 'welcome-learn-more', 'format-aside',
		'format-image', 'format-gallery', 'format-video', 'format-audio',
		'format-chat', 'format-status', 'format-quote', 'camera',
		'images-alt', 'images-alt2', 'video-alt', 'video-alt2',
		'video-alt3', 'media-archive', 'media-audio', 'media-code',
		'media-default', 'media-document', 'media-interactive', 'media-spreadsheet',
		'media-text', 'media-video', 'playlist-audio', 'playlist-video',
		'controls-play', 'controls-pause', 'controls-forward', 'controls-back',
		'album', 'calendar', 'calendar-alt', 'clock',
		'email', 'email-alt', 'email-alt2', 'phone',
		'smartphone', 'tablet', 'desktop', 'laptop',
		'store', 'cart', 'products', 'money-alt',
		'bank', 'bitcoin', 'book', 'book-alt',
		'database', 'cloud', 'cloud-upload', 'cloud-download',
		'download', 'upload', 'backup', 'lightbulb',
		'microphone', 'palmtree', 'airplane', 'car',
		'location', 'location-alt', 'chart-pie', 'chart-bar',
		'chart-line', 'chart-area', 'groups', 'businessman',
		'businesswoman', 'businessperson', 'id', 'id-alt',
		'universal-access', 'universal-access-alt', 'nametag', 'star-filled',
		'star-half', 'star-empty', 'flag', 'warning',
		'yes', 'yes-alt', 'no', 'no-alt',
		'plus', 'plus-alt', 'plus-alt2', 'minus',
		'dismiss', 'marker', 'lock', 'unlock',
		'sticky', 'external', 'arrow-up', 'arrow-down',
		'arrow-left', 'arrow-right', 'arrow-up-alt', 'arrow-down-alt',
		'arrow-left-alt', 'arrow-right-alt', 'arrow-up-alt2', 'arrow-down-alt2',
		'arrow-left-alt2', 'arrow-right-alt2', 'sort', 'leftright',
		'randomize', 'list-view', 'excerpt-view', 'grid-view',
		'move', 'share', 'share-alt', 'share-alt2',
		'rss', 'twitter', 'facebook', 'facebook-alt',
		'instagram', 'linkedin', 'pinterest', 'podio',
		'googleplus', 'networking', 'amazon', 'reddit',
		'spotify', 'twitch', 'whatsapp', 'xing',
		'youtube', 'wordpress', 'wordpress-alt', 'hammer',
		'art', 'migrate', 'performance', 'paperclip',
		'edit', 'editor-help', 'editor-bold', 'editor-italic',
		'editor-ul', 'editor-ol', 'editor-quote', 'editor-alignleft',
		'editor-aligncenter', 'editor-alignright', 'editor-insertmore', 'editor-spellcheck',
		'editor-distractionfree', 'editor-kitchensink', 'editor-underline', 'editor-justify',
		'editor-textcolor', 'editor-paste-word', 'editor-paste-text', 'editor-removeformatting',
		'editor-video', 'editor-customchar', 'editor-outdent', 'editor-indent',
		'editor-ltr', 'editor-break', 'editor-code', 'editor-paragraph',
		'editor-table', 'align-left', 'align-right', 'align-center',
		'align-none', 'buddicons-activity', 'buddicons-bbpress-logo', 'buddicons-buddypress-logo',
		'buddicons-community', 'buddicons-forums', 'buddicons-friends', 'buddicons-groups',
		'buddicons-pm', 'buddicons-replies', 'buddicons-topics', 'buddicons-tracking',
		'heart', 'games', 'pets', 'tickets-alt',
		'food', 'coffee', 'beer', 'building',
		'menu', 'menu-alt', 'menu-alt2', 'menu-alt3',
		'search', 'text', 'screenoptions', 'info', 'info-outline',
		'trash', 'undo', 'redo', 'visibility', 'hidden',
		'update', 'update-alt', 'post-status', 'pressthis',
		'translation', 'tag', 'category', 'archive',
		'tagcloud', 'text-page', 'analytics', 'shield',
		'shield-alt', 'vault', 'privacy', 'superhero', 'superhero-alt',
		'rest-api', 'code-standards', 'buddicons-tracking', 'fullscreen-alt', 'fullscreen-exit-alt',
		'tide', 'smiley', 'thumbs-up', 'thumbs-down', 'layout',
		'html', 'database-add', 'database-remove', 'database-import', 'database-export', 'database-view',
		'open-folder', 'portfolio', 'hourglass', 'color-picker', 'embed-audio',
		'embed-generic', 'embed-photo', 'embed-post', 'embed-video', 'exit',
		'heading', 'insert', 'insert-after', 'insert-before', 'remove',
		'saved', 'shortcode', 'table-col-after', 'table-col-before', 'table-col-delete',
		'table-row-after', 'table-row-before', 'table-row-delete', 'text-page'
	];

	function init() {
		initSortable();
		initEmojiPicker();
		initDashiconPicker();
		bindEvents();
		bindAdminMenuSearch();
		checkDeepLink();
		initGreeting();
	}

	var HIDE_GREETING_KEY = 'my_apps_hide_greeting';

	function isGreetingHidden() {
		var stored = localStorage.getItem(HIDE_GREETING_KEY);
		if (stored === '1') return true;
		if (stored === '0') return false;
		return !isPlayground;
	}

	function toggleGreeting() {
		var newHidden = !isGreetingHidden();
		localStorage.setItem(HIDE_GREETING_KEY, newHidden ? '1' : '0');
		initGreeting();
		updateGreetingToggleLabel();
	}

	function updateGreetingToggleLabel() {
		var label = document.querySelector('.toggle-greeting-label');
		if (!label) return;
		label.textContent = isGreetingHidden() ? 'Show greeting' : 'Hide greeting';
	}

	function initGreeting() {
		var greeting = document.getElementById('greeting');
		if ( ! greeting ) {
			return;
		}
		if ( isGreetingHidden() ) {
			greeting.innerHTML = '';
			return;
		}
		var displayName = myAppsConfig.displayName || 'admin';
		renderGreeting(greeting, displayName);
	}

	function renderGreeting(greeting, displayName) {
		var isDefault = displayName.toLowerCase() === 'admin';
		if ( isDefault ) {
			greeting.innerHTML = 'Hi, <span class="greeting-name">' + escapeHtml(displayName) + '</span>!' +
				'<span class="greeting-nudge">You\'re not really called admin, are you? Click to change your name!</span>';
		} else {
			greeting.innerHTML = 'Hi, <span class="greeting-name">' + escapeHtml(displayName) + '</span>!';
		}
		greeting.querySelector('.greeting-name').addEventListener('click', function() {
			startNameEdit(greeting, displayName);
		});
	}

	function startNameEdit(greeting, currentName) {
		var isDefault = currentName.toLowerCase() === 'admin';
		greeting.innerHTML = '<span class="greeting-edit">Hi, <input type="text" id="greeting-name-input" value="' +
			escapeAttr(isDefault ? '' : currentName) + '" placeholder="Your name"' +
			' maxlength="50" autofocus>!</span>';
		var input = document.getElementById('greeting-name-input');
		input.focus();
		input.addEventListener('keydown', function(e) {
			if ( e.key === 'Enter' ) {
				saveDisplayName(greeting, input.value.trim());
			} else if ( e.key === 'Escape' ) {
				renderGreeting(greeting, currentName);
			}
		});
		input.addEventListener('blur', function() {
			var val = input.value.trim();
			if ( val && val !== currentName ) {
				saveDisplayName(greeting, val);
			} else {
				renderGreeting(greeting, currentName);
			}
		});
	}

	function saveDisplayName(greeting, newName) {
		if ( ! newName ) {
			return;
		}
		var formData = new FormData();
		formData.append('action', 'my_apps_save_display_name');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('display_name', newName);
		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			body: formData,
		})
		.then(function(r) { return r.json(); })
		.then(function(resp) {
			if ( resp.success ) {
				renderGreeting(greeting, resp.data.display_name);
				if ( resp.data.blogname ) {
					updateAdminBarSiteName(resp.data.blogname);
				}
			} else {
				renderGreeting(greeting, newName);
			}
		})
		.catch(function() {
			renderGreeting(greeting, newName);
		});
	}

	function updateAdminBarSiteName(title) {
		var siteNode = document.getElementById('wp-admin-bar-site-name');
		if ( ! siteNode ) {
			return;
		}
		var link = siteNode.querySelector(':scope > a.ab-item');
		if ( link ) {
			link.textContent = title;
		}
		siteNode.querySelectorAll('[aria-label]').forEach(function(el) {
			el.setAttribute('aria-label', title);
		});
	}

	function escapeHtml(str) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		return div.innerHTML;
	}

	function escapeAttr(str) {
		return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function bindAdminMenuSearch() {
		if (adminMenuSearch) {
			adminMenuSearch.addEventListener('input', function() {
				filterAdminMenu(adminMenuSearch.value);
			});
		}
	}

	function loadAdminMenu() {
		var formData = new FormData();
		formData.append('action', 'my_apps_get_admin_menu');
		formData.append('nonce', myAppsConfig.nonce);

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data.success) {
				adminMenuData = data.data;
				renderAdminMenuTree(adminMenuData);
			} else {
				while (adminMenuTree.firstChild) {
					adminMenuTree.removeChild(adminMenuTree.firstChild);
				}
				var errorEl = document.createElement('div');
				errorEl.className = 'admin-menu-empty';
				errorEl.textContent = 'Failed to load menu';
				adminMenuTree.appendChild(errorEl);
			}
		})
		.catch(function() {
			while (adminMenuTree.firstChild) {
				adminMenuTree.removeChild(adminMenuTree.firstChild);
			}
			var errorEl = document.createElement('div');
			errorEl.className = 'admin-menu-empty';
			errorEl.textContent = 'Failed to load menu';
			adminMenuTree.appendChild(errorEl);
		});
	}

	function createDashicon(iconClass) {
		var span = document.createElement('span');
		span.className = 'dashicons ' + iconClass;
		return span;
	}

	function createIconElement(dashicon) {
		var iconEl = document.createElement('span');
		iconEl.className = 'admin-menu-icon';

		if (dashicon && dashicon.indexOf('dashicons-') === 0) {
			iconEl.appendChild(createDashicon(dashicon));
		} else if (dashicon && (dashicon.indexOf('http') === 0 || dashicon.indexOf('data:') === 0)) {
			var img = document.createElement('img');
			img.src = dashicon;
			img.alt = '';
			iconEl.appendChild(img);
		} else {
			iconEl.appendChild(createDashicon('dashicons-admin-generic'));
		}
		return iconEl;
	}

	function createToggleSvg() {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z');
		svg.appendChild(path);
		return svg;
	}

	function renderAdminMenuTree(menuData, filter) {
		filter = (filter || '').toLowerCase();

		while (adminMenuTree.firstChild) {
			adminMenuTree.removeChild(adminMenuTree.firstChild);
		}

		var hasResults = false;

		menuData.forEach(function(parent) {
			var matchesFilter = !filter || parent.name.toLowerCase().indexOf(filter) !== -1;
			var matchingChildren = [];

			if (parent.children && parent.children.length > 0) {
				matchingChildren = parent.children.filter(function(child) {
					return !filter || child.name.toLowerCase().indexOf(filter) !== -1;
				});
			}

			if (!matchesFilter && matchingChildren.length === 0) {
				return;
			}

			hasResults = true;

			var parentEl = document.createElement('div');
			parentEl.className = 'admin-menu-parent';
			if (!parent.children || parent.children.length === 0) {
				parentEl.classList.add('no-children');
			}
			if (filter && matchingChildren.length > 0) {
				parentEl.classList.add('expanded');
			}

			var headerEl = document.createElement('button');
			headerEl.type = 'button';
			headerEl.className = 'admin-menu-parent-header';

			var toggleEl = document.createElement('span');
			toggleEl.className = 'admin-menu-toggle';
			toggleEl.appendChild(createToggleSvg());
			headerEl.appendChild(toggleEl);

			headerEl.appendChild(createIconElement(parent.dashicon));

			var nameEl = document.createElement('span');
			nameEl.className = 'admin-menu-name';
			nameEl.textContent = parent.name;
			headerEl.appendChild(nameEl);

			var addBtn = document.createElement('button');
			addBtn.type = 'button';
			addBtn.className = 'admin-menu-add';
			addBtn.textContent = '+';
			addBtn.title = 'Add ' + parent.name;
			addBtn.addEventListener('click', function(e) {
				e.stopPropagation();
				addAdminMenuItem(parent, addBtn);
			});
			headerEl.appendChild(addBtn);

			headerEl.addEventListener('click', function(e) {
				if (e.target.closest('.admin-menu-add')) return;
				if (parent.children && parent.children.length > 0) {
					parentEl.classList.toggle('expanded');
				}
			});

			parentEl.appendChild(headerEl);

			if (parent.children && parent.children.length > 0) {
				var childrenEl = document.createElement('div');
				childrenEl.className = 'admin-menu-children';

				var childrenToShow = filter ? matchingChildren : parent.children;
				childrenToShow.forEach(function(child) {
					var itemEl = document.createElement('button');
					itemEl.type = 'button';
					itemEl.className = 'admin-menu-item';

					itemEl.appendChild(createIconElement(child.dashicon));

					var childNameEl = document.createElement('span');
					childNameEl.className = 'admin-menu-name';
					childNameEl.textContent = child.name;
					itemEl.appendChild(childNameEl);

					var childAddBtn = document.createElement('button');
					childAddBtn.type = 'button';
					childAddBtn.className = 'admin-menu-add';
					childAddBtn.textContent = '+';
					childAddBtn.title = 'Add ' + child.name;
					childAddBtn.addEventListener('click', function(e) {
						e.stopPropagation();
						addAdminMenuItem(child, childAddBtn);
					});
					itemEl.appendChild(childAddBtn);

					itemEl.addEventListener('click', function(e) {
						if (e.target.closest('.admin-menu-add')) return;
						addAdminMenuItem(child, childAddBtn);
					});

					childrenEl.appendChild(itemEl);
				});

				parentEl.appendChild(childrenEl);
			}

			adminMenuTree.appendChild(parentEl);
		});

		if (!hasResults) {
			var emptyEl = document.createElement('div');
			emptyEl.className = 'admin-menu-empty';
			emptyEl.textContent = 'No menu items found';
			adminMenuTree.appendChild(emptyEl);
		}
	}

	function filterAdminMenu(filter) {
		if (adminMenuData) {
			renderAdminMenuTree(adminMenuData, filter);
		}
	}

	function addAdminMenuItem(item, btn) {
		var dashicon = item.dashicon;
		if (dashicon && dashicon.indexOf('dashicons-') !== 0 && dashicon.indexOf('http') !== 0 && dashicon.indexOf('data:') !== 0) {
			dashicon = 'dashicons-admin-generic';
		}

		var iconData = {};
		if (dashicon && dashicon.indexOf('dashicons-') === 0) {
			iconData.dashicon = dashicon;
		} else if (dashicon && (dashicon.indexOf('http') === 0 || dashicon.indexOf('data:') === 0)) {
			iconData.icon_url = dashicon;
		} else {
			iconData.dashicon = 'dashicons-admin-generic';
		}

		var formData = new FormData();
		formData.append('action', 'my_apps_add');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('name', item.name);
		formData.append('url', item.url);
		Object.keys(iconData).forEach(function(key) {
			formData.append(key, iconData[key]);
		});

		btn.classList.add('added');
		btn.textContent = '✓';

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data.success) {
				if (data.data && data.data.slug && Array.isArray(myAppsConfig.deletableSlugs) && myAppsConfig.deletableSlugs.indexOf(data.data.slug) === -1) {
					myAppsConfig.deletableSlugs.push(data.data.slug);
				}
				var newApp = createAppElement(data.data);
				var addBtn = document.querySelector('.add-app-btn');
				container.insertBefore(newApp, addBtn);

				setTimeout(function() {
					btn.classList.remove('added');
					btn.textContent = '+';
				}, 1500);
			} else {
				btn.classList.remove('added');
				btn.textContent = '+';
				alert(data.data || 'Error adding app');
			}
		})
		.catch(function() {
			btn.classList.remove('added');
			btn.textContent = '+';
			alert('Network error');
		});
	}

	function initEmojiPicker() {
		var picker = document.getElementById('emoji-picker');
		var searchInput = document.getElementById('emoji-search');

		function renderEmojis(filter) {
			while (picker.firstChild) {
				picker.removeChild(picker.firstChild);
			}

			var filterLower = (filter || '').toLowerCase();
			var currentValue = document.getElementById('app-emoji').value;

			emojis.forEach(function(item) {
				if (filterLower && item.keywords.toLowerCase().indexOf(filterLower) === -1 && item.emoji.indexOf(filterLower) === -1) {
					return;
				}

				var btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'emoji-option';
				btn.textContent = item.emoji;
				btn.title = item.keywords.split(' ').slice(0, 3).join(', ');

				if (currentValue === item.emoji) {
					btn.classList.add('selected');
				}

				btn.addEventListener('click', function() {
					picker.querySelectorAll('.emoji-option').forEach(function(b) {
						b.classList.remove('selected');
					});
					btn.classList.add('selected');
					document.getElementById('app-emoji').value = item.emoji;
					updateIconPreview();
				});

				picker.appendChild(btn);
			});
		}

		renderEmojis('');

		searchInput.addEventListener('input', function() {
			renderEmojis(searchInput.value);
		});
	}

	function initSortable() {
		sortable = new Sortable(container, {
			animation: 150,
			ghostClass: 'sortable-ghost',
			chosenClass: 'sortable-chosen',
			dragClass: 'sortable-drag',
			filter: '.add-app-btn',
			disabled: true,
			onEnd: function() {
				if (isEditMode) {
					saveOrder();
				}
			}
		});
	}

	function initDashiconPicker() {
		var picker = document.getElementById('dashicon-picker');
		var searchInput = document.getElementById('dashicon-search');

		function renderIcons(filter) {
			while (picker.firstChild) {
				picker.removeChild(picker.firstChild);
			}

			var filterLower = (filter || '').toLowerCase();
			var currentValue = document.getElementById('app-dashicon').value;

			dashicons.forEach(function(icon) {
				if (filterLower && icon.toLowerCase().indexOf(filterLower) === -1) {
					return;
				}

				var btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'dashicon-option';
				btn.dataset.icon = 'dashicons-' + icon;
				btn.title = icon;

				if (currentValue === 'dashicons-' + icon) {
					btn.classList.add('selected');
				}

				var span = document.createElement('span');
				span.className = 'dashicons dashicons-' + icon;
				btn.appendChild(span);

				btn.addEventListener('click', function() {
					picker.querySelectorAll('.dashicon-option').forEach(function(b) {
						b.classList.remove('selected');
					});
					btn.classList.add('selected');
					document.getElementById('app-dashicon').value = 'dashicons-' + icon;
					updateIconPreview();
				});

				picker.appendChild(btn);
			});
		}

		renderIcons('');

		searchInput.addEventListener('input', function() {
			renderIcons(searchInput.value);
		});
	}

	function bindEvents() {
		editBtn.addEventListener('click', enterEditMode);
		doneBtn.addEventListener('click', exitEditMode);

		container.addEventListener('touchstart', handleTouchStart, { passive: true });
		container.addEventListener('touchend', handleTouchEnd);
		container.addEventListener('touchmove', handleTouchMove, { passive: true });

		container.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('click', hideContextMenu);
		contextMenu.addEventListener('click', handleContextAction);

		container.addEventListener('click', handleHideClick);
		container.addEventListener('click', handleAppClick);

		document.querySelector('.add-app-btn').addEventListener('click', function(e) {
			e.stopPropagation();
			openInstallSoftwareModal();
		});

		addAppForm.addEventListener('submit', handleAddApp);

		installSoftwareModal.querySelector('.modal-close').addEventListener('click', closeInstallSoftwareModal);
		installSoftwareModal.addEventListener('click', function(e) {
			if (e.target === installSoftwareModal) closeInstallSoftwareModal();
		});

		document.querySelectorAll('.icon-tab').forEach(function(tab) {
			tab.addEventListener('click', handleIconTabSwitch);
		});

		document.querySelectorAll('.icon-input').forEach(function(input) {
			input.addEventListener('input', updateIconPreview);
		});

		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') {
				if (installSoftwareModal.classList.contains('active')) {
					// If on a detail page (app, plugin, or recipe), go back
					// to the list one level first instead of closing the modal.
					var url = new URL(window.location);
					if (url.searchParams.has('app')) {
						closeAppDetail();
						return;
					}
					if (url.searchParams.has('plugin')) {
						closePluginDetail();
						return;
					}
					if (activeCategory === '__recipes__' && activeRecipe) {
						activeRecipe = null;
						if (url.searchParams.has('recipe')) {
							url.searchParams.delete('recipe');
							history.pushState({}, '', url.toString());
						}
						appStoreHeading.textContent = categoryLabel('__recipes__');
						filterAppStore();
						return;
					}
					closeInstallSoftwareModal();
				} else if (bgPicker.classList.contains('active')) {
					closeBgPicker();
				} else if (hiddenPopup.classList.contains('active')) {
					closeHiddenPopup();
				} else if (contextMenu.classList.contains('active')) {
					hideContextMenu();
				} else if (isEditMode) {
					exitEditMode();
				}
			}
		});

		// Background picker
		bgBtn.addEventListener('click', toggleBgPicker);
		bgPicker.addEventListener('click', handleBgSelect);
		document.addEventListener('click', function(e) {
			if (!bgPicker.contains(e.target) && !bgBtn.contains(e.target)) {
				closeBgPicker();
			}
			if (!hiddenPopup.contains(e.target) && !hiddenBtn.contains(e.target)) {
				closeHiddenPopup();
			}
			if (settingsDropdown && !settingsBtn.contains(e.target)) {
				settingsDropdown.classList.remove('active');
			}
		});

		// Settings dropdown
		if (settingsBtn && settingsDropdown) {
			settingsBtn.addEventListener('click', function(e) {
				if (e.target.closest('.settings-dropdown')) return;
				settingsDropdown.classList.toggle('active');
				if (settingsDropdown.classList.contains('active')) {
					updateLayoutButtons();
					updateGreetingToggleLabel();
				}
			});
			settingsDropdown.addEventListener('click', function(e) {
				var item = e.target.closest('.settings-dropdown-item');
				if (!item) return;
				var action = item.dataset.action;
				if (action === 'layout-flow' || action === 'layout-grid') {
					setLayout(action === 'layout-grid' ? 'grid' : 'flow');
				} else {
					settingsDropdown.classList.remove('active');
					if (action === 'export') {
						handleExport();
					} else if (action === 'import') {
						handleImport();
					} else if (action === 'toggle-greeting') {
						toggleGreeting();
					}
				}
			});

			var iconSizeSlider = document.getElementById('setting-icon-size');
			var spacingSlider = document.getElementById('setting-spacing');

			if (iconSizeSlider) {
				iconSizeSlider.value = displaySettings.icon_size || '60';
				iconSizeSlider.addEventListener('input', function() {
					applyAppSize(this.value);
					saveDisplay('icon_size', this.value);
				});
			}

			if (spacingSlider) {
				spacingSlider.value = displaySettings.spacing || '16';
				spacingSlider.addEventListener('input', function() {
					applySpacing(this.value);
					saveDisplay('spacing', this.value);
				});
			}

			var gridColumnsSlider = document.getElementById('setting-grid-columns');
			var gridColumnsValue = document.getElementById('grid-columns-value');
			if (gridColumnsSlider) {
				gridColumnsSlider.value = displaySettings.grid_columns || '6';
				if (gridColumnsValue) gridColumnsValue.textContent = gridColumnsSlider.value;
				gridColumnsSlider.addEventListener('input', function() {
					applyGridColumns(this.value);
					saveDisplay('grid_columns', this.value);
					if (gridColumnsValue) gridColumnsValue.textContent = this.value;
				});
			}

			// Set initial visibility of grid-only settings
			updateLayoutButtons();
		}

		// Hidden apps popup
		hiddenBtn.addEventListener('click', toggleHiddenPopup);
		hiddenAppsList.addEventListener('click', handleHiddenListClick);

		// Mark current background as selected
		var currentBg = body.className.match(/bg-[\w-]+/);
		if (currentBg) {
			var selected = bgPicker.querySelector('[data-bg="' + currentBg[0].replace('bg-', '') + '"]');
			if (selected) {
				selected.classList.add('selected');
			}
		}
	}

	function toggleBgPicker() {
		bgPicker.classList.toggle('active');
	}

	function closeBgPicker() {
		bgPicker.classList.remove('active');
	}

	function toggleHiddenPopup() {
		hiddenPopup.classList.toggle('active');
		closeBgPicker();
	}

	function closeHiddenPopup() {
		hiddenPopup.classList.remove('active');
	}

	function handleHiddenListClick(e) {
		var deleteBtn = e.target.closest('.hidden-app-delete');
		if (deleteBtn) {
			handleDeleteApp(deleteBtn);
			return;
		}

		var item = e.target.closest('.hidden-app-item');
		if (!item) return;

		var slug = item.dataset.slug;

		var formData = new FormData();
		formData.append('action', 'my_apps_unhide');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('slug', slug);

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data.success) {
				var app = data.data;
				var newApp = createAppElement(app);
				var addBtn = document.querySelector('.add-app-btn');
				container.insertBefore(newApp, addBtn);

				removeHiddenRow(item);
			}
		});
	}

	function handleDeleteApp(deleteBtn) {
		var slug = deleteBtn.dataset.slug;
		var row = deleteBtn.closest('.hidden-app-row');
		if (!slug || !row) return;

		var confirmMsg = (myAppsConfig.i18n && myAppsConfig.i18n.confirmDelete) || 'Delete this app? This cannot be undone.';
		if (!window.confirm(confirmMsg)) return;

		var formData = new FormData();
		formData.append('action', 'my_apps_delete');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('slug', slug);

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data.success) {
				if (Array.isArray(myAppsConfig.deletableSlugs)) {
					myAppsConfig.deletableSlugs = myAppsConfig.deletableSlugs.filter(function(s) {
						return s !== slug;
					});
				}
				removeHiddenRow(row.querySelector('.hidden-app-item') || row);
			} else {
				alert((data && data.data) || 'Error deleting app');
			}
		})
		.catch(function() {
			alert('Network error');
		});
	}

	function removeHiddenRow(item) {
		var row = item.closest('.hidden-app-row') || item;
		row.remove();

		updateHiddenCount();

		if (hiddenAppsList.querySelectorAll('.hidden-app-item').length === 0) {
			var noApps = document.createElement('div');
			noApps.className = 'no-hidden-apps';
			noApps.textContent = 'No hidden apps';
			hiddenAppsList.appendChild(noApps);
		}
	}

	function updateHiddenCount() {
		var count = hiddenAppsList.querySelectorAll('.hidden-app-item').length;
		var badge = hiddenBtn.querySelector('.hidden-count');

		if (count > 0) {
			if (badge) {
				badge.textContent = count;
			} else {
				badge = document.createElement('span');
				badge.className = 'hidden-count';
				badge.textContent = count;
				hiddenBtn.appendChild(badge);
			}
		} else if (badge) {
			badge.remove();
		}
	}

	function handleBgSelect(e) {
		var option = e.target.closest('.bg-option');
		if (!option) return;

		var bg = option.dataset.bg;

		// Update selection UI
		bgPicker.querySelectorAll('.bg-option').forEach(function(opt) {
			opt.classList.remove('selected');
		});
		option.classList.add('selected');

		// Remove old bg classes and add new one
		body.className = body.className.replace(/bg-[\w-]+/g, '').trim();
		body.classList.add('bg-' + bg);

		// Save via AJAX
		var formData = new FormData();
		formData.append('action', 'my_apps_save_background');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('background', bg);

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		});

		closeBgPicker();
	}

	var DISPLAY_KEYS = ['layout', 'icon_size', 'spacing', 'grid_columns'];

	function loadDisplaySettings() {
		var out = {};
		DISPLAY_KEYS.forEach(function(k) {
			var v = localStorage.getItem('my_apps_' + k);
			if (v !== null) out[k] = v;
		});
		return out;
	}

	var displaySettings = loadDisplaySettings();

	function saveDisplay(key, value) {
		displaySettings[key] = value;
		localStorage.setItem('my_apps_' + key, value);
	}

	function setLayout(mode) {
		if (mode === 'grid') {
			container.classList.add('layout-grid');
		} else {
			container.classList.remove('layout-grid');
		}
		saveDisplay('layout', mode);
		updateLayoutButtons();
	}

	function applyGridColumns(cols) {
		container.style.setProperty('--grid-columns', cols);
	}

	function updateLayoutButtons() {
		if (!settingsDropdown) return;
		var mode = displaySettings.layout || 'flow';
		settingsDropdown.querySelectorAll('.settings-dropdown-item').forEach(function(item) {
			if (item.dataset.action === 'layout-flow') {
				item.classList.toggle('active', mode === 'flow');
			} else if (item.dataset.action === 'layout-grid') {
				item.classList.toggle('active', mode === 'grid');
			}
		});
		var gridOnly = document.getElementById('settings-grid-only');
		if (gridOnly) {
			gridOnly.style.display = mode === 'grid' ? 'block' : 'none';
		}
	}

	function applyAppSize(size) {
		container.style.setProperty('--app-size', size + 'px');
	}

	function applySpacing(gap) {
		container.style.setProperty('--app-gap', gap + 'px');
	}

	// Restore settings on load
	(function() {
		if (displaySettings.layout === 'grid') {
			container.classList.add('layout-grid');
		}
		if (displaySettings.grid_columns) applyGridColumns(displaySettings.grid_columns);
		if (displaySettings.icon_size) applyAppSize(displaySettings.icon_size);
		if (displaySettings.spacing) applySpacing(displaySettings.spacing);
	})();

	function handleExport() {
		var formData = new FormData();
		formData.append('action', 'my_apps_export');
		formData.append('nonce', myAppsConfig.nonce);

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data.success) {
				var exportData = data.data;
				exportData.display = {
					layout: localStorage.getItem('my_apps_layout') || 'flow',
					icon_size: localStorage.getItem('my_apps_icon_size') || '60',
					spacing: localStorage.getItem('my_apps_spacing') || '16',
					grid_columns: localStorage.getItem('my_apps_grid_columns') || '6',
					custom_blueprints: localStorage.getItem(CUSTOM_BLUEPRINTS_KEY) || '{}'
				};
				var json = JSON.stringify(exportData, null, 2);
				var blob = new Blob([json], { type: 'application/json' });
				var url = URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.href = url;
				a.download = 'my-apps-settings.json';
				a.click();
				URL.revokeObjectURL(url);
				showToast('Settings exported');
			}
		});
	}

	function handleImport() {
		var input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.addEventListener('change', function() {
			var file = input.files[0];
			if (!file) return;

			var reader = new FileReader();
			reader.onload = function(e) {
				var parsed;
				try {
					parsed = JSON.parse(e.target.result);
				} catch (err) {
					showToast('Invalid JSON file');
					return;
				}

				if (parsed && parsed.display && typeof parsed.display === 'object') {
					DISPLAY_KEYS.forEach(function(k) {
						if (parsed.display[k] !== undefined && parsed.display[k] !== null) {
							localStorage.setItem('my_apps_' + k, String(parsed.display[k]));
						}
					});
				}
				if (parsed && typeof parsed.custom_blueprints === 'string') {
					localStorage.setItem(CUSTOM_BLUEPRINTS_KEY, parsed.custom_blueprints);
				}

				var formData = new FormData();
				formData.append('action', 'my_apps_import');
				formData.append('nonce', myAppsConfig.nonce);
				formData.append('data', e.target.result);

				fetch(myAppsConfig.ajaxUrl, {
					method: 'POST',
					body: formData
				})
				.then(function(res) { return res.json(); })
				.then(function(data) {
					if (data.success) {
						showToast('Settings imported');
						setTimeout(function() { window.location.reload(); }, 1000);
					} else {
						showToast('Import failed');
					}
				});
			};
			reader.readAsText(file);
		});
		input.click();
	}

	function enterEditMode() {
		isEditMode = true;
		body.classList.add('edit-mode');
		sortable.option('disabled', false);
	}

	function exitEditMode() {
		isEditMode = false;
		body.classList.remove('edit-mode');
		sortable.option('disabled', true);
		saveOrder();
	}

	function handleTouchStart(e) {
		var appIcon = e.target.closest('.app-icon:not(.add-app-btn)');
		if (!appIcon || isEditMode) return;

		longPressTimer = setTimeout(function() {
			enterEditMode();
			if (navigator.vibrate) {
				navigator.vibrate(50);
			}
		}, LONG_PRESS_DURATION);
	}

	function handleTouchEnd() {
		clearTimeout(longPressTimer);
	}

	function handleTouchMove() {
		clearTimeout(longPressTimer);
	}

	function handleContextMenu(e) {
		var appIcon = e.target.closest('.app-icon:not(.add-app-btn)');
		if (!appIcon) return;

		e.preventDefault();
		contextTarget = appIcon;

		var x = Math.min(e.clientX, window.innerWidth - 160);
		var y = Math.min(e.clientY, window.innerHeight - 150);

		contextMenu.style.left = x + 'px';
		contextMenu.style.top = y + 'px';
		contextMenu.classList.add('active');
	}

	function hideContextMenu() {
		contextMenu.classList.remove('active');
		contextTarget = null;
	}

	function handleContextAction(e) {
		var action = e.target.dataset.action;
		if (!action || !contextTarget) return;

		var url = contextTarget.dataset.url;
		var slug = contextTarget.dataset.slug;

		switch (action) {
			case 'open':
				window.location.href = url;
				break;
			case 'open-new':
				window.open(url, '_blank');
				break;
			case 'hide':
				hideApp(slug, contextTarget);
				break;
			case 'move-front':
				container.insertBefore(contextTarget, container.firstChild);
				saveOrder();
				break;
		}

		hideContextMenu();
	}

	function handleHideClick(e) {
		if (!e.target.closest('.hide-btn')) return;
		e.preventDefault();
		e.stopPropagation();

		var appIcon = e.target.closest('.app-icon');
		var slug = appIcon.dataset.slug;
		hideApp(slug, appIcon);
	}

	function hideApp(slug, element) {
		var appName = element.querySelector('.app-title').textContent;
		var iconHtml = '';
		var img = element.querySelector('.app-link img');
		var dashicon = element.querySelector('.app-link .dashicons');
		var emoji = element.querySelector('.app-link .emoji');
		var letter = element.querySelector('.app-link .app-letter-icon');

		if (img) {
			iconHtml = '<img src="' + img.src + '" alt="">';
		} else if (dashicon) {
			iconHtml = '<span class="' + dashicon.className + '"></span>';
		} else if (emoji) {
			iconHtml = '<span class="emoji">' + emoji.textContent + '</span>';
		} else if (letter) {
			var letterClone = letter.cloneNode(true);
			letterClone.classList.add('app-letter-icon-small');
			iconHtml = letterClone.outerHTML;
		}

		element.classList.add('hiding');
		setTimeout(function() {
			element.remove();
			saveHidden(slug);
			addToHiddenList(slug, appName, iconHtml);
		}, 300);
	}

	function addToHiddenList(slug, name, iconHtml) {
		var noApps = hiddenAppsList.querySelector('.no-hidden-apps');
		if (noApps) {
			noApps.remove();
		}

		var row = document.createElement('div');
		row.className = 'hidden-app-row';

		var item = document.createElement('button');
		item.type = 'button';
		item.className = 'hidden-app-item';
		item.dataset.slug = slug;

		item.innerHTML = '<span class="hidden-app-icon">' + iconHtml + '</span>' +
			'<span class="hidden-app-name">' + name + '</span>' +
			'<span class="restore-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg></span>';

		row.appendChild(item);

		if (Array.isArray(myAppsConfig.deletableSlugs) && myAppsConfig.deletableSlugs.indexOf(slug) !== -1) {
			var deleteBtn = document.createElement('button');
			deleteBtn.type = 'button';
			deleteBtn.className = 'hidden-app-delete';
			deleteBtn.dataset.slug = slug;
			deleteBtn.title = 'Delete';
			deleteBtn.setAttribute('aria-label', 'Delete');
			deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
			row.appendChild(deleteBtn);
		}

		hiddenAppsList.appendChild(row);
		updateHiddenCount();
	}

	function handleAppClick(e) {
		if (!isEditMode) return;

		var link = e.target.closest('.app-link');
		if (link) {
			e.preventDefault();
		}
	}

	function resetAdminLinkView() {
		if (!adminMenuData) {
			loadAdminMenu();
		}
		if (adminMenuSearch) {
			adminMenuSearch.value = '';
			if (adminMenuData) {
				renderAdminMenuTree(adminMenuData);
			}
		}
	}

	function resetWebLinkForm() {
		addAppForm.reset();

		document.querySelectorAll('.icon-tab').forEach(function(t) {
			t.classList.remove('active');
		});
		document.querySelector('.icon-tab[data-type="emoji"]').classList.add('active');
		document.querySelectorAll('.icon-input').forEach(function(i) {
			i.classList.remove('active');
		});
		document.querySelector('.dashicon-picker-container').classList.remove('active');
		document.querySelector('.emoji-picker-container').classList.add('active');

		document.getElementById('app-emoji').value = '';
		document.getElementById('emoji-search').value = '';
		document.querySelectorAll('.emoji-option.selected').forEach(function(btn) {
			btn.classList.remove('selected');
		});

		document.getElementById('app-dashicon').value = '';
		document.getElementById('dashicon-search').value = '';
		document.querySelectorAll('.dashicon-option.selected').forEach(function(btn) {
			btn.classList.remove('selected');
		});

		updateIconPreview();
	}

	function handleIconTabSwitch(e) {
		var type = e.target.dataset.type;

		document.querySelectorAll('.icon-tab').forEach(function(t) {
			t.classList.remove('active');
		});
		e.target.classList.add('active');

		document.querySelectorAll('.icon-input').forEach(function(input) {
			input.classList.remove('active');
		});
		document.querySelector('.emoji-picker-container').classList.remove('active');
		document.querySelector('.dashicon-picker-container').classList.remove('active');

		if (type === 'emoji') {
			document.querySelector('.emoji-picker-container').classList.add('active');
			document.getElementById('emoji-search').focus();
		} else if (type === 'url') {
			var urlInput = document.getElementById('app-icon-url');
			urlInput.classList.add('active');
			urlInput.focus();
		} else if (type === 'dashicon') {
			document.querySelector('.dashicon-picker-container').classList.add('active');
			document.getElementById('dashicon-search').focus();
		}

		updateIconPreview();
	}

	function updateIconPreview() {
		var preview = document.getElementById('icon-preview');
		var emoji = document.getElementById('app-emoji').value;
		var iconUrl = document.getElementById('app-icon-url').value;
		var dashicon = document.getElementById('app-dashicon').value;

		var activeTab = document.querySelector('.icon-tab.active');
		var type = activeTab ? activeTab.dataset.type : 'emoji';

		while (preview.firstChild) {
			preview.removeChild(preview.firstChild);
		}
		preview.className = 'preview-box';

		if (type === 'emoji' && emoji) {
			preview.textContent = emoji;
			preview.classList.add('preview-emoji');
		} else if (type === 'url' && iconUrl) {
			var img = document.createElement('img');
			img.src = iconUrl;
			img.onerror = function() { preview.textContent = '?'; };
			preview.appendChild(img);
		} else if (type === 'dashicon' && dashicon) {
			var icon = document.createElement('span');
			var dashClass = dashicon.startsWith('dashicons-') ? dashicon : 'dashicons-' + dashicon;
			icon.className = 'dashicons ' + dashClass;
			preview.appendChild(icon);
			preview.classList.add('preview-dashicon');
		}
	}

	function handleAddApp(e) {
		e.preventDefault();

		var name = document.getElementById('app-name').value.trim();
		var url = document.getElementById('app-url').value.trim();
		var emoji = document.getElementById('app-emoji').value.trim();
		var iconUrl = document.getElementById('app-icon-url').value.trim();
		var dashicon = document.getElementById('app-dashicon').value.trim();

		var activeTab = document.querySelector('.icon-tab.active');
		var type = activeTab ? activeTab.dataset.type : 'emoji';

		var iconData = {};
		if (type === 'emoji' && emoji) {
			iconData.emoji = emoji;
		} else if (type === 'url' && iconUrl) {
			iconData.icon_url = iconUrl;
		} else if (type === 'dashicon' && dashicon) {
			iconData.dashicon = dashicon.startsWith('dashicons-') ? dashicon : 'dashicons-' + dashicon;
		}

		if (!name || !url || Object.keys(iconData).length === 0) {
			alert(myAppsConfig.i18n.fillAllFields || 'Please fill in all fields');
			return;
		}

		var formData = new FormData();
		formData.append('action', 'my_apps_add');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('name', name);
		formData.append('url', url);
		Object.keys(iconData).forEach(function(key) {
			formData.append(key, iconData[key]);
		});

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data.success) {
				closeInstallSoftwareModal();
				insertAndHighlightApp(data.data);
			} else {
				alert(data.data || 'Error adding app');
			}
		})
		.catch(function() {
			alert('Network error');
		});
	}

	function insertAndHighlightApp(app) {
		if (app && app.slug && Array.isArray(myAppsConfig.deletableSlugs) && myAppsConfig.deletableSlugs.indexOf(app.slug) === -1) {
			myAppsConfig.deletableSlugs.push(app.slug);
		}
		var newApp = createAppElement(app);
		var addBtn = document.querySelector('.add-app-btn');
		newApp.classList.add('just-added');
		container.insertBefore(newApp, addBtn);
		requestAnimationFrame(function() {
			newApp.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
		newApp.addEventListener('animationend', function onEnd(ev) {
			if (ev.animationName === 'my-apps-glow-pulse') {
				newApp.classList.remove('just-added');
				newApp.removeEventListener('animationend', onEnd);
			}
		});
		return newApp;
	}

	function buildLetterIconSvg(data, extraClass) {
		var svgNS = 'http://www.w3.org/2000/svg';
		var letters = String(data.letters || '?');
		var svg = document.createElementNS(svgNS, 'svg');
		svg.setAttribute('class', 'app-letter-icon' + (extraClass ? ' ' + extraClass : ''));
		svg.setAttribute('viewBox', '0 0 100 100');
		svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
		svg.setAttribute('aria-hidden', 'true');
		var rect = document.createElementNS(svgNS, 'rect');
		rect.setAttribute('width', '100');
		rect.setAttribute('height', '100');
		rect.setAttribute('rx', '22');
		rect.setAttribute('ry', '22');
		rect.setAttribute('fill', data.background || '#888');
		svg.appendChild(rect);
		var text = document.createElementNS(svgNS, 'text');
		text.setAttribute('x', '50');
		text.setAttribute('y', '50');
		text.setAttribute('fill', '#fff');
		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('dominant-baseline', 'central');
		text.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif');
		text.setAttribute('font-weight', '600');
		text.setAttribute('font-size', letters.length > 1 ? '36' : '46');
		text.textContent = letters;
		svg.appendChild(text);
		return svg;
	}

	function createAppElement(app) {
		var div = document.createElement('div');
		div.className = 'app-icon';
		div.dataset.slug = app.slug;
		div.dataset.url = app.url;

		var hideBtn = document.createElement('button');
		hideBtn.type = 'button';
		hideBtn.className = 'hide-btn';
		hideBtn.title = 'Hide';
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', '12');
		circle.setAttribute('cy', '12');
		circle.setAttribute('r', '11');
		circle.setAttribute('fill', '#000');
		circle.setAttribute('stroke', '#fff');
		circle.setAttribute('stroke-width', '2');
		svg.appendChild(circle);
		var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', 'M8 8l8 8M16 8l-8 8');
		path.setAttribute('stroke', '#fff');
		path.setAttribute('stroke-width', '2');
		path.setAttribute('stroke-linecap', 'round');
		svg.appendChild(path);
		hideBtn.appendChild(svg);
		div.appendChild(hideBtn);

		var link = document.createElement('a');
		link.href = app.url;
		link.className = 'app-link';

		if (app.icon_url) {
			var img = document.createElement('img');
			img.src = app.icon_url;
			img.alt = app.name;
			link.appendChild(img);
		} else if (app.dashicon) {
			var dashDiv = document.createElement('div');
			dashDiv.className = 'dashicons ' + app.dashicon;
			link.appendChild(dashDiv);
		} else if (app.emoji) {
			var emojiDiv = document.createElement('div');
			emojiDiv.className = 'emoji';
			emojiDiv.textContent = app.emoji;
			link.appendChild(emojiDiv);
		} else if (app.letter_icon) {
			link.appendChild(buildLetterIconSvg(app.letter_icon));
		}

		var title = document.createElement('p');
		title.className = 'app-title';
		title.textContent = app.name;
		link.appendChild(title);

		div.appendChild(link);
		return div;
	}

	function saveOrder() {
		var slugs = [];
		container.querySelectorAll('.app-icon:not(.add-app-btn)').forEach(function(el) {
			if (el.dataset.slug) {
				slugs.push(el.dataset.slug);
			}
		});

		var formData = new FormData();
		formData.append('action', 'my_apps_save_order');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('order', JSON.stringify(slugs));

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		});
	}

	function saveHidden(slug) {
		var formData = new FormData();
		formData.append('action', 'my_apps_hide');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('slug', slug);

		fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		});
	}

	// ── Install Software (App Store) ─────────────────────────

	var appStoreNav = document.getElementById('app-store-nav');
	var appStoreSearchInput = document.getElementById('app-store-search');
	var appStoreHeading = document.getElementById('app-store-heading');
	// Optimistic default — assume recipes will load. If the fetch fails
	// loadAppStore flips this back to 'all' before the first render.
	var activeCategory = '__recipes__';
	var activeView = 'apps';
	var activeRecipe = null;

	function showAppStoreView(view) {
		activeView = view;
		appStoreContent.hidden = (view !== 'apps');
		adminLinkView.hidden = (view !== 'admin-link');
		webLinkView.hidden = (view !== 'web-link');

		if (view === 'admin-link') {
			appStoreHeading.textContent = 'Add Admin Link';
			resetAdminLinkView();
		} else if (view === 'web-link') {
			appStoreHeading.textContent = 'Add Web Link';
			resetWebLinkForm();
		} else {
			appStoreHeading.textContent = categoryLabel(activeCategory);
		}
	}

	function categoryLabel(cat) {
		if (cat === 'all') return 'All Apps';
		if (cat === '__plugins__') return 'Recommended Plugins';
		if (cat === '__recipes__') {
			return (activeRecipe && recipes[activeRecipe]) ? recipes[activeRecipe].title : 'Recipes';
		}
		return cat;
	}

	function openInstallSoftwareModal() {
		installSoftwareModal.classList.add('active');
		document.body.style.overflow = 'hidden';
		showAppStoreView('apps');
		if (!appStoreData) {
			loadAppStore();
		}
	}

	function closeInstallSoftwareModal() {
		installSoftwareModal.classList.remove('active');
		document.body.style.overflow = '';

		// Clean up state-bearing params (?app, ?recipe, ?plugin) when
		// closing the modal, and reset activeRecipe so the next open
		// lands on the recipes grid instead of a stale recipe detail.
		var url = new URL(window.location);
		var changed = false;
		['app', 'recipe', 'plugin'].forEach(function(name) {
			if (url.searchParams.has(name)) {
				url.searchParams.delete(name);
				changed = true;
			}
		});
		if (changed) {
			history.replaceState({}, '', url.toString());
		}
		activeRecipe = null;

		// Reset to list view for next open
		var sidebar = document.getElementById('app-store-sidebar');
		sidebar.classList.remove('app-store-sidebar-hidden');
		showAppStoreView('apps');
		if (appStoreData) {
			renderAppStore(appStoreData, activeCategory, '');
		}
		if (appStoreSearchInput) {
			appStoreSearchInput.value = '';
		}
	}

	// Fetch the curated my-wordpress/plugins.json from the blueprints repo
	// and enrich wp.org entries with icons + names from the wp.org plugins
	// API. GitHub-hosted entries use the metadata as-is. Returns an object
	// keyed the same way the old PHP endpoint returned, so
	// mergeRecommendedPlugins doesn't need to change.
	function fetchRecommendedPlugins() {
		var pluginInstallUrl = myAppsConfig.ajaxUrl.replace('admin-ajax.php', 'plugin-install.php');

		return fetch(PLUGINS_URL)
			.then(function(r) { return r.json(); })
			.then(function(curated) {
				if (!curated || typeof curated !== 'object') return null;

				var promises = Object.keys(curated).map(function(key) {
					var meta = curated[key] || {};
					var categories = Array.isArray(meta.categories) ? meta.categories : [];
					var note = meta.note || '';
					var landingPage = (typeof meta.landing_page === 'string' && meta.landing_page.indexOf('/') === 0) ? meta.landing_page : '';

					// GitHub-hosted plugin: use metadata as-is, no wp.org fetch.
					if (meta.github && /^[\w.-]+\/[\w.-]+$/.test(meta.github)) {
						var owner = meta.github.split('/')[0];
						var repoName = meta.github.split('/')[1];
						var ghKey = 'github/' + (owner + '-' + repoName).toLowerCase();
						return Promise.resolve({
							outKey: ghKey,
							entry: {
								source: 'github',
								repo: meta.github,
								title: meta.title ? cleanText(meta.title) : repoName,
								author: meta.author ? cleanText(meta.author) : owner,
								short_description: '',
								icon: meta.icon || '',
								note: note,
								categories: categories,
								install_url: 'https://github.com/' + meta.github,
								landing_page: landingPage
							}
						});
					}

					// wp.org plugin keyed by slug.
					var slug = (key || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
					if (!slug) return Promise.resolve(null);

					return fetchWpOrgPluginInfo(slug).then(function(info) {
						var icons = (info && info.icons) || {};
						var icon = icons.svg || icons['2x'] || icons['1x'] || icons['default'] || '';
						var fallbackTitle = meta.title
							? cleanText(meta.title)
							: slug.split('-').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');

						return {
							outKey: slug,
							entry: {
								source: 'wp.org',
								slug: slug,
								title: (info && info.name) ? cleanText(info.name) : fallbackTitle,
								author: (info && info.author) ? cleanText(info.author) : (meta.author ? cleanText(meta.author) : ''),
								short_description: (info && info.short_description) ? cleanText(info.short_description) : '',
								icon: icon,
								note: note,
								categories: categories,
								install_url: pluginInstallUrl + '?tab=plugin-information&plugin=' + slug,
								landing_page: landingPage
							}
						};
					});
				});

				return Promise.all(promises).then(function(results) {
					var out = {};
					results.forEach(function(r) {
						if (r) out[r.outKey] = r.entry;
					});
					return out;
				});
			})
			.catch(function() { return null; });
	}

	// Decode HTML entities + strip tags via the browser's parser so wp.org
	// strings like "Akismet Anti-spam: Spam Protection &#8211; ..." render
	// as plain text.
	function cleanText(s) {
		if (!s) return '';
		var doc = new DOMParser().parseFromString(String(s), 'text/html');
		return (doc.body.textContent || '').trim();
	}

	// Per-slug wp.org plugin info, cached in localStorage so a page reload
	// doesn't make a fresh request for every curated plugin.
	var PLUGIN_INFO_CACHE_KEY = 'my_apps_plugin_info_cache';
	var PLUGIN_INFO_CACHE_TTL = 24 * 60 * 60 * 1000;

	function fetchWpOrgPluginInfo(slug) {
		var cached = readCachedPluginInfo(slug);
		if (cached) return Promise.resolve(cached);

		var url = WP_ORG_PLUGIN_INFO_URL +
			'?action=plugin_information' +
			'&request[slug]=' + encodeURIComponent(slug) +
			'&request[fields][short_description]=1' +
			'&request[fields][icons]=1';

		return fetch(url)
			.then(function(r) { return r.json(); })
			.then(function(info) {
				if (info && !info.error) {
					writeCachedPluginInfo(slug, info);
					return info;
				}
				return null;
			})
			.catch(function() { return null; });
	}

	function readCachedPluginInfo(slug) {
		try {
			var raw = JSON.parse(localStorage.getItem(PLUGIN_INFO_CACHE_KEY)) || {};
			var entry = raw[slug];
			if (!entry || (Date.now() - entry.t) > PLUGIN_INFO_CACHE_TTL) return null;
			return entry.info;
		} catch (e) { return null; }
	}

	function writeCachedPluginInfo(slug, info) {
		try {
			var raw = JSON.parse(localStorage.getItem(PLUGIN_INFO_CACHE_KEY)) || {};
			raw[slug] = { info: info, t: Date.now() };
			localStorage.setItem(PLUGIN_INFO_CACHE_KEY, JSON.stringify(raw));
		} catch (e) { /* localStorage full or disabled — fine, we'll refetch */ }
	}

	// Walk an app blueprint's installPlugin steps and add each referenced
	// plugin to the catalogue as a synthetic Recommended Plugins entry, so
	// the underlying plugins of every app in apps.json are discoverable on
	// their own. Recommended-Plugins curated entries (loaded after this)
	// overwrite anything we add here, so curated metadata always wins.
	function mergeAppBlueprintPlugins(data, blueprint) {
		if (!blueprint || !Array.isArray(blueprint.steps)) return;

		var pluginInstallUrl = myAppsConfig.ajaxUrl.replace('admin-ajax.php', 'plugin-install.php');

		blueprint.steps.forEach(function(step) {
			if (step.step !== 'installPlugin') return;
			var pd = step.pluginData || {};
			var key = null;
			var entry = null;

			if (pd.resource === 'wordpress.org/plugins' && pd.slug) {
				key = 'plugin/' + pd.slug;
				if (data[key]) return;
				entry = {
					title: humanizeSlug(pd.slug),
					description: '',
					author: '',
					categories: ['Plugins'],
					_type: 'plugin',
					_source: 'wp.org',
					_slug: pd.slug,
					_repo: '',
					_icon: '',
					_shortDescription: '',
					_note: '',
					_installUrl: pluginInstallUrl + '?tab=plugin-information&plugin=' + pd.slug,
					_landingPage: ''
				};
			} else {
				// git:directory uses pd.url; release zips use pd.url too.
				var url = pd.url || '';
				var m = url.match(/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\/|\.git$|$)/);
				if (!m) return;
				var owner = m[1];
				var repoName = m[2].replace(/\.git$/, '').replace(/\.zip$/, '');
				var repo = owner + '/' + repoName;
				key = 'plugin/github/' + (owner + '-' + repoName).toLowerCase();
				if (data[key]) return;
				entry = {
					title: humanizeSlug(repoName),
					description: '',
					author: owner,
					categories: ['Plugins'],
					_type: 'plugin',
					_source: 'github',
					_slug: '',
					_repo: repo,
					_icon: '',
					_shortDescription: '',
					_note: '',
					_installUrl: 'https://github.com/' + repo,
					_landingPage: ''
				};
			}

			if (entry && key) {
				data[key] = entry;
			}
		});
	}

	function humanizeSlug(slug) {
		return String(slug).split(/[-_]+/).map(function(w) {
			return w ? w.charAt(0).toUpperCase() + w.slice(1) : '';
		}).join(' ').trim();
	}

	function mergeRecommendedPlugins(data, plugins) {
		Object.keys(plugins).forEach(function(key) {
			var p = plugins[key];
			data['plugin/' + key] = {
				title: p.title,
				description: p.note || p.short_description || '',
				author: p.author || '',
				categories: p.categories || [],
				_type: 'plugin',
				_source: p.source || 'wp.org',
				_slug: p.slug || '',
				_repo: p.repo || '',
				_icon: p.icon || '',
				_shortDescription: p.short_description || '',
				_note: p.note || '',
				_installUrl: p.install_url || '',
				_landingPage: p.landing_page || ''
			};
		});
	}

	function buildPluginBlueprint(app) {
		var pluginData = app._source === 'github'
			? { resource: 'git:directory', url: 'https://github.com/' + app._repo, ref: 'HEAD' }
			: { resource: 'wordpress.org/plugins', slug: app._slug };
		var blueprint = {
			'$schema': 'https://playground.wordpress.net/blueprint-schema.json',
			meta: {
				title: app.title,
				author: app.author || 'Unknown',
				description: app.description || '',
				categories: app.categories || []
			},
			steps: [ { step: 'installPlugin', pluginData: pluginData } ]
		};
		if (app._landingPage) {
			blueprint.landingPage = app._landingPage;
		}
		return blueprint;
	}

	function installPluginApp(app, gradient) {
		if (isPlayground) {
			var blueprint = buildPluginBlueprint(app);
			var blueprintUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(blueprint))));
			addAppFromBlueprint(app, blueprint, gradient);
			window.parent.postMessage({
				type: 'relay',
				relayType: 'install-blueprint',
				blueprintUrl: blueprintUrl
			}, '*');
			return;
		}
		// Hosted WordPress: deep-link to whatever makes sense for this source
		// (wp-admin plugin-install page for wp.org, repo page for GitHub).
		if (app._installUrl) {
			window.location.href = app._installUrl;
		}
	}

	// 'loading' \u2192 plugins fetch in flight; 'loaded' \u2192 merged in; 'failed' \u2192 fetch errored or returned nothing.
	var pluginsLoadState = 'loading';

	function loadAppStore() {
		appStoreContent.innerHTML = '<div class="app-store-loading">Loading apps\u2026</div>';
		pluginsLoadState = 'loading';
		recipesLoadState = 'loading';

		var pluginsPromise = fetchRecommendedPlugins();
		var recipesPromise = fetch(RECIPES_URL)
			.then(function(r) { return r.json(); })
			.then(function(data) {
				if (data && typeof data === 'object' && !Array.isArray(data)) {
					recipes = data;
					hasRecipes = Object.keys(recipes).length > 0;
					recipesLoadState = 'loaded';
				} else {
					recipesLoadState = 'failed';
				}
			})
			.catch(function() {
				recipesLoadState = 'failed';
			});

		fetch(APPS_INDEX_URL)
			.then(function(res) { return res.json(); })
			.then(function(data) {
				appStoreData = mergeCustomBlueprints(data);
				buildAppStoreNav(appStoreData);

				// If we already have a deep-link target available (apps from
				// apps.json land here), render the detail page directly so
				// the user doesn't see a flash of the recipes grid first.
				// For plugin deep-links the entry isn't in appStoreData yet
				// — keep the existing "Loading apps…" message until the
				// blueprint + recommended fetches settle and we can render
				// the detail at the second pass below.
				if (!tryRenderPendingDeepLink()) {
					if (!(pendingDeepLink && pendingDeepLink.type === 'plugin')) {
						renderAppStore(appStoreData);
					}
				}
				bindAppStoreEvents();

				// Each apps/*.json blueprint may install one or more plugins.
				// Fetch them all in parallel and add the underlying plugins
				// to the catalogue as Recommended Plugins entries — so
				// "Friends" or "Keeping Contact" appear in the plugins tab
				// even when only the curated app is in apps.json.
				var blueprintPromises = Object.keys(appStoreData)
					.filter(function(p) { return p.indexOf('apps/') === 0 && !appStoreData[p]._custom; })
					.map(function(path) {
						return fetch(BLUEPRINTS_BASE_URL + path)
							.then(function(r) { return r.json(); })
							.then(function(bp) { mergeAppBlueprintPlugins(appStoreData, bp); })
							.catch(function() { /* keep going if one blueprint fails */ });
					});

				// Wait for recipes, recommended-plugins enrichment, and all
				// blueprint extractions before the final re-render.
				// Recommended plugins merge LAST so curated metadata wins
				// over any synthetic blueprint-derived entries.
				Promise.all([pluginsPromise, recipesPromise].concat(blueprintPromises)).then(function(results) {
					var plugins = results[0];
					if (!plugins || !Object.keys(plugins).length) {
						pluginsLoadState = 'failed';
					} else {
						mergeRecommendedPlugins(appStoreData, plugins);
						pluginsLoadState = 'loaded';
					}

					// If we had a pending recipe deep-link, resolve it now
					// that recipes are loaded.
					if (pendingRecipe && recipes[pendingRecipe]) {
						activeCategory = '__recipes__';
						activeRecipe = pendingRecipe;
					}
					pendingRecipe = null;

					// If recipes failed (or returned empty) and we'd default
					// to the recipes grid, fall through to All Apps so the
					// user sees something useful instead of an error state.
					if (!hasRecipes && activeCategory === '__recipes__' && !activeRecipe) {
						activeCategory = 'all';
					}

					buildAppStoreNav(appStoreData);

					// Plugin deep-links land here (their entries only appear
					// after the blueprint + recommended fetches resolve).
					var renderedNow = tryRenderPendingDeepLink();
					// Clear any leftover pending target — if it didn't resolve
					// by now, the slug doesn't exist in the catalogue.
					pendingDeepLink = null;
					if (!renderedNow && !deepLinkRendered) {
						renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
					}
				});
			})
			.catch(function() {
				appStoreContent.innerHTML = '<div class="app-store-error">Unable to load apps. Check your connection.</div>';
			});
	}

	// Render the pending deep-link target if its data is now available.
	// Called from within loadAppStore at the two points where appStoreData
	// changes shape (after apps.json, then after blueprints + recommended).
	function tryRenderPendingDeepLink() {
		if (!pendingDeepLink || !appStoreData) return false;
		if (pendingDeepLink.type === 'app') {
			var appPath = pendingDeepLink.path;
			if (!appStoreData[appPath]) return false;
			var app = appStoreData[appPath];
			var blueprintUrl = getBlueprintUrl(appPath);
			var cats = app.categories || [];
			var gradient = defaultGradient;
			for (var i = cats.length - 1; i >= 0; i--) {
				if (categoryGradients[cats[i]]) {
					gradient = categoryGradients[cats[i]];
					break;
				}
			}
			renderAppDetail(appPath, app, blueprintUrl, gradient);
			pendingDeepLink = null;
			deepLinkRendered = true;
			return true;
		}
		if (pendingDeepLink.type === 'plugin') {
			var pluginPath = pendingDeepLink.path;
			if (!appStoreData[pluginPath]) return false;
			renderPluginDetail(pluginPath, appStoreData[pluginPath]);
			pendingDeepLink = null;
			deepLinkRendered = true;
			return true;
		}
		return false;
	}

	function buildAppStoreNav(data) {
		var categories = new Set();
		Object.keys(data).forEach(function(path) {
			var cats = data[path].categories || [];
			cats.forEach(function(c) { categories.add(c); });
		});

		appStoreNav.innerHTML = '';

		// Recipes are curated use cases — surface them as the first sidebar
		// entry so people see what WordPress can actually do before drilling
		// into individual apps. A divider visually groups them apart from
		// the regular category list below.
		if (hasRecipes) {
			var recipesLi = document.createElement('li');
			recipesLi.className = 'app-store-nav-item' + (activeView === 'apps' && activeCategory === '__recipes__' ? ' active' : '');
			recipesLi.dataset.category = '__recipes__';
			recipesLi.textContent = 'Recipes';
			appStoreNav.appendChild(recipesLi);

			var recipesDivider = document.createElement('li');
			recipesDivider.className = 'app-store-nav-divider';
			appStoreNav.appendChild(recipesDivider);
		}

		var discoverLi = document.createElement('li');
		discoverLi.className = 'app-store-nav-item' + (activeView === 'apps' && activeCategory === 'all' ? ' active' : '');
		discoverLi.dataset.category = 'all';
		discoverLi.textContent = 'All Apps';
		appStoreNav.appendChild(discoverLi);

		// Always show the Recommended Plugins entry — the curated list ships
		// with the plugin, so even if the wp.org enrichment call fails we still
		// have something meaningful to render in that section.
		var pluginsLi = document.createElement('li');
		pluginsLi.className = 'app-store-nav-item' + (activeCategory === '__plugins__' ? ' active' : '');
		pluginsLi.dataset.category = '__plugins__';
		pluginsLi.textContent = 'Recommended Plugins';
		appStoreNav.appendChild(pluginsLi);

		categories.forEach(function(cat) {
			var li = document.createElement('li');
			li.className = 'app-store-nav-item';
			li.dataset.category = cat;
			li.textContent = cat;
			appStoreNav.appendChild(li);
		});

		var addDivider = document.createElement('li');
		addDivider.className = 'app-store-nav-divider';
		appStoreNav.appendChild(addDivider);

		var addAdminLi = document.createElement('li');
		addAdminLi.className = 'app-store-nav-item';
		addAdminLi.dataset.view = 'admin-link';
		addAdminLi.textContent = 'Add Admin Link';
		appStoreNav.appendChild(addAdminLi);

		var addWebLi = document.createElement('li');
		addWebLi.className = 'app-store-nav-item';
		addWebLi.dataset.view = 'web-link';
		addWebLi.textContent = 'Add Web Link';
		appStoreNav.appendChild(addWebLi);

		// Plugin directory link
		var divider = document.createElement('li');
		divider.className = 'app-store-nav-divider';
		appStoreNav.appendChild(divider);

		var pluginDirLi = document.createElement('li');
		pluginDirLi.className = 'app-store-nav-item app-store-nav-external';
		var pluginDirLink = document.createElement('a');
		pluginDirLink.href = myAppsConfig.ajaxUrl.replace('admin-ajax.php', 'plugin-install.php');
		pluginDirLink.target = '_top';
		pluginDirLink.textContent = 'Plugin Directory';
		pluginDirLi.appendChild(pluginDirLink);
		appStoreNav.appendChild(pluginDirLi);

		var submitLi = document.createElement('li');
		submitLi.className = 'app-store-nav-item app-store-nav-external';
		var submitLink = document.createElement('a');
		submitLink.href = 'https://github.com/WordPress/blueprints/';
		submitLink.target = '_blank';
		submitLink.rel = 'noopener noreferrer';
		submitLink.textContent = 'Submit an App';
		submitLi.appendChild(submitLink);
		appStoreNav.appendChild(submitLi);
	}

	function handleBlueprintPaste(e) {
		var text = (e.clipboardData || window.clipboardData).getData('text');
		if (!text) return;

		var blueprint;
		try {
			blueprint = JSON.parse(text);
		} catch (err) {
			showToast('Pasted text is not valid JSON');
			return;
		}

		// Validate it looks like a blueprint
		if (!blueprint.steps && !blueprint.meta && !(blueprint.$schema && blueprint.$schema.indexOf('blueprint') !== -1)) {
			showToast('Pasted JSON is not a valid blueprint');
			return;
		}

		e.preventDefault();

		var meta = blueprint.meta || {};
		var title = meta.title || 'Untitled App';
		var description = meta.description || '';
		var author = meta.author || '';

		// Check for existing app with matching title
		var matchedPath = null;
		if (appStoreData) {
			Object.keys(appStoreData).forEach(function(path) {
				if (appStoreData[path].title === title) {
					matchedPath = path;
				}
			});
		}

		// Grab original categories before removing
		var originalCategories = (matchedPath && appStoreData[matchedPath])
			? appStoreData[matchedPath].categories
			: null;

		// Resolve the true original path (follow existing override chain)
		var overridesPath = matchedPath;
		if (matchedPath && appStoreData[matchedPath]._overrides) {
			overridesPath = appStoreData[matchedPath]._overrides;
		}

		// Use the original path as key for overrides, generate new key for custom apps
		var customPath = overridesPath || ('custom/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json');

		if (matchedPath) {
			if (!confirm('An app named "' + title + '" already exists. Override it with your pasted blueprint?')) {
				return;
			}
			// Only delete if the key changes (avoid re-inserting at end)
			if (matchedPath !== customPath) {
				delete appStoreData[matchedPath];
			}
		}

		var appMeta = {
			title: title,
			description: description,
			author: author,
			categories: originalCategories || ['Custom']
		};

		// Only set overridesPath if this actually overrides a non-custom app
		var actualOverrides = (overridesPath && overridesPath !== customPath) ? overridesPath : null;
		saveCustomBlueprint(customPath, appMeta, blueprint, actualOverrides);

		// Merge into current data
		appMeta._custom = true;
		if (actualOverrides) appMeta._overrides = actualOverrides;
		appStoreData[customPath] = appMeta;

		buildAppStoreNav(appStoreData);
		renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
		showToast(matchedPath ? '"' + title + '" overridden with custom blueprint' : '"' + title + '" added');
	}

	function bindAppStoreEvents() {
		installSoftwareModal.addEventListener('paste', handleBlueprintPaste);

		appStoreNav.addEventListener('click', function(e) {
			var item = e.target.closest('.app-store-nav-item');
			if (!item) return;
			if (!item.dataset.view && !item.dataset.category) return;

			appStoreNav.querySelectorAll('.app-store-nav-item').forEach(function(el) {
				el.classList.remove('active');
			});
			item.classList.add('active');

			if (item.dataset.view) {
				showAppStoreView(item.dataset.view);
				return;
			}

			activeCategory = item.dataset.category;
			activeRecipe = null;

			var url = new URL(window.location);
			if (url.searchParams.has('recipe')) {
				url.searchParams.delete('recipe');
				history.replaceState({}, '', url.toString());
			}

			showAppStoreView('apps');
			filterAppStore();
		});

		appStoreSearchInput.addEventListener('input', function() {
			filterAppStore();
		});
	}

	function filterAppStore() {
		var search = (appStoreSearchInput.value || '').toLowerCase();
		renderAppStore(appStoreData, activeCategory, search);
	}

	function selectCategory(cat) {
		activeCategory = cat;
		activeRecipe = null;
		appStoreHeading.textContent = categoryLabel(cat);

		var url = new URL(window.location);
		if (url.searchParams.has('recipe')) {
			url.searchParams.delete('recipe');
			history.replaceState({}, '', url.toString());
		}

		// Update sidebar selection
		appStoreNav.querySelectorAll('.app-store-nav-item').forEach(function(el) {
			el.classList.toggle('active', el.dataset.category === cat);
		});

		filterAppStore();
	}

	function selectRecipe(recipeKey) {
		if (!recipes[recipeKey]) return;
		activeCategory = '__recipes__';
		activeRecipe = recipeKey;

		// Push URL state so the recipe detail is shareable, browser-back-able,
		// and the modal reopens to the same place after a close.
		var url = new URL(window.location);
		if (url.searchParams.get('recipe') !== recipeKey) {
			url.searchParams.set('recipe', recipeKey);
			history.pushState({ recipe: recipeKey }, '', url.toString());
		}

		// Update sidebar selection
		appStoreNav.querySelectorAll('.app-store-nav-item').forEach(function(el) {
			el.classList.toggle('active', el.dataset.category === '__recipes__');
		});
		filterAppStore();
	}

	var categoryGradients = {
		'Productivity': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		'Social':       'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		'AI':           'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		'Media':        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
		'Utility':      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
		'Apps':         'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	};

	var defaultGradient = 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';

	function renderAppStore(data, category, search) {
		category = category || 'all';
		search = (search || '').toLowerCase();

		if (category === '__recipes__') {
			if (activeRecipe && recipes[activeRecipe]) {
				renderRecipeDetail(activeRecipe, data, search);
			} else {
				renderRecipesGrid(search);
			}
			return;
		}

		var listEl = document.createElement('div');
		listEl.className = 'app-store-list';

		var wpIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5zM4.146 12L7.09 19.6a8.476 8.476 0 01-2.944-7.6zm14.023 3.533L14.89 6.178c.563-.03 1.07-.088 1.07-.088.502-.06.443-.797-.06-.769 0 0-1.51.119-2.485.119-.918 0-2.458-.119-2.458-.119-.503-.028-.563.739-.06.769 0 0 .478.058.982.088l1.46 4-2.048 6.14L7.96 6.178c.564-.03 1.07-.088 1.07-.088.503-.06.443-.797-.06-.769 0 0-1.508.119-2.484.119-.175 0-.38-.005-.596-.013A8.467 8.467 0 0112 3.5c3.161 0 5.946 1.725 7.426 4.286-.048-.003-.094-.01-.144-.01-1.243 0-2.125.91-2.125 1.893 0 .878.507 1.622 1.048 2.502.406.706.88 1.612.88 2.92 0 .907-.348 1.958-.81 3.422l-1.106 3.52zm-6.187 1.085L15.5 7.653l1.666 4.573c.16.454.282.826.282 1.274 0 1.072-.28 1.818-.6 2.832l-.877 2.765a8.473 8.473 0 01-4.002 1.559z"/></svg>';

		var hasResults = false;

		Object.keys(data).forEach(function(path) {
			var app = data[path];

			// Category filter
			if (category === '__plugins__') {
				if (app._type !== 'plugin') return;
			} else if (category !== 'all') {
				var cats = app.categories || [];
				if (cats.indexOf(category) === -1) return;
			}

			// Search filter
			if (search) {
				var haystack = (app.title + ' ' + app.description + ' ' + (app.author || '')).toLowerCase();
				if (haystack.indexOf(search) === -1) return;
			}

			hasResults = true;
			var isPluginEntry = app._type === 'plugin';
			var blueprintUrl = isPluginEntry ? '' : getBlueprintUrl(path);

			var itemEl = document.createElement('div');
			itemEl.className = 'app-store-item' + (isPluginEntry ? ' app-store-item-plugin' : '');

			var iconEl = document.createElement('div');
			iconEl.className = 'app-store-icon';

			// Pick gradient based on most specific category
			var cats = app.categories || [];
			var gradient = defaultGradient;
			for (var i = cats.length - 1; i >= 0; i--) {
				if (categoryGradients[cats[i]]) {
					gradient = categoryGradients[cats[i]];
					break;
				}
			}

			if (isPluginEntry && app._icon) {
				var pluginIcon = document.createElement('img');
				pluginIcon.src = app._icon;
				pluginIcon.alt = '';
				pluginIcon.loading = 'lazy';
				iconEl.appendChild(pluginIcon);
			} else {
				iconEl.innerHTML = wpIconSvg;
				iconEl.style.background = gradient;
			}

			var infoEl = document.createElement('div');
			infoEl.className = 'app-store-info';

			if (app.categories && app.categories.length > 0) {
				var catEl = document.createElement('div');
				catEl.className = 'app-store-category';
				app.categories.forEach(function(cat, idx) {
					if (idx > 0) {
						catEl.appendChild(document.createTextNode(' \u00b7 '));
					}
					var catLink = document.createElement('span');
					catLink.className = 'app-store-category-link';
					catLink.textContent = cat;
					catLink.addEventListener('click', function(e) {
						e.stopPropagation();
						selectCategory(cat);
					});
					catEl.appendChild(catLink);
				});
				infoEl.appendChild(catEl);
			}

			var titleEl = document.createElement('div');
			titleEl.className = 'app-store-title';
			titleEl.textContent = app.title;

			var descEl = document.createElement('div');
			descEl.className = 'app-store-description';
			descEl.textContent = app.description;

			var metaEl = document.createElement('div');
			metaEl.className = 'app-store-meta';

			var badgeEl = document.createElement('span');
			badgeEl.className = 'app-store-badge';
			badgeEl.textContent = 'Free, open source';
			metaEl.appendChild(badgeEl);

			if (app._custom) {
				var modBadge = document.createElement('span');
				modBadge.className = 'app-store-badge app-store-badge-modified';
				modBadge.dataset.label = app._overrides ? 'Modified' : 'Custom';
				modBadge.dataset.hoverLabel = app._overrides ? 'Revert' : 'Remove';
				modBadge.textContent = modBadge.dataset.label;
				modBadge.addEventListener('mouseenter', function() { modBadge.textContent = modBadge.dataset.hoverLabel; });
				modBadge.addEventListener('mouseleave', function() { modBadge.textContent = modBadge.dataset.label; });
				(function(badgeEl, p) {
					badgeEl.addEventListener('click', function(e) {
						e.stopPropagation();
						deleteCustomBlueprint(p);
						fetch(APPS_INDEX_URL)
							.then(function(res) { return res.json(); })
							.then(function(data) {
								appStoreData = mergeCustomBlueprints(data);
								buildAppStoreNav(appStoreData);
								renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
								showToast(app._overrides ? 'Original restored' : 'Custom app removed');
							});
					});
				})(modBadge, path);
				metaEl.appendChild(modBadge);
			}

			if (app.author) {
				var authorEl = document.createElement('span');
				authorEl.className = 'app-store-author';
				authorEl.textContent = 'by ' + app.author;
				metaEl.appendChild(authorEl);
			}

			infoEl.appendChild(titleEl);
			infoEl.appendChild(descEl);
			infoEl.appendChild(metaEl);

			var actionsEl = document.createElement('div');
			actionsEl.className = 'app-store-actions';

			if (isPluginEntry) {
				var pluginInstallBtn = document.createElement('button');
				pluginInstallBtn.type = 'button';
				pluginInstallBtn.className = 'app-store-install-btn';
				pluginInstallBtn.textContent = 'Install';
				(function(a, g) {
					pluginInstallBtn.addEventListener('click', function(e) {
						e.stopPropagation();
						installPluginApp(a, g);
					});
				})(app, gradient);
				actionsEl.appendChild(pluginInstallBtn);
			} else if (isPlayground) {
				var installBtn = document.createElement('button');
				installBtn.type = 'button';
				installBtn.className = 'app-store-install-btn';
				installBtn.textContent = 'Install';
				(function(a, bUrl, g) {
					installBtn.addEventListener('click', function(e) {
						e.stopPropagation();
						addAppFromBlueprintUrl(a, bUrl, g);
						window.parent.postMessage({
							type: 'relay',
							relayType: 'install-blueprint',
							blueprintUrl: bUrl
						}, '*');
					});
				})(app, blueprintUrl, gradient);
				actionsEl.appendChild(installBtn);
			}

			itemEl.appendChild(iconEl);
			itemEl.appendChild(infoEl);
			itemEl.appendChild(actionsEl);

			// Clicking the title or icon opens the in-launcher detail view —
			// blueprint apps render the full app detail (with how-to-install
			// recipe), plugins render a slimmer plugin detail.
			titleEl.classList.add('app-store-title-link');
			iconEl.classList.add('app-store-icon-link');
			(function(p, a, bUrl, g) {
				var openDetail = function(e) {
					e.stopPropagation();
					if (isPluginEntry) {
						openPluginDetail(p, a);
					} else {
						openAppDetail(p, a, bUrl, g);
					}
				};
				titleEl.addEventListener('click', openDetail);
				iconEl.addEventListener('click', openDetail);
			})(path, app, blueprintUrl, gradient);

			listEl.appendChild(itemEl);
		});

		appStoreContent.innerHTML = '';

		if (category === '__plugins__') {
			var introEl = document.createElement('p');
			introEl.className = 'app-store-intro';
			introEl.textContent = 'These plugins have been hand-picked as useful additions for a personal WordPress site.';
			appStoreContent.appendChild(introEl);

			if (!hasResults && pluginsLoadState === 'loading') {
				var pluginLoadingEl = document.createElement('div');
				pluginLoadingEl.className = 'app-store-loading';
				pluginLoadingEl.textContent = 'Loading recommendations…';
				appStoreContent.appendChild(pluginLoadingEl);
			} else if (!hasResults) {
				var pluginEmptyEl = document.createElement('div');
				pluginEmptyEl.className = 'app-store-error';
				pluginEmptyEl.textContent = pluginsLoadState === 'failed'
					? 'Unable to load recommendations right now.'
					: 'No recommendations match your search.';
				appStoreContent.appendChild(pluginEmptyEl);
			} else {
				appStoreContent.appendChild(listEl);
			}

			var footerEl = document.createElement('p');
			footerEl.className = 'app-store-footer-link';
			var footerLink = document.createElement('a');
			footerLink.href = myAppsConfig.ajaxUrl.replace('admin-ajax.php', 'plugin-install.php');
			footerLink.target = '_top';
			footerLink.textContent = 'Browse all WordPress plugins →';
			footerEl.appendChild(footerLink);
			appStoreContent.appendChild(footerEl);
			return;
		}

		if (hasResults) {
			appStoreContent.appendChild(listEl);
		} else {
			var emptyEl = document.createElement('div');
			emptyEl.className = 'app-store-error';
			emptyEl.textContent = 'No apps found.';
			appStoreContent.appendChild(emptyEl);
		}
	}

	// ── Recipes ──────────────────────────────────────────────

	var BACK_ARROW_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
	var WP_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5zM4.146 12L7.09 19.6a8.476 8.476 0 01-2.944-7.6zm14.023 3.533L14.89 6.178c.563-.03 1.07-.088 1.07-.088.502-.06.443-.797-.06-.769 0 0-1.51.119-2.485.119-.918 0-2.458-.119-2.458-.119-.503-.028-.563.739-.06.769 0 0 .478.058.982.088l1.46 4-2.048 6.14L7.96 6.178c.564-.03 1.07-.088 1.07-.088.503-.06.443-.797-.06-.769 0 0-1.508.119-2.484.119-.175 0-.38-.005-.596-.013A8.467 8.467 0 0112 3.5c3.161 0 5.946 1.725 7.426 4.286-.048-.003-.094-.01-.144-.01-1.243 0-2.125.91-2.125 1.893 0 .878.507 1.622 1.048 2.502.406.706.88 1.612.88 2.92 0 .907-.348 1.958-.81 3.422l-1.106 3.52zm-6.187 1.085L15.5 7.653l1.666 4.573c.16.454.282.826.282 1.274 0 1.072-.28 1.818-.6 2.832l-.877 2.765a8.473 8.473 0 01-4.002 1.559z"/></svg>';

	function findStoreEntryForStep(step) {
		if (!appStoreData || !step) return null;
		if (step.type === 'app' && step.path && appStoreData[step.path]) {
			return { path: step.path, app: appStoreData[step.path] };
		}
		if (step.type === 'plugin' && step.slug) {
			var key = 'plugin/' + step.slug;
			if (appStoreData[key]) return { path: key, app: appStoreData[key] };
		}
		if (step.type === 'github' && step.repo) {
			var match = null;
			Object.keys(appStoreData).forEach(function(p) {
				if (appStoreData[p]._repo === step.repo) match = { path: p, app: appStoreData[p] };
			});
			return match;
		}
		return null;
	}

	function renderRecipesGrid(search) {
		appStoreContent.innerHTML = '';

		var introEl = document.createElement('p');
		introEl.className = 'app-store-intro';
		introEl.textContent = 'WordPress can do a lot more than blogging — but turning that into something useful takes knowing which pieces fit together. Each recipe is a guide for one of those use cases.';
		appStoreContent.appendChild(introEl);

		if (recipesLoadState === 'loading' && !hasRecipes) {
			var loadingEl = document.createElement('div');
			loadingEl.className = 'app-store-loading';
			loadingEl.textContent = 'Loading recipes…';
			appStoreContent.appendChild(loadingEl);
			return;
		}
		if (recipesLoadState === 'failed' && !hasRecipes) {
			var failedEl = document.createElement('div');
			failedEl.className = 'app-store-error';
			failedEl.textContent = 'Recipes are unavailable right now. Try All Apps instead.';
			appStoreContent.appendChild(failedEl);
			return;
		}

		var grid = document.createElement('div');
		grid.className = 'recipe-grid';

		var hasResults = false;
		Object.keys(recipes).forEach(function(key) {
			var r = recipes[key];
			if (search) {
				var hay = (r.title + ' ' + (r.tagline || '') + ' ' + (r.description || '')).toLowerCase();
				if (hay.indexOf(search) === -1) return;
			}
			hasResults = true;

			var card = document.createElement('button');
			card.type = 'button';
			card.className = 'recipe-card';

			var iconEl = document.createElement('div');
			iconEl.className = 'recipe-card-icon';
			iconEl.style.background = r.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
			iconEl.textContent = r.icon || '✨';
			card.appendChild(iconEl);

			var titleEl = document.createElement('div');
			titleEl.className = 'recipe-card-title';
			titleEl.textContent = r.title;
			card.appendChild(titleEl);

			var taglineEl = document.createElement('div');
			taglineEl.className = 'recipe-card-tagline';
			taglineEl.textContent = r.tagline || '';
			card.appendChild(taglineEl);

			var stepCount = (r.steps && r.steps.length) || 0;
			var metaEl = document.createElement('div');
			metaEl.className = 'recipe-card-meta';
			metaEl.textContent = stepCount + ' step' + (stepCount === 1 ? '' : 's');
			card.appendChild(metaEl);

			(function(k) {
				card.addEventListener('click', function() { selectRecipe(k); });
			})(key);

			grid.appendChild(card);
		});

		if (hasResults) {
			appStoreContent.appendChild(grid);
		} else {
			var emptyEl = document.createElement('div');
			emptyEl.className = 'app-store-error';
			emptyEl.textContent = 'No recipes match your search.';
			appStoreContent.appendChild(emptyEl);
		}
	}

	function renderRecipeDetail(recipeKey, data, search) {
		var recipe = recipes[recipeKey];
		if (!recipe) {
			activeRecipe = null;
			renderRecipesGrid(search);
			return;
		}

		appStoreContent.innerHTML = '';

		// Heading: back arrow + parent label (Recipes grid). The recipe
		// title itself appears in the hero below.
		appStoreHeading.innerHTML = '';
		var backBtn = document.createElement('button');
		backBtn.type = 'button';
		backBtn.className = 'app-detail-back';
		backBtn.innerHTML = BACK_ARROW_SVG;
		var backLabel = document.createElement('span');
		backLabel.className = 'app-detail-back-label';
		backLabel.textContent = 'Recipes';
		backBtn.appendChild(backLabel);
		backBtn.addEventListener('click', function() {
			activeRecipe = null;

			var url = new URL(window.location);
			if (url.searchParams.has('recipe')) {
				url.searchParams.delete('recipe');
				history.pushState({}, '', url.toString());
			}

			appStoreHeading.textContent = categoryLabel('__recipes__');
			filterAppStore();
		});
		appStoreHeading.appendChild(backBtn);

		// Hero
		var hero = document.createElement('div');
		hero.className = 'recipe-hero';

		var heroIcon = document.createElement('div');
		heroIcon.className = 'recipe-hero-icon';
		heroIcon.style.background = recipe.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
		heroIcon.textContent = recipe.icon || '✨';
		hero.appendChild(heroIcon);

		var heroText = document.createElement('div');
		heroText.className = 'recipe-hero-text';
		var heroTitle = document.createElement('div');
		heroTitle.className = 'recipe-hero-title';
		heroTitle.textContent = recipe.title;
		heroText.appendChild(heroTitle);
		var heroTagline = document.createElement('div');
		heroTagline.className = 'recipe-hero-tagline';
		heroTagline.textContent = recipe.tagline || '';
		heroText.appendChild(heroTagline);
		hero.appendChild(heroText);
		appStoreContent.appendChild(hero);

		// Description
		if (recipe.description) {
			var descEl = document.createElement('p');
			descEl.className = 'recipe-description';
			descEl.textContent = recipe.description;
			appStoreContent.appendChild(descEl);
		}

		// Steps
		var stepsEl = document.createElement('ol');
		stepsEl.className = 'recipe-steps';

		(recipe.steps || []).forEach(function(step) {
			// On my.wordpress.net / Playground a site is private by default, so
			// steps tagged "self-hosted" (e.g., the privacy plugins) don't apply.
			if (step.context === 'self-hosted' && isPlayground) return;
			if (step.context === 'playground' && !isPlayground) return;

			var stepLi = document.createElement('li');
			stepLi.className = 'recipe-step' + (step.optional ? ' recipe-step-optional' : '');

			var stepTitle = document.createElement('h4');
			stepTitle.className = 'recipe-step-title';
			stepTitle.textContent = step.title || '';
			if (step.optional) {
				var optionalBadge = document.createElement('span');
				optionalBadge.className = 'recipe-step-optional-badge';
				optionalBadge.textContent = 'Optional';
				stepTitle.appendChild(document.createTextNode(' '));
				stepTitle.appendChild(optionalBadge);
			}
			stepLi.appendChild(stepTitle);

			if (step.description) {
				var stepDesc = document.createElement('p');
				stepDesc.className = 'recipe-step-description';
				stepDesc.textContent = step.description;
				stepLi.appendChild(stepDesc);
			}

			var entry = findStoreEntryForStep(step);
			if (entry) {
				stepLi.appendChild(buildRecipeStepCard(entry.path, entry.app));
			} else if (step.type === 'note' && step.url) {
				var linkWrap = document.createElement('div');
				linkWrap.className = 'recipe-step-actions';
				var linkEl = document.createElement('a');
				linkEl.className = 'recipe-step-link';
				linkEl.href = step.url;
				if (step.url.indexOf('http') === 0) {
					linkEl.target = '_blank';
					linkEl.rel = 'noopener noreferrer';
				} else {
					linkEl.target = '_top';
				}
				linkEl.textContent = (step.url_label || 'Open') + ' →';
				linkWrap.appendChild(linkEl);
				stepLi.appendChild(linkWrap);
			} else if (step.type !== 'note') {
				// Plugin/app referenced but not yet in appStoreData (e.g., recommended-plugins still loading).
				var pendingEl = document.createElement('div');
				pendingEl.className = 'recipe-step-pending';
				pendingEl.textContent = pluginsLoadState === 'loading' ? 'Loading…' : 'Reference unavailable.';
				stepLi.appendChild(pendingEl);
			}

			stepsEl.appendChild(stepLi);
		});
		appStoreContent.appendChild(stepsEl);

		if (recipe.learn_more) {
			var learnEl = document.createElement('p');
			learnEl.className = 'recipe-learn-more';
			var learnLink = document.createElement('a');
			learnLink.href = recipe.learn_more;
			learnLink.target = '_blank';
			learnLink.rel = 'noopener noreferrer';
			learnLink.textContent = 'Read why this matters →';
			learnEl.appendChild(learnLink);
			appStoreContent.appendChild(learnEl);
		}
	}

	function buildRecipeStepCard(path, app) {
		var isPluginEntry = app._type === 'plugin';
		var blueprintUrl = isPluginEntry ? '' : getBlueprintUrl(path);

		var cats = app.categories || [];
		var gradient = defaultGradient;
		for (var i = cats.length - 1; i >= 0; i--) {
			if (categoryGradients[cats[i]]) {
				gradient = categoryGradients[cats[i]];
				break;
			}
		}

		var card = document.createElement('div');
		card.className = 'recipe-step-card' + (isPluginEntry ? ' recipe-step-card-plugin' : '');

		var iconEl = document.createElement('div');
		iconEl.className = 'recipe-step-icon';

		if (isPluginEntry && app._icon) {
			var img = document.createElement('img');
			img.src = app._icon;
			img.alt = '';
			img.loading = 'lazy';
			iconEl.appendChild(img);
		} else {
			iconEl.innerHTML = WP_ICON_SVG;
			iconEl.style.background = gradient;
		}
		card.appendChild(iconEl);

		var info = document.createElement('div');
		info.className = 'recipe-step-info';

		var titleEl = document.createElement('div');
		titleEl.className = 'recipe-step-card-title';
		titleEl.textContent = app.title;
		info.appendChild(titleEl);

		if (app.author) {
			var authorEl = document.createElement('div');
			authorEl.className = 'recipe-step-card-author';
			authorEl.textContent = 'by ' + app.author;
			info.appendChild(authorEl);
		}
		card.appendChild(info);

		var actions = document.createElement('div');
		actions.className = 'recipe-step-card-actions';

		if (isPluginEntry) {
			var pluginBtn = document.createElement('button');
			pluginBtn.type = 'button';
			pluginBtn.className = 'app-store-install-btn';
			pluginBtn.textContent = 'Install';
			(function(a, g) {
				pluginBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					installPluginApp(a, g);
				});
			})(app, gradient);
			actions.appendChild(pluginBtn);
		} else if (isPlayground) {
			var installBtn = document.createElement('button');
			installBtn.type = 'button';
			installBtn.className = 'app-store-install-btn';
			installBtn.textContent = 'Install';
			(function(a, bUrl, g) {
				installBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					addAppFromBlueprintUrl(a, bUrl, g);
					window.parent.postMessage({
						type: 'relay',
						relayType: 'install-blueprint',
						blueprintUrl: bUrl
					}, '*');
				});
			})(app, blueprintUrl, gradient);
			actions.appendChild(installBtn);
		}
		card.appendChild(actions);

		// Title/icon opens the full detail — apps get the app detail with
		// blueprint steps, plugins get the slimmer plugin detail.
		titleEl.classList.add('app-store-title-link');
		iconEl.classList.add('app-store-icon-link');
		(function(p, a, bUrl, g) {
			var openDetail = function(e) {
				e.stopPropagation();
				if (isPluginEntry) {
					openPluginDetail(p, a);
				} else {
					openAppDetail(p, a, bUrl, g);
				}
			};
			titleEl.addEventListener('click', openDetail);
			iconEl.addEventListener('click', openDetail);
		})(path, app, blueprintUrl, gradient);

		return card;
	}

	// ── Plugin Detail Page ──────────────────────────────────

	function openPluginDetail(pluginPath, plugin) {
		var url = new URL(window.location);
		url.searchParams.set('plugin', pluginPath);
		history.pushState({ pluginDetail: pluginPath }, '', url.toString());
		renderPluginDetail(pluginPath, plugin);
	}

	function closePluginDetail() {
		var url = new URL(window.location);
		if (url.searchParams.has('plugin')) {
			url.searchParams.delete('plugin');
			history.pushState({}, '', url.toString());
		}

		if (appStoreData) {
			renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
		}

		// Recipe-detail rendering sets its own heading (back arrow + title);
		// don't clobber it.
		if (!(activeCategory === '__recipes__' && activeRecipe)) {
			appStoreHeading.textContent = categoryLabel(activeCategory);
		}

		var sidebar = document.getElementById('app-store-sidebar');
		sidebar.classList.remove('app-store-sidebar-hidden');
	}

	function renderPluginDetail(pluginPath, plugin) {
		var sidebar = document.getElementById('app-store-sidebar');
		sidebar.classList.add('app-store-sidebar-hidden');

		appStoreHeading.innerHTML = '';
		var backBtn = document.createElement('button');
		backBtn.type = 'button';
		backBtn.className = 'app-detail-back';
		backBtn.innerHTML = BACK_ARROW_SVG;
		var backLabel = document.createElement('span');
		backLabel.className = 'app-detail-back-label';
		backLabel.textContent = categoryLabel(activeCategory);
		backBtn.appendChild(backLabel);
		backBtn.addEventListener('click', closePluginDetail);
		appStoreHeading.appendChild(backBtn);

		var cats = plugin.categories || [];
		var gradient = defaultGradient;
		for (var i = cats.length - 1; i >= 0; i--) {
			if (categoryGradients[cats[i]]) {
				gradient = categoryGradients[cats[i]];
				break;
			}
		}

		var detail = document.createElement('div');
		detail.className = 'app-detail';

		// Header: icon + title + author + Install
		var headerEl = document.createElement('div');
		headerEl.className = 'app-detail-header';

		var iconEl = document.createElement('div');
		iconEl.className = 'app-detail-icon';
		if (plugin._icon) {
			iconEl.classList.add('app-detail-icon-plugin');
			var img = document.createElement('img');
			img.src = plugin._icon;
			img.alt = '';
			iconEl.appendChild(img);
		} else {
			iconEl.innerHTML = WP_ICON_SVG;
			iconEl.style.background = gradient;
		}

		var headerInfo = document.createElement('div');
		headerInfo.className = 'app-detail-header-info';

		var titleEl = document.createElement('h3');
		titleEl.className = 'app-detail-title';
		titleEl.textContent = plugin.title;

		var subtitleEl = document.createElement('div');
		subtitleEl.className = 'app-detail-subtitle';
		subtitleEl.textContent = plugin.author ? 'by ' + plugin.author : '';

		var metaRow = document.createElement('div');
		metaRow.className = 'app-detail-meta-row';
		var badge = document.createElement('span');
		badge.className = 'app-store-badge';
		badge.textContent = 'Free, open source';
		metaRow.appendChild(badge);
		if (plugin.categories && plugin.categories.length) {
			var catSpan = document.createElement('span');
			catSpan.className = 'app-detail-categories';
			catSpan.textContent = plugin.categories.join(' · ');
			metaRow.appendChild(catSpan);
		}

		headerInfo.appendChild(titleEl);
		headerInfo.appendChild(subtitleEl);
		headerInfo.appendChild(metaRow);

		var headerActions = document.createElement('div');
		headerActions.className = 'app-detail-header-actions';

		var installBtn = document.createElement('button');
		installBtn.type = 'button';
		installBtn.className = 'app-store-install-btn app-detail-install-btn';
		installBtn.textContent = 'Install';
		installBtn.addEventListener('click', function() {
			installPluginApp(plugin, gradient);
		});

		var shareBtn = document.createElement('button');
		shareBtn.type = 'button';
		shareBtn.className = 'app-detail-share-btn';
		shareBtn.title = 'Copy link';
		shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>';
		shareBtn.addEventListener('click', function() {
			if (navigator.clipboard) {
				navigator.clipboard.writeText(window.location.href).then(function() {
					shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
					setTimeout(function() {
						shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>';
					}, 2000);
				});
			}
		});

		headerActions.appendChild(installBtn);
		headerActions.appendChild(shareBtn);

		headerEl.appendChild(iconEl);
		headerEl.appendChild(headerInfo);
		headerEl.appendChild(headerActions);

		detail.appendChild(headerEl);

		// About section: prefer the curated note, then short description, then description
		var aboutText = plugin._note || plugin._shortDescription || plugin.description || '';
		if (aboutText) {
			var aboutSection = document.createElement('div');
			aboutSection.className = 'app-detail-section';
			var aboutTitle = document.createElement('h4');
			aboutTitle.textContent = 'About';
			aboutSection.appendChild(aboutTitle);
			var aboutP = document.createElement('p');
			aboutP.textContent = aboutText;
			aboutSection.appendChild(aboutP);
			detail.appendChild(aboutSection);
		}

		// Source link
		var sourceUrl = '';
		var sourceLabel = '';
		if (plugin._source === 'github' && plugin._repo) {
			sourceUrl = 'https://github.com/' + plugin._repo;
			sourceLabel = 'github.com/' + plugin._repo;
		} else if (plugin._source === 'wp.org' && plugin._slug) {
			sourceUrl = 'https://wordpress.org/plugins/' + plugin._slug + '/';
			sourceLabel = 'wordpress.org/plugins/' + plugin._slug + '/';
		}
		if (sourceUrl) {
			var sourceSection = document.createElement('div');
			sourceSection.className = 'app-detail-section';
			var sourceTitle = document.createElement('h4');
			sourceTitle.textContent = 'Source';
			sourceSection.appendChild(sourceTitle);
			var sourceLink = document.createElement('a');
			sourceLink.href = sourceUrl;
			sourceLink.target = '_blank';
			sourceLink.rel = 'noopener noreferrer';
			sourceLink.className = 'app-detail-recipe-link';
			sourceLink.textContent = sourceLabel;
			sourceSection.appendChild(sourceLink);
			detail.appendChild(sourceSection);
		}

		appStoreContent.innerHTML = '';
		appStoreContent.appendChild(detail);
	}

	// ── App Detail Page ──────────────────────────────────────

	function openAppDetail(appPath, app, blueprintUrl, gradient) {
		// Push URL state so the detail page is shareable
		var url = new URL(window.location);
		url.searchParams.set('app', appPath);
		history.pushState({ appDetail: appPath }, '', url.toString());

		renderAppDetail(appPath, app, blueprintUrl, gradient);
	}

	function closeAppDetail() {
		// Go back to the list — remove ?app param
		var url = new URL(window.location);
		if (url.searchParams.has('app')) {
			url.searchParams.delete('app');
			history.pushState({}, '', url.toString());
		}

		// Re-render the list
		if (appStoreData) {
			renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
		}

		// Restore heading. Recipe detail rendering sets its own heading
		// (back arrow + title), so don't clobber it.
		if (!(activeCategory === '__recipes__' && activeRecipe)) {
			appStoreHeading.textContent = categoryLabel(activeCategory);
		}

		// Show sidebar
		var sidebar = document.getElementById('app-store-sidebar');
		sidebar.classList.remove('app-store-sidebar-hidden');
	}

	function renderAppDetail(appPath, app, blueprintUrl, gradient) {
		var wpIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5zM4.146 12L7.09 19.6a8.476 8.476 0 01-2.944-7.6zm14.023 3.533L14.89 6.178c.563-.03 1.07-.088 1.07-.088.502-.06.443-.797-.06-.769 0 0-1.51.119-2.485.119-.918 0-2.458-.119-2.458-.119-.503-.028-.563.739-.06.769 0 0 .478.058.982.088l1.46 4-2.048 6.14L7.96 6.178c.564-.03 1.07-.088 1.07-.088.503-.06.443-.797-.06-.769 0 0-1.508.119-2.484.119-.175 0-.38-.005-.596-.013A8.467 8.467 0 0112 3.5c3.161 0 5.946 1.725 7.426 4.286-.048-.003-.094-.01-.144-.01-1.243 0-2.125.91-2.125 1.893 0 .878.507 1.622 1.048 2.502.406.706.88 1.612.88 2.92 0 .907-.348 1.958-.81 3.422l-1.106 3.52zm-6.187 1.085L15.5 7.653l1.666 4.573c.16.454.282.826.282 1.274 0 1.072-.28 1.818-.6 2.832l-.877 2.765a8.473 8.473 0 01-4.002 1.559z"/></svg>';

		// Hide sidebar — detail page is full-width in the main area
		var sidebar = document.getElementById('app-store-sidebar');
		sidebar.classList.add('app-store-sidebar-hidden');

		// Update heading: back arrow + parent label, all clickable.
		appStoreHeading.innerHTML = '';

		var backBtn = document.createElement('button');
		backBtn.type = 'button';
		backBtn.className = 'app-detail-back';
		backBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
		var backLabel = document.createElement('span');
		backLabel.className = 'app-detail-back-label';
		backLabel.textContent = categoryLabel(activeCategory);
		backBtn.appendChild(backLabel);
		backBtn.addEventListener('click', closeAppDetail);

		appStoreHeading.appendChild(backBtn);

		// Build detail content
		var detail = document.createElement('div');
		detail.className = 'app-detail';

		// ── Header row: icon + title + install ──
		var headerEl = document.createElement('div');
		headerEl.className = 'app-detail-header';

		var iconEl = document.createElement('div');
		iconEl.className = 'app-detail-icon';
		iconEl.innerHTML = wpIconSvg;
		iconEl.style.background = gradient;

		var headerInfo = document.createElement('div');
		headerInfo.className = 'app-detail-header-info';

		var titleEl = document.createElement('h3');
		titleEl.className = 'app-detail-title';
		titleEl.textContent = app.title;

		var subtitleEl = document.createElement('div');
		subtitleEl.className = 'app-detail-subtitle';
		subtitleEl.textContent = app.author ? 'by ' + app.author : '';

		var metaRow = document.createElement('div');
		metaRow.className = 'app-detail-meta-row';

		var badge = document.createElement('span');
		badge.className = 'app-store-badge';
		badge.textContent = 'Free, open source';
		metaRow.appendChild(badge);

		if (app._custom) {
			var detailModBadge = document.createElement('span');
			detailModBadge.className = 'app-store-badge app-store-badge-modified';
			detailModBadge.dataset.label = app._overrides ? 'Modified' : 'Custom';
			detailModBadge.dataset.hoverLabel = app._overrides ? 'Revert' : 'Remove';
			detailModBadge.textContent = detailModBadge.dataset.label;
			detailModBadge.addEventListener('mouseenter', function() { detailModBadge.textContent = detailModBadge.dataset.hoverLabel; });
			detailModBadge.addEventListener('mouseleave', function() { detailModBadge.textContent = detailModBadge.dataset.label; });
			detailModBadge.addEventListener('click', function() {
				deleteCustomBlueprint(appPath);
				fetch(APPS_INDEX_URL)
					.then(function(res) { return res.json(); })
					.then(function(data) {
						appStoreData = mergeCustomBlueprints(data);
						buildAppStoreNav(appStoreData);
						closeAppDetail();
						renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
						showToast(app._overrides ? 'Original restored' : 'Custom app removed');
					});
			});
			metaRow.appendChild(detailModBadge);
		}

		if (app.categories && app.categories.length) {
			var catSpan = document.createElement('span');
			catSpan.className = 'app-detail-categories';
			catSpan.textContent = app.categories.join(' \u00b7 ');
			metaRow.appendChild(catSpan);
		}

		headerInfo.appendChild(titleEl);
		headerInfo.appendChild(subtitleEl);
		headerInfo.appendChild(metaRow);

		var headerActions = document.createElement('div');
		headerActions.className = 'app-detail-header-actions';

		var blueprintInfoEl = document.createElement('div');
		blueprintInfoEl.className = 'app-store-blueprint-info';

		var installBtn;
		if (isPlayground) {
			installBtn = document.createElement('button');
			installBtn.type = 'button';
			installBtn.className = 'app-store-install-btn app-detail-install-btn';
			installBtn.textContent = 'Install';
			installBtn.addEventListener('click', function() {
				addAppFromBlueprintUrl(app, blueprintUrl, gradient);
				window.parent.postMessage({
					type: 'relay',
					relayType: 'install-blueprint',
					blueprintUrl: blueprintUrl
				}, '*');
			});
		} else {
			installBtn = document.createElement('button');
			installBtn.type = 'button';
			installBtn.className = 'app-store-install-btn app-detail-install-btn';
			installBtn.textContent = 'Install';
			installBtn.addEventListener('click', function() {
				handleAppInstall(blueprintUrl, blueprintInfoEl, installBtn);
			});
		}

		var shareBtn = document.createElement('button');
		shareBtn.type = 'button';
		shareBtn.className = 'app-detail-share-btn';
		shareBtn.title = 'Copy link';
		shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>';
		shareBtn.addEventListener('click', function() {
			var shareUrl = window.location.href;
			if (navigator.clipboard) {
				navigator.clipboard.writeText(shareUrl).then(function() {
					shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
					setTimeout(function() {
						shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>';
					}, 2000);
				});
			}
		});

		headerActions.appendChild(installBtn);
		headerActions.appendChild(shareBtn);

		headerEl.appendChild(iconEl);
		headerEl.appendChild(headerInfo);
		headerEl.appendChild(headerActions);

		detail.appendChild(headerEl);
		detail.appendChild(blueprintInfoEl);

		// ── Screenshots placeholder ──
		var screenshotsEl = document.createElement('div');
		screenshotsEl.className = 'app-detail-screenshots';
		// Future: populate from blueprint meta.screenshots array
		detail.appendChild(screenshotsEl);

		// ── Description ──
		var descSection = document.createElement('div');
		descSection.className = 'app-detail-section';

		var descTitle = document.createElement('h4');
		descTitle.textContent = 'Description';
		descSection.appendChild(descTitle);

		var descText = document.createElement('p');
		descText.textContent = app.description;
		descSection.appendChild(descText);

		detail.appendChild(descSection);

		// ── Recipe (fetched from individual blueprint JSON) ──
		var recipeSection = document.createElement('div');
		recipeSection.className = 'app-detail-section';

		var recipeTitle = document.createElement('h4');
		recipeTitle.textContent = 'How to install';
		recipeSection.appendChild(recipeTitle);

		var recipeLoading = document.createElement('p');
		recipeLoading.className = 'app-detail-comp-loading';
		recipeLoading.textContent = 'Loading recipe\u2026';
		recipeSection.appendChild(recipeLoading);

		detail.appendChild(recipeSection);

		appStoreContent.innerHTML = '';
		appStoreContent.appendChild(detail);

		// Fetch the individual blueprint to show recipe steps
		var customBlueprints = getCustomBlueprints();
		var blueprintPromise = customBlueprints[appPath]
			? Promise.resolve(customBlueprints[appPath].blueprint)
			: fetch(blueprintUrl).then(function(res) { return res.json(); });

		blueprintPromise
			.then(function(blueprint) {
				recipeLoading.remove();

				var steps = blueprint.steps || [];
				if (steps.length === 0) {
					var noSteps = document.createElement('p');
					noSteps.className = 'app-detail-comp-note';
					noSteps.textContent = 'No installation steps required.';
					recipeSection.appendChild(noSteps);
					return;
				}

				var recipeIntro = document.createElement('p');
				recipeIntro.className = 'app-detail-recipe-intro';
				recipeIntro.appendChild(document.createTextNode('This app is installed by running the following '));
				var blueprintLink = document.createElement('a');
				blueprintLink.href = blueprintUrl;
				blueprintLink.target = '_blank';
				blueprintLink.rel = 'noopener noreferrer';
				blueprintLink.className = 'app-detail-recipe-link';
				blueprintLink.textContent = 'blueprint';
				recipeIntro.appendChild(blueprintLink);
				recipeIntro.appendChild(document.createTextNode(' ('));
				var stepLibLink = document.createElement('a');
				stepLibLink.href = 'https://akirk.github.io/playground-step-library/?blueprint-url=' + encodeURIComponent(blueprintUrl);
				stepLibLink.target = '_blank';
				stepLibLink.rel = 'noopener noreferrer';
				stepLibLink.className = 'app-detail-recipe-link';
				stepLibLink.textContent = 'view in Step Library';
				recipeIntro.appendChild(stepLibLink);
				recipeIntro.appendChild(document.createTextNode('):'));
				recipeSection.appendChild(recipeIntro);

				var recipeList = document.createElement('ol');
				recipeList.className = 'app-detail-recipe-list';

				steps.forEach(function(step) {
					var li = document.createElement('li');

					if (step.step === 'installPlugin') {
						var pluginInfo = resolvePluginInfo(step.pluginData);
						li.appendChild(document.createTextNode('Install plugin '));
						var link = document.createElement('a');
						link.href = pluginInfo.pageUrl;
						link.target = '_blank';
						link.rel = 'noopener noreferrer';
						link.className = 'app-detail-recipe-link';
						link.textContent = pluginInfo.name;
						li.appendChild(link);

						if (step.pluginData) {
							var sourceEl = document.createElement('span');
							sourceEl.className = 'app-detail-recipe-source';
							if (step.pluginData.resource === 'wordpress.org/plugins') {
								sourceEl.textContent = ' from wordpress.org';
							} else if (step.pluginData.resource === 'git:directory') {
								sourceEl.textContent = ' from git';
								if (step.pluginData.url) {
									sourceEl.appendChild(document.createTextNode(' '));
									var srcLink = document.createElement('a');
									srcLink.href = step.pluginData.url;
									srcLink.target = '_blank';
									srcLink.rel = 'noopener noreferrer';
									srcLink.className = 'app-detail-recipe-link';
									srcLink.textContent = step.pluginData.url.replace(/https?:\/\//, '');
									sourceEl.appendChild(srcLink);
								}
								if (step.pluginData.ref) {
									var refLabel = step.pluginData.refType || 'ref';
									sourceEl.appendChild(document.createTextNode(' (' + refLabel + ': '));
									var refCode = document.createElement('code');
									refCode.className = 'app-detail-recipe-ref';
									refCode.textContent = step.pluginData.ref;
									sourceEl.appendChild(refCode);
									sourceEl.appendChild(document.createTextNode(')'));
								}
							} else if (step.pluginData.url) {
								sourceEl.textContent = ' from URL';
								var urlLink = document.createElement('a');
								urlLink.href = step.pluginData.url;
								urlLink.target = '_blank';
								urlLink.rel = 'noopener noreferrer';
								urlLink.className = 'app-detail-recipe-link';
								urlLink.textContent = step.pluginData.url.replace(/https?:\/\//, '');
								sourceEl.appendChild(document.createTextNode(' '));
								sourceEl.appendChild(urlLink);
							}
							li.appendChild(sourceEl);
						}

						// Fetch GitHub info if available
						if (pluginInfo.githubRepo) {
							fetchGithubInfo(pluginInfo.githubRepo, li);
						}
					} else if (step.step === 'installTheme') {
						var themeInfo = resolveThemeInfo(step.themeData);
						li.appendChild(document.createTextNode('Install theme '));
						var themeLink = document.createElement('a');
						themeLink.href = themeInfo.pageUrl;
						themeLink.target = '_blank';
						themeLink.rel = 'noopener noreferrer';
						themeLink.className = 'app-detail-recipe-link';
						themeLink.textContent = themeInfo.name;
						li.appendChild(themeLink);

						if (step.themeData) {
							var themeSourceEl = document.createElement('span');
							themeSourceEl.className = 'app-detail-recipe-source';
							if (step.themeData.resource === 'wordpress.org/themes') {
								themeSourceEl.textContent = ' from wordpress.org';
							} else if (step.themeData.resource === 'git:directory') {
								themeSourceEl.textContent = ' from git';
								if (step.themeData.url) {
									themeSourceEl.appendChild(document.createTextNode(' '));
									var themeSrcLink = document.createElement('a');
									themeSrcLink.href = step.themeData.url;
									themeSrcLink.target = '_blank';
									themeSrcLink.rel = 'noopener noreferrer';
									themeSrcLink.className = 'app-detail-recipe-link';
									themeSrcLink.textContent = step.themeData.url.replace(/https?:\/\//, '');
									themeSourceEl.appendChild(themeSrcLink);
								}
								if (step.themeData.ref) {
									var themeRefLabel = step.themeData.refType || 'ref';
									themeSourceEl.appendChild(document.createTextNode(' (' + themeRefLabel + ': '));
									var themeRefCode = document.createElement('code');
									themeRefCode.className = 'app-detail-recipe-ref';
									themeRefCode.textContent = step.themeData.ref;
									themeSourceEl.appendChild(themeRefCode);
									themeSourceEl.appendChild(document.createTextNode(')'));
								}
							} else if (step.themeData.url) {
								themeSourceEl.textContent = ' from URL';
								var themeUrlLink = document.createElement('a');
								themeUrlLink.href = step.themeData.url;
								themeUrlLink.target = '_blank';
								themeUrlLink.rel = 'noopener noreferrer';
								themeUrlLink.className = 'app-detail-recipe-link';
								themeUrlLink.textContent = step.themeData.url.replace(/https?:\/\//, '');
								themeSourceEl.appendChild(document.createTextNode(' '));
								themeSourceEl.appendChild(themeUrlLink);
							}
							li.appendChild(themeSourceEl);
						}
					} else if (step.step === 'runPHP') {
						var caption = (step.progress && step.progress.caption) || 'Run PHP code';
						li.appendChild(document.createTextNode(caption + ' '));

						var toggleBtn = document.createElement('button');
						toggleBtn.type = 'button';
						toggleBtn.className = 'app-detail-code-toggle';
						toggleBtn.textContent = 'view code';

						var codeBlock = document.createElement('pre');
						codeBlock.className = 'app-detail-code-block';
						codeBlock.textContent = step.code || '';

						toggleBtn.addEventListener('click', function() {
							var isVisible = codeBlock.classList.toggle('active');
							toggleBtn.textContent = isVisible ? 'hide code' : 'view code';
						});

						li.appendChild(toggleBtn);
						li.appendChild(codeBlock);
					} else if (step.step === 'activatePlugin') {
						li.textContent = 'Activate plugin ' + (step.pluginPath || step.slug || '');
					} else if (step.step === 'activateTheme') {
						li.textContent = 'Activate theme ' + (step.themeFolderName || step.slug || '');
					} else if (step.step === 'login') {
						li.textContent = 'Log in as ' + (step.username || 'admin');
					} else if (step.step === 'defineWpConfigConsts') {
						li.textContent = 'Configure WordPress settings';
					} else if (step.step === 'setSiteLanguage') {
						li.textContent = 'Set site language to ' + (step.language || 'default');
					} else {
						li.textContent = step.step.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
					}

					recipeList.appendChild(li);
				});

				// Landing page as final step
				if (blueprint.landingPage) {
					var landingLi = document.createElement('li');
					landingLi.appendChild(document.createTextNode('And finally, go to '));
					var landingCode = document.createElement('code');
					landingCode.className = 'app-detail-landing-path';
					landingCode.textContent = blueprint.landingPage;
					landingCode.title = 'Click to copy';
					landingCode.addEventListener('click', function() {
						if (navigator.clipboard) {
							navigator.clipboard.writeText(blueprint.landingPage).then(function() {
								var orig = landingCode.textContent;
								landingCode.textContent = 'Copied!';
								setTimeout(function() { landingCode.textContent = orig; }, 1500);
							});
						}
					});
					landingLi.appendChild(landingCode);
					recipeList.appendChild(landingLi);
				}

				recipeSection.appendChild(recipeList);

				// Check for screenshots in blueprint meta
				if (blueprint.meta && blueprint.meta.screenshots && blueprint.meta.screenshots.length) {
					renderScreenshots(screenshotsEl, blueprint.meta.screenshots);
				}
			})
			.catch(function() {
				recipeLoading.textContent = 'Could not load recipe.';
			});
	}

	function resolvePluginInfo(pluginData) {
		if (!pluginData) return { name: 'a plugin', pageUrl: '#', githubRepo: null };

		// wordpress.org/plugins slug
		if (pluginData.resource === 'wordpress.org/plugins' && pluginData.slug) {
			return {
				name: pluginData.slug.replace(/[-_]/g, ' '),
				pageUrl: 'https://wordpress.org/plugins/' + pluginData.slug + '/',
				githubRepo: null,
			};
		}

		// git:directory with GitHub URL
		if (pluginData.resource === 'git:directory' && pluginData.url) {
			var match = pluginData.url.match(/github\.com\/([^\/]+\/[^\/]+)/);
			var repo = match ? match[1] : null;
			var name = repo ? repo.split('/')[1].replace(/[-_]/g, ' ') : 'a plugin';
			return {
				name: name,
				pageUrl: pluginData.url,
				githubRepo: repo,
			};
		}

		// Direct URL (usually a GitHub release zip)
		if (pluginData.url) {
			var ghMatch = pluginData.url.match(/github\.com\/([^\/]+\/[^\/]+)/);
			var ghRepo = ghMatch ? ghMatch[1] : null;
			var parts = pluginData.url.split('/');
			var filename = parts[parts.length - 1] || '';
			var displayName = filename.replace(/\.zip$/, '').replace(/[-_]/g, ' ');

			return {
				name: displayName,
				pageUrl: ghRepo ? 'https://github.com/' + ghRepo : pluginData.url,
				githubRepo: ghRepo,
			};
		}

		if (pluginData.slug) {
			return {
				name: pluginData.slug.replace(/[-_]/g, ' '),
				pageUrl: '#',
				githubRepo: null,
			};
		}

		return { name: 'a plugin', pageUrl: '#', githubRepo: null };
	}

	function resolveThemeInfo(themeData) {
		if (!themeData) return { name: 'a theme', pageUrl: '#' };

		if (themeData.resource === 'wordpress.org/themes' && themeData.slug) {
			return {
				name: themeData.slug.replace(/[-_]/g, ' '),
				pageUrl: 'https://wordpress.org/themes/' + themeData.slug + '/',
			};
		}

		if (themeData.url) {
			var ghMatch = themeData.url.match(/github\.com\/([^\/]+\/[^\/]+)/);
			var parts = themeData.url.split('/');
			var filename = parts[parts.length - 1] || '';
			return {
				name: filename.replace(/\.zip$/, '').replace(/[-_]/g, ' '),
				pageUrl: ghMatch ? 'https://github.com/' + ghMatch[1] : themeData.url,
			};
		}

		if (themeData.slug) {
			return {
				name: themeData.slug.replace(/[-_]/g, ' '),
				pageUrl: '#',
			};
		}

		return { name: 'a theme', pageUrl: '#' };
	}

	var githubCache = {};

	function fetchGithubInfo(repo, li) {
		if (githubCache[repo]) {
			appendGithubBadge(li, githubCache[repo]);
			return;
		}

		fetch('https://api.github.com/repos/' + repo)
			.then(function(res) {
				if (!res.ok) return null;
				return res.json();
			})
			.then(function(data) {
				if (!data) return;
				githubCache[repo] = data;
				appendGithubBadge(li, data);
			})
			.catch(function() {
				// Silently fail — GitHub info is optional
			});
	}

	function appendGithubBadge(li, data) {
		var badge = document.createElement('span');
		badge.className = 'app-detail-github-badge';

		var parts = [];
		if (data.description) {
			parts.push(data.description);
		}
		if (data.stargazers_count > 0) {
			parts.push('\u2605 ' + data.stargazers_count);
		}
		if (data.license && data.license.spdx_id && data.license.spdx_id !== 'NOASSERTION') {
			parts.push(data.license.spdx_id);
		}

		badge.textContent = parts.join(' \u00b7 ');
		if (badge.textContent) {
			li.appendChild(badge);
		}
	}

	function renderScreenshots(container, screenshots) {
		container.innerHTML = '';
		screenshots.forEach(function(src) {
			var img = document.createElement('img');
			img.className = 'app-detail-screenshot';
			img.src = src;
			img.alt = 'Screenshot';
			img.loading = 'lazy';
			container.appendChild(img);
		});
	}

	// Handle browser back/forward for detail pages
	window.addEventListener('popstate', function(e) {
		if (!installSoftwareModal.classList.contains('active')) return;

		var url = new URL(window.location);
		var appParam = url.searchParams.get('app');
		var pluginParam = url.searchParams.get('plugin');
		var recipeParam = url.searchParams.get('recipe');

		// Keep activeRecipe in sync with the URL so going back from an
		// app/plugin detail to a recipe detail (or from a recipe detail
		// to the grid) restores the right view.
		if (recipeParam && recipes[recipeParam]) {
			activeCategory = '__recipes__';
			activeRecipe = recipeParam;
		} else {
			activeRecipe = null;
		}

		if (appParam && appStoreData && appStoreData[appParam]) {
			var app = appStoreData[appParam];
			var blueprintUrl = getBlueprintUrl(appParam);
			var cats = app.categories || [];
			var gradient = defaultGradient;
			for (var i = cats.length - 1; i >= 0; i--) {
				if (categoryGradients[cats[i]]) {
					gradient = categoryGradients[cats[i]];
					break;
				}
			}
			renderAppDetail(appParam, app, blueprintUrl, gradient);
		} else if (pluginParam && appStoreData && appStoreData[pluginParam]) {
			renderPluginDetail(pluginParam, appStoreData[pluginParam]);
		} else if (appStoreData) {
			// Back to list / grid / recipe detail (whichever activeCategory +
			// activeRecipe currently describe).
			var sidebar = document.getElementById('app-store-sidebar');
			sidebar.classList.remove('app-store-sidebar-hidden');
			appStoreNav.querySelectorAll('.app-store-nav-item').forEach(function(el) {
				el.classList.toggle('active', el.dataset.category === activeCategory);
			});
			if (!(activeCategory === '__recipes__' && activeRecipe)) {
				appStoreHeading.textContent = categoryLabel(activeCategory);
			}
			renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
		}
	});

	// On initial load, check query params for deep-links into the modal.
	function checkDeepLink() {
		var url = new URL(window.location);
		var addParam = url.searchParams.get('add');
		if (addParam === 'web-link' || addParam === 'admin-link' || addParam === 'apps') {
			openInstallSoftwareModal();
			showAppStoreView(addParam);
			url.searchParams.delete('add');
			history.replaceState({}, '', url.toString());
			return;
		}
		var recipeParam = url.searchParams.get('recipe');
		var appParam = url.searchParams.get('app');
		var pluginParam = url.searchParams.get('plugin');

		// Recipes load async, so we can't validate recipeParam against the
		// recipes map here. Stash it; loadAppStore will resolve it once
		// the recipes fetch settles. App/plugin deep-links without a
		// recipe context land in the regular app list (back → All Apps).
		if (recipeParam) {
			pendingRecipe = recipeParam;
			activeCategory = '__recipes__';
		} else if (appParam || pluginParam) {
			activeCategory = 'all';
			activeRecipe = null;
		}

		if (appParam) {
			pendingDeepLink = { type: 'app', path: appParam };
			openInstallSoftwareModal();
		} else if (pluginParam) {
			pendingDeepLink = { type: 'plugin', path: pluginParam };
			openInstallSoftwareModal();
		} else if (recipeParam) {
			// Recipe-only deep link: open the modal; the recipes-promise
			// resolution in loadAppStore will set activeRecipe and the
			// final render will route to the recipe detail.
			openInstallSoftwareModal();
		}
	}

	function handleAppInstall(blueprintUrl, infoEl, btn) {
		// Show the blueprint URL for manual use (non-Playground only)
		if (infoEl.classList.contains('active')) {
			infoEl.classList.remove('active');
			btn.textContent = 'Install';
			return;
		}

		// Close any other open info panels
		appStoreContent.querySelectorAll('.app-store-blueprint-info.active').forEach(function(el) {
			el.classList.remove('active');
		});
		appStoreContent.querySelectorAll('.app-store-install-btn').forEach(function(b) {
			b.textContent = 'Install';
		});

		var playgroundLink = 'https://playground.wordpress.net/?blueprint-url=' + encodeURIComponent(blueprintUrl);
		infoEl.innerHTML = '<p>To install, open this blueprint in WordPress Playground:</p>' +
			'<a href="' + playgroundLink + '" target="_blank" rel="noopener noreferrer" class="app-store-blueprint-url">' + blueprintUrl + '</a>' +
			'<p style="margin-top:8px;font-size:12px;color:#757575;">Click to open in Playground, or copy the URL to use with any Playground-compatible setup.</p>';
		infoEl.classList.add('active');
		btn.textContent = 'Close';
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
