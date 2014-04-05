/**
 * Frontend JavaScript
 *
 * @package node-aquastreamxt
 * @author Alexander Dick <alex@dick.at>
 */

jQuery(function() {

	/**
	 * Register Handlebars Helpers
	 */
	for(var h in Helper.Handlebars)
		Handlebars.registerHelper(h, Helper.Handlebars[h]);


	/**
	 * Pump data and info tables
	 */
    var pumpDataTemplate =
        '<h3>Current values</h3>\
        <table class="table table-condensed">\
	        <tr><th>Frequency</th><td>{{frequency}} Hz</td></tr>\
	        <tr><th>Max. Frequency</th><td>{{frequencyMax}} Hz</td></tr>\
	        <tr><th>Power Consumption</th><td>{{pumpCurrent}} mA</td></tr>\
            <tr><th>Power</th><td>{{round pumpPower}} W</td></tr>\
            <tr><th>Voltage</th><td>{{round voltage}} V</td></tr>\
        </table>';

    pumpDataTemplate = Handlebars.compile(pumpDataTemplate);

    var pumpInfoTemplate =
        '<h3>Hardware</h3>\
        <table class="table table-condensed">\
	        <tr><th>Pump Mode</th><td>{{pumpMode mode}}</td></tr>\
            <tr><th>Firmware</th><td>{{hardware.firmware}}</td></tr>\
	        <tr><th>Hardware</th><td>{{hardware.hardware}}</td></tr>\
	        <tr><th>Serial</th><td>{{hardware.serial}}</td></tr>\
	        <tr><th>Public Key</th><td>{{join hardware.publicKey}}</td></tr>\
        </table>';


    pumpInfoTemplate = Handlebars.compile(pumpInfoTemplate);
    var pumpInfoHtml = pumpInfoTemplate(pumpData);
    jQuery('#pump-info').html(pumpInfoHtml);

	var pumpSettingsTemplate =
		'<h3>Settings</h3>\
		<table class="table table-condensed">\
			<tr><th>Frequency mode</th><td>{{frequencyMode pumpMode}}</td></tr>\
			<tr><th>Deaeration mode</th><td>{{deaerationMode pumpMode}}</td></tr>\
		</table>';


	pumpSettingsTemplate = Handlebars.compile(pumpSettingsTemplate);
	var pumpSettingsHtml = pumpSettingsTemplate(pumpSettings);
	jQuery('#pump-settings').html(pumpSettingsHtml);


	/**
	 * Save Flow Sensor settings on change
	 */
	jQuery('#impulses-per-liter').on('change', function() {
		jQuery.post('/config', {
			key: 'aquastreamXt:flowSensor:impulsesPerLiter',
			value: this.value
		}, function(conf) {
			// overwrite config with updated values
			window.config = conf;
		}, 'json');
	});
	jQuery('#measuring-impulses').on('change', function() {
		jQuery.post('/config', {
			key: 'aquastreamXt:flowSensor:measuringImpulses',
			value: this.value
		}, function(conf) {
			// overwrite config with updated values
			window.config = conf;
		}, 'json');
	});


	/**
	 * Initialize charts
	 */
	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});

	var chart = new Highcharts.Chart({
		chart: {
			renderTo: 'chart',
			type: 'area',
			marginRight: 0
		},
		title: {
			text: ''
		},
		xAxis: {
			type: 'datetime',
			tickPixelInterval: 200,
			tickmarkPlacement: 'on',
			title: {
				text: 'Time'
			}
		},
		yAxis: {
			title: {
				text: ''
			}
		},
		tooltip: {
			formatter: function() {
				return '<b>'+ this.series.name +'</b><br/>'+
					Highcharts.dateFormat('%d.%m.%Y %H:%M:%S', this.x) +'<br/>'+
					Highcharts.numberFormat(this.y, 1);
			}
		},

		exporting: {
			enabled: false
		},
		plotOptions: {
			area: {
				lineWidth : 1,
				lineColor: '#666666',
				marker: {
					enabled: true,
					symbol: 'circle',
					radius: 2,
					states: {
						hover: {
							enabled: true
						}
					}
				}
			}
		},

		series: [{
		    name: 'Flow',
			type: 'area',
			data: [{x: new Date().getTime(), y: 0}],
			color: '#b3c58d',
			fillColor : {
			    linearGradient : [0, 0, 0, 300],
				stops : [
					[0, 'rgba(137,165,78,.5)'],
					[1, 'rgba(137,165,78,1)']
				]
			}
		}, {
			name: 'Water Temperature',
			type: 'area',
			data: [{x: new Date().getTime(), y: 0}],
			color: '#948ddf',
			fillColor : {
				linearGradient: [0, 0, 0, 300],
				stops : [
					[0, 'rgba(146,146,235,.5)'],
					[1, 'rgba(146,146,235,1)']
				]
			}
		}]
	});

	/**
	 * Update charts and controls periodically
	 */
	var socket              = io.connect();
	var maxPointsPerSeries  = (config.ui.chart.period / (config.ui.updateInterval / 1000)) * config.ui.chart.period;
	var numSeries           = chart.series.length;

	var updateUi            = function(data) {

		// Remove points older than config.ui.chart.period
		var numPoints = chart.series[0].points.length - 1;
		if(numPoints == maxPointsPerSeries) {
			for(var i = 0; i < numSeries; i++)
				chart.series[i].points.shift().remove();
		}

		// Add new points
		var time = new Date().getTime();

		var flow = data.current.flow;
        if(flow) {
	        flow = Helper.convert.flow(
		        flow,
		        config.aquastreamXt.flowSensor.impulsesPerLiter,
		        config.aquastreamXt.flowSensor.measuringImpulses
	        );
            flow = Helper.round(flow, 1);
		    var flowPlot = [time, flow];
		    chart.series[0].addPoint(flowPlot, true, false);
        }

		var waterTemp       = Helper.round(data.current.temperature.water, 1);
		var waterTempPlot   = [time, waterTemp];
		chart.series[1].addPoint(waterTempPlot, true, false);

	    // Update data table with current data
        var pumpDataHtml = pumpDataTemplate(data.current);
        jQuery('#pump-data').html(pumpDataHtml);
	};

	// Initial update with current pumpData assigned in layout.jade
	updateUi(pumpData);

	// Periodical update through server
	socket.on('getData', updateUi);
});