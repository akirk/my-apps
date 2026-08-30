/**
 * Remote version checks for plugins installed from GitHub.
 *
 * Plugins that Playground installs from a `git:directory` resource carry no
 * update information: WordPress only knows about wordpress.org plugins. The
 * sibling repositories publish a `dist/<branch>` branch whose main plugin
 * file has its `Version:` header stamped with the source commit
 * (`1.1.1+0484e32e3915`), so fetching that one file straight from
 * raw.githubusercontent.com and comparing headers tells us whether the
 * installed copy is behind the branch the blueprint installs from. Repos
 * without the stamp still work: a bumped version number is detected, the
 * commits in between are not.
 *
 * This file is deliberately free of launcher state. It exposes
 * `window.MyAppsUpdates` and launcher.js decides what to do with the results.
 */
(function() {
	'use strict';

	var RAW_BASE_URL = 'https://raw.githubusercontent.com/';
	var CACHE_STORAGE_KEY = 'my_apps_remote_versions';
	var CACHE_TTL = 5 * 60 * 1000;
	var AUTO_UPDATE_STORAGE_KEY = 'my_apps_auto_update_attempt';

	var memoryCache = {};
	var pending = {};

	function readStorage(key) {
		try {
			var raw = window.sessionStorage.getItem(key);
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			return null;
		}
	}

	function writeStorage(key, value) {
		try {
			if (value === null) {
				window.sessionStorage.removeItem(key);
			} else {
				window.sessionStorage.setItem(key, JSON.stringify(value));
			}
		} catch (e) {}
	}

	function storedCache() {
		var stored = readStorage(CACHE_STORAGE_KEY);
		return stored && typeof stored === 'object' ? stored : {};
	}

	function normalizeVersion(version) {
		return String(version || '').trim();
	}

	/**
	 * Parse the `Version:` file header out of a plugin's main file.
	 *
	 * Mirrors get_file_data(): the header sits in the first 8 KB and ends at
	 * the line break; a trailing comment terminator is stripped.
	 */
	function pluginHeaderVersion(text) {
		var head = String(text || '').slice(0, 8192).replace(/\r/g, '\n');
		var match = head.match(/^[ \t\/*#@]*Version:(.*)$/mi);
		if (!match) return '';
		return normalizeVersion(match[1].replace(/\s*(?:\*\/|\?>).*/, ''));
	}

	function githubRepoFromUrl(url) {
		var match = String(url || '').match(/^https?:\/\/github\.com\/([^\/?#]+)\/([^\/?#]+?)(?:\.git)?(?:[\/?#]|$)/i);
		return match ? match[1] + '/' + match[2] : '';
	}

	/**
	 * The path segment raw.githubusercontent.com expects for a git ref.
	 *
	 * Branch names may contain slashes (`dist/main`); spelling the ref out as
	 * `refs/heads/...` keeps that unambiguous. A bare `HEAD` is accepted too.
	 */
	function rawRefPath(ref, refType) {
		ref = String(ref || 'HEAD').replace(/^\/+|\/+$/g, '');
		if (!ref || ref === 'HEAD') return 'HEAD';
		if (/^refs\//.test(ref)) return ref;
		if (refType === 'branch') return 'refs/heads/' + ref;
		if (refType === 'tag') return 'refs/tags/' + ref;
		return ref;
	}

	/**
	 * URL of `file` inside a git:directory resource, or '' when the resource
	 * is not a GitHub checkout we can read.
	 */
	function rawFileUrl(resource, file) {
		var repo = resource && resource.resource === 'git:directory' ? githubRepoFromUrl(resource.url) : '';
		var dir = resource && resource.path ? String(resource.path).replace(/^\/+|\/+$/g, '') : '';
		if (!repo || !file) return '';
		return RAW_BASE_URL + repo + '/' + rawRefPath(resource.ref, resource.refType) + '/' + (dir ? dir + '/' : '') + file;
	}

	/**
	 * Basename of the main plugin file WordPress recorded for a plugin,
	 * e.g. `ai-assistant/ai-assistant.php` -> `ai-assistant.php`.
	 */
	function pluginMainFile(installed) {
		var file = installed && installed.plugin ? String(installed.plugin) : '';
		var slash = file.lastIndexOf('/');
		return slash === -1 ? file : file.slice(slash + 1);
	}

	function cacheKey(url, installedVersion) {
		return url + '#' + normalizeVersion(installedVersion);
	}

	function cachedResult(url, installedVersion) {
		var key = cacheKey(url, installedVersion);
		var entry = memoryCache[key] || storedCache()[key];
		if (!entry || !entry.checkedAt || Date.now() - entry.checkedAt > CACHE_TTL) {
			return null;
		}
		memoryCache[key] = entry;
		return entry;
	}

	function rememberResult(url, installedVersion, result) {
		var key = cacheKey(url, installedVersion);
		var stored = storedCache();
		result.checkedAt = Date.now();
		memoryCache[key] = result;
		stored[key] = result;
		Object.keys(stored).forEach(function(otherKey) {
			if (!stored[otherKey] || Date.now() - stored[otherKey].checkedAt > CACHE_TTL) {
				delete stored[otherKey];
			}
		});
		writeStorage(CACHE_STORAGE_KEY, stored);
	}

	function buildResult(status, installedVersion, remoteVersion, url) {
		return {
			status: status,
			installedVersion: normalizeVersion(installedVersion),
			remoteVersion: normalizeVersion(remoteVersion),
			url: url || ''
		};
	}

	function fetchRemoteVersion(url) {
		return fetch(url, { cache: 'no-cache' }).then(function(response) {
			if (!response.ok) {
				throw new Error('HTTP ' + response.status);
			}
			return response.text();
		}).then(pluginHeaderVersion);
	}

	/**
	 * Compare an installed plugin against the file the resource points at.
	 *
	 * Resolves to `{ status, installedVersion, remoteVersion, url }` where
	 * status is `update` (headers differ), `current` (identical) or
	 * `unknown` (nothing to compare: not installed, not on GitHub, fetch
	 * failed, or the remote file has no Version header). Never rejects.
	 */
	function checkPlugin(resource, installed) {
		var installedVersion = installed && installed.version ? installed.version : '';
		var url = rawFileUrl(resource, pluginMainFile(installed));
		var cached;

		if (!url || !installedVersion) {
			return Promise.resolve(buildResult('unknown', installedVersion, '', url));
		}

		cached = cachedResult(url, installedVersion);
		if (cached) {
			return Promise.resolve(cached);
		}
		if (pending[url]) {
			return pending[url];
		}

		pending[url] = fetchRemoteVersion(url).then(function(remoteVersion) {
			var status = !remoteVersion
				? 'unknown'
				: (normalizeVersion(remoteVersion) === normalizeVersion(installedVersion) ? 'current' : 'update');
			var result = buildResult(status, installedVersion, remoteVersion, url);
			rememberResult(url, installedVersion, result);
			return result;
		}).catch(function() {
			return buildResult('unknown', installedVersion, '', url);
		}).then(function(result) {
			delete pending[url];
			return result;
		});

		return pending[url];
	}

	/**
	 * Version check the git:directory installPlugin steps of a blueprint.
	 *
	 * `installedPlugins` is keyed by plugin directory slug, as exposed in
	 * myAppsConfig.installedPlugins. `slugForStep(step)` maps a step to that
	 * slug. Resolves to `{ slug: result }` for every step that could be
	 * mapped to an installed plugin.
	 */
	function checkBlueprint(blueprint, installedPlugins, slugForStep) {
		var checks = {};
		var steps = blueprint && Array.isArray(blueprint.steps) ? blueprint.steps : [];

		steps.forEach(function(step) {
			var resource = step && step.step === 'installPlugin' ? step.pluginData : null;
			var slug = resource && resource.resource === 'git:directory' ? slugForStep(step) : '';
			if (!slug || checks[slug] || !installedPlugins || !installedPlugins[slug]) return;
			checks[slug] = checkPlugin(resource, installedPlugins[slug]);
		});

		var slugs = Object.keys(checks);
		return Promise.all(slugs.map(function(slug) {
			return checks[slug];
		})).then(function(results) {
			var bySlug = {};
			slugs.forEach(function(slug, index) {
				bySlug[slug] = results[index];
			});
			return bySlug;
		});
	}

	/**
	 * Record one automatic update attempt per set of target versions.
	 *
	 * Returns true the first time a given set is seen in this tab. When the
	 * update fails, or succeeds without changing the installed versions, the
	 * next page load finds the same set and skips it instead of retrying
	 * forever. A newer set of versions is attempted again.
	 */
	function claimAutoUpdate(targets) {
		var signature = JSON.stringify(targets || {});
		if (!signature || signature === '{}') return false;
		if (readStorage(AUTO_UPDATE_STORAGE_KEY) === signature) return false;
		writeStorage(AUTO_UPDATE_STORAGE_KEY, signature);
		return true;
	}

	function forgetAutoUpdateAttempt() {
		writeStorage(AUTO_UPDATE_STORAGE_KEY, null);
	}

	function clearCache() {
		memoryCache = {};
		writeStorage(CACHE_STORAGE_KEY, null);
	}

	window.MyAppsUpdates = {
		pluginHeaderVersion: pluginHeaderVersion,
		rawFileUrl: rawFileUrl,
		pluginMainFile: pluginMainFile,
		checkPlugin: checkPlugin,
		checkBlueprint: checkBlueprint,
		claimAutoUpdate: claimAutoUpdate,
		forgetAutoUpdateAttempt: forgetAutoUpdateAttempt,
		clearCache: clearCache
	};
})();
