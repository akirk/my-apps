(function() {
	'use strict';

	var subscriptions = [
		{
			criteria: { ability: 'my-apps/set-background', success: true },
			callback: function(context) {
				if (window.MyApps && typeof window.MyApps.reloadBackground === 'function') {
					window.MyApps.reloadBackground(context && context.result);
				}
			}
		},
		{
			criteria: { ability: 'my-apps/set-background-color', success: true },
			callback: function(context) {
				if (window.MyApps && typeof window.MyApps.reloadBackground === 'function') {
					window.MyApps.reloadBackground(context && context.result);
				}
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
