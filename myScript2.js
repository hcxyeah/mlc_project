function openSection(evt, name) {
		var i, tabcontent, tablinks;

		// Get all elements with class="tabcontent" and hide them
		tabcontent = document.getElementsByClassName("tabcontent");
		for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = "none";
		}

		// Get all elements with class="tablinks" and remove the class "active"
		tablinks = document.getElementsByClassName("tablinks");
		for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
			//tablinks[i].classList.remove("active");
		}


		// Show the current tab, and add an "active" class to the button that opened the tab
		document.getElementById(name).style.display = "block";
		//evt.currentTarget.classList.add("active");
    	evt.currentTarget.className += " active";
};


function selectTag(evt) {
	var i, tags;
	tags = document.getElementsByClassName("tag");
	for (i = 0; i < tags.length; i++) {
		tags[i].className = tags[i].className.replace(" selected", "");
	}

	evt.currentTarget.className += " selected";
}

function generateTable(header, body) {
	var indexName = header.indexOf("Restaurant");
	var indexRating = header.indexOf("Rating");
	var indexAddress = header.indexOf("Address");
	var indexStar = header.indexOf("Star");
	var indexState = header.indexOf("State");

	var tableHeaders = "";
	$.each(header, function (i, val) {
			tableHeaders += "<th>" + val + "</th>";
	});
	console.log(body);
	$("#tableContainer").empty().append('<table id="table" class="table table-bordered table-striped"><thead><tr>' + tableHeaders + '</tr></thead>');
	var table = $("#table").DataTable({
			data: body,
			order: [[1, "desc"]],
			//autoWidth: false,
			//autoHeight: false,
			scrollY: '70vh',
			scrollX: true,
			scrollCollapse: true,
			columnDefs: [
					{"width": "100px", "targets": indexName},
					{"width": "100px", "targets": indexRating},
					{"width": "300px", "targets": indexAddress},
					{"width": "200px", "targets": indexStar},
					{"width": "100px", "targets": indexState}
			]
	});
}

function generatePlot(restaurants) {
	var svg_height = 600;
	var svg_width = 1500;
	var legendFullWidth = 500;
	var legendFullHeight = 70;
	var legendWidth = 200;
	var legendHeight = 20;
	var margin = {top: 50, right: 20, bottom: 30, left: 30};
	var height = svg_height - margin.top - margin.bottom - legendFullHeight;
	var width = svg_width - margin.left - margin.right;
	var top = margin.top + legendFullHeight;
	d3.select("#Bar-chart").selectAll('*').remove();
	var svg = d3.select("#Bar-chart").append("svg")
		.attr("class", "parameter")
		.attr("width", svg_width)
		.attr("height", svg_height)
		.attr("transform", "translate("+margin.left+", "+margin.top+")");

	svg.selectAll('*').remove();

	//var restaurants = data.filter(function(d) { return d[filter]; });
  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top +")");

  var max_arr = d3.max(restaurants, function(d) {return d[1]; });

  var min_arr = d3.min(restaurants, function(d) {return d[1]; });

  var y = d3.scaleLinear().domain([min_arr, max_arr]).range([height, 0]);
  var x = d3.scaleBand()
      .domain(restaurants.map(function(d) {return d[0];}))
      .rangeRound([0, width]).padding(1);

        //console.log(all_data);
        //console.log(process_data(data));
  g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate("+ 10 + "," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis-y")
      .call(d3.axisLeft(y));

  var tooltip = d3.select("#Bar-chart").append("div")
      .attr("class", "tooltip")
      .style("display", "none");

  g.selectAll(".bar")
      .data(restaurants)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d, i) { return x(d[0]); })
      .attr("y", function(d, i)  { return 450-y(d[1]); })
      .attr("width", 50)
      .attr("height", function(d, i) { return y(d[1]); })
      .on("mouseover", function(d) {
          tooltip
              .style("left", d3.event.pageX - 70 + "px")
              .style("top", 700 + "px")
              .style("display", "block")
              .html("<b>"+d[0]+"</b><br>Arrival rating: " + Math.round(d[1]*100)/100 );
      })
      .on("mouseout", function() { tooltip.style("display", "none"); });
}

$(document).ready(function(){
	$.ajax({
		url: "res_rating_by_dish.json",
		dataType: "json",
		success: function (rating) {
			var data = rating;
			var tagData = Object.keys(rating);
			var tagGroup = "";
			$.each(tagData, function (i, val) {
				tagGroup += '<button type="button" class="tag btn btn-info" id="tag' + i + '" value="' + val + '">' + val + '</button>';
			});
			$("#tagGroup").empty().append(tagGroup);
			$.ajax({
				url: "chinese_restaurants.json",
				dataType: "json",
				success: function (business) {
					var header = ['Restaurant', 'Rating', 'Address', 'Star', 'State'];
					$('.tag').on('click', function (event) {
						var restaurants = Object.keys(data[this.value]).map(function(key) {
							return [key, this[key], business[key]['address'], business[key]['star'], business[key]['state']];
						}, data[this.value]);
						restaurants.sort(function(a, b) {return a[1] - b[1];});
						var top = restaurants.slice(0, 10);
						selectTag(event);
						generateTable(header, restaurants);
						generatePlot(top);
					})
				}
			})
		}
	})
})
