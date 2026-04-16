(function() {
	'use strict';

	const container = document.getElementById('apps-container');
	const editBtn = document.querySelector('.edit-btn');
	const doneBtn = document.querySelector('.done-btn');
	const contextMenu = document.getElementById('context-menu');
	const addAppModal = document.getElementById('add-app-modal');
	const addAppForm = document.getElementById('add-app-form');
	const bgPicker = document.getElementById('bg-picker');
	const bgBtn = document.querySelector('.bg-btn');
	const hiddenPopup = document.getElementById('hidden-popup');
	const hiddenBtn = document.querySelector('.hidden-btn');
	const hiddenAppsList = document.getElementById('hidden-apps-list');
	const body = document.body;
	const adminMenuTree = document.getElementById('admin-menu-tree');
	const adminMenuSearch = document.getElementById('admin-menu-search');

	const addDropdown = document.getElementById('add-dropdown');
	const installSoftwareModal = document.getElementById('install-software-modal');
	const appStoreContent = document.getElementById('app-store-content');

	let isEditMode = false;
	let adminMenuData = null;
	let appStoreData = null;
	let sortable = null;
	let longPressTimer = null;
	let contextTarget = null;
	const LONG_PRESS_DURATION = 500;
	const APPS_INDEX_URL = 'https://raw.githubusercontent.com/WordPress/blueprints/trunk/apps.json';
	const APPS_BASE_URL = 'https://raw.githubusercontent.com/WordPress/blueprints/trunk/';
	const isPlayground = !!(typeof myAppsConfig !== 'undefined' && myAppsConfig.isPlayground);

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
		return APPS_BASE_URL + path;
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
		bindModalTabEvents();
		checkDeepLink();
	}

	function bindModalTabEvents() {
		document.querySelectorAll('.modal-tab').forEach(function(tab) {
			tab.addEventListener('click', function() {
				var tabName = tab.dataset.tab;

				document.querySelectorAll('.modal-tab').forEach(function(t) {
					t.classList.remove('active');
				});
				tab.classList.add('active');

				document.querySelectorAll('.modal-tab-content').forEach(function(content) {
					content.classList.add('hidden');
				});
				document.getElementById('tab-' + tabName).classList.remove('hidden');

				if (tabName === 'admin-menu' && !adminMenuData) {
					loadAdminMenu();
				}
			});
		});

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
			// Don't toggle dropdown if clicking inside it
			if (e.target.closest('.add-dropdown')) return;
			e.stopPropagation();
			addDropdown.classList.toggle('active');
		});

		addDropdown.addEventListener('click', function(e) {
			var item = e.target.closest('.add-dropdown-item');
			if (!item) return;
			e.stopPropagation();
			addDropdown.classList.remove('active');
			var action = item.dataset.action;
			if (action === 'add-link') {
				openAddModal();
			} else if (action === 'install-software') {
				openInstallSoftwareModal();
			}
		});

		document.addEventListener('click', function(e) {
			if (!e.target.closest('.add-app-btn')) {
				addDropdown.classList.remove('active');
			}
		});

		addAppModal.querySelector('.modal-close').addEventListener('click', closeAddModal);
		addAppModal.querySelector('.btn-cancel').addEventListener('click', closeAddModal);
		addAppModal.addEventListener('click', function(e) {
			if (e.target === addAppModal) closeAddModal();
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
					// If on a detail page, go back to list first
					var url = new URL(window.location);
					if (url.searchParams.has('app')) {
						closeAppDetail();
						return;
					}
					closeInstallSoftwareModal();
				} else if (addAppModal.classList.contains('active')) {
					closeAddModal();
				} else if (addDropdown.classList.contains('active')) {
					addDropdown.classList.remove('active');
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
		});

		// Hidden apps popup
		hiddenBtn.addEventListener('click', toggleHiddenPopup);
		hiddenAppsList.addEventListener('click', handleRestoreApp);

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

	function handleRestoreApp(e) {
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

				item.remove();

				updateHiddenCount();

				if (hiddenAppsList.querySelectorAll('.hidden-app-item').length === 0) {
					var noApps = document.createElement('div');
					noApps.className = 'no-hidden-apps';
					noApps.textContent = 'No hidden apps';
					hiddenAppsList.appendChild(noApps);
				}
			}
		});
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

		if (img) {
			iconHtml = '<img src="' + img.src + '" alt="">';
		} else if (dashicon) {
			iconHtml = '<span class="' + dashicon.className + '"></span>';
		} else if (emoji) {
			iconHtml = '<span class="emoji">' + emoji.textContent + '</span>';
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

		var item = document.createElement('button');
		item.type = 'button';
		item.className = 'hidden-app-item';
		item.dataset.slug = slug;

		item.innerHTML = '<span class="hidden-app-icon">' + iconHtml + '</span>' +
			'<span class="hidden-app-name">' + name + '</span>' +
			'<span class="restore-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg></span>';

		hiddenAppsList.appendChild(item);
		updateHiddenCount();
	}

	function handleAppClick(e) {
		if (!isEditMode) return;

		var link = e.target.closest('.app-link');
		if (link) {
			e.preventDefault();
		}
	}

	function openAddModal() {
		addAppModal.classList.add('active');
		document.body.style.overflow = 'hidden';

		// Reset to Admin Menu tab
		document.querySelectorAll('.modal-tab').forEach(function(t) {
			t.classList.remove('active');
		});
		document.querySelector('.modal-tab[data-tab="admin-menu"]').classList.add('active');
		document.querySelectorAll('.modal-tab-content').forEach(function(c) {
			c.classList.add('hidden');
		});
		document.getElementById('tab-admin-menu').classList.remove('hidden');

		// Load admin menu if not loaded
		if (!adminMenuData) {
			loadAdminMenu();
		}

		// Reset search
		if (adminMenuSearch) {
			adminMenuSearch.value = '';
			if (adminMenuData) {
				renderAdminMenuTree(adminMenuData);
			}
		}

		// Reset custom form
		addAppForm.reset();

		// Reset icon tabs to emoji
		document.querySelectorAll('.icon-tab').forEach(function(t) {
			t.classList.remove('active');
		});
		document.querySelector('.icon-tab[data-type="emoji"]').classList.add('active');
		document.querySelectorAll('.icon-input').forEach(function(i) {
			i.classList.remove('active');
		});
		document.querySelector('.dashicon-picker-container').classList.remove('active');
		document.querySelector('.emoji-picker-container').classList.add('active');

		// Reset emoji picker
		document.getElementById('app-emoji').value = '';
		document.getElementById('emoji-search').value = '';
		document.querySelectorAll('.emoji-option.selected').forEach(function(btn) {
			btn.classList.remove('selected');
		});

		// Reset dashicon picker
		document.getElementById('app-dashicon').value = '';
		document.getElementById('dashicon-search').value = '';
		document.querySelectorAll('.dashicon-option.selected').forEach(function(btn) {
			btn.classList.remove('selected');
		});

		updateIconPreview();
	}

	function closeAddModal() {
		addAppModal.classList.remove('active');
		document.body.style.overflow = '';
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
				var newApp = createAppElement(data.data);
				var addBtn = document.querySelector('.add-app-btn');
				container.insertBefore(newApp, addBtn);
				closeAddModal();
			} else {
				alert(data.data || 'Error adding app');
			}
		})
		.catch(function() {
			alert('Network error');
		});
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
	var activeCategory = 'all';

	function openInstallSoftwareModal() {
		installSoftwareModal.classList.add('active');
		document.body.style.overflow = 'hidden';
		if (!appStoreData) {
			loadAppStore();
		}
	}

	function closeInstallSoftwareModal() {
		installSoftwareModal.classList.remove('active');
		document.body.style.overflow = '';

		// Clean up ?app= param when closing the whole modal
		var url = new URL(window.location);
		if (url.searchParams.has('app')) {
			url.searchParams.delete('app');
			history.replaceState({}, '', url.toString());
		}

		// Reset to list view for next open
		var sidebar = document.getElementById('app-store-sidebar');
		sidebar.classList.remove('app-store-sidebar-hidden');
		if (appStoreHeading) {
			appStoreHeading.textContent = activeCategory === 'all' ? 'Discover' : activeCategory;
		}
		if (appStoreData) {
			renderAppStore(appStoreData, activeCategory, '');
		}
		if (appStoreSearchInput) {
			appStoreSearchInput.value = '';
		}
	}

	function loadAppStore() {
		appStoreContent.innerHTML = '<div class="app-store-loading">Loading apps\u2026</div>';

		fetch(APPS_INDEX_URL)
			.then(function(res) { return res.json(); })
			.then(function(data) {
				appStoreData = mergeCustomBlueprints(data);
				buildAppStoreNav(appStoreData);
				renderAppStore(appStoreData);
				bindAppStoreEvents();
			})
			.catch(function() {
				appStoreContent.innerHTML = '<div class="app-store-error">Unable to load apps. Check your connection.</div>';
			});
	}

	function buildAppStoreNav(data) {
		var categories = new Set();
		Object.keys(data).forEach(function(path) {
			var cats = data[path].categories || [];
			cats.forEach(function(c) { categories.add(c); });
		});

		// Keep "Discover" (all), then add each category
		appStoreNav.innerHTML = '';
		var discoverLi = document.createElement('li');
		discoverLi.className = 'app-store-nav-item active';
		discoverLi.dataset.category = 'all';
		discoverLi.textContent = 'Discover';
		appStoreNav.appendChild(discoverLi);

		categories.forEach(function(cat) {
			var li = document.createElement('li');
			li.className = 'app-store-nav-item';
			li.dataset.category = cat;
			li.textContent = cat;
			appStoreNav.appendChild(li);
		});
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

		if (matchedPath) {
			if (!confirm('An app named "' + title + '" already exists. Override it with your pasted blueprint?')) {
				return;
			}
			delete appStoreData[matchedPath];
		}

		// Use the original path as key for overrides, generate new key for custom apps
		var customPath = overridesPath || ('custom/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json');

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

			appStoreNav.querySelectorAll('.app-store-nav-item').forEach(function(el) {
				el.classList.remove('active');
			});
			item.classList.add('active');

			activeCategory = item.dataset.category;
			appStoreHeading.textContent = activeCategory === 'all' ? 'Discover' : activeCategory;
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
		appStoreHeading.textContent = cat;

		// Update sidebar selection
		appStoreNav.querySelectorAll('.app-store-nav-item').forEach(function(el) {
			el.classList.toggle('active', el.dataset.category === cat);
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

		var listEl = document.createElement('div');
		listEl.className = 'app-store-list';

		var wpIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5zM4.146 12L7.09 19.6a8.476 8.476 0 01-2.944-7.6zm14.023 3.533L14.89 6.178c.563-.03 1.07-.088 1.07-.088.502-.06.443-.797-.06-.769 0 0-1.51.119-2.485.119-.918 0-2.458-.119-2.458-.119-.503-.028-.563.739-.06.769 0 0 .478.058.982.088l1.46 4-2.048 6.14L7.96 6.178c.564-.03 1.07-.088 1.07-.088.503-.06.443-.797-.06-.769 0 0-1.508.119-2.484.119-.175 0-.38-.005-.596-.013A8.467 8.467 0 0112 3.5c3.161 0 5.946 1.725 7.426 4.286-.048-.003-.094-.01-.144-.01-1.243 0-2.125.91-2.125 1.893 0 .878.507 1.622 1.048 2.502.406.706.88 1.612.88 2.92 0 .907-.348 1.958-.81 3.422l-1.106 3.52zm-6.187 1.085L15.5 7.653l1.666 4.573c.16.454.282.826.282 1.274 0 1.072-.28 1.818-.6 2.832l-.877 2.765a8.473 8.473 0 01-4.002 1.559z"/></svg>';

		var hasResults = false;

		Object.keys(data).forEach(function(path) {
			var app = data[path];

			// Category filter
			if (category !== 'all') {
				var cats = app.categories || [];
				if (cats.indexOf(category) === -1) return;
			}

			// Search filter
			if (search) {
				var haystack = (app.title + ' ' + app.description + ' ' + (app.author || '')).toLowerCase();
				if (haystack.indexOf(search) === -1) return;
			}

			hasResults = true;
			var blueprintUrl = getBlueprintUrl(path);

			var itemEl = document.createElement('div');
			itemEl.className = 'app-store-item';

			var iconEl = document.createElement('div');
			iconEl.className = 'app-store-icon';
			iconEl.innerHTML = wpIconSvg;

			// Pick gradient based on most specific category
			var cats = app.categories || [];
			var gradient = defaultGradient;
			for (var i = cats.length - 1; i >= 0; i--) {
				if (categoryGradients[cats[i]]) {
					gradient = categoryGradients[cats[i]];
					break;
				}
			}
			iconEl.style.background = gradient;

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
				modBadge.textContent = app._overrides ? 'Modified' : 'Custom';
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

			if (isPlayground) {
				var installBtn = document.createElement('button');
				installBtn.type = 'button';
				installBtn.className = 'app-store-install-btn';
				installBtn.textContent = 'Install';
				installBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					window.parent.postMessage({
						type: 'relay',
						relayType: 'install-blueprint',
						blueprintUrl: blueprintUrl
					}, '*');
				});
				actionsEl.appendChild(installBtn);
			}

			itemEl.appendChild(iconEl);
			itemEl.appendChild(infoEl);
			itemEl.appendChild(actionsEl);

			// Click title or icon to open detail page
			titleEl.classList.add('app-store-title-link');
			iconEl.classList.add('app-store-icon-link');
			titleEl.addEventListener('click', function(e) {
				e.stopPropagation();
				openAppDetail(path, app, blueprintUrl, gradient);
			});
			iconEl.addEventListener('click', function(e) {
				e.stopPropagation();
				openAppDetail(path, app, blueprintUrl, gradient);
			});

			listEl.appendChild(itemEl);
		});

		appStoreContent.innerHTML = '';
		if (hasResults) {
			appStoreContent.appendChild(listEl);
		} else {
			var emptyEl = document.createElement('div');
			emptyEl.className = 'app-store-error';
			emptyEl.textContent = 'No apps found.';
			appStoreContent.appendChild(emptyEl);
		}
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

		// Restore heading
		appStoreHeading.textContent = activeCategory === 'all' ? 'Discover' : activeCategory;

		// Show sidebar
		var sidebar = document.getElementById('app-store-sidebar');
		sidebar.classList.remove('app-store-sidebar-hidden');
	}

	function renderAppDetail(appPath, app, blueprintUrl, gradient) {
		var wpIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5zM4.146 12L7.09 19.6a8.476 8.476 0 01-2.944-7.6zm14.023 3.533L14.89 6.178c.563-.03 1.07-.088 1.07-.088.502-.06.443-.797-.06-.769 0 0-1.51.119-2.485.119-.918 0-2.458-.119-2.458-.119-.503-.028-.563.739-.06.769 0 0 .478.058.982.088l1.46 4-2.048 6.14L7.96 6.178c.564-.03 1.07-.088 1.07-.088.503-.06.443-.797-.06-.769 0 0-1.508.119-2.484.119-.175 0-.38-.005-.596-.013A8.467 8.467 0 0112 3.5c3.161 0 5.946 1.725 7.426 4.286-.048-.003-.094-.01-.144-.01-1.243 0-2.125.91-2.125 1.893 0 .878.507 1.622 1.048 2.502.406.706.88 1.612.88 2.92 0 .907-.348 1.958-.81 3.422l-1.106 3.52zm-6.187 1.085L15.5 7.653l1.666 4.573c.16.454.282.826.282 1.274 0 1.072-.28 1.818-.6 2.832l-.877 2.765a8.473 8.473 0 01-4.002 1.559z"/></svg>';

		// Hide sidebar — detail page is full-width in the main area
		var sidebar = document.getElementById('app-store-sidebar');
		sidebar.classList.add('app-store-sidebar-hidden');

		// Update heading to back button + share
		appStoreHeading.innerHTML = '';

		var backBtn = document.createElement('button');
		backBtn.type = 'button';
		backBtn.className = 'app-detail-back';
		backBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
		backBtn.addEventListener('click', closeAppDetail);

		var headingText = document.createElement('span');
		headingText.textContent = activeCategory === 'all' ? 'Discover' : activeCategory;

		appStoreHeading.appendChild(backBtn);
		appStoreHeading.appendChild(headingText);

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

		if (app._custom) {
			var restoreBtn = document.createElement('button');
			restoreBtn.type = 'button';
			restoreBtn.className = 'app-detail-restore-btn';
			restoreBtn.textContent = app._overrides ? 'Restore Original' : 'Remove';
			restoreBtn.addEventListener('click', function() {
				deleteCustomBlueprint(appPath);
				// Re-fetch and rebuild store data
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
			headerActions.appendChild(restoreBtn);
		}

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
		} else {
			// Back to list
			if (appStoreData) {
				var sidebar = document.getElementById('app-store-sidebar');
				sidebar.classList.remove('app-store-sidebar-hidden');
				appStoreHeading.textContent = activeCategory === 'all' ? 'Discover' : activeCategory;
				renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
			}
		}
	});

	// On initial load, check if ?app= is present to deep-link into a detail page
	function checkDeepLink() {
		var url = new URL(window.location);
		var appParam = url.searchParams.get('app');
		if (appParam) {
			openInstallSoftwareModal();
			// Wait for data to load, then open detail
			var checkInterval = setInterval(function() {
				if (appStoreData) {
					clearInterval(checkInterval);
					if (appStoreData[appParam]) {
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
					}
				}
			}, 100);
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
