/*
 * Copyright (c) 2011.
 *
 * Author: oldj <oldj.wu@gmail.com>
 * Blog: http://oldj.net/
 *
 * Last Update: 2011/1/10 5:22:52
 */


// _TD.a.push begin
_TD.a.push(function (TD) {

	/**
	 * Event manager
	 */
	TD.eventManager = {
		ex: -1, // Event coordinates x
		ey: -1, // Event coordinates y
		_registers: {}, // Register the elements of the listen event

		// Currently supported event types
		ontypes: [
			"enter", // Mouse in
			"hover", // The mouse is on the element, which is equivalent to onmouseover
			"out", // Mouse out
			"click" // Mouse click
		],

		// Current event type
		current_type: "hover",

		/**
		 * Determine whether the event is on the element based on the event coordinates
		 * @param el {Element} Element element
		 * @return {Boolean}
		 */
		isOn: function (el) {
			return (this.ex != -1 &&
			this.ey != -1 &&
			this.ex > el.x &&
			this.ex < el.x2 &&
			this.ey > el.y &&
			this.ey < el.y2);
		},

		/**
		 * Generate a string identifier based on the element name and event name for registering event listeners
		 * @param el {Element}
		 * @param evt_type {String}
		 * @return evt_name {String} String identifier
		 */
		_mkElEvtName: function (el, evt_type) {
			return el.id + "::_evt_::" + evt_type;
		},

		/**
		 * Register event listeners for elements
		 * The current implementation is relatively simple. If an element is registered for multiple times for an event, the subsequent listener will overwrite the previous one.		 *
		 * @param el {Element}
		 * @param evt_type {String}
		 * @param f {Function}
		 */
		on: function (el, evt_type, f) {
			this._registers[this._mkElEvtName(el, evt_type)] = [el, evt_type, f];
		},

		/**
		 * Remove element listeners for specified events
		 * @param el {Element}
		 * @param evt_type {String}
		 */
		removeEventListener: function (el, evt_type) {
			var en = this._mkElEvtName(el, evt_type);
			delete this._registers[en];
		},

		/**
		 * Clear all listen events
		 */
		clear: function () {
			delete this._registers;
			this._registers = {};
			//this.elements = [];
		},

		/**
		 * Main loop method
		 */
		step: function () {
			if (!this.current_type) return; // No events are triggered

			var k, a, el, et, f,
			//en,
				j,
				_this = this,
				ontypes_len = this.ontypes.length,
				is_evt_on,
//				reg_length = 0,
				to_del_el = [];

			//var m = TD.stage.current_act.current_scene.map;
			//TD.log([m.is_hover, this.isOn(m)]);

			// Traversing the currently registered event
			for (k in this._registers) {
//				reg_length ++;
				if (!this._registers.hasOwnProperty(k)) continue;
				a = this._registers[k];
				el = a[0]; // The element corresponding to the event
				et = a[1]; // Event type
				f = a[2]; // Event handler
				if (!el.is_valid) {
					to_del_el.push(el);
					continue;
				}
				if (!el.is_visiable) continue; // Invisible elements do not respond to events

				is_evt_on = this.isOn(el); // Whether the event occurred on the element

				if (this.current_type != "click") {
					// enter / out / hover event

					if (et == "hover" && el.is_hover && is_evt_on) {
						// normal hover
						f();
						this.current_type = "hover";
					} else if (et == "enter" && !el.is_hover && is_evt_on) {
						// enter event
						el.is_hover = true;
						f();
						this.current_type = "enter";
					} else if (et == "out" && el.is_hover && !is_evt_on) {
						// out event
						el.is_hover = false;
						f();
						this.current_type = "out";
//					} else {
						// The event has nothing to do with the current element
//					continue;
					}

				} else {
					// click event
					//TD.log("click event: et = " + et + " is_evt_on = " + is_evt_on);
					if (is_evt_on && et == "click") f();
				}
			}

			// Delete events for the specified element list
			TD.lang.each(to_del_el, function (obj) {
				for (j = 0; j < ontypes_len; j++)
					_this.removeEventListener(obj, _this.ontypes[j]);
			});
//			TD.log(reg_length);
			this.current_type = "";
		},

		/**
		 * Mouse on element
		 * @param ex {Number}
		 * @param ey {Number}
		 */
		hover: function (ex, ey) {
			// Exit if there is still a click event unhandled, click event has a higher priority
			if (this.current_type == "click") return;

			this.current_type = "hover";
			this.ex = ex;
			this.ey = ey;
		},

		/**
		 * Click event
		 * @param ex {Number}
		 * @param ey {Number}
		 */
		click: function (ex, ey) {
			this.current_type = "click";
			this.ex = ex;
			this.ey = ey;
		}
	};

}); // _TD.a.push end

