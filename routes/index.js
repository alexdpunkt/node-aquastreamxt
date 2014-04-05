/**
 * Index / Main route
 *
 * @package node-aquastreamxt
 * @author Alexander Dick <alex@dick.at>
 */
exports.index = function (req, res) {

	/**
	 * Create an instance of the pump :-)
	 */
	var aquastream = new aquastreamApi.Aquastream(
		conf.get('aquastreamXt:vendorId'),
		conf.get('aquastreamXt:productId')
	);

	var report = conf.get('aquastreamXt:report');

	/**
	 * Emit pump data info periodically to our socket for displaying in frontend
	 */
	var emitDataTimeout;
	(function emitData() {
		aquastream.getReport(
			report.pumpDataTransfer,
			function (data) {
				io.sockets.emit('getData', data);
			}
		);
		emitDataTimeout = setTimeout(emitData, conf.get('ui:updateInterval'));
	})();

	/**
	 * Initialize sockets for data transfer
	 */
	io.sockets.on('connection', function (socket) {

		socket.on('getSettings', function (callback) {
			aquastream.getReport(
				report.settings,
				function (data) {
					callback(data);
				}
			);
		});

		socket.on('getData', function (callback) {
			aquastream.getReport(
				report.pumpDataTransfer,
				function (data) {
					callback(data);
				}
			);
		});

		/*
		socket.on('setSettings', function(settings) {
			var result = aquastream.setReport(
				report.settings,
				settings
			);
		});
		*/

		socket.on('disconnect', function (data) {
			clearTimeout(emitDataTimeout);
		});

	});

	/**
	 * Render page and assign pump settings and data for initial usage
	 */
	aquastream.getReport(report.settings, function (pumpSettings) {
		aquastream.getReport(report.pumpDataTransfer, function (pumpData) {
			aquastream.getDeviceInfo(function (deviceInfo) {
				res.render('index', {
					locals: {
						config: conf.get(),
						pumpSettings: pumpSettings,
						pumpData: pumpData,
						deviceInfo: deviceInfo
					},
					pretty: true
				});
			});
		});
	});

};