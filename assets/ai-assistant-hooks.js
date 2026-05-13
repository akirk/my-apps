(function() {
	'use strict';

	function reloadBackgroundFromToolCall(context) {
		if (window.MyApps && typeof window.MyApps.reloadBackground === 'function') {
			window.MyApps.reloadBackground(context);
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
			criteria: { ability: 'my-apps/set-background-color', success: true },
			callback: function(context) {
				reloadBackgroundFromToolCall(context);
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
