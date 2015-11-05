/////////////////////////////////////////////////////////////////////////////////////////////////////
// Web Notifications HTML API Wrapper
// by Jose M. Alarcon - www.campusmvp.com - 2014-2015
// Open Source - Mit License - Do not remove this
//                                       __  ____      _______          
//                                     |  \/  \ \    / /  __ \         
//   ___ __ _ _ __ ___  _ __  _   _ ___| \  / |\ \  / /| |__) |__  ___ 
//  / __/ _` | '_ ` _ \| '_ \| | | / __| |\/| | \ \/ / |  ___/ _ \/ __|
// | (_| (_| | | | | | | |_) | |_| \__ \ |  | |  \  /  | |_ |  __/\__ \
//  \___\__,_|_| |_| |_| .__/ \__,_|___/_|  |_|   \/   |_(_) \___||___/
//                     | |                                             
//                     |_|                                             
//
/////////////////////////////////////////////////////////////////////////////////////////////////////

(function (modName, definition) {
	if (typeof define === "function" && define.amd)
		define(modName, definition);
	else
		this[modName] = definition();
})('WebNotifications', function(){

	// Permission values
	var _WEBNOTIF_PERMISSION_DEFAULT = 0;
	var _WEBNOTIF_PERMISSION_DENIED = 1;
	var _WEBNOTIF_PERMISSION_GRANTED = 2;

	//Returns current browser's Notification object. Base of all notifications. We encapsulate it here so it's easy to add alternative objects in browsers that don't support the standard.
	var __getNotificationSingleton = function() {
		return window.Notification;
	};

	//Returns true if the web notifications API is supported
	var _getWebNotificationsSupported = function() {
		return (!!__getNotificationSingleton());
	};

	//Returns a constant depending on current notification status
	//It's better than having to compare a string that may change in the future
	var _getWebNotificationPermissionStatus = function() {
		return __translateWebNotificationPermissionStatus(__getNotificationSingleton().permission);
	};

	//Trnaslate one of the defined strings for notification permission status into one of our constants
	var __translateWebNotificationPermissionStatus = function(status) {
		switch (status) {
			case "granted":
				return _WEBNOTIF_PERMISSION_GRANTED;
			case "denied":
				return _WEBNOTIF_PERMISSION_DENIED;
			default:
				return _WEBNOTIF_PERMISSION_DEFAULT;
		}
	};

	//Ask the user for permission to show notifications if needed
	//It will only work if it's called because of an user's action (eg: clicking a button. It will not work in the onload event)
	var _askForWebNotificationPermissions = function() {
		if (_getWebNotificationsSupported()) {
			var notif = __getNotificationSingleton();
			notif.requestPermission();
		}
		else {
			console.error('Web Notifications not supported in this browser!');
		}
	};

	/* Creates a new Notification object
	By default uses the standard one, but it would be possible to use a different one in browsers
	that don't support this feature */
	var __newNotificationObject = function(title, options) {
		return new Notification(title, options);
	};
	
	//Creates a new notification
	//Only title and msg are mandatory
	//icon: the icon to show along with the notification
	//tag: an unique tag to prevent showing messages about the same issue more than once
	//timeout: auto-close the notification
	var _createNewWebNotification = function(title, msg, icon, tag, timeout) {
		var options = { body: msg };
		if (icon)
			options.icon = icon;
		if (tag)
			options.tag = tag;

		//Show the notification
		var notif =  __newNotificationObject(title, options);

		//Autohide notification if specified
		if (timeout && typeof (timeout) == "number")
			setTimeout(__closeNotification, timeout, notif);

		return notif;
	};

	//Shows a web notification with the specified parameters and returns a reference to the current notification
	//Only title and message are mandatory parameters.
	//It's a kind of "fire and forget" way to show notifications
	//If there's no permission it will try to ask for it (that will only work if this is fired from an user action, like clicking a button)
	var _showWebNotification = function(title, msg, icon, tag, timeout){
	  if (_getWebNotificationsSupported())
	  {
		switch (_getWebNotificationPermissionStatus()) {
			case _WEBNOTIF_PERMISSION_GRANTED:	//Simply show the notification
				_createNewWebNotification(title, msg, icon, tag, timeout);
				break;
			case _WEBNOTIF_PERMISSION_DENIED, _WEBNOTIF_PERMISSION_DEFAULT:
				//if we don't have permission, then ask for it and later show the notification if granted (no reference returned)
				var notifS = __getNotificationSingleton();
				notifS.requestPermission( function(status) {
					if (__translateWebNotificationPermissionStatus(status) == _WEBNOTIF_PERMISSION_GRANTED)
						_createNewWebNotification(title, msg, icon, tag, timeout);
				});
				break;
		}
	  }
	};

	//Closes a notification
	var __closeNotification = function (notif) {
		notif.close();
	};

	//Return the helper definition
	return {
		permissions: {
			'default': _WEBNOTIF_PERMISSION_DEFAULT,
			'denied': _WEBNOTIF_PERMISSION_DENIED,
			'granted': _WEBNOTIF_PERMISSION_GRANTED
		},
		areSupported: _getWebNotificationsSupported,
		currentPermission: _getWebNotificationPermissionStatus,
		askForPermission: _askForWebNotificationPermissions,
		'new':  _createNewWebNotification,
		fire: _showWebNotification
	};
});