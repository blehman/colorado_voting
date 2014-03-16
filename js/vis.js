  function buildMenu(data) {
    var menu = d3.select("#menu");
    menu.selectAll("option").data(data)
      .enter()
      .append("option")
      .attr("value", function(d) { return d.county; })
      .text(function(d) { return d.county; });
    menu.on("change", function(event) { drawRadial(data);});

  }
  function drawRadial(data) {
    var numericFields = ["ballots", "no", "voters", "turnout", "yes"],
        angle = d3.scale.ordinal(),
        rad = d3.scale.linear(),
        size = d3.scale.linear(),
        color = d3.scale.linear(),
        container = svg.select(".container"),
        points = container.select(".points"),
        dot_selection = points.selectAll(".point"),
        dots,
        markers = container.select(".markers"),
        menuCounty = d3.select("#menu").property("value"),
        selected = data.filter(function(d) {
          return d.county == menuCounty; })[0];

    data.forEach(function(d) {
      numericFields.forEach(function(f) {
        d[f] = +d[f];
      });
      d.difference = Math.abs((+selected.yes / +selected.turnout) - (d.yes / d.turnout));
    });
      var max_diff = d3.max(data, function(d) { return d.difference;})
    angle.rangePoints([0,2 * Math.PI]).domain(d3.range(data.length));
    rad.domain([0,max_diff])
      .range([0,circleWidth/2]);
    size.domain([0,max_diff])
      .range([13,3]);
    color.domain([0,max_diff])
      .range(["#8DF2C8","#213D32"]).interpolate(d3.interpolateHsl); //consider: add multiple colors

 // Update header text.
    d3.select("body").select('#vis').select("h3").text("Similarity to " + selected.county);

    container.attr("transform", "translate(" + [circleWidth/2,circleWidth/2] + ")");
    markers.selectAll(".marker").data(d3.range(4))
      .enter()
      .append("circle")
      .classed("marker", true)
      .attr({
        cx: 0,
        cy: 0,
        r: function(d,i) { return (i+1) * circleWidth / 8; }
      });

    dots = dot_selection.data(data, function(d) { return d.county; }); //makes d3 use county instead of index to differentiate items in the array

    dots.enter()
      .append("circle")
      .classed("point", true)
      .attr({
        cx: 0,
        cy: 0,
        r:  3
      });

    dots.on("mouseover", function (d,i) {
      drawDetail(d,i,angle, rad);
    });

    dots.on("mouseout", function (d,i) {
      shortenDetailLine();
    });

    dots.on("click", function(ev) {
      d3.select("#menu").property("value", ev.county);
      shortenDetailLine();
      drawRadial(data);
    });

    dots.transition()
      .delay(function(d,i) { return i * 10;})
      .attr({
        cx: function(d,i) { return Math.sin(angle(i)) * rad(d.difference); },
        cy: function(d,i) { return Math.cos(angle(i)) * rad(d.difference); },
        r: function(d, i) { return size(d.difference); },
        fill: function(d) { return color(d.difference); }
      });
  }

function shortenDetailLine() {
  line   = detail.select(".detailLine");
  header = detail.select(".detailHeader");
  d3.select(".detailLine").attr("d", "M"+(300 + header[0][0].getComputedTextLength()) + ",-210 L300,-210");
}

function drawDetail(d, i, angle, rad) {
  console.log(d,i);
  var path, line, header, detail = svg.select(".detail");
  line   = detail.select(".detailLine");
  header = detail.select(".detailHeader");
  header.text(d.county);
  line.transition()
    .attr("d", "M"+(300 + header[0][0].getComputedTextLength()) + ",-210 L300,-210" + 
        " L" + (Math.sin(angle(i)) * rad(d.difference)) + "," + (Math.cos(angle(i)) * rad(d.difference))
        );
}

var svg = d3.select("svg"),
      w = 960, h = 600, circleWidth = 600;

svg.attr({
  width:  w,
  height: h
});

var detail, container = svg.append("g").classed("container", true);
container.append("g").classed("markers", true);
container.append("g").classed("points", true);
detail = container.append("g").classed("detail", true);
detail.append("path").classed("detailLine", true);
detail.append("text").classed("detailHeader", true).attr({
  x: 300,
  y: -220,
});

d3.csv("data/amendment64.csv", function(data) {
  buildMenu(data);
  drawRadial(data);
});
