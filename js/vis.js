
  function drawRadial(data, selected) {
    var numericFields = ["ballots", "no", "voters", "turnout", "yes"],
        angle = d3.scale.ordinal(),
        rad = d3.scale.linear(),
        size = d3.scale.linear(),
        color = d3.scale.linear(),
        container = svg.select(".container"),
        points = container.select(".points"),
        dot_selection = points.selectAll(".point"),
        detail = d3.select(".detail"),
        dots,
        markers = container.select(".markers");

    data.forEach(function(d) {
      numericFields.forEach(function(f) {
        d[f] = +d[f];
      });
      d.difference = Math.abs((+selected.yes / +selected.turnout) - (d.yes / d.turnout));
    });
      var max_diff = d3.max(data, function(d) { return d.difference;});
    angle.rangePoints([0,2 * Math.PI]).domain(d3.range(data.length));
    rad.domain([0,max_diff])
      .range([0,circleWidth/2]);
    size.domain([0,max_diff])
      .range([13,3]);
    color.domain([0,max_diff])
      .range(["#8DF2C8","#213D32"]).interpolate(d3.interpolateHsl); //consider: add multiple colors

 // Update header text.
    d3.select("body").select('#vis').select("h3").text("Similarity to " + selected.county);

    container.attr("transform", "translate(" + [circleWidth/2+x_offset,circleWidth/2] + ")");
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
      drawDetail(d,i, this);
    });

    dots.on("mouseout", function (d,i) {
      d3.selectAll(".underline").remove();
    });

    dots.on("click", function(d) {
      d3.selectAll(".underline").remove();
      shortenDetailLine();
      console.log(this);
      drawRadial(data, d);
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

function drawDetail(d,i, element) {
  var detail = d3.select(".detail");
  var selected = detail.selectAll("text").filter(function(inner_d) { return d == inner_d;});
  var x = selected[0][0].getAttribute("x");
  var y = selected[0][0].getAttribute("y");
  var cx = element.getAttribute("cx");
  var cy = element.getAttribute("cy");
  var direction = i % 2 == 0 ? -1 : 1;
  //var direction = function(d,i) { if (i % 2 === 0) { return -1;} else { return 1;}}
  detail.append("path")
    .classed("underline", true)
    //.attr("d", "M" + x + "," + y + "h" + selected[0][0].getComputedTextLength())
    .attr("d", "M" + cx+","+cy+" L"+x+","+y+"h"+direction*selected[0][0].getComputedTextLength())
}

function drawText(data) {
  detail.selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .classed("label",true)
    .classed("left",  function(d,i) { return i % 2 === 0 })
    .classed("right", function(d,i) { return i % 2 !== 0 })
    .attr(
        {
          x: labelX,
          y: labelY
        })
  .text(function(d,i) { return d.county;});
}


function labelX (d,i) { if (i % 2 === 0) { return -c2-10;} else { return c2+10;}}
function labelY (d,i) { if (i % 2 === 0) { return -280 + (i * 9);} else { return -280 + (i - 1) * 9;}}

function shortenDetailLine() {
  var line   = detail.select(".detailLine");
  var header = detail.select(".detailHeader");
  d3.select(".detailLine").transition()
    .attr("d", "M"+(300 + header[0][0].getComputedTextLength()) + ",-210 L300,-210 L300,-210");
}

var x_offset=200
var svg = d3.select("svg"),
      w = 960, h = 600, circleWidth = 600;
var c2=circleWidth/2
svg.attr({
  width:  w,
  height: h
});

var detail, container = svg.append("g").classed("container", true);
container.append("g").classed("markers", true);
container.append("g").classed("points", true);
detail = container.append("g").classed("detail", true);
detail.append("text").classed("detailHeader", true).attr({
  x: 300,
  y: -220,
});

d3.csv("data/amendment64.csv", function(data) {
  drawText(data);
  drawRadial(data, data[0]);
});
