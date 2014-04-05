/**
 * Helper functions
 *
 * @package node-aquastreamxt
 * @author Alexander Dick <alex@dick.at>
 */

var Helper = {

	round: function (number, decimals) {

		if (arguments.length == 1)
			return Math.round(number);

		var multiplier = Math.pow(10, decimals);
		return Math.round(number * multiplier) / multiplier;

	},

	format: {

		current: function (val) {
			return parseInt(val) + ' mA';
		},

		frequency: function (val) {
			return parseInt(val) + ' Hz';
		},

		power: function (val) {
			return Helper.round(val, 2) + ' W';
		},

		voltage: function (val) {
			return Helper.round(val, 2) + ' V';
		}

	},

	convert: {

		flow: function (rawFlow, impulsesPerLiter, measuringImpulses) {
			if (rawFlow >= 600000) {
				return 0;
			} else {
				var time = 46875 * 3600;
				var cal = (measuringImpulses / 2) / impulsesPerLiter;
				return time / (rawFlow / cal);
			}
		}

	},

	Handlebars: {
		round: function (val) {
			val = Handlebars.Utils.escapeExpression(val);
			return Helper.round(val, 2);
		},
		join: function (val) {
			return val.join(':');
		},
		pumpMode: function (mode) {

			if (mode.aquastreamModeUltra)
				return 'Ultra';

			if (mode.aquastreamModeAdvanced)
				return 'Advanced';

			return 'Standard';
		},
		frequencyMode: function (pumpMode) {
			return pumpMode.autoPumpMaxFrequency ? 'auto' : 'manual';
		},
		deaerationMode: function (pumpMode) {
			return pumpMode.deaeration ? 'on' : 'off';
		}
	}
};