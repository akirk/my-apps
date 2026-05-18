(function() {
	'use strict';

	const container = document.getElementById('apps-container');
	const editBtn = document.querySelector('.edit-btn');
	const doneBtn = document.querySelector('.done-btn');
	const contextMenu = document.getElementById('context-menu');
	const addAppForm = document.getElementById('add-app-form');
	const iconEditModal = document.getElementById('icon-edit-modal');
	const iconEditForm = document.getElementById('icon-edit-form');
	const bgPicker = document.getElementById('bg-picker');
	const bgBtn = document.querySelector('.bg-btn');
	const bgMediaBtn = document.getElementById('bg-media-btn');
	const bgUrlToggle = document.getElementById('bg-url-toggle');
	const bgUrlForm = document.getElementById('bg-url-form');
	const bgUrlInput = document.getElementById('bg-url-input');
	const bgImagePreview = document.getElementById('bg-image-preview');
	const bgCustomCssSection = document.getElementById('bg-custom-css-section');
	const bgCustomCssOption = document.getElementById('bg-custom-css-option');
	const bgCustomCssPreview = document.getElementById('bg-custom-css-preview');
	const settingsBtn = document.querySelector('.settings-btn');
	const settingsDropdown = document.getElementById('settings-dropdown');
	const hiddenPopup = document.getElementById('hidden-popup');
	const hiddenBtn = document.querySelector('.hidden-btn');
	const hiddenAppsList = document.getElementById('hidden-apps-list');
	const wallpaperHint = document.getElementById('wallpaper-hint');
	const wallpaperHintText = document.getElementById('wallpaper-hint-text');
	const wallpaperHintButton = document.getElementById('wallpaper-hint-button');
	const wallpaperHintClose = document.getElementById('wallpaper-hint-close');
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
	let bgMediaFrame = null;
	let contextTarget = null;
	let iconEditTarget = null;
	let isWallpaperHintBound = false;
	let isWallpaperHintCloseBound = false;
	// Tracks a deep-link target picked up by checkDeepLink so loadAppStore
	// can render the detail page directly instead of flashing the grid first.
	let pendingDeepLink = null;
	let deepLinkRendered = false;
	// Single base for the blueprints repo we read apps, recipes and the
	// curated plugin list from.
	const DEFAULT_BLUEPRINTS_BASE_URL = 'https://raw.githubusercontent.com/WordPress/blueprints/trunk/';
	const WORDPRESS_BLUEPRINTS_PR_BASE_URL = 'https://raw.githubusercontent.com/WordPress/blueprints/refs/pull/%s/head/';
	const BLUEPRINTS_SOURCE_STORAGE_KEY = 'my_apps_blueprints_source';
	let BLUEPRINTS_BASE_URL = '';
	let APPS_INDEX_URL = '';
	let RECIPES_URL = '';
	let PLUGINS_URL = '';
	const WP_ORG_PLUGIN_INFO_URL = 'https://api.wordpress.org/plugins/info/1.2/';
	const isPlayground = !!(typeof myAppsConfig !== 'undefined' && myAppsConfig.isPlayground);
	const PLAYGROUND_INSTALL_RESULT_TIMEOUT = 180000;
	const WALLPAPER_HINT_DISMISSED_KEY = 'wallpaperHintDismissed';
	const WALLPAPER_HINT_ELIGIBLE_KEY = 'wallpaperHintEligible';
	const WALLPAPER_SHUFFLE_BAG_KEY = 'wallpaperShuffleBag';

	refreshBlueprintsSourceUrls();

	// Walk up the parent chain until we reach a cross-origin frame.
	// In the normal case window.parent is already cross-origin (Playground).
	// When running inside a Desktop Mode native window, window.parent is a
	// same-origin intermediate frame, so we need to go one level higher.
	function getPlaygroundTarget() {
		var w = window.parent;
		try {
			while (w.parent !== w) {
				void w.document; // throws if cross-origin — that's our target
				w = w.parent;
			}
		} catch (e) {
			// w is the first cross-origin ancestor: Playground
		}
		return w;
	}

	function getDesktopModeShell() {
		try {
			if (
				window.parent &&
				window.parent !== window &&
				window.parent.wp &&
				window.parent.wp.desktop
			) {
				return window.parent;
			}
		} catch (e) {
			// The parent is cross-origin, so this is not a Desktop Mode shell.
		}
		return null;
	}

	function isDesktopModeEmbedded() {
		return !!getDesktopModeShell();
	}

	function getBlueprintsBaseUrl() {
		var source = getStoredBlueprintsSource();
		if (source) {
			return source.baseUrl;
		}
		return DEFAULT_BLUEPRINTS_BASE_URL;
	}

	function refreshBlueprintsSourceUrls() {
		BLUEPRINTS_BASE_URL = getBlueprintsBaseUrl();
		APPS_INDEX_URL = BLUEPRINTS_BASE_URL + 'apps.json';
		RECIPES_URL = BLUEPRINTS_BASE_URL + 'blueprints/my-wordpress/recipes.json';
		PLUGINS_URL = BLUEPRINTS_BASE_URL + 'blueprints/my-wordpress/plugins.json';
	}

	function rawGithubBaseUrl(owner, repo, ref) {
		return 'https://raw.githubusercontent.com/' + owner + '/' + repo + '/' + ref.replace(/^\/+|\/+$/g, '') + '/';
	}

	function blueprintsPullRequestSource(input, pr) {
		return {
			input: input,
			baseUrl: WORDPRESS_BLUEPRINTS_PR_BASE_URL.replace('%s', pr),
			label: 'PR #' + pr
		};
	}

	function githubBranchSource(input, owner, repo, refPath) {
		var ref = stripKnownBlueprintsPath(refPath);
		return {
			input: input,
			baseUrl: rawGithubBaseUrl(owner, repo, ref),
			label: owner + '/' + repo + ' @ ' + ref
		};
	}

	function stripKnownBlueprintsPath(refPath) {
		var path = refPath.replace(/^\/+|\/+$/g, '');
		var suffixes = [
			'/apps.json',
			'/blueprints/my-wordpress/recipes.json',
			'/blueprints/my-wordpress/plugins.json',
			'/blueprints/my-wordpress'
		];

		for (var i = 0; i < suffixes.length; i++) {
			if (path.slice(-suffixes[i].length) === suffixes[i]) {
				return path.slice(0, -suffixes[i].length);
			}
		}
		return path;
	}

	function normalizeBlueprintsSourceInput(value) {
		value = (value || '').trim();
		if (!value) return '';
		if (/^\d+$/.test(value)) {
			return blueprintsPullRequestSource(value, value);
		}

		var match = value.match(/^https:\/\/github\.com\/WordPress\/blueprints\/pull\/(\d+)(?:[\/?#].*)?$/i);
		if (match) {
			return blueprintsPullRequestSource(value, match[1]);
		}

		match = value.match(/^https:\/\/github\.com\/([^\/?#]+)\/([^\/?#]+)\/tree\/([^?#]+)(?:[?#].*)?$/i);
		if (match) {
			return githubBranchSource(value, match[1], match[2], match[3]);
		}

		match = value.match(/^https:\/\/github\.com\/([^\/?#]+)\/([^\/?#]+)\/blob\/([^?#]+)(?:[?#].*)?$/i);
		if (match) {
			return githubBranchSource(value, match[1], match[2], match[3]);
		}

		match = value.match(/^https:\/\/raw\.githubusercontent\.com\/([^\/?#]+)\/([^\/?#]+)\/([^?#]+)(?:[?#].*)?$/i);
		if (match) {
			return githubBranchSource(value, match[1], match[2], match[3]);
		}

		return null;
	}

	function getStoredBlueprintsSourceInput() {
		try {
			return localStorage.getItem(BLUEPRINTS_SOURCE_STORAGE_KEY) || '';
		} catch (e) {
			return '';
		}
	}

	function getStoredBlueprintsSource() {
		var value = getStoredBlueprintsSourceInput();
		var source = normalizeBlueprintsSourceInput(value);
		return source && source.baseUrl ? source : null;
	}

	function setStoredBlueprintsSource(source) {
		try {
			if (source && source.input) {
				localStorage.setItem(BLUEPRINTS_SOURCE_STORAGE_KEY, source.input);
			} else {
				localStorage.removeItem(BLUEPRINTS_SOURCE_STORAGE_KEY);
			}
			return true;
		} catch (e) {
			showToast('Unable to save catalog source in this browser');
			return false;
		}
	}

	function resetBlueprintsSourceCatalogState() {
		appStoreData = null;
		recipes = {};
		hasRecipes = false;
		recipesLoadState = 'idle';
		activeRecipe = null;
		pendingRecipe = null;
		pendingDeepLink = null;
		deepLinkRendered = false;
	}

	function applyBlueprintsSource(source) {
		if (!setStoredBlueprintsSource(source)) {
			return false;
		}
		refreshBlueprintsSourceUrls();
		resetBlueprintsSourceCatalogState();
		if (typeof appStoreSearchInput !== 'undefined' && appStoreSearchInput) {
			appStoreSearchInput.value = '';
		}
		updateBlueprintsSourceBadge();
		if (installSoftwareModal.classList.contains('active')) {
			loadAppStore();
		}
		showToast(source ? 'Using custom blueprints source' : 'Using default catalog');
		return true;
	}

	function importBlueprintsSourceText(text) {
		var source = normalizeBlueprintsSourceInput(text);
		if (!source || !source.baseUrl) {
			return false;
		}
		applyBlueprintsSource(source);
		return true;
	}

	function isAppStoreEmbeddedView() {
		if (
			body &&
			body.classList &&
			body.classList.contains('my-apps-app-store-embedded')
		) {
			return true;
		}
		return /(?:^\?|&)app-store(?:=|&|$)/.test(window.location.search);
	}

	function shouldUseDesktopModeAppStoreInstallFlow() {
		return isDesktopModeEmbedded() && isAppStoreEmbeddedView();
	}

	function refreshDesktopModeShell() {
		var shell = getDesktopModeShell();
		if (
			!shell ||
			!shell.wp ||
			!shell.wp.desktop ||
			typeof shell.wp.desktop.refreshMenu !== 'function'
		) {
			return Promise.resolve();
		}
		try {
			return Promise.resolve(shell.wp.desktop.refreshMenu()).catch(function() {});
		} catch (e) {
			return Promise.resolve();
		}
	}

	function getPostMessageTargetOrigin(target) {
		try {
			return target.location.origin || window.location.origin;
		} catch (e) {
			return '*';
		}
	}

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

	// Derive a folder name from a git:directory resource. Prefer the
	// subdirectory's basename when `path` is set, otherwise the repo name
	// from the URL (with any `.git` suffix stripped).
	function deriveTargetFolderName(resource) {
		if (!resource || resource.resource !== 'git:directory' || !resource.url) return '';
		if (resource.path) {
			var parts = String(resource.path).split('/').filter(Boolean);
			if (parts.length) return parts[parts.length - 1];
		}
		var m = String(resource.url).match(/^https?:\/\/[^\/]+\/[^\/]+\/([^\/?#]+?)(?:\.git)?(?:[\/?#]|$)/);
		return m ? m[1] : '';
	}

	// Retrofit options.targetFolderName onto installPlugin/installTheme
	// steps that pull from git:directory but don't already specify a
	// folder name. Without it Playground writes the repo to a generated
	// path and `activate` can't find the plugin. Mutates the blueprint.
	function retrofitGitTargetFolderName(blueprint) {
		if (!blueprint || !Array.isArray(blueprint.steps)) return blueprint;
		blueprint.steps.forEach(function(step) {
			if (!step) return;
			var data = step.step === 'installPlugin' ? step.pluginData
				: step.step === 'installTheme' ? step.themeData
				: null;
			if (!data || data.resource !== 'git:directory') return;
			step.options = step.options || {};
			if (step.options.targetFolderName) return;
			var folder = deriveTargetFolderName(data);
			if (folder) step.options.targetFolderName = folder;
		});
		return blueprint;
	}

	function saveCustomBlueprint(path, meta, blueprint, overrides) {
		var custom = getCustomBlueprints();
		custom[path] = { meta: meta, blueprint: retrofitGitTargetFolderName(blueprint), overrides: overrides || null };
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

	function normalizeAppUrl(url) {
		if (!url) return '';
		var link = document.createElement('a');
		link.href = url;
		return link.href.replace(/\/$/, '');
	}

	function knownAppUrlExists(url) {
		var normalized = normalizeAppUrl(url);
		if (!normalized) return false;

		var configuredUrls = Array.isArray(myAppsConfig.appUrls) ? myAppsConfig.appUrls : [];
		for (var i = 0; i < configuredUrls.length; i++) {
			if (normalizeAppUrl(configuredUrls[i]) === normalized) {
				return true;
			}
		}

		return Array.prototype.some.call(document.querySelectorAll('.app-icon[data-url]'), function(el) {
			return normalizeAppUrl(el.dataset.url) === normalized;
		});
	}

	function rememberAppUrl(url) {
		if (!url) return;
		myAppsConfig.appUrls = Array.isArray(myAppsConfig.appUrls) ? myAppsConfig.appUrls : [];
		if (!knownAppUrlExists(url)) {
			myAppsConfig.appUrls.push(normalizeAppUrl(url));
		}
	}

	function getPluginInstallUrl() {
		if (typeof myAppsConfig === 'undefined') return '/wp-admin/plugin-install.php';
		return myAppsConfig.pluginInstallUrl
			? myAppsConfig.pluginInstallUrl
			: myAppsConfig.ajaxUrl.replace('admin-ajax.php', 'plugin-install.php');
	}

	function setInstallButtonState(btn, label, disabled) {
		if (!btn) return;
		btn.textContent = label;
		btn.disabled = !!disabled;
		btn.classList.toggle('is-busy', !!disabled && ['Installed', 'Updated', 'Up to date'].indexOf(label) === -1);
	}

	function resetInstallButtonState(btn) {
		setInstallButtonState(btn, (btn && btn.dataset.defaultLabel) || 'Install', false);
	}

	function absoluteLauncherUrl(url) {
		if (!url) return '';
		return url.indexOf('http') === 0 ? url : window.location.origin + url;
	}

	function getEntryLauncherUrl(app, blueprint) {
		if (blueprint && blueprint.launcher_url) return blueprint.launcher_url;
		if (!app) return '';
		return app._launcherUrl || app.launcher_url || '';
	}

	function isLauncherUrlInstalled(url) {
		return !!url && knownAppUrlExists(absoluteLauncherUrl(url));
	}

	function getInstalledPluginStatus(app) {
		var installed = myAppsConfig.installedPlugins || {};
		if (!app) return null;
		if (app._source === 'wp.org' && app._slug) {
			return installed[app._slug] || null;
		}
		if (app._path) {
			var appMatch = String(app._path).match(/^apps\/([^\/]+)\.json$/);
			if (appMatch && installed[appMatch[1]]) {
				return installed[appMatch[1]];
			}
		}
		return null;
	}

	function rememberInstalledPlugin(slug, result) {
		if (!slug) return;
		myAppsConfig.installedPlugins = myAppsConfig.installedPlugins || {};
		myAppsConfig.installedPlugins[slug] = {
			plugin: result.plugin || '',
			name: result.pluginName || slug,
			version: result.version || '',
			active: !!(result.activated || result.alreadyActive),
			updateAvailable: !!result.updateAvailable
		};
	}

	function isStoreEntryInstalled(app, blueprint) {
		if (getInstalledPluginStatus(app)) return true;
		return isLauncherUrlInstalled(getEntryLauncherUrl(app, blueprint));
	}

	function getInstallButtonLabel(app, blueprint) {
		return isStoreEntryInstalled(app, blueprint) ? 'Update' : 'Install';
	}

	function prepareInstallButton(btn, app, blueprint) {
		if (!btn) return;
		var label = getInstallButtonLabel(app, blueprint);
		btn.dataset.defaultLabel = label;
		btn.classList.toggle('is-update', label === 'Update');
		setInstallButtonState(btn, label, false);
	}

	function canManageWpOrgPlugin(app) {
		if (!app || app._source !== 'wp.org' || !app._slug) return false;
		return !!(myAppsConfig.canInstallPlugins || (myAppsConfig.canUpdatePlugins && getInstalledPluginStatus(app)));
	}

	function ajaxErrorMessage(data, fallback) {
		if (data && data.data && data.data.errorMessage) return data.data.errorMessage;
		if (data && data.data && typeof data.data === 'string') return data.data;
		if (data && data.message) return data.message;
		return fallback || 'Install failed';
	}

	function describeErrorValue(value) {
		if (!value) return '';
		if (typeof value === 'string') return value.trim();
		if (typeof value === 'number' || typeof value === 'boolean') return String(value);
		if (Array.isArray(value)) {
			return value.map(describeErrorValue).filter(Boolean).join('; ');
		}
		if (typeof value === 'object') {
			var parts = [];
			['name', 'code', 'message', 'error', 'errorMessage', 'details', 'detail', 'reason'].forEach(function(key) {
				if (value[key]) {
					parts.push(describeErrorValue(value[key]));
				}
			});
			parts = parts.filter(Boolean);
			if (parts.length) {
				return parts.join(': ');
			}
			try {
				return JSON.stringify(value);
			} catch (e) {
				return String(value);
			}
		}
		return String(value);
	}

	function playgroundInstallErrorMessage(data) {
		var details = [
			data && data.error,
			data && data.message,
			data && data.errorMessage,
			data && data.details,
			data && data.detail,
			data && data.reason,
			data && data.data
		].map(describeErrorValue).filter(Boolean).join(' ');

		if (!details) {
			return 'Install failed: Playground did not return an error message.';
		}
		return /^install failed/i.test(details) ? details : 'Install failed: ' + details;
	}

	// ── Auto-add icon for blueprint/plugin installs ──
	// Opt-in: only fires when the blueprint declares `launcher_url` (the
	// page the launcher icon should open). `landingPage` alone is no
	// longer enough — it's a Playground concept (where to navigate after
	// install) and not always a page the user wants pinned.
	function addAppFromBlueprint(app, blueprint, gradient) {
		var launcherUrl = blueprint && blueprint.launcher_url;
		if (!launcherUrl) return Promise.resolve(false);
		app._launcherUrl = launcherUrl;

		var appUrl = launcherUrl.indexOf('http') === 0
			? launcherUrl
			: window.location.origin + launcherUrl;

		if (knownAppUrlExists(appUrl)) {
			return Promise.resolve(false);
		}

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
			.then(function(data) {
				if (data && data.success) {
					rememberAppUrl(appUrl);
					return !(data.data && data.data.duplicate);
				}
				return false;
			})
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
			.then(function(blueprint) {
				if (blueprint && blueprint.launcher_url) {
					app._launcherUrl = blueprint.launcher_url;
				}
				return addAppFromBlueprint(app, blueprint, gradient);
			})
			.catch(function() { return false; });
	}

	function encodeBlueprintDataUrl(blueprint) {
		return 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(blueprint))));
	}

	function cloneBlueprintWithoutLandingPage(blueprint) {
		var clone = JSON.parse(JSON.stringify(blueprint || {}));
		delete clone.landingPage;
		return clone;
	}

	function toAbsoluteUrl(url) {
		if (!url) return '';
		try {
			return new URL(url, window.location.origin).toString();
		} catch (e) {
			return '';
		}
	}

	function getBlueprintLandingUrl(blueprint) {
		if (!blueprint || typeof blueprint.landingPage !== 'string' || !blueprint.landingPage.trim()) {
			return '';
		}
		return toAbsoluteUrl(blueprint.landingPage);
	}

	function getAppLandingUrl(app) {
		if (!app || typeof app._landingPage !== 'string' || !app._landingPage.trim()) {
			return '';
		}
		return toAbsoluteUrl(app._landingPage);
	}

	function getInstallLandingUrl(app, blueprint) {
		return getBlueprintLandingUrl(blueprint) || getAppLandingUrl(app);
	}

	function getInstallOpenUrl(install) {
		if (!install) return '';
		var openUrl = install.landingUrl || getInstallLandingUrl(install.app, install.blueprint);
		if (!openUrl) {
			openUrl = getEntryLauncherUrl(install.app, install.blueprint);
		}
		return toAbsoluteUrl(openUrl);
	}

	function replaceInstallButtonWithOpenLink(btn, install) {
		var openUrl = getInstallOpenUrl(install);
		if (!btn || !btn.parentNode || !openUrl) return false;

		var link = document.createElement('a');
		link.href = openUrl;
		link.className = btn.className;
		link.classList.remove('is-busy', 'is-update');
		link.classList.add('is-open-link');
		link.textContent = 'Open';

		if (install && install.app && install.app.title) {
			link.setAttribute('aria-label', 'Open ' + install.app.title);
		}

		if (install && install.desktopMode) {
			link.addEventListener('click', function(e) {
				if (openDesktopModeLandingPage({
					app: install.app,
					landingUrl: openUrl
				})) {
					e.preventDefault();
				}
			});
		} else {
			try {
				if ((new URL(openUrl, window.location.href)).origin !== window.location.origin) {
					link.target = '_blank';
					link.rel = 'noopener noreferrer';
				}
			} catch (e) {}
		}

		btn.replaceWith(link);
		return true;
	}

	function finishInstallButton(btn, label, install) {
		if (!replaceInstallButtonWithOpenLink(btn, install)) {
			setInstallButtonState(btn, label, true);
		}
	}

	function getDesktopModeWindowUrl(url) {
		try {
			var parsed = new URL(url, window.location.origin);
			if (parsed.origin === window.location.origin) {
				parsed.searchParams.set('desktop_mode_chromeless', '1');
			}
			return parsed.toString();
		} catch (e) {
			return '';
		}
	}

	function fallbackDesktopWindowId(url) {
		var slug = String(url || '')
			.toLowerCase()
			.replace(/^https?:\/\//, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 80);
		return 'my-apps-' + (slug || 'installed-app');
	}

	function openDesktopModeLandingPage(install) {
		var shell = getDesktopModeShell();
		var desktop = shell && shell.wp && shell.wp.desktop;
		var windowManager = desktop && desktop.windowManager;
		var windowUrl = getDesktopModeWindowUrl(install && install.landingUrl);

		if (!windowUrl || !windowManager || typeof windowManager.open !== 'function') {
			return false;
		}

		var windowId = '';
		try {
			windowId = typeof desktop.deriveWindowId === 'function' ? desktop.deriveWindowId(windowUrl) : '';
		} catch (e) {
			windowId = '';
		}

		if (!windowId) {
			windowId = fallbackDesktopWindowId(windowUrl);
		}

		try {
			windowManager.open({
				id: windowId,
				baseId: windowId,
				url: windowUrl,
				title: install.app && install.app.title ? install.app.title : 'App',
				icon: install.app && install.app._icon ? install.app._icon : 'dashicons-admin-generic',
				width: 900,
				height: 640
			});
			return true;
		} catch (e) {
			return false;
		}
	}

	function getPlaygroundBlueprintUrlForInstall(blueprint, originalBlueprintUrl) {
		if (blueprint && blueprint.landingPage) {
			// Keep Playground from navigating during install; show an Open link after success.
			return encodeBlueprintDataUrl(cloneBlueprintWithoutLandingPage(blueprint));
		}
		return originalBlueprintUrl || encodeBlueprintDataUrl(blueprint);
	}

	function postPlaygroundBlueprintInstall(blueprintUrl, requestId) {
		var target = getPlaygroundTarget();
		target.postMessage({
			type: 'relay',
			relayType: 'install-blueprint',
			blueprintUrl: blueprintUrl,
			requestId: requestId
		}, getPostMessageTargetOrigin(target));
	}

	function startPlaygroundBlueprintInstall(blueprintUrl, install) {
		var requestId = window.crypto && typeof window.crypto.randomUUID === 'function'
			? window.crypto.randomUUID()
			: 'my-apps-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
		var settled = false;
		var resultTimeout = null;

		function cleanup() {
			if (settled) return false;
			settled = true;
			window.removeEventListener('message', onMessage);
			if (resultTimeout) {
				clearTimeout(resultTimeout);
				resultTimeout = null;
			}
			return true;
		}

		function finishResult(data) {
			if (data.status === 'success') {
				handlePlaygroundInstallSuccess(install, data);
				return;
			}

			resetInstallButtonState(install.btn);
			if (data.status === 'cancelled') {
				showToast('Install cancelled');
			} else {
				showToast(playgroundInstallErrorMessage(data));
			}
		}

		function onMessage(event) {
			var data = event && event.data;
			if (
				!data ||
				data.type !== 'relay' ||
				data.relayType !== 'install-blueprint-result' ||
				data.requestId !== requestId
			) {
				return;
			}
			if (!cleanup()) return;
			finishResult(data);
		}

		window.addEventListener('message', onMessage);
		resultTimeout = setTimeout(function() {
			if (!cleanup()) return;
			resetInstallButtonState(install.btn);
			showToast('Install status unknown: Playground did not report whether the install finished.');
		}, PLAYGROUND_INSTALL_RESULT_TIMEOUT);

		try {
			postPlaygroundBlueprintInstall(blueprintUrl, requestId);
		} catch (error) {
			cleanup();
			resetInstallButtonState(install.btn);
			showToast(playgroundInstallErrorMessage({ error: error }));
			return null;
		}
		return requestId;
	}

	function installResolvedBlueprintInPlayground(app, blueprint, originalBlueprintUrl, gradient, btn) {
		var desktopMode = shouldUseDesktopModeAppStoreInstallFlow();
		var blueprintUrl = getPlaygroundBlueprintUrlForInstall(blueprint, originalBlueprintUrl);
		var optimisticAddPromise = null;

		setInstallButtonState(btn, 'Installing...', true);
		if (!desktopMode && app && blueprint) {
			optimisticAddPromise = addAppFromBlueprint(app, blueprint, gradient);
		}

		return Promise.resolve(startPlaygroundBlueprintInstall(blueprintUrl, {
			app: app || null,
			blueprint: blueprint || null,
			gradient: gradient || '',
			btn: btn || null,
			desktopMode: desktopMode,
			landingUrl: getInstallLandingUrl(app, blueprint),
			blueprintUrl: blueprintUrl,
			optimisticAddPromise: optimisticAddPromise
		}));
	}

	function installBlueprintInPlayground(app, blueprintUrl, gradient, btn) {
		setInstallButtonState(btn, 'Installing...', true);
		return resolveBlueprintFromUrl(blueprintUrl)
			.then(function(blueprint) {
				return installResolvedBlueprintInPlayground(app, blueprint, blueprintUrl, gradient, btn);
			})
			.catch(function(error) {
				var desktopMode = shouldUseDesktopModeAppStoreInstallFlow();
				if (desktopMode) {
					var message = 'Install failed: Could not load the blueprint before sending it to Playground.';
					if (error && error.message) {
						message += ' ' + error.message;
					}
					resetInstallButtonState(btn);
					showToast(message);
					return null;
				}
				return startPlaygroundBlueprintInstall(blueprintUrl, {
					app: app || null,
					blueprint: null,
					gradient: gradient || '',
					btn: btn || null,
					desktopMode: desktopMode,
					landingUrl: '',
					blueprintUrl: blueprintUrl
				});
			});
	}

	function completeInstalledBlueprint(install) {
		var addPromise = install.optimisticAddPromise
			? install.optimisticAddPromise
			: (install.app && install.blueprint
				? addAppFromBlueprint(install.app, install.blueprint, install.gradient)
				: Promise.resolve(false));

		return addPromise
			.then(function(added) {
				var shellRefresh = install.desktopMode ? refreshDesktopModeShell() : Promise.resolve();
				return shellRefresh.then(function() {
					return added;
				});
			});
	}

	function handlePlaygroundInstallSuccess(install, result) {
		return completeInstalledBlueprint(install).then(function(added) {
			var wasUpdate = install.btn && install.btn.dataset.defaultLabel === 'Update';
			finishInstallButton(install.btn, wasUpdate ? 'Updated' : 'Installed', install);
			if (wasUpdate) {
				showToast(added ? 'Updated and added to My Apps' : 'Updated');
			} else {
				showToast(added ? 'Installed and added to My Apps' : 'Installed');
			}
			bootstrapAiAssistantAfterPlaygroundInstall(install, result);
			return added;
		});
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
		updateBlueprintsSourceBadge();
		if (new URL(window.location).searchParams.has('app-store')) {
			checkDeepLink();
			return;
		}
		initSortable();
		initEmojiPicker();
		initDashiconPicker();
		initIconEditPickers();
		bindEvents();
		bindAdminMenuSearch();
		checkDeepLink();
		initGreeting();
		initWallpaperHint();
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
			greeting.innerHTML = '<span class="greeting-line">Hi, <span class="greeting-name">' + escapeHtml(displayName) + '</span>!</span>' +
				'<span class="greeting-nudge">You\'re not really called admin, are you? Click to change your name!</span>';
		} else {
			greeting.innerHTML = '<span class="greeting-line">Hi, <span class="greeting-name">' + escapeHtml(displayName) + '</span>!</span>';
		}
		function openEdit() {
			startNameEdit(greeting, displayName);
		}
		greeting.querySelectorAll('.greeting-line, .greeting-nudge').forEach(function(el) {
			el.addEventListener('click', openEdit);
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
				if (container) {
					var newApp = createAppElement(data.data);
					var addBtn = document.querySelector('.add-app-btn');
					container.insertBefore(newApp, addBtn);
				} else if (data.data && data.data.url) {
					rememberAppUrl(data.data.url);
				}

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
		if (!container) return;

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

	function initIconEditPickers() {
		if (!iconEditForm) return;
		initIconEditEmojiPicker();
		initIconEditDashiconPicker();
	}

	function initIconEditEmojiPicker() {
		var picker = document.getElementById('icon-edit-emoji-picker');
		var searchInput = document.getElementById('icon-edit-emoji-search');
		var emojiInput = document.getElementById('icon-edit-emoji');
		if (!picker || !searchInput || !emojiInput) return;

		function renderEmojis(filter) {
			while (picker.firstChild) {
				picker.removeChild(picker.firstChild);
			}

			var filterLower = (filter || '').toLowerCase();
			var currentValue = emojiInput.value;

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
					emojiInput.value = item.emoji;
					updateIconEditPreview();
				});

				picker.appendChild(btn);
			});
		}

		picker.renderEmojis = renderEmojis;
		renderEmojis('');

		searchInput.addEventListener('input', function() {
			renderEmojis(searchInput.value);
		});
	}

	function initIconEditDashiconPicker() {
		var picker = document.getElementById('icon-edit-dashicon-picker');
		var searchInput = document.getElementById('icon-edit-dashicon-search');
		var dashiconInput = document.getElementById('icon-edit-dashicon');
		if (!picker || !searchInput || !dashiconInput) return;

		function renderIcons(filter) {
			while (picker.firstChild) {
				picker.removeChild(picker.firstChild);
			}

			var filterLower = (filter || '').toLowerCase();
			var currentValue = dashiconInput.value;

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
					dashiconInput.value = 'dashicons-' + icon;
					updateIconEditPreview();
				});

				picker.appendChild(btn);
			});
		}

		picker.renderIcons = renderIcons;
		renderIcons('');

		searchInput.addEventListener('input', function() {
			renderIcons(searchInput.value);
		});
	}

	function currentIconEditType() {
		var activeTab = iconEditForm ? iconEditForm.querySelector('.icon-tab.active') : null;
		return activeTab ? activeTab.dataset.type : 'emoji';
	}

	function setIconEditType(type) {
		if (!iconEditForm) return;

		iconEditForm.querySelectorAll('.icon-tab').forEach(function(tab) {
			tab.classList.toggle('active', tab.dataset.type === type);
		});
		iconEditForm.querySelectorAll('.icon-input').forEach(function(input) {
			input.classList.remove('active');
		});
		iconEditForm.querySelector('.emoji-picker-container').classList.remove('active');
		iconEditForm.querySelector('.dashicon-picker-container').classList.remove('active');

		if (type === 'emoji') {
			iconEditForm.querySelector('.emoji-picker-container').classList.add('active');
		} else if (type === 'url') {
			document.getElementById('icon-edit-url').classList.add('active');
		} else if (type === 'dashicon') {
			iconEditForm.querySelector('.dashicon-picker-container').classList.add('active');
		}

		updateIconEditPreview();
	}

	function handleIconEditTabSwitch(e) {
		var tab = e.target.closest('.icon-tab');
		if (!tab) return;
		setIconEditType(tab.dataset.type);
	}

	function selectedDashiconClass(el) {
		if (!el || !el.classList) return '';
		for (var i = 0; i < el.classList.length; i++) {
			if (el.classList[i].indexOf('dashicons-') === 0) {
				return el.classList[i];
			}
		}
		return '';
	}

	function faviconUrlForAppUrl(url) {
		var parsed;
		try {
			parsed = new URL(url, window.location.origin);
		} catch (e) {
			return '';
		}
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return '';
		}
		return parsed.origin + '/favicon.ico';
	}

	function letterIconDataForName(name) {
		var words = String(name || '').trim().split(/\s+/).filter(Boolean);
		var letters = '?';
		var key = String(name || '').toLowerCase();
		var hash = 5381;
		var i;

		if (words.length === 1) {
			letters = words[0].charAt(0).toUpperCase();
		} else if (words.length > 1) {
			letters = (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
		}
		for (i = 0; i < key.length; i++) {
			hash = ((hash * 33) + key.charCodeAt(i)) >>> 0;
		}
		return {
			letters: letters,
			background: 'hsl(' + (hash % 360) + ', 55%, 45%)'
		};
	}

	function updateIconEditPreview() {
		var preview = document.getElementById('icon-edit-preview');
		if (!preview) return;

		var type = currentIconEditType();
		while (preview.firstChild) {
			preview.removeChild(preview.firstChild);
		}
		preview.className = 'preview-box';

		if (type === 'emoji') {
			var emoji = document.getElementById('icon-edit-emoji').value;
			if (emoji) {
				preview.textContent = emoji;
				preview.classList.add('preview-emoji');
			}
		} else if (type === 'url') {
			var iconUrl = document.getElementById('icon-edit-url').value;
			if (iconUrl) {
				var img = document.createElement('img');
				img.src = iconUrl;
				img.onerror = function() { preview.textContent = '?'; };
				preview.appendChild(img);
			}
		} else if (type === 'dashicon') {
			var dashicon = document.getElementById('icon-edit-dashicon').value;
			if (dashicon) {
				var icon = document.createElement('span');
				icon.className = 'dashicons ' + (dashicon.indexOf('dashicons-') === 0 ? dashicon : 'dashicons-' + dashicon);
				preview.appendChild(icon);
				preview.classList.add('preview-dashicon');
			}
		} else if (type === 'favicon') {
			var favicon = faviconUrlForAppUrl(iconEditTarget ? iconEditTarget.dataset.url : '');
			if (favicon) {
				var faviconImg = document.createElement('img');
				faviconImg.src = favicon;
				faviconImg.onerror = function() { preview.textContent = '?'; };
				preview.appendChild(faviconImg);
			}
		} else if (type === 'letter') {
			var title = iconEditTarget ? iconEditTarget.querySelector('.app-title') : null;
			preview.appendChild(buildLetterIconSvg(letterIconDataForName(title ? title.textContent : '')));
		}
	}

	function resetIconEditForm() {
		if (!iconEditForm) return;

		iconEditForm.reset();
		document.getElementById('icon-edit-emoji').value = '';
		document.getElementById('icon-edit-url').value = '';
		document.getElementById('icon-edit-dashicon').value = '';
		document.getElementById('icon-edit-emoji-search').value = '';
		document.getElementById('icon-edit-dashicon-search').value = '';
		iconEditForm.querySelectorAll('.emoji-option.selected, .dashicon-option.selected').forEach(function(btn) {
			btn.classList.remove('selected');
		});
		var emojiPicker = document.getElementById('icon-edit-emoji-picker');
		var dashiconPicker = document.getElementById('icon-edit-dashicon-picker');
		if (emojiPicker && typeof emojiPicker.renderEmojis === 'function') {
			emojiPicker.renderEmojis('');
		}
		if (dashiconPicker && typeof dashiconPicker.renderIcons === 'function') {
			dashiconPicker.renderIcons('');
		}
		setIconEditType('emoji');
	}

	function prefillIconEditFromTarget(appIcon) {
		var link = appIcon ? appIcon.querySelector('.app-link') : null;
		if (!link) return;

		var img = link.querySelector('img');
		var dashicon = link.querySelector('.dashicons');
		var emoji = link.querySelector('.emoji');
		var letter = link.querySelector('.app-letter-icon');
		var gradient = link.querySelector('.app-gradient-icon');

		if (img) {
			document.getElementById('icon-edit-url').value = img.getAttribute('src') || img.src;
			setIconEditType('url');
		} else if (dashicon) {
			document.getElementById('icon-edit-dashicon').value = selectedDashiconClass(dashicon);
			var picker = document.getElementById('icon-edit-dashicon-picker');
			if (picker && typeof picker.renderIcons === 'function') {
				picker.renderIcons(document.getElementById('icon-edit-dashicon-search').value);
			}
			setIconEditType('dashicon');
		} else if (emoji) {
			document.getElementById('icon-edit-emoji').value = emoji.textContent;
			var emojiPicker = document.getElementById('icon-edit-emoji-picker');
			if (emojiPicker && typeof emojiPicker.renderEmojis === 'function') {
				emojiPicker.renderEmojis(document.getElementById('icon-edit-emoji-search').value);
			}
			setIconEditType('emoji');
		} else if (letter || gradient) {
			setIconEditType('letter');
		}
	}

	function openIconEditModal(appIcon) {
		if (!iconEditModal || !iconEditForm || !appIcon) return;

		iconEditTarget = appIcon;
		resetIconEditForm();

		var slugInput = document.getElementById('icon-edit-slug');
		var heading = document.getElementById('icon-edit-heading');
		var title = appIcon.querySelector('.app-title');
		slugInput.value = appIcon.dataset.slug || '';
		if (heading) {
			heading.textContent = title && title.textContent ? 'Change Icon: ' + title.textContent : 'Change Icon';
		}
		prefillIconEditFromTarget(appIcon);
		iconEditModal.classList.add('active');
	}

	function closeIconEditModal() {
		if (!iconEditModal) return;
		iconEditModal.classList.remove('active');
		iconEditTarget = null;
	}

	function saveIconEdit(options) {
		options = options || {};
		if (!iconEditForm) return Promise.resolve(false);

		var slug = document.getElementById('icon-edit-slug').value;
		var type = currentIconEditType();
		var formData = new FormData();
		formData.append('action', 'my_apps_save_app_icon');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('slug', slug);

		if (options.revert) {
			formData.append('revert', '1');
		} else if (type === 'emoji') {
			formData.append('emoji', document.getElementById('icon-edit-emoji').value.trim());
		} else if (type === 'url') {
			formData.append('icon_url', document.getElementById('icon-edit-url').value.trim());
		} else if (type === 'dashicon') {
			formData.append('dashicon', document.getElementById('icon-edit-dashicon').value.trim());
		} else if (type === 'favicon') {
			formData.append('use_favicon', '1');
		} else if (type === 'letter') {
			formData.append('icon[type]', 'letter');
		}

		return fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data.success) {
				applyCustomizationPayload(data.data);
				closeIconEditModal();
				return true;
			}
			alert((data && data.data) || 'Error saving icon');
			return false;
		})
		.catch(function() {
			alert('Network error');
			return false;
		});
	}

	function handleSaveAppIcon(e) {
		e.preventDefault();
		saveIconEdit();
	}

	function handleRevertAppIcon(e) {
		e.preventDefault();
		saveIconEdit({ revert: true });
	}

	function bindEvents() {
		editBtn.addEventListener('click', enterEditMode);
		doneBtn.addEventListener('click', exitEditMode);

		container.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('click', hideContextMenu);
		contextMenu.addEventListener('click', handleContextAction);

		container.addEventListener('click', handleHideClick);
		container.addEventListener('click', handleAppClick);

		document.querySelector('.add-app-btn').addEventListener('click', function(e) {
			e.stopPropagation();
			openDefaultAppStore();
		});

		addAppForm.addEventListener('submit', handleAddApp);

		installSoftwareModal.querySelector('.modal-close').addEventListener('click', closeInstallSoftwareModal);
		installSoftwareModal.addEventListener('click', function(e) {
			if (e.target === installSoftwareModal) closeInstallSoftwareModal();
		});

		addAppForm.querySelectorAll('.icon-tab').forEach(function(tab) {
			tab.addEventListener('click', handleIconTabSwitch);
		});

		addAppForm.querySelectorAll('.icon-input').forEach(function(input) {
			input.addEventListener('input', updateIconPreview);
		});

		if (iconEditModal && iconEditForm) {
			iconEditModal.querySelector('.modal-close').addEventListener('click', closeIconEditModal);
			iconEditModal.addEventListener('click', function(e) {
				if (e.target === iconEditModal) closeIconEditModal();
			});
			iconEditForm.addEventListener('submit', handleSaveAppIcon);
			iconEditForm.querySelectorAll('.icon-tab').forEach(function(tab) {
				tab.addEventListener('click', handleIconEditTabSwitch);
			});
			iconEditForm.querySelectorAll('.icon-input').forEach(function(input) {
				input.addEventListener('input', updateIconEditPreview);
			});
			document.getElementById('icon-edit-revert').addEventListener('click', handleRevertAppIcon);
		}

		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') {
				if (iconEditModal && iconEditModal.classList.contains('active')) {
					closeIconEditModal();
				} else if (installSoftwareModal.classList.contains('active')) {
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
		if (bgMediaBtn) {
			bgMediaBtn.addEventListener('click', handleBgMediaSelect);
		}
		if (bgUrlToggle) {
			bgUrlToggle.addEventListener('click', handleBgUrlToggle);
		}
		if (bgUrlForm) {
			bgUrlForm.addEventListener('submit', handleBgUrlSubmit);
		}
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
					} else if (action === 'update-my-apps') {
						updateMyApps();
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
		updateBackgroundSelection(myAppsConfig.background || '');
		updateBackgroundImagePreview(myAppsConfig.backgroundImageUrl || '');
	}

	function toggleBgPicker() {
		if (bgPicker.classList.contains('active')) {
			closeBgPicker();
		} else {
			bgPicker.classList.add('active');
		}
	}

	function closeBgPicker() {
		if (!bgPicker) return;
		bgPicker.classList.remove('active');
		setBgUrlFormVisible(false);
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
				if (container) {
					var newApp = createAppElement(app);
					var addBtn = document.querySelector('.add-app-btn');
					container.insertBefore(newApp, addBtn);
				} else if (app && app.url) {
					rememberAppUrl(app.url);
				}

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
		if (!hiddenBtn || !hiddenAppsList) return;

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

	function updateBackgroundSelection(background) {
		if (!bgPicker) return;

		bgPicker.querySelectorAll('.bg-option, .bg-image-option').forEach(function(opt) {
			opt.classList.remove('selected');
		});
		updateCustomCssBackgroundOption();

		if (background === 'custom') {
			if (isCustomCssBackground() && bgCustomCssOption) {
				bgCustomCssOption.classList.add('selected');
			} else if (bgMediaBtn) {
				bgMediaBtn.classList.add('selected');
			}
			return;
		}

		if (!background) {
			var currentBg = body.className.match(/bg-[\w-]+/);
			background = currentBg ? currentBg[0].replace('bg-', '') : '';
		}

		var selected = background ? bgPicker.querySelector('[data-bg="' + background + '"]') : null;
		if (selected) {
			selected.classList.add('selected');
		}
	}

	function updateBackgroundImagePreview(url) {
		if (!bgImagePreview) return;

		if (url) {
			bgImagePreview.style.backgroundImage = 'url("' + String(url).replace(/"/g, '\\"') + '")';
		} else {
			bgImagePreview.style.backgroundImage = '';
		}
	}

	function isCustomCssBackground() {
		return myAppsConfig.background === 'custom' && !!myAppsConfig.customBackground && !myAppsConfig.backgroundImageUrl;
	}

	function updateCustomCssBackgroundOption() {
		var css = isCustomCssBackground() ? myAppsConfig.customBackground : '';

		if (bgCustomCssSection) {
			bgCustomCssSection.hidden = !css;
		}
		if (bgCustomCssPreview) {
			bgCustomCssPreview.style.background = css || '';
		}
	}

	function setBackgroundLoading(isLoading) {
		if (bgPicker) {
			bgPicker.classList.toggle('is-loading', !!isLoading);
		}
		if (bgUrlInput) {
			bgUrlInput.disabled = !!isLoading;
		}
	}

	function setBgUrlFormVisible(isVisible) {
		if (!bgUrlForm) return;

		bgUrlForm.hidden = !isVisible;
		if (bgUrlToggle) {
			bgUrlToggle.classList.toggle('is-active', !!isVisible);
			bgUrlToggle.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
		}
		if (!isVisible && bgUrlInput) {
			bgUrlInput.value = '';
		}
	}

	function clearWallpaperHintStorage() {
		try {
			localStorage.removeItem(WALLPAPER_HINT_DISMISSED_KEY);
			localStorage.removeItem(WALLPAPER_HINT_ELIGIBLE_KEY);
			localStorage.removeItem(WALLPAPER_SHUFFLE_BAG_KEY);
		} catch (e) {}
	}

	function resetBackgroundDemo() {
		var formData = new FormData();
		formData.append('action', 'my_apps_reset_background');
		formData.append('nonce', myAppsConfig.nonce);

		setBackgroundLoading(true);

		return fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (!data || !data.success) {
				throw new Error((data && data.data) || 'Error resetting background');
			}

			clearWallpaperHintStorage();
			applyBackgroundPayload(data.data);
			myAppsConfig.hasCustomizedWallpaper = false;
			closeBgPicker();

			return initWallpaperHint();
		})
		.catch(function(error) {
			showToast(error.message || 'Error resetting background');
			return false;
		})
		.finally(function() {
			setBackgroundLoading(false);
		});
	}

	function reloadBackground(data) {
		var fallbackPayload = normalizeBackgroundPayload(data, 4);

		return fetchBackgroundPayload()
			.then(function(payload) {
				applyBackgroundPayload(payload);
				return payload;
			})
			.catch(function() {
				if (fallbackPayload) {
					applyBackgroundPayload(fallbackPayload);
				}
				return fallbackPayload;
			});
	}

	function exposePublicApi() {
		if (!window.MyApps || (typeof window.MyApps !== 'object' && typeof window.MyApps !== 'function')) {
			window.MyApps = {};
		}
		window.MyApps.reloadBackground = reloadBackground;
		window.MyApps.resetBackgroundDemo = resetBackgroundDemo;
		window.MyApps.reloadApps = reloadApps;
		window.MyApps.reloadCustomization = reloadApps;
	}

	function fetchBackgroundPayload() {
		var formData = new FormData();
		formData.append('action', 'my_apps_get_background');
		formData.append('nonce', myAppsConfig.nonce);

		return fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data && data.success) {
				return data.data;
			}
			throw new Error((data && data.data) || 'Error loading background');
		});
	}

	function normalizeBackgroundPayload(value, depth) {
		var keys = ['result', 'output', 'data', 'response', 'body', 'payload'];
		var parsed;
		var i;
		var found;

		if (!value || depth < 0) return null;

		if (typeof value === 'string') {
			try {
				parsed = JSON.parse(value);
			} catch (e) {
				return null;
			}
			return normalizeBackgroundPayload(parsed, depth - 1);
		}

		if (typeof value !== 'object') return null;

		if (value.background && typeof value.background === 'object' && !Array.isArray(value.background)) {
			return normalizeBackgroundPayload(value.background, depth - 1);
		}

		if (typeof value.slug === 'string') {
			return value;
		}

		for (i = 0; i < keys.length; i++) {
			if (Object.prototype.hasOwnProperty.call(value, keys[i])) {
				found = normalizeBackgroundPayload(value[keys[i]], depth - 1);
				if (found) return found;
			}
		}

		return null;
	}

	function applyBackgroundPayload(data) {
		data = normalizeBackgroundPayload(data, 4);

		if (!data || typeof data.slug !== 'string') {
			return;
		}

		body.className = body.className.replace(/bg-[\w-]+/g, '').trim();
		body.style.background = '';
		if (data.slug) {
			body.classList.add('bg-' + data.slug);
		}

		if (data.slug === 'custom' && data.custom) {
			body.style.background = data.custom;
		}

		myAppsConfig.background = data.slug;
		myAppsConfig.customBackground = data.custom || '';
		myAppsConfig.backgroundImageUrl = data.image_url || '';
		myAppsConfig.backgroundAttachmentId = data.attachment_id || 0;

		updateBackgroundSelection(data.slug);
		updateBackgroundImagePreview(myAppsConfig.backgroundImageUrl);
		updateWallpaperHintCopy();
	}

	function saveBackground(value, options) {
		options = options || {};

		var formData = new FormData();
		formData.append('action', 'my_apps_save_background');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('background', value);

		setBackgroundLoading(true);

		return fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data.success) {
				applyBackgroundPayload(data.data);
				if (options.closePicker !== false) {
					closeBgPicker();
				}
				return true;
			}

			if (!options.silent) {
				alert((data && data.data) || 'Error saving background');
			}
			return false;
		})
		.catch(function() {
			if (!options.silent) {
				alert('Network error');
			}
			return false;
		})
		.finally(function() {
			setBackgroundLoading(false);
		});
	}

	function getI18n(key, fallback) {
		return (myAppsConfig.i18n && myAppsConfig.i18n[key]) || fallback;
	}

	function getWallpaperPalette() {
		if (!bgPicker) return [];

		return Array.prototype.slice.call(bgPicker.querySelectorAll('.bg-option[data-bg]')).map(function(option) {
			return {
				slug: option.dataset.bg,
				name: option.getAttribute('title') || ''
			};
		}).filter(function(item) {
			return !!item.slug;
		});
	}

	function getCurrentWallpaperSlug() {
		if (myAppsConfig.background) {
			return myAppsConfig.background;
		}

		var currentBg = body.className.match(/bg-[\w-]+/);
		return currentBg ? currentBg[0].replace('bg-', '') : '';
	}

	function getWallpaperPaletteItem(slug) {
		var palette = getWallpaperPalette();
		var i;

		for (i = 0; i < palette.length; i++) {
			if (palette[i].slug === slug) {
				return palette[i];
			}
		}

		return null;
	}

	function getWallpaperPaletteSlugs(palette) {
		return palette.map(function(item) {
			return item.slug;
		});
	}

	function getWallpaperPaletteSignature(slugs) {
		return slugs.join('|');
	}

	function readWallpaperShuffleBag(paletteSlugs) {
		var stored;
		var parsed;
		var bag;
		var paletteSignature = getWallpaperPaletteSignature(paletteSlugs);
		var validSlugs = {};
		var seenSlugs = {};

		paletteSlugs.forEach(function(slug) {
			validSlugs[slug] = true;
		});

		try {
			stored = localStorage.getItem(WALLPAPER_SHUFFLE_BAG_KEY);
			parsed = stored ? JSON.parse(stored) : null;
		} catch (e) {
			return [];
		}

		if (!parsed || parsed.palette !== paletteSignature || !Array.isArray(parsed.bag)) {
			return [];
		}

		bag = parsed.bag.filter(function(slug) {
			if (!validSlugs[slug] || seenSlugs[slug]) {
				return false;
			}
			seenSlugs[slug] = true;
			return true;
		});

		return bag;
	}

	function writeWallpaperShuffleBag(paletteSlugs, bag) {
		try {
			localStorage.setItem(WALLPAPER_SHUFFLE_BAG_KEY, JSON.stringify({
				palette: getWallpaperPaletteSignature(paletteSlugs),
				bag: bag
			}));
		} catch (e) {}
	}

	function shuffleWallpaperSlugs(slugs) {
		var shuffled = slugs.slice();
		var i;
		var j;
		var tmp;

		for (i = shuffled.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			tmp = shuffled[i];
			shuffled[i] = shuffled[j];
			shuffled[j] = tmp;
		}

		return shuffled;
	}

	function pickWallpaperShuffleEntry(currentSlug) {
		var paletteSlugs = getWallpaperPaletteSlugs(getWallpaperPalette());
		var bag = readWallpaperShuffleBag(paletteSlugs).filter(function(slug) {
			return slug !== currentSlug;
		});
		var choices;
		var nextSlug;

		if (!bag.length) {
			choices = paletteSlugs.filter(function(slug) {
				return slug !== currentSlug;
			});
			if (!choices.length) return null;
			bag = shuffleWallpaperSlugs(choices);
		}

		nextSlug = bag.shift();
		if (!nextSlug) return null;

		return {
			slug: nextSlug,
			paletteSlugs: paletteSlugs,
			bag: bag
		};
	}

	function updateWallpaperHintCopy() {
		if (!wallpaperHint || !wallpaperHintText || !wallpaperHintButton) return;

		var item = getWallpaperPaletteItem(getCurrentWallpaperSlug());
		var namedPrompt = getI18n('wallpaperNamedPrompt', 'This wallpaper is %s.');
		wallpaperHintText.textContent = item && item.name
			? namedPrompt.replace('%s', item.name)
			: getI18n('wallpaperPrompt', 'Not feeling this?');
		wallpaperHintButton.textContent = getI18n('wallpaperTryAnother', 'Try another.');
	}

	function dismissWallpaperHint() {
		if (!wallpaperHint) return;

		markWallpaperHintDismissed();
		setWallpaperHintCloseVisible(false);
		wallpaperHint.hidden = true;
	}

	function markWallpaperHintDismissed() {
		localStorage.wallpaperHintDismissed = '1';
		localStorage.setItem(WALLPAPER_HINT_DISMISSED_KEY, '1');
	}

	function bindWallpaperHintButton() {
		if (!wallpaperHintButton || isWallpaperHintBound) return;

		wallpaperHintButton.addEventListener('click', function() {
			randomizeWallpaperHint();
		});
		isWallpaperHintBound = true;
	}

	function bindWallpaperHintClose() {
		if (!wallpaperHintClose || isWallpaperHintCloseBound) return;

		wallpaperHintClose.addEventListener('click', dismissWallpaperHint);
		isWallpaperHintCloseBound = true;
	}

	function setWallpaperHintCloseVisible(isVisible) {
		if (!wallpaperHintClose) return;

		wallpaperHintClose.hidden = !isVisible;
	}

	function shouldShowWallpaperHint() {
		if (!wallpaperHint || !wallpaperHintButton || !bgPicker) return false;
		if (localStorage.getItem(WALLPAPER_HINT_DISMISSED_KEY) === '1') return false;

		if (localStorage.getItem(WALLPAPER_HINT_ELIGIBLE_KEY) === '1') {
			return true;
		}

		return !myAppsConfig.hasCustomizedWallpaper && !myAppsConfig.background;
	}

	function showWallpaperHint(options) {
		options = options || {};
		if (!wallpaperHint || !wallpaperHintButton || !bgPicker) return false;

		bindWallpaperHintButton();
		if (options.showClose) {
			bindWallpaperHintClose();
		}
		setWallpaperHintCloseVisible(!!options.showClose);
		updateWallpaperHintCopy();
		wallpaperHint.hidden = false;
		return true;
	}

	function hideWallpaperHint() {
		if (!wallpaperHint) return;

		setWallpaperHintCloseVisible(false);
		wallpaperHint.hidden = true;
	}

	function randomizeWallpaperHint(options) {
		options = options || {};

		var selection = pickWallpaperShuffleEntry(getCurrentWallpaperSlug());
		if (!selection) return Promise.resolve(false);

		if (wallpaperHintButton) {
			wallpaperHintButton.disabled = true;
		}

		return saveBackground(selection.slug, {
			closePicker: false,
			silent: !!options.silent
		}).then(function(saved) {
			if (saved) {
				writeWallpaperShuffleBag(selection.paletteSlugs, selection.bag);
			}
			return saved;
		}).finally(function() {
			if (wallpaperHintButton) {
				wallpaperHintButton.disabled = false;
			}
		});
	}

	function initWallpaperHint() {
		if (!shouldShowWallpaperHint()) return Promise.resolve(false);

		localStorage.setItem(WALLPAPER_HINT_ELIGIBLE_KEY, '1');
		showWallpaperHint({ showClose: true });

		if (!myAppsConfig.background) {
			return randomizeWallpaperHint({ silent: true });
		}

		return Promise.resolve(true);
	}

	function fetchCustomizationPayload() {
		var formData = new FormData();
		formData.append('action', 'my_apps_get_customization');
		formData.append('nonce', myAppsConfig.nonce);

		return fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			body: formData
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data && data.success) {
				return data.data;
			}
			throw new Error((data && data.data) || 'Error loading launcher customization');
		});
	}

	function normalizeCustomizationPayload(value, depth) {
		var keys = ['result', 'output', 'data', 'response', 'body', 'payload'];
		var parsed;
		var found;
		var i;

		if (!value || depth < 0) return null;

		if (typeof value === 'string') {
			try {
				parsed = JSON.parse(value);
			} catch (e) {
				return null;
			}
			return normalizeCustomizationPayload(parsed, depth - 1);
		}

		if (typeof value !== 'object') return null;

		if (value.apps && typeof value.apps === 'object' && !Array.isArray(value.apps) && Array.isArray(value.visible_ordered)) {
			return value;
		}

		for (i = 0; i < keys.length; i++) {
			if (Object.prototype.hasOwnProperty.call(value, keys[i])) {
				found = normalizeCustomizationPayload(value[keys[i]], depth - 1);
				if (found) return found;
			}
		}

		return null;
	}

	function appFromCustomizationItem(slug, item) {
		item = item || {};

		var app = {
			slug: slug || '',
			name: item.name || slug || '',
			url: item.url || '',
			hidden: !!item.hidden,
			deletable: !!item.deletable,
			icon_customized: !!item.icon_customized
		};
		var icon = item.icon || {};

		if (icon.type === 'icon_url') {
			app.icon_url = icon.value || '';
		} else if (icon.type === 'dashicon') {
			app.dashicon = icon.value || '';
		} else if (icon.type === 'emoji') {
			app.emoji = icon.value || '';
		} else if (icon.type === 'gradient') {
			app.gradient = icon.value || '';
		} else if (icon.type === 'letter') {
			app.letter_icon = {
				letters: icon.value || '?',
				background: icon.background || '#888'
			};
		}

		return app;
	}

	function appsFromCustomizationPayload(data) {
		var appMap = data.apps || {};
		var visibleOrdered = Array.isArray(data.visible_ordered) ? data.visible_ordered : [];
		var seen = {};
		var apps = [];

		function addApp(slug) {
			slug = slug === null || typeof slug === 'undefined' ? '' : String(slug);
			if (!slug || seen[slug] || !Object.prototype.hasOwnProperty.call(appMap, slug)) {
				return;
			}
			seen[slug] = true;
			apps.push(appFromCustomizationItem(slug, appMap[slug]));
		}

		visibleOrdered.forEach(addApp);
		Object.keys(appMap).forEach(addApp);

		return apps;
	}

	function createHiddenAppRow(app) {
		var row = document.createElement('div');
		row.className = 'hidden-app-row';

		var item = document.createElement('button');
		item.type = 'button';
		item.className = 'hidden-app-item';
		item.dataset.slug = app.slug;

		var icon = document.createElement('span');
		icon.className = 'hidden-app-icon';
		appendAppIconGraphic(icon, app, { inline: true, small: true, alt: '' });
		item.appendChild(icon);

		var name = document.createElement('span');
		name.className = 'hidden-app-name';
		name.textContent = app.name;
		item.appendChild(name);

		var restore = document.createElement('span');
		restore.className = 'restore-icon';
		restore.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
		item.appendChild(restore);
		row.appendChild(item);

		if (app.deletable) {
			var deleteBtn = document.createElement('button');
			deleteBtn.type = 'button';
			deleteBtn.className = 'hidden-app-delete';
			deleteBtn.dataset.slug = app.slug;
			deleteBtn.title = 'Delete';
			deleteBtn.setAttribute('aria-label', 'Delete');
			deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
			row.appendChild(deleteBtn);
		}

		return row;
	}

	function applyCustomizationPayload(data) {
		data = normalizeCustomizationPayload(data, 4);
		if (!data || !data.apps || typeof data.apps !== 'object' || Array.isArray(data.apps) || !Array.isArray(data.visible_ordered)) {
			return;
		}

		var apps = appsFromCustomizationPayload(data);
		myAppsConfig.appUrls = apps.map(function(app) {
			return normalizeAppUrl(app.url);
		}).filter(Boolean);
		myAppsConfig.deletableSlugs = apps.filter(function(app) {
			return app.deletable;
		}).map(function(app) {
			return app.slug;
		});

		if (data.background) {
			applyBackgroundPayload(data);
		}

		if (container) {
			container.querySelectorAll('.app-icon:not(.add-app-btn)').forEach(function(el) {
				el.remove();
			});

			var addBtn = container.querySelector('.add-app-btn');
			apps.forEach(function(app) {
				if (app.hidden) return;
				var appEl = createAppElement(app);
				if (addBtn) {
					container.insertBefore(appEl, addBtn);
				} else {
					container.appendChild(appEl);
				}
			});
		}

		if (hiddenAppsList) {
			hiddenAppsList.innerHTML = '';
			var hidden = apps.filter(function(app) {
				return app.hidden;
			});
			if (hidden.length) {
				hidden.forEach(function(app) {
					hiddenAppsList.appendChild(createHiddenAppRow(app));
				});
			} else {
				var noApps = document.createElement('div');
				noApps.className = 'no-hidden-apps';
				noApps.textContent = 'No hidden apps';
				hiddenAppsList.appendChild(noApps);
			}
			updateHiddenCount();
		}
	}

	function reloadApps(data) {
		var fallbackPayload = normalizeCustomizationPayload(data, 4);

		return fetchCustomizationPayload()
			.then(function(payload) {
				applyCustomizationPayload(payload);
				return payload;
			})
			.catch(function() {
				if (fallbackPayload) {
					applyCustomizationPayload(fallbackPayload);
				}
				return fallbackPayload;
			});
	}

	function handleBgSelect(e) {
		var option = e.target.closest('.bg-option');
		if (!option) return;

		saveBackground(option.dataset.bg, { closePicker: false });
	}

	function handleBgMediaSelect(e) {
		e.preventDefault();
		e.stopPropagation();

		if (!window.wp || !window.wp.media) {
			alert('Media library is unavailable');
			return;
		}

		if (!bgMediaFrame) {
			bgMediaFrame = window.wp.media({
				title: 'Background Image',
				button: {
					text: 'Set Background'
				},
				library: {
					type: 'image'
				},
				multiple: false
			});

			bgMediaFrame.on('select', function() {
				var attachment = bgMediaFrame.state().get('selection').first();
				if (!attachment) return;

				attachment = attachment.toJSON();
				if (attachment && attachment.id) {
					saveBackground(String(attachment.id));
				}
			});
		}

		bgMediaFrame.open();
	}

	function handleBgUrlToggle(e) {
		e.preventDefault();
		e.stopPropagation();

		var shouldShow = !bgUrlForm || bgUrlForm.hidden;
		setBgUrlFormVisible(shouldShow);
		if (shouldShow && bgUrlInput) {
			bgUrlInput.focus();
		}
	}

	function handleBgUrlSubmit(e) {
		e.preventDefault();
		e.stopPropagation();

		var url = bgUrlInput ? bgUrlInput.value.trim() : '';
		if (!url) return;

		saveBackground(url).then(function(saved) {
			if (saved && bgUrlInput) {
				bgUrlInput.value = '';
			}
		});
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
		if (container) {
			if (mode === 'grid') {
				container.classList.add('layout-grid');
			} else {
				container.classList.remove('layout-grid');
			}
		}
		saveDisplay('layout', mode);
		updateLayoutButtons();
	}

	function applyGridColumns(cols) {
		if (!container) return;
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
		if (!container) return;
		container.style.setProperty('--app-size', size + 'px');
	}

	function applySpacing(gap) {
		if (!container) return;
		container.style.setProperty('--app-gap', gap + 'px');
	}

	// Restore settings on load
	(function() {
		if (!container) return;
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
		showWallpaperHint({ showClose: false });
	}

	function exitEditMode() {
		isEditMode = false;
		body.classList.remove('edit-mode');
		sortable.option('disabled', true);
		hideWallpaperHint();
		saveOrder();
	}

	function handleContextMenu(e) {
		var appIcon = e.target.closest('.app-icon:not(.add-app-btn)');
		if (!appIcon) return;

		e.preventDefault();
		contextTarget = appIcon;

		var x = Math.max(8, Math.min(e.clientX, window.innerWidth - 160));
		var y = Math.max(8, Math.min(e.clientY, window.innerHeight - 210));

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
			case 'change-icon':
				openIconEditModal(contextTarget);
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
		var gradient = element.querySelector('.app-link .app-gradient-icon');

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
		} else if (gradient) {
			var gradientClone = gradient.cloneNode(true);
			gradientClone.classList.add('app-gradient-icon-small');
			iconHtml = gradientClone.outerHTML;
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
		if (!container) {
			if (app && app.url) {
				rememberAppUrl(app.url);
			}
			return null;
		}
		var existing = findExistingAppElement(app);
		if (existing) {
			return highlightAppElement(existing);
		}
		if (app && app.slug && Array.isArray(myAppsConfig.deletableSlugs) && myAppsConfig.deletableSlugs.indexOf(app.slug) === -1) {
			myAppsConfig.deletableSlugs.push(app.slug);
		}
		var newApp = createAppElement(app);
		var addBtn = document.querySelector('.add-app-btn');
		if (addBtn) {
			container.insertBefore(newApp, addBtn);
		} else {
			container.appendChild(newApp);
		}
		rememberAppUrl(app.url);
		return highlightAppElement(newApp);
	}

	function findExistingAppElement(app) {
		if (!container) return null;
		if (!app) return null;
		if (app.slug) {
			var slugIcons = container.querySelectorAll('.app-icon[data-slug]');
			for (var s = 0; s < slugIcons.length; s++) {
				if (slugIcons[s].dataset.slug === app.slug) {
					return slugIcons[s];
				}
			}
		}
		if (app.url) {
			var normalized = normalizeAppUrl(app.url);
			var icons = container.querySelectorAll('.app-icon[data-url]');
			for (var i = 0; i < icons.length; i++) {
				if (normalizeAppUrl(icons[i].dataset.url) === normalized) {
					return icons[i];
				}
			}
		}
		return null;
	}

	function highlightAppElement(appEl) {
		appEl.classList.add('just-added');
		requestAnimationFrame(function() {
			appEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
		appEl.addEventListener('animationend', function onEnd(ev) {
			if (ev.animationName === 'my-apps-glow-pulse') {
				appEl.classList.remove('just-added');
				appEl.removeEventListener('animationend', onEnd);
			}
		});
		return appEl;
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

	function appendAppIconGraphic(parent, app, options) {
		options = options || {};
		var tagName = options.inline ? 'span' : 'div';

		if (app.icon_url) {
			var img = document.createElement('img');
			img.src = app.icon_url;
			img.alt = options.alt !== undefined ? options.alt : (app.name || '');
			parent.appendChild(img);
		} else if (app.dashicon) {
			var dash = document.createElement(tagName);
			dash.className = 'dashicons ' + app.dashicon;
			parent.appendChild(dash);
		} else if (app.emoji) {
			var emoji = document.createElement(tagName);
			emoji.className = 'emoji';
			emoji.textContent = app.emoji;
			parent.appendChild(emoji);
		} else if (app.letter_icon) {
			parent.appendChild(buildLetterIconSvg(app.letter_icon, options.small ? 'app-letter-icon-small' : ''));
		} else if (app.gradient) {
			var gradient = document.createElement(tagName);
			gradient.className = 'app-gradient-icon' + (options.small ? ' app-gradient-icon-small' : '');
			gradient.style.background = app.gradient;
			gradient.innerHTML = WP_ICON_SVG || '';
			parent.appendChild(gradient);
		}
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
		appendAppIconGraphic(link, app);

		var title = document.createElement('p');
		title.className = 'app-title';
		title.textContent = app.name;
		link.appendChild(title);

		div.appendChild(link);
		return div;
	}

	function saveOrder() {
		if (!container) return;

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
	var appStoreSourceBadge = document.getElementById('app-store-source-badge');
	var DEFAULT_APP_STORE_CATEGORY = 'Apps';
	var activeCategory = DEFAULT_APP_STORE_CATEGORY;
	var activeView = 'apps';
	var activeRecipe = null;
	var appStoreEventsBound = false;

	function updateBlueprintsSourceBadge() {
		if (!appStoreSourceBadge) return;

		var source = getStoredBlueprintsSource();
		if (!source) {
			appStoreSourceBadge.hidden = true;
			appStoreSourceBadge.innerHTML = '';
			appStoreSourceBadge.removeAttribute('title');
			return;
		}

		appStoreSourceBadge.hidden = false;
		appStoreSourceBadge.title = source.input || source.baseUrl;
		appStoreSourceBadge.innerHTML = '';

		var labelEl = document.createElement('span');
		labelEl.className = 'app-store-source-label';
		labelEl.textContent = source.label || 'Custom source';
		appStoreSourceBadge.appendChild(labelEl);

		var clearBtn = document.createElement('button');
		clearBtn.type = 'button';
		clearBtn.className = 'app-store-source-clear';
		clearBtn.setAttribute('aria-label', 'Use default catalog');
		clearBtn.title = 'Use default catalog';
		clearBtn.textContent = '\u00d7';
		clearBtn.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			applyBlueprintsSource('');
		});
		appStoreSourceBadge.appendChild(clearBtn);
	}

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
		if (cat === 'all') return DEFAULT_APP_STORE_CATEGORY;
		if (cat === '__plugins__') return 'Other Plugins';
		if (cat === '__recipes__') {
			return (activeRecipe && recipes[activeRecipe]) ? recipes[activeRecipe].title : 'Recipes';
		}
		return cat;
	}

	function routeRequestsRecipes(url) {
		var appStore = (url.searchParams.get('app-store') || '').toLowerCase();
		var add = (url.searchParams.get('add') || '').toLowerCase();
		var category = (url.searchParams.get('category') || '').toLowerCase();

		return url.searchParams.has('recipes') ||
			appStore === 'recipes' ||
			add === 'recipes' ||
			category === 'recipes' ||
			category === '__recipes__';
	}

	function openRecipesRoute(cleanUrl) {
		activeCategory = '__recipes__';
		activeRecipe = null;
		openInstallSoftwareModal();

		if (!cleanUrl) {
			return;
		}

		var url = new URL(window.location);
		var changed = false;
		['recipes', 'category'].forEach(function(name) {
			if (url.searchParams.has(name)) {
				url.searchParams.delete(name);
				changed = true;
			}
		});
		if ((url.searchParams.get('add') || '').toLowerCase() === 'recipes') {
			url.searchParams.delete('add');
			changed = true;
		}
		if (changed) {
			history.replaceState({}, '', url.toString());
		}
	}

	function openInstallSoftwareModal() {
		installSoftwareModal.classList.add('active');
		document.body.style.overflow = 'hidden';
		bindAppStoreEvents();
		showAppStoreView('apps');
		if (!appStoreData) {
			loadAppStore();
		}
	}

	function openDefaultAppStore() {
		activeCategory = DEFAULT_APP_STORE_CATEGORY;
		activeRecipe = null;

		if (appStoreSearchInput) {
			appStoreSearchInput.value = '';
		}

		openInstallSoftwareModal();

		if (!appStoreData) {
			return;
		}

		var sidebar = document.getElementById('app-store-sidebar');
		if (sidebar) {
			sidebar.classList.remove('app-store-sidebar-hidden');
		}

		appStoreNav.querySelectorAll('.app-store-nav-item').forEach(function(el) {
			el.classList.toggle('active', el.dataset.category === activeCategory);
		});

		renderAppStore(appStoreData, activeCategory, '');
	}

	function closeInstallSoftwareModal() {
		installSoftwareModal.classList.remove('active');
		document.body.style.overflow = '';

		// Clean up state-bearing params (?app, ?recipe, ?plugin) when
		// closing the modal, and reset activeRecipe so the next open
		// doesn't land on a stale recipe detail.
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
		var pluginInstallUrl = getPluginInstallUrl();

		return fetch(PLUGINS_URL)
			.then(function(r) { return r.json(); })
			.then(function(curated) {
				if (!curated || typeof curated !== 'object') return null;

				var promises = Object.keys(curated).map(function(key) {
					var meta = curated[key] || {};
					var categories = Array.isArray(meta.categories) ? meta.categories : [];
					var note = meta.note || '';
					var landingPage = (typeof meta.landing_page === 'string' && meta.landing_page.indexOf('/') === 0) ? meta.landing_page : '';
					// `launcher_url` opts the entry into auto-adding a launcher
					// icon after install. Accepts an absolute http(s) URL or a
					// site-relative path starting with "/".
					var launcherUrl = '';
					if (typeof meta.launcher_url === 'string') {
						if (/^https?:\/\//.test(meta.launcher_url) || meta.launcher_url.indexOf('/') === 0) {
							launcherUrl = meta.launcher_url;
						}
					}

					// Direct ZIP URL: no wp.org / GitHub lookup, use metadata as-is.
					if (typeof meta.url === 'string' && /^https?:\/\//.test(meta.url)) {
						var rawKey = (key || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
						if (!rawKey) return Promise.resolve(null);
						var urlFallbackTitle = meta.title
							? cleanText(meta.title)
							: rawKey.split('-').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
						return Promise.resolve({
							outKey: 'url/' + rawKey,
							entry: {
								source: 'url',
								url: meta.url,
								title: urlFallbackTitle,
								author: meta.author ? cleanText(meta.author) : '',
								short_description: '',
								icon: meta.icon || '',
								note: note,
								categories: categories,
								install_url: meta.url,
								landing_page: landingPage,
								launcher_url: launcherUrl
							}
						});
					}

					// GitHub-hosted plugin: use metadata as-is, no wp.org fetch.
					if (meta.github && /^[\w.-]+\/[\w.-]+$/.test(meta.github)) {
						var owner = meta.github.split('/')[0];
						var repoName = meta.github.split('/')[1];
						var ghKey = 'github/' + (owner + '-' + repoName).toLowerCase();

						// Optional ref: shorthand `branch: "develop"`, or
						// explicit `ref` + `refType` ("branch" | "tag" | "commit").
						// When ref is a branch or tag name, refType is required
						// for Playground to resolve it reliably.
						var ref = '';
						var refType = '';
						if (typeof meta.branch === 'string' && /^[\w.\/-]+$/.test(meta.branch)) {
							ref = meta.branch;
							refType = 'branch';
						} else if (typeof meta.ref === 'string' && /^[\w.\/-]+$/.test(meta.ref)) {
							ref = meta.ref;
							if (meta.refType === 'branch' || meta.refType === 'tag' || meta.refType === 'commit') {
								refType = meta.refType;
							}
						}

						return Promise.resolve({
							outKey: ghKey,
							entry: {
								source: 'github',
								repo: meta.github,
								ref: ref,
								refType: refType,
								title: meta.title ? cleanText(meta.title) : repoName,
								author: meta.author ? cleanText(meta.author) : owner,
								short_description: '',
								icon: meta.icon || '',
								note: note,
								categories: categories,
								install_url: 'https://github.com/' + meta.github,
								landing_page: landingPage,
								launcher_url: launcherUrl
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
								landing_page: landingPage,
								launcher_url: launcherUrl
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
				_url: p.url || '',
				_ref: p.ref || '',
				_refType: p.refType || '',
				_icon: p.icon || '',
				_shortDescription: p.short_description || '',
				_note: p.note || '',
				_installUrl: p.install_url || '',
				_landingPage: p.landing_page || '',
				_launcherUrl: p.launcher_url || ''
			};
		});
	}

	function buildPluginBlueprint(app) {
		var pluginData;
		if (app._source === 'github') {
			pluginData = { resource: 'git:directory', url: 'https://github.com/' + app._repo };
			if (app._ref) {
				pluginData.ref = app._ref;
				if (app._refType) pluginData.refType = app._refType;
			} else {
				pluginData.ref = 'HEAD';
			}
		} else if (app._source === 'url') {
			pluginData = { resource: 'url', url: app._url };
		} else {
			pluginData = { resource: 'wordpress.org/plugins', slug: app._slug };
		}
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
		if (app._launcherUrl) {
			blueprint.launcher_url = app._launcherUrl;
		}
		return retrofitGitTargetFolderName(blueprint);
	}

	var aiAssistantBootstrapPromise = null;

	function isAiAssistantInstall(slug, result) {
		return slug === 'ai-assistant' ||
			(result && result.plugin === 'ai-assistant/ai-assistant.php');
	}

	function isAiAssistantApp(app) {
		if (!app) return false;
		var path = app._path ? String(app._path).replace(/^\/+/, '') : '';
		return (app._source === 'wp.org' && app._slug === 'ai-assistant') ||
			(!app._source && app._slug === 'ai-assistant') ||
			path === 'apps/ai-assistant.json' ||
			path === 'plugin/ai-assistant';
	}

	function blueprintInstallsAiAssistant(blueprint) {
		if (!blueprint || !Array.isArray(blueprint.steps)) return false;
		return blueprint.steps.some(function(step) {
			var pluginData = step && step.pluginData;
			if (!step || step.step !== 'installPlugin' || !pluginData) return false;
			if (pluginData.resource === 'wordpress.org/plugins' && pluginData.slug === 'ai-assistant') return true;
			return step.options && step.options.targetFolderName === 'ai-assistant';
		});
	}

	function extractPluginInstallResult(result) {
		if (!result || typeof result !== 'object') return null;
		if (result.plugin) return result;

		var candidates = [ result.data, result.result, result.pluginResult ];
		for (var i = 0; i < candidates.length; i++) {
			if (candidates[i] && typeof candidates[i] === 'object' && candidates[i].plugin) {
				return candidates[i];
			}
		}
		return null;
	}

	function bootstrapAiAssistantAfterPlaygroundInstall(install, result) {
		var app = install && install.app ? install.app : null;
		var blueprint = install && install.blueprint ? install.blueprint : null;
		var pluginResult = extractPluginInstallResult(result);
		var slug = app && app._slug ? app._slug : '';

		if (
			!isAiAssistantInstall(slug, pluginResult) &&
			!isAiAssistantApp(app) &&
			!blueprintInstallsAiAssistant(blueprint)
		) {
			return Promise.resolve(false);
		}

		return bootstrapAiAssistantAfterInstall(
			slug || 'ai-assistant',
			pluginResult || { plugin: 'ai-assistant/ai-assistant.php' }
		);
	}

	function assetUrl(src, version) {
		if (!version) return src;
		try {
			var url = new URL(src, window.location.href);
			url.searchParams.set('ver', version);
			return url.toString();
		} catch (e) {
			return src + (src.indexOf('?') === -1 ? '?' : '&') + 'ver=' + encodeURIComponent(version);
		}
	}

	function loadAiAssistantStyles(styles) {
		(styles || []).forEach(function(style) {
			if (!style || !style.href) return;
			var id = style.id ? style.id : '';
			var elementId = id ? id.replace(/-css$/, '') + '-css' : '';
			if (elementId && document.getElementById(elementId)) return;

			var link = document.createElement('link');
			if (elementId) {
				link.id = elementId;
			}
			link.rel = 'stylesheet';
			link.href = assetUrl(style.href, style.version);
			document.head.appendChild(link);
		});
	}

	function applyAiAssistantInlineStyles(inlineStyles) {
		(inlineStyles || []).forEach(function(style) {
			if (!style || !style.css) return;
			var id = style.id || '';
			if (id && document.getElementById(id)) return;

			var el = document.createElement('style');
			if (id) {
				el.id = id;
			}
			el.textContent = style.css;
			document.head.appendChild(el);
		});
	}

	function loadAiAssistantScript(script) {
		if (!script || !script.src) {
			return Promise.resolve();
		}

		if (script.global && window[script.global]) {
			return Promise.resolve();
		}

		var elementId = script.id ? script.id.replace(/-js$/, '') + '-js' : '';
		if (elementId && document.getElementById(elementId)) {
			return Promise.resolve();
		}

		return new Promise(function(resolve, reject) {
			var el = document.createElement('script');
			if (elementId) {
				el.id = elementId;
			}
			el.src = assetUrl(script.src, script.version);
			el.onload = function() { resolve(); };
			el.onerror = function() { reject(new Error('Could not load ' + script.src)); };
			document.head.appendChild(el);
		});
	}

	function loadAiAssistantScripts(scripts) {
		return (scripts || []).reduce(function(promise, script) {
			return promise.then(function() {
				return loadAiAssistantScript(script);
			});
		}, Promise.resolve());
	}

	function applyAiAssistantGlobals(globals) {
		Object.keys(globals || {}).forEach(function(name) {
			window[name] = globals[name];
		});
	}

	function runAiAssistantBootstrap(payload) {
		applyAiAssistantGlobals(payload.globals || {});
		loadAiAssistantStyles(payload.styles || []);
		applyAiAssistantInlineStyles(payload.inlineStyles || []);

		return loadAiAssistantScripts(payload.scripts || []).then(function() {
			if (
				window.aiAssistantBootstrapRuntime &&
				typeof window.aiAssistantBootstrapRuntime.renderAndInit === 'function'
			) {
				window.aiAssistantBootstrapRuntime.renderAndInit();
			}
			return true;
		});
	}

	function bootstrapAiAssistantAfterInstall(slug, result) {
		if (!isAiAssistantInstall(slug, result)) {
			return Promise.resolve(false);
		}

		if (
			window.aiAssistantBootstrapRuntime &&
			typeof window.aiAssistantBootstrapRuntime.renderAndInit === 'function'
		) {
			window.aiAssistantBootstrapRuntime.renderAndInit();
			return Promise.resolve(true);
		}

		if (!myAppsConfig.aiAssistantBootstrapNonce) {
			return Promise.resolve(false);
		}

		if (aiAssistantBootstrapPromise) {
			return aiAssistantBootstrapPromise;
		}

		var formData = new FormData();
		formData.append('action', 'ai_assistant_bootstrap');
		formData.append('_wpnonce', myAppsConfig.aiAssistantBootstrapNonce);

		aiAssistantBootstrapPromise = fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			body: formData
		})
			.then(function(res) { return res.json(); })
			.then(function(data) {
				if (!data || !data.success) {
					return false;
				}
				return runAiAssistantBootstrap(data.data || {});
			})
			.catch(function() {
				return false;
			});

		return aiAssistantBootstrapPromise;
	}

	function installWpOrgPluginOnHost(slug) {
		var formData = new FormData();
		formData.append('action', 'my_apps_install_plugin');
		formData.append('nonce', myAppsConfig.nonce);
		formData.append('slug', slug);

		return fetch(myAppsConfig.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			body: formData
		})
			.then(function(res) { return res.json(); })
			.then(function(data) {
				if (!data || !data.success) {
					throw new Error(ajaxErrorMessage(data, 'Could not install plugin.'));
				}
				var result = data.data || {};
				bootstrapAiAssistantAfterInstall(slug, result);
				return result;
			});
	}

	function closeBlueprintInstallInfo(infoEl, btn) {
		if (infoEl) {
			infoEl.classList.remove('active');
			infoEl.innerHTML = '';
		}
		resetInstallButtonState(btn);
	}

	function showManualBlueprintInstall(blueprintUrl, infoEl, btn, message) {
		if (!infoEl) {
			window.location.href = 'https://playground.wordpress.net/?blueprint-url=' + encodeURIComponent(blueprintUrl);
			return;
		}

		var playgroundLink = 'https://playground.wordpress.net/?blueprint-url=' + encodeURIComponent(blueprintUrl);
		infoEl.innerHTML = '';

		var messageEl = document.createElement('p');
		messageEl.textContent = message || 'This blueprint includes steps that cannot be run safely from this host.';
		infoEl.appendChild(messageEl);

		var playgroundEl = document.createElement('a');
		playgroundEl.href = playgroundLink;
		playgroundEl.target = '_blank';
		playgroundEl.rel = 'noopener noreferrer';
		playgroundEl.className = 'app-store-blueprint-url';
		playgroundEl.textContent = 'Open in WordPress Playground';
		infoEl.appendChild(playgroundEl);

		var blueprintEl = document.createElement('a');
		blueprintEl.href = blueprintUrl;
		blueprintEl.target = '_blank';
		blueprintEl.rel = 'noopener noreferrer';
		blueprintEl.className = 'app-store-blueprint-url';
		blueprintEl.textContent = 'View blueprint JSON';
		infoEl.appendChild(blueprintEl);

		var noteEl = document.createElement('p');
		noteEl.textContent = 'You can also follow the installation steps below manually.';
		infoEl.appendChild(noteEl);

		infoEl.classList.add('active');
		setInstallButtonState(btn, 'Close', false);
	}

	function encodeGitHubRefPath(ref) {
		return String(ref || 'HEAD').split('/').map(function(part) {
			return encodeURIComponent(part);
		}).join('/');
	}

	function getPluginZipUrl(app) {
		if (app._source === 'github' && app._repo) {
			var ref = app._ref || 'HEAD';
			if (app._refType === 'branch') {
				return 'https://github.com/' + app._repo + '/archive/refs/heads/' + encodeGitHubRefPath(ref) + '.zip';
			}
			if (app._refType === 'tag') {
				return 'https://github.com/' + app._repo + '/archive/refs/tags/' + encodeGitHubRefPath(ref) + '.zip';
			}
			return 'https://github.com/' + app._repo + '/archive/' + encodeGitHubRefPath(ref) + '.zip';
		}

		if (app._source === 'url') {
			return app._url || app._installUrl || '';
		}

		return '';
	}

	function showManualPluginInstall(app, infoEl, btn) {
		if (!infoEl) {
			if (app._installUrl) {
				window.location.href = app._installUrl;
			}
			return;
		}

		if (infoEl.classList.contains('active')) {
			infoEl.classList.remove('active');
			infoEl.innerHTML = '';
			resetInstallButtonState(btn);
			return;
		}

		var sourceUrl = app._installUrl || app._url || (app._repo ? 'https://github.com/' + app._repo : '');
		var zipUrl = getPluginZipUrl(app);
		infoEl.innerHTML = '';

		var messageEl = document.createElement('p');
		if (app._source === 'github') {
			messageEl.textContent = 'This plugin is hosted on GitHub, so it cannot be installed automatically on this host yet.';
		} else {
			messageEl.textContent = 'This plugin is provided as a ZIP download. Download it, then upload and activate it in WordPress.';
		}
		infoEl.appendChild(messageEl);

		if (zipUrl) {
			var downloadLink = document.createElement('a');
			downloadLink.href = zipUrl;
			downloadLink.target = '_blank';
			downloadLink.rel = 'noopener noreferrer';
			downloadLink.className = 'app-store-blueprint-url';
			downloadLink.textContent = 'Download ZIP';
			infoEl.appendChild(downloadLink);
		}

		if (sourceUrl && sourceUrl !== zipUrl) {
			var sourceLink = document.createElement('a');
			sourceLink.href = sourceUrl;
			sourceLink.target = '_blank';
			sourceLink.rel = 'noopener noreferrer';
			sourceLink.className = 'app-store-blueprint-url';
			sourceLink.textContent = app._source === 'github' ? 'Open GitHub repository' : 'Open plugin source';
			infoEl.appendChild(sourceLink);
		}

		var uploadLink = document.createElement('a');
		uploadLink.href = getPluginInstallUrl() + '?tab=upload';
		uploadLink.target = '_top';
		uploadLink.className = 'app-store-blueprint-url';
		uploadLink.textContent = 'Open plugin upload screen';
		infoEl.appendChild(uploadLink);

		var noteEl = document.createElement('p');
		noteEl.textContent = 'Download the plugin ZIP, then upload and activate it in WordPress.';
		infoEl.appendChild(noteEl);

		infoEl.classList.add('active');
		setInstallButtonState(btn, 'Close', false);
	}

	function blueprintStepLabel(step) {
		if (!step || !step.step) return 'unknown step';
		return String(step.step).replace(/([A-Z])/g, ' $1').toLowerCase().trim();
	}

	function getHostBlueprintInstallPlan(blueprint) {
		var plan = {
			plugins: [],
			unsupported: []
		};
		var seenPlugins = {};

		(blueprint && Array.isArray(blueprint.steps) ? blueprint.steps : []).forEach(function(step) {
			if (!step || !step.step) return;

			if (step.step === 'installPlugin') {
				var pluginData = step.pluginData || {};
				if (pluginData.resource === 'wordpress.org/plugins' && pluginData.slug) {
					if (!seenPlugins[pluginData.slug]) {
						seenPlugins[pluginData.slug] = true;
						plan.plugins.push(pluginData.slug);
					}
					return;
				}
				plan.unsupported.push(blueprintStepLabel(step));
				return;
			}

			// The host installer activates plugins automatically after install.
			if (step.step === 'activatePlugin' || step.step === 'login') return;

			plan.unsupported.push(blueprintStepLabel(step));
		});

		return plan;
	}

	function installBlueprintOnHost(app, blueprintUrl, gradient, infoEl, btn) {
		if (infoEl && infoEl.classList.contains('active')) {
			closeBlueprintInstallInfo(infoEl, btn);
			return;
		}

		setInstallButtonState(btn, 'Checking...', true);
		resolveBlueprintFromUrl(blueprintUrl)
			.then(function(blueprint) {
				var plan = getHostBlueprintInstallPlan(blueprint);
				if (!plan.plugins.length) {
					showManualBlueprintInstall(
						blueprintUrl,
						infoEl,
						btn,
						'This blueprint does not contain a WordPress.org plugin install step that can be run on this host.'
					);
					return false;
				}
				if (plan.unsupported.length) {
					showManualBlueprintInstall(
						blueprintUrl,
						infoEl,
						btn,
						'This blueprint includes steps this host installer cannot run: ' + plan.unsupported.join(', ') + '.'
					);
					return false;
				}
				if (!myAppsConfig.canInstallPlugins) {
					var canUpdateInstalledPlugins = !!myAppsConfig.canUpdatePlugins && plan.plugins.every(function(slug) {
						return !!((myAppsConfig.installedPlugins || {})[slug]);
					});
					if (!canUpdateInstalledPlugins) {
						showManualBlueprintInstall(
							blueprintUrl,
							infoEl,
							btn,
							'This account cannot install plugins on this host.'
						);
						return false;
					}
				}

				var installResults = [];
				return plan.plugins.reduce(function(promise, slug) {
					return promise.then(function() {
						setInstallButtonState(btn, getInstallButtonLabel(app, blueprint) === 'Update' ? 'Updating...' : 'Installing...', true);
						return installWpOrgPluginOnHost(slug).then(function(result) {
							rememberInstalledPlugin(slug, result);
							installResults.push(result);
							return result;
						});
					});
				}, Promise.resolve())
					.then(function() {
						var desktopMode = shouldUseDesktopModeAppStoreInstallFlow();
						var install = {
							app: app,
							blueprint: blueprint,
							gradient: gradient,
							btn: btn,
							desktopMode: desktopMode,
							landingUrl: getInstallLandingUrl(app, blueprint)
						};
						return completeInstalledBlueprint(install).then(function(added) {
							return { added: added, install: install };
						});
					})
					.then(function(outcome) {
						var updated = installResults.some(function(result) { return result.updated; });
						var alreadyInstalled = installResults.length && installResults.every(function(result) { return result.alreadyInstalled && !result.updated && !result.activated; });
						finishInstallButton(btn, updated ? 'Updated' : (alreadyInstalled ? 'Up to date' : 'Installed'), outcome.install);
						if (updated) {
							showToast(outcome.added ? 'Updated and added to My Apps' : 'Updated');
						} else if (alreadyInstalled) {
							showToast(outcome.added ? 'Added to My Apps' : 'Already up to date');
						} else {
							showToast(outcome.added ? 'Installed and added to My Apps' : 'Installed');
						}
						return true;
					});
			})
			.catch(function(error) {
				resetInstallButtonState(btn);
				showToast(error && error.message ? error.message : 'Install failed');
			});
	}

	function updateMyApps() {
		var blueprint = {
			steps: [ {
				step: 'installPlugin',
				pluginData: { resource: 'git:directory', url: 'https://github.com/akirk/my-apps', ref: 'HEAD' },
				options: { targetFolderName: 'my-apps' }
			} ]
		};
		installResolvedBlueprintInPlayground({ title: 'My Apps', _landingPage: '/my-apps/' }, blueprint, '', '', null);
	}

	function installPluginApp(app, gradient, btn, infoEl) {
		if (isPlayground) {
			var blueprint = buildPluginBlueprint(app);
			installResolvedBlueprintInPlayground(app, blueprint, '', gradient, btn);
			return;
		}

		if (app._source !== 'wp.org') {
			showManualPluginInstall(app, infoEl, btn);
			return;
		}

		if (canManageWpOrgPlugin(app)) {
			setInstallButtonState(btn, getInstallButtonLabel(app) === 'Update' ? 'Updating...' : 'Installing...', true);
			installWpOrgPluginOnHost(app._slug)
				.then(function(result) {
					rememberInstalledPlugin(app._slug, result);
					if (result.activated || result.alreadyActive) {
						var blueprint = buildPluginBlueprint(app);
						var desktopMode = shouldUseDesktopModeAppStoreInstallFlow();
						var install = {
							app: app,
							blueprint: blueprint,
							gradient: gradient,
							btn: btn,
							desktopMode: desktopMode,
							landingUrl: getInstallLandingUrl(app, blueprint)
						};
						return completeInstalledBlueprint(install).then(function(added) {
							return { result: result, added: added, install: install };
						});
					}
					return { result: result, added: false };
				})
				.then(function(outcome) {
					if (outcome.result.updated) {
						finishInstallButton(btn, 'Updated', outcome.install);
						showToast(outcome.added ? 'Updated and added to My Apps' : 'Updated');
					} else if (outcome.result.alreadyInstalled && !outcome.result.activated) {
						finishInstallButton(btn, 'Up to date', outcome.install);
						showToast(outcome.added ? 'Added to My Apps' : 'Already up to date');
					} else {
						finishInstallButton(btn, 'Installed', outcome.install);
					}

					if (outcome.result.updated || (outcome.result.alreadyInstalled && !outcome.result.activated)) {
						return;
					}

					if (outcome.result.activated || outcome.result.alreadyActive) {
						showToast(outcome.added ? 'Installed and added to My Apps' : 'Installed and activated');
					} else {
						showToast('Installed. Activate it from Plugins.');
					}
				})
				.catch(function(error) {
					resetInstallButtonState(btn);
					showToast(error && error.message ? error.message : 'Install failed');
				});
			return;
		}

		// Hosted WordPress: deep-link to whatever makes sense for this source
		// (wp-admin plugin-install page for wp.org, repo page for GitHub).
		if (app._installUrl) {
			window.location.href = app._installUrl;
		} else {
			window.location.href = getPluginInstallUrl();
		}
	}

	// 'loading' \u2192 plugins fetch in flight; 'loaded' \u2192 merged in; 'failed' \u2192 fetch errored or returned nothing.
	var pluginsLoadState = 'loading';
	var appStoreLoadId = 0;

	function loadAppStore() {
		var loadId = ++appStoreLoadId;
		appStoreContent.innerHTML = '<div class="app-store-loading">Loading apps\u2026</div>';
		pluginsLoadState = 'loading';
		recipesLoadState = 'loading';

		var pluginsPromise = fetchRecommendedPlugins();
		var recipesPromise = fetch(RECIPES_URL)
			.then(function(r) { return r.json(); })
			.then(function(data) {
				if (loadId !== appStoreLoadId) return;
				if (data && typeof data === 'object' && !Array.isArray(data)) {
					recipes = data;
					hasRecipes = Object.keys(recipes).length > 0;
					recipesLoadState = 'loaded';
				} else {
					recipesLoadState = 'failed';
				}
			})
			.catch(function() {
				if (loadId !== appStoreLoadId) return;
				recipesLoadState = 'failed';
			});

		fetch(APPS_INDEX_URL)
			.then(function(res) { return res.json(); })
			.then(function(data) {
				if (loadId !== appStoreLoadId) return;
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
						renderAppStore(appStoreData, activeCategory, (appStoreSearchInput.value || '').toLowerCase());
					}
				}
				bindAppStoreEvents();

				// Wait for recipes + recommended-plugins enrichment before the
				// final re-render. The plugins from each app's blueprint are
				// covered by the curated plugins.json now, so we no longer
				// fetch every blueprint up front to extract them.
				Promise.all([pluginsPromise, recipesPromise]).then(function(results) {
					if (loadId !== appStoreLoadId) return;
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

					buildAppStoreNav(appStoreData);

					// Plugin deep-links land here (their entries only appear
					// after the recommended-plugins fetch resolves).
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
				if (loadId !== appStoreLoadId) return;
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
			var gradient = getCategoryGradient(app.categories);
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
		// the regular category list below. Render optimistically while the
		// recipes fetch is still in flight so the second build doesn't
		// insert a new item at the top and shift the layout.
		var showRecipesNav = hasRecipes || recipesLoadState === 'idle' || recipesLoadState === 'loading';
		if (showRecipesNav) {
			var recipesLi = document.createElement('li');
			recipesLi.className = 'app-store-nav-item' + (activeView === 'apps' && activeCategory === '__recipes__' ? ' active' : '');
			recipesLi.dataset.category = '__recipes__';
			recipesLi.textContent = 'Recipes';
			appStoreNav.appendChild(recipesLi);

			var recipesDivider = document.createElement('li');
			recipesDivider.className = 'app-store-nav-divider';
			appStoreNav.appendChild(recipesDivider);
		}

		categories.forEach(function(cat) {
			var li = document.createElement('li');
			li.className = 'app-store-nav-item' + (activeView === 'apps' && activeCategory === cat ? ' active' : '');
			li.dataset.category = cat;
			li.textContent = cat;
			appStoreNav.appendChild(li);
		});

		// Always show the Other Plugins entry — the curated list ships with
		// the plugin, so even if the wp.org enrichment call fails we still
		// have something meaningful to render in that section.
		var pluginsLi = document.createElement('li');
		pluginsLi.className = 'app-store-nav-item' + (activeView === 'apps' && activeCategory === '__plugins__' ? ' active' : '');
		pluginsLi.dataset.category = '__plugins__';
		pluginsLi.textContent = 'Other Plugins';
		appStoreNav.appendChild(pluginsLi);

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
		pluginDirLink.href = getPluginInstallUrl();
		pluginDirLink.target = '_top';
		pluginDirLink.textContent = 'Plugin Directory';
		pluginDirLi.appendChild(pluginDirLink);
		appStoreNav.appendChild(pluginDirLi);

		var submitLi = document.createElement('li');
		submitLi.className = 'app-store-nav-item app-store-nav-external';
		var submitLink = document.createElement('a');
		submitLink.href = 'https://github.com/WordPress/blueprints/blob/trunk/blueprints/my-wordpress/README.md';
		submitLink.target = '_blank';
		submitLink.rel = 'noopener noreferrer';
		submitLink.textContent = 'Submit an App';
		submitLi.appendChild(submitLink);
		appStoreNav.appendChild(submitLi);
	}

	function isJsonTextCandidate(text) {
		var trimmed = String(text || '').trim();
		return trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[';
	}

	function isBlueprintLikeObject(blueprint) {
		return !!(
			blueprint &&
			typeof blueprint === 'object' &&
			(
				blueprint.steps ||
				blueprint.meta ||
				(
					typeof blueprint.$schema === 'string' &&
					blueprint.$schema.indexOf('blueprint') !== -1
				)
			)
		);
	}

	function importCustomBlueprint(blueprint) {
		if (!appStoreData) {
			showToast('Apps are still loading. Try again in a moment.');
			return true;
		}

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
				return true;
			}
			// Only delete if the key changes (avoid re-inserting at end)
			if (matchedPath !== customPath) {
				delete appStoreData[matchedPath];
			}
		}

		var customCategories = originalCategories ? originalCategories.slice() : [];
		if (customCategories.indexOf('Custom') === -1) {
			customCategories.push('Custom');
		}

		var appMeta = {
			title: title,
			description: description,
			author: author,
			categories: customCategories
		};

		// Only set overridesPath if this actually overrides a non-custom app
		var actualOverrides = (overridesPath && overridesPath !== customPath) ? overridesPath : null;
		saveCustomBlueprint(customPath, appMeta, blueprint, actualOverrides);

		// Merge into current data
		appMeta._custom = true;
		if (actualOverrides) appMeta._overrides = actualOverrides;
		appStoreData[customPath] = appMeta;

		buildAppStoreNav(appStoreData);
		navigateToAppStoreCategory('Custom');
		showToast(matchedPath ? '"' + title + '" overridden with custom blueprint' : '"' + title + '" added');
		return true;
	}

	function importBlueprintText(text, options) {
		options = options || {};
		if (!isJsonTextCandidate(text)) {
			return false;
		}

		var blueprint;
		try {
			blueprint = JSON.parse(text);
		} catch (err) {
			if (options.showErrors) {
				showToast('Pasted text is not valid JSON');
			}
			return !!options.consumeInvalid;
		}

		if (!isBlueprintLikeObject(blueprint)) {
			if (options.showErrors) {
				showToast('Pasted JSON is not a valid blueprint');
			}
			return !!options.consumeInvalid;
		}

		return importCustomBlueprint(blueprint);
	}

	function handleBlueprintPaste(e) {
		if (e.defaultPrevented) return;

		var clipboard = e.clipboardData || window.clipboardData;
		var text = clipboard ? clipboard.getData('text') : '';
		if (!text) return;

		if (importBlueprintsSourceText(text)) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		if (importBlueprintText(text, { showErrors: true, consumeInvalid: true })) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	function handleBlueprintSearchPaste(e) {
		var clipboard = e.clipboardData || window.clipboardData;
		var text = clipboard ? clipboard.getData('text') : '';
		if (!text) return;

		if (importBlueprintsSourceText(text)) {
			appStoreSearchInput.value = '';
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		if (!isJsonTextCandidate(text)) return;

		appStoreSearchInput.value = '';
		if (importBlueprintText(text, { showErrors: true, consumeInvalid: true })) {
			e.preventDefault();
			e.stopPropagation();
			if (appStoreData) {
				filterAppStore();
			}
		}
	}

	function handleBlueprintSearchInput(e) {
		var value = appStoreSearchInput.value || '';
		if (e && e.inputType === 'insertFromPaste' && importBlueprintsSourceText(value)) {
			appStoreSearchInput.value = '';
			return true;
		}

		if (!isJsonTextCandidate(value)) {
			return false;
		}

		if (importBlueprintText(value, { showErrors: false, consumeInvalid: false })) {
			appStoreSearchInput.value = '';
			return true;
		}

		return false;
	}

	function bindAppStoreEvents() {
		if (appStoreEventsBound) return;
		appStoreEventsBound = true;

		installSoftwareModal.addEventListener('paste', handleBlueprintPaste);
		appStoreSearchInput.addEventListener('paste', handleBlueprintSearchPaste);

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

		appStoreSearchInput.addEventListener('input', function(e) {
			if (handleBlueprintSearchInput(e)) {
				filterAppStore();
				return;
			}
			filterAppStore();
		});
	}

	function filterAppStore() {
		if (!appStoreData) return;

		var search = (appStoreSearchInput.value || '').toLowerCase();
		renderAppStore(appStoreData, activeCategory, search);
	}

	function navigateToAppStoreCategory(cat) {
		activeCategory = cat;
		activeRecipe = null;

		if (appStoreSearchInput) {
			appStoreSearchInput.value = '';
		}

		var url = new URL(window.location);
		var changed = false;
		['app', 'plugin', 'recipe'].forEach(function(name) {
			if (url.searchParams.has(name)) {
				url.searchParams.delete(name);
				changed = true;
			}
		});
		if (changed) {
			history.replaceState({}, '', url.toString());
		}

		var sidebar = document.getElementById('app-store-sidebar');
		if (sidebar) {
			sidebar.classList.remove('app-store-sidebar-hidden');
		}

		showAppStoreView('apps');
		appStoreNav.querySelectorAll('.app-store-nav-item').forEach(function(el) {
			el.classList.toggle('active', el.dataset.category === cat);
		});

		filterAppStore();
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

	function getCategoryGradient(categories) {
		var cats = Array.isArray(categories) ? categories : [];
		for (var i = cats.length - 1; i >= 0; i--) {
			if (categoryGradients[cats[i]]) {
				return categoryGradients[cats[i]];
			}
		}
		return defaultGradient;
	}

	// When the same software ships as both a richer "app" entry (apps.json,
	// path "apps/<slug>.json") and a curated plugin (plugins.json), the app
	// wins. Two signals identify a collision: the app's path slug matching
	// the plugin's slug / GitHub repo / URL key, and a case-insensitive
	// title match. Either is enough.
	function dedupePluginsAgainstApps(keys, data) {
		var claimedSlugs = {};
		var claimedTitles = {};
		keys.forEach(function(path) {
			var entry = data[path];
			if (!entry || entry._type === 'plugin') return;
			var match = path.match(/^apps\/([^\/]+)\.json$/);
			if (match) claimedSlugs[match[1].toLowerCase()] = true;
			if (entry.title) claimedTitles[entry.title.toLowerCase()] = true;
		});
		return keys.filter(function(path) {
			var entry = data[path];
			if (!entry || entry._type !== 'plugin') return true;
			if (entry.title && claimedTitles[entry.title.toLowerCase()]) return false;
			if (entry._slug && claimedSlugs[entry._slug.toLowerCase()]) return false;
			if (entry._repo) {
				var repoName = entry._repo.split('/').pop();
				if (repoName && claimedSlugs[repoName.toLowerCase()]) return false;
			}
			// URL entries use a "url/<key>" path; the key portion is the
			// curator-chosen identifier and may match an app slug.
			var urlMatch = path.match(/^plugin\/url\/(.+)$/);
			if (urlMatch && claimedSlugs[urlMatch[1].toLowerCase()]) return false;
			return true;
		});
	}

	function renderAppStore(data, category, search) {
		category = category || DEFAULT_APP_STORE_CATEGORY;
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
		var matchingRecipeKeys = (search && category !== '__plugins__')
			? getMatchingRecipeKeys(search)
			: [];

		var keys = dedupePluginsAgainstApps(Object.keys(data), data);
		keys.sort(function(a, b) {
			return (data[a].title || '').localeCompare(data[b].title || '', undefined, { sensitivity: 'base' });
		});

		keys.forEach(function(path) {
			var app = data[path];
			app._path = path;

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

			var gradient = getCategoryGradient(app.categories);

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
				prepareInstallButton(pluginInstallBtn, app);
				(function(p, a, g) {
					pluginInstallBtn.addEventListener('click', function(e) {
						e.stopPropagation();
						if (!isPlayground && a._source !== 'wp.org') {
							openPluginDetail(p, a, { autoOpenInstallInfo: true });
							return;
						}
						installPluginApp(a, g, e.currentTarget);
					});
				})(path, app, gradient);
				actionsEl.appendChild(pluginInstallBtn);
			} else if (isPlayground) {
				var installBtn = document.createElement('button');
				installBtn.type = 'button';
				installBtn.className = 'app-store-install-btn';
				prepareInstallButton(installBtn, app);
				(function(a, bUrl, g) {
					installBtn.addEventListener('click', function(e) {
						e.stopPropagation();
						installBlueprintInPlayground(a, bUrl, g, e.currentTarget);
					});
				})(app, blueprintUrl, gradient);
				actionsEl.appendChild(installBtn);
			} else {
				var hostedInstallBtn = document.createElement('button');
				hostedInstallBtn.type = 'button';
				hostedInstallBtn.className = 'app-store-install-btn';
				prepareInstallButton(hostedInstallBtn, app);
				(function(p, a, bUrl, g) {
					hostedInstallBtn.addEventListener('click', function(e) {
						e.stopPropagation();
						openAppDetail(p, a, bUrl, g);
					});
				})(path, app, blueprintUrl, gradient);
				actionsEl.appendChild(hostedInstallBtn);
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
						openPluginDetail(p, a, { autoOpenInstallInfo: true });
					} else {
						openAppDetail(p, a, bUrl, g);
					}
				};
				titleEl.addEventListener('click', openDetail);
				iconEl.addEventListener('click', openDetail);
			})(path, app, blueprintUrl, gradient);

			listEl.appendChild(itemEl);
		});

		matchingRecipeKeys.forEach(function(recipeKey) {
			var recipeItem = buildRecipeSearchItem(recipeKey);
			if (!recipeItem) return;
			hasResults = true;
			listEl.appendChild(recipeItem);
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
			footerLink.href = getPluginInstallUrl();
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
			emptyEl.textContent = search ? 'No results found.' : 'No apps found.';
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

	function recipeSearchHaystack(recipe, key) {
		if (!recipe) return '';

		var stepText = '';
		(recipe.steps || []).forEach(function(step) {
			if (!step) return;
			stepText += ' ' + [
				step.title,
				step.description,
				step.type,
				step.path,
				step.slug,
				step.repo,
				step.url
			].filter(Boolean).join(' ');
		});

		return [
			key,
			recipe.title,
			recipe.tagline,
			recipe.description,
			recipe.learn_more,
			stepText
		].filter(Boolean).join(' ').toLowerCase();
	}

	function getMatchingRecipeKeys(search) {
		if (!search || !hasRecipes) return [];

		return Object.keys(recipes)
			.filter(function(key) {
				return recipeSearchHaystack(recipes[key], key).indexOf(search) !== -1;
			})
			.sort(function(a, b) {
				return (recipes[a].title || '').localeCompare(recipes[b].title || '', undefined, { sensitivity: 'base' });
			});
	}

	function buildRecipeSearchItem(recipeKey) {
		var recipe = recipes[recipeKey];
		if (!recipe) return null;

		var itemEl = document.createElement('div');
		itemEl.className = 'app-store-item app-store-item-recipe';

		var iconEl = document.createElement('div');
		iconEl.className = 'app-store-icon app-store-icon-link';
		iconEl.style.background = recipe.gradient || defaultGradient;
		if (recipe.icon) {
			iconEl.textContent = recipe.icon;
			iconEl.style.fontSize = '24px';
			iconEl.style.lineHeight = '1';
		} else {
			iconEl.innerHTML = WP_ICON_SVG;
		}

		var infoEl = document.createElement('div');
		infoEl.className = 'app-store-info';

		var categoryEl = document.createElement('div');
		categoryEl.className = 'app-store-category';
		categoryEl.textContent = 'Recipe';
		infoEl.appendChild(categoryEl);

		var titleEl = document.createElement('div');
		titleEl.className = 'app-store-title app-store-title-link';
		titleEl.textContent = recipe.title;
		infoEl.appendChild(titleEl);

		var descEl = document.createElement('div');
		descEl.className = 'app-store-description';
		descEl.textContent = recipe.tagline || recipe.description || '';
		infoEl.appendChild(descEl);

		var stepCount = (recipe.steps && recipe.steps.length) || 0;
		var metaEl = document.createElement('div');
		metaEl.className = 'app-store-meta';
		var badgeEl = document.createElement('span');
		badgeEl.className = 'app-store-badge';
		badgeEl.textContent = stepCount + ' step' + (stepCount === 1 ? '' : 's');
		metaEl.appendChild(badgeEl);
		infoEl.appendChild(metaEl);

		var actionsEl = document.createElement('div');
		actionsEl.className = 'app-store-actions';
		var viewBtn = document.createElement('button');
		viewBtn.type = 'button';
		viewBtn.className = 'app-store-install-btn';
		viewBtn.textContent = 'View';
		actionsEl.appendChild(viewBtn);

		var openRecipe = function(e) {
			e.stopPropagation();
			selectRecipe(recipeKey);
		};
		titleEl.addEventListener('click', openRecipe);
		iconEl.addEventListener('click', openRecipe);
		viewBtn.addEventListener('click', openRecipe);

		itemEl.appendChild(iconEl);
		itemEl.appendChild(infoEl);
		itemEl.appendChild(actionsEl);

		return itemEl;
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
			failedEl.textContent = 'Recipes are unavailable right now. Try Apps instead.';
			appStoreContent.appendChild(failedEl);
			return;
		}

		var grid = document.createElement('div');
		grid.className = 'recipe-grid';

		var hasResults = false;
		Object.keys(recipes).forEach(function(key) {
			var r = recipes[key];
			if (search) {
				if (recipeSearchHaystack(r, key).indexOf(search) === -1) return;
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
		app._path = path;
		var isPluginEntry = app._type === 'plugin';
		var blueprintUrl = isPluginEntry ? '' : getBlueprintUrl(path);

		var gradient = getCategoryGradient(app.categories);

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
			prepareInstallButton(pluginBtn, app);
			(function(p, a, g) {
				pluginBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					if (!isPlayground && a._source !== 'wp.org') {
						openPluginDetail(p, a);
						return;
					}
					installPluginApp(a, g, e.currentTarget);
				});
			})(path, app, gradient);
			actions.appendChild(pluginBtn);
		} else if (isPlayground) {
			var installBtn = document.createElement('button');
			installBtn.type = 'button';
			installBtn.className = 'app-store-install-btn';
			prepareInstallButton(installBtn, app);
			(function(a, bUrl, g) {
				installBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					installBlueprintInPlayground(a, bUrl, g, e.currentTarget);
				});
			})(app, blueprintUrl, gradient);
			actions.appendChild(installBtn);
		} else {
			var hostedInstallBtn = document.createElement('button');
			hostedInstallBtn.type = 'button';
			hostedInstallBtn.className = 'app-store-install-btn';
			prepareInstallButton(hostedInstallBtn, app);
			(function(p, a, bUrl, g) {
				hostedInstallBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					openAppDetail(p, a, bUrl, g);
				});
			})(path, app, blueprintUrl, gradient);
			actions.appendChild(hostedInstallBtn);
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

	function openPluginDetail(pluginPath, plugin, options) {
		var url = new URL(window.location);
		url.searchParams.set('plugin', pluginPath);
		history.pushState({ pluginDetail: pluginPath }, '', url.toString());
		renderPluginDetail(pluginPath, plugin, options);
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

	function renderPluginDetail(pluginPath, plugin, options) {
		options = options || {};
		plugin._path = pluginPath;
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

		var gradient = getCategoryGradient(plugin.categories);

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

		var pluginInstallInfoEl = document.createElement('div');
		pluginInstallInfoEl.className = 'app-store-blueprint-info';

		var installBtn = document.createElement('button');
		installBtn.type = 'button';
		installBtn.className = 'app-store-install-btn app-detail-install-btn';
		prepareInstallButton(installBtn, plugin);
		installBtn.addEventListener('click', function() {
			installPluginApp(plugin, gradient, installBtn, pluginInstallInfoEl);
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
		detail.appendChild(pluginInstallInfoEl);

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
		} else if (plugin._source === 'url' && plugin._url) {
			sourceUrl = plugin._url;
			try {
				var parsedUrl = new URL(plugin._url);
				sourceLabel = parsedUrl.hostname + parsedUrl.pathname;
			} catch (e) {
				sourceLabel = plugin._url;
			}
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

		if (options.autoOpenInstallInfo && !isPlayground && plugin._source !== 'wp.org') {
			showManualPluginInstall(plugin, pluginInstallInfoEl, installBtn);
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
		app._path = appPath;
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
			prepareInstallButton(installBtn, app);
			installBtn.addEventListener('click', function() {
				installBlueprintInPlayground(app, blueprintUrl, gradient, installBtn);
			});
		} else {
			installBtn = document.createElement('button');
			installBtn.type = 'button';
			installBtn.className = 'app-store-install-btn app-detail-install-btn';
			prepareInstallButton(installBtn, app);
			installBtn.addEventListener('click', function() {
				installBlueprintOnHost(app, blueprintUrl, gradient, blueprintInfoEl, installBtn);
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
				if (blueprint && blueprint.launcher_url) {
					app._launcherUrl = blueprint.launcher_url;
					if (!installBtn.disabled) {
						prepareInstallButton(installBtn, app, blueprint);
					}
				}

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
			var gradient = getCategoryGradient(app.categories);
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
		if (url.searchParams.has('app-store')) {
			if (routeRequestsRecipes(url)) {
				activeCategory = '__recipes__';
				activeRecipe = null;
			}
			openInstallSoftwareModal();
			return;
		}
		var addParam = url.searchParams.get('add');
		if (addParam === 'recipes') {
			openRecipesRoute(true);
			return;
		}
		if (addParam === 'web-link' || addParam === 'admin-link' || addParam === 'apps') {
			openInstallSoftwareModal();
			showAppStoreView(addParam);
			url.searchParams.delete('add');
			history.replaceState({}, '', url.toString());
			return;
		}
		if (routeRequestsRecipes(url)) {
			openRecipesRoute(true);
			return;
		}
		var recipeParam = url.searchParams.get('recipe');
		var appParam = url.searchParams.get('app');
		var pluginParam = url.searchParams.get('plugin');

		// Recipes load async, so we can't validate recipeParam against the
		// recipes map here. Stash it; loadAppStore will resolve it once
		// the recipes fetch settles. App/plugin deep-links without a
		// recipe context land in the regular app list (back → Apps).
		if (recipeParam) {
			pendingRecipe = recipeParam;
			activeCategory = '__recipes__';
		} else if (appParam || pluginParam) {
			activeCategory = DEFAULT_APP_STORE_CATEGORY;
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

	exposePublicApi();

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
