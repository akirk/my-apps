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

	let isEditMode = false;
	let sortable = null;
	let longPressTimer = null;
	let contextTarget = null;
	const LONG_PRESS_DURATION = 500;

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

		document.querySelector('.add-app-btn').addEventListener('click', openAddModal);

		addAppModal.querySelector('.modal-close').addEventListener('click', closeAddModal);
		addAppModal.querySelector('.btn-cancel').addEventListener('click', closeAddModal);
		addAppModal.addEventListener('click', function(e) {
			if (e.target === addAppModal) closeAddModal();
		});
		addAppForm.addEventListener('submit', handleAddApp);

		document.querySelectorAll('.icon-tab').forEach(function(tab) {
			tab.addEventListener('click', handleIconTabSwitch);
		});

		document.querySelectorAll('.icon-input').forEach(function(input) {
			input.addEventListener('input', updateIconPreview);
		});

		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') {
				if (addAppModal.classList.contains('active')) {
					closeAddModal();
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
		addAppForm.reset();
		document.getElementById('app-name').focus();

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

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
