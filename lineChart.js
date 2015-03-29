var LineChart = function(config) {
	// Set the dimensions of the canvas / graph
	var config = config || {};
	var _config = {
		margin: {
			top: 30,
			right: 200,
			bottom: 30,
			left: 50
		},
		ticks: 10,
		targetElem: "body",
		width: 800,
		height: 240,
		dataset: []
	};

	for (var key in config) {
		if (typeof _config[key] !== 'undefined') {
			_config[key] = config[key];
		}
	}

	_config.width = _config.width - _config.margin.left - _config.margin.right;
	_config.height = _config.height - _config.margin.top - _config.margin.bottom;

	// Parse the date / time
	var parseDate = d3.time.format.iso.parse,
		formatDate = d3.time.format.iso, //d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ"),
		bisectDate = d3.bisector(function(d) {
			return d.date;
		}).left;
	// d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ");
	// Set the ranges
	var x = d3.time.scale().range([0, _config.width]);
	var y = d3.scale.linear().range([_config.height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
		.orient("bottom").ticks(_config.ticks);

	var yAxis = d3.svg.axis().scale(y)
		.orient("left").ticks(_config.ticks);

	// Define the line
	var valueline = d3.svg.line()
		.x(function(d) {
			return x(d.date);
		})
		.y(function(d) {
			return y(d.close);
		});

	// Adds the svg canvas
	var svg = d3.select(_config.targetElem)
		.append("svg")
		.attr("width", _config.width + _config.margin.left + _config.margin.right)
		.attr("height", _config.height + _config.margin.top + _config.margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + _config.margin.left + "," + _config.margin.top + ")");

	var lineSvg = svg.append("g");

	var focus = svg.append("g")
		.style("display", "none");



	// Get the data
	// d3.csv("atad.csv", processData); // for csv
	processData(_config.dataset);

	function processData(data) {
		data.forEach(function(d) {
			d.date = parseDate(d.date);
			d.close = +d.close;
		});

		// Scale the range of the data
		x.domain(d3.extent(data, function(d) {
			return d.date;
		}));
		y.domain(d3.extent(data, function(d) {
			return d.close;
		}));

		// Add the valueline path.
		lineSvg.append("path")
			.attr("class", "line")
			.attr("d", valueline(data));

		// Add the X Axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + _config.height + ")")
			.call(xAxis);

		// Add the Y Axis
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		// append the x line
		focus.append("line")
			.attr("class", "x")
			.style("stroke", "blue")
			.style("stroke-dasharray", "3,3")
			.style("opacity", 0.5)
			.attr("y1", 0)
			.attr("y2", _config.height);

		// append the y line
		focus.append("line")
			.attr("class", "y")
			.style("stroke", "blue")
			.style("stroke-dasharray", "3,3")
			.style("opacity", 0.5)
			.attr("x1", _config.width)
			.attr("x2", _config.width);

		// append the circle at the intersection
		focus.append("circle")
			.attr("class", "y")
			.style("fill", "none")
			.style("stroke", "blue")
			.attr("r", 4);

		// place the value at the intersection
		focus.append("text")
			.attr("class", "y1")
			.style("stroke", "white")
			.style("stroke-width", "3.5px")
			.style("opacity", 0.8)
			.attr("dx", 8)
			.attr("dy", "-.3em");
		focus.append("text")
			.attr("class", "y2")
			.attr("dx", 8)
			.attr("dy", "-.3em");

		// place the date at the intersection
		focus.append("text")
			.attr("class", "y3")
			.style("stroke", "white")
			.style("stroke-width", "3.5px")
			.style("opacity", 0.8)
			.attr("dx", 8)
			.attr("dy", "1em");
		focus.append("text")
			.attr("class", "y4")
			.attr("dx", 8)
			.attr("dy", "1em");

		// append the rectangle to capture mouse
		svg.append("rect")
			.attr("width", _config.width)
			.attr("height", _config.height)
			.style("fill", "none")
			.style("pointer-events", "all")
			.on("mouseover", function() {
				focus.style("display", null);
			})
			.on("mouseout", function() {
				focus.style("display", "none");
			})
			.on("mousemove", mousemove);

		function mousemove() {
			var x0 = x.invert(d3.mouse(this)[0]),
				i = bisectDate(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = x0 - d0.date > d1.date - x0 ? d1 : d0;
			// console.log(data, d0, d1, d);
			focus.select("circle.y")
				.attr("transform",
					"translate(" + x(d.date) + "," +
					y(d.close) + ")");

			focus.select("text.y1")
				.attr("transform",
					"translate(" + x(d.date) + "," +
					y(d.close) + ")")
				.text(d.close);

			focus.select("text.y2")
				.attr("transform",
					"translate(" + x(d.date) + "," +
					y(d.close) + ")")
				.text(d.close);

			focus.select("text.y3")
				.attr("transform",
					"translate(" + x(d.date) + "," +
					y(d.close) + ")")
				.text(formatDate(d.date));

			focus.select("text.y4")
				.attr("transform",
					"translate(" + x(d.date) + "," +
					y(d.close) + ")")
				.text(formatDate(d.date));

			focus.select(".x")
				.attr("transform",
					"translate(" + x(d.date) + "," +
					0 + ")") // mode half: y(d.close)
				.attr("y2", _config.height); //height - y(d.close)

			focus.select(".y")
				.attr("transform",
					"translate(" + _config.width * -1 + "," +
					y(d.close) + ")")
				.attr("x2", _config.width + _config.width);
		}
	};
};
