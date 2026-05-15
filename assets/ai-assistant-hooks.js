(function() {
	'use strict';

	function reloadBackgroundFromToolCall(context) {
		if (window.MyApps && typeof window.MyApps.reloadBackground === 'function') {
			window.MyApps.reloadBackground(context);
		}
	}

	function reloadAppsFromToolCall(context) {
		if (window.MyApps && typeof window.MyApps.reloadApps === 'function') {
			window.MyApps.reloadApps(context);
		}
	}

	var subscriptions = [
		{
			criteria: { ability: 'my-apps/set-background', success: true },
			callback: function(context) {
				reloadBackgroundFromToolCall(context);
			}
		},
		{
			criteria: { ability: 'my-apps/add-app', success: true },
			callback: function(context) {
				reloadAppsFromToolCall(context);
			}
		},
		{
			criteria: { ability: 'my-apps/set-app-icon', success: true },
			callback: function(context) {
				reloadAppsFromToolCall(context);
			}
		},
		{
			criteria: { ability: 'my-apps/set-app-details', success: true },
			callback: function(context) {
				reloadAppsFromToolCall(context);
			}
		},
		{
			criteria: { ability: 'my-apps/set-app-visibility', success: true },
			callback: function(context) {
				reloadAppsFromToolCall(context);
			}
		},
		{
			criteria: { ability: 'my-apps/set-visible-ordered', success: true },
			callback: function(context) {
				reloadAppsFromToolCall(context);
			}
		}
	];

	subscriptions.forEach(function(subscription) {
		if (window.aiAssistant && typeof window.aiAssistant.onToolCall === 'function') {
			window.aiAssistant.onToolCall(subscription.criteria, subscription.callback);
		} else {
			window.aiAssistantToolCallbacks = window.aiAssistantToolCallbacks || [];
			window.aiAssistantToolCallbacks.push(subscription);
		}
	});
})();
