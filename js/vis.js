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
        container = svg.select(".container"),
        points = container.select(".points"),
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

    angle.rangePoints([0,360]).domain(d3.range(data.length));
    rad.domain([0,d3.max(data, function(d) { return d.difference;})])
      .range([0,350]);
    size.domain([0,d3.max(data, function(d) { return d.difference;})])
      .range([3,13]);

 // Update header text.
    d3.select("h3").text("Similarity to " + selected.county);

    container.attr("transform", "translate(" + [w/2,h/2] + ")");
    markers.selectAll(".marker").data(d3.range(4))
      .enter()
      .append("circle")
      .classed("marker", true)
      .attr({
        cx: 0,
        cy: 0,
        r: function(d,i) { return (i+1) * 100; }
      });

    var dots = points.selectAll(".point")
      .data(data, function(d) { return d.county; });

    dots.enter()
      .append("circle")
      .classed("point", true)
      .attr({
        cx: 0,
        cy: 0,
        r:  3
      });

    dots.on("mouseover", function(ev) { 
      console.log(ev.county);
    });

    dots.on("click", function(ev) { 
      d3.select("#menu").property("value", ev.county);
      drawRadial(data);
    });

    dots.transition()
      .delay(function(d,i) { return i * 10;})
      .attr({
        transform: function(d,i) { 
          return "rotate(" + angle(i) + ") translate(" + rad(d.difference) + ")";
        },
        r: function(d, i) { return size(d.difference); }
      });
  }

var svg = d3.select("svg"),
      w = 800, h = 800;

svg.attr({
  width:  w,
  height: h
});

var container = svg.append("g").classed("container", true);
container.append("g").classed("markers", true);
container.append("g").classed("points", true);

d3.csv("data/amendment64.csv", function(data) { 
  buildMenu(data); 
  drawRadial(data);
});
