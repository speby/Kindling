kindling.module(function () {
	'use strict';

	var OPTIONS = [
		'enterRoom',
		'leaveRoom',
		'timeStamps',
		'notifications',
		'highlightName',
		'showAvatarsInNotifications',
		'disableNotificationsWhenInFocus',
		'autoDismiss',
		'filterNotifications',
		'soundAndEmojiMenus',
		'showAvatarsInChat',
		'useDifferentTheme'
	];

	function getMessages() {
		document.title = chrome.i18n.getMessage('options');
		$('.cb-enable > span').html(chrome.i18n.getMessage('on'));
		$('.cb-disable > span').html(chrome.i18n.getMessage('off'));

		$('#notificationsTitle').html(chrome.i18n.getMessage('notificationsTitle'));
		$('#messagesTitle').html(chrome.i18n.getMessage('messagesTitle'));
		$('#otherTitle').html(chrome.i18n.getMessage('otherTitle'));
		$('label[for="notificationTimeout"]').html(chrome.i18n.getMessage('notificationTimeout'));

		var i;
		for (i = 0; i < OPTIONS.length; i += 1) {
			$('.description[for="' + OPTIONS[i] + '"]').html(chrome.i18n.getMessage(OPTIONS[i]));
		}
	}

	function onOptionChanged() {
		chrome.extension.sendRequest({ type: 'optionsChanged' });
	}

	function onCheckChange($parent, value) {
		if (value) {
			$parent.find('.cb-disable').removeClass('selected');
			$parent.find('.cb-enable').addClass('selected');
		} else {
			$parent.find('.cb-enable').removeClass('selected');
			$parent.find('.cb-disable').addClass('selected');
		}

		if ($parent[0].id === 'notifications' && value !== (localStorage.notifications === 'true')) {
			$('#disableNotificationsWhenInFocus,#filterNotifications,#showAvatarsInNotifications,#dismissDiv').slideToggle(500, 'easeInOutExpo');
		} else if ($parent[0].id === 'autoDismiss' && value !== (localStorage.autoDismiss === 'true')) {
			$('#timeoutDiv').slideToggle(500, 'easeInOutExpo');
		} else if ($parent[0].id === 'useDifferentTheme' && value !== (localStorage.useDifferentTheme === 'true')) {
			$('#themeColor').slideToggle(500, 'easeInOutExpo');
		}
	}

	function saveOption(id, value) {
		localStorage[id] = value;
		onOptionChanged();
	}

	function onCheckClick(sender, value) {
		var $parent = $(sender).parents('.switch:first');
		onCheckChange($parent, value);
		saveOption($parent[0].id, value);
	}

	function onNotificationTimeoutChanged() {
		var slider = document.getElementById('notificationTimeout');
		var $tooltip = $('#rangeTooltip');
		$tooltip.html((slider.value / 1000) + ' ' + chrome.i18n.getMessage('seconds'));
		$tooltip.css('left', ((slider.value / (slider.max - slider.min)) * $(slider).width()) - ($tooltip.width() / 1.75));

		localStorage[slider.id] = slider.value;
		onOptionChanged();
	}

	function onThemeColorChanged() {
		localStorage.themeColor = $('#themeColor input:checked').attr('title');
		onOptionChanged();
	}

	function onToggle(e) {
		var option = $(e.currentTarget).attr('for');
		var value = localStorage[option];
		onCheckClick(e.currentTarget, value === 'true' ? false : true);
	}

	function initOptions() {
		var i;
		for (i = 0; i < OPTIONS.length; i += 1) {
			var savedValue = localStorage[OPTIONS[i]];
			var checked = savedValue === undefined || (savedValue === 'true');
			onCheckChange($(document.getElementById(OPTIONS[i])), checked);
		}

		$('#themeColor input[title=' + localStorage.themeColor + ']').attr('checked', true);

		var notificationTimeoutSlider = document.getElementById('notificationTimeout');
		notificationTimeoutSlider.value = localStorage.notificationTimeout;
		onNotificationTimeoutChanged();

		if (localStorage.notifications === 'false') {
		    $('#disableNotificationsWhenInFocus,#filterNotifications,#showAvatarsInNotifications,#dismissDiv').hide();
		}
		if (localStorage.autoDismiss === 'false') {
			$('#timeoutDiv').hide();
		}
		if (localStorage.useDifferentTheme === 'false') {
			$('#themeColor').hide();
		}
	}

	return {
		init: function () {
			getMessages();

			$('.cb-enable').click(function () {
				onCheckClick(this, true);
			});
			$('.cb-disable').click(function () {
				onCheckClick(this, false);
			});
			$('.description').click(onToggle);

			$('#notificationTimeout').change(onNotificationTimeoutChanged);

			$('#themeColor').change(onThemeColorChanged);

			initOptions();

			$('#coda-slider').codaSlider();
		}
	};
}());
