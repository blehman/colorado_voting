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
        points = svg.append("g").classed("points", true),
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

    points.selectAll(".marker").data(d3.range(4))
      .enter()
      .append("circle")
      .classed("marker", true)
      .attr({
        cx: 0,
        cy: 0,
        r: function(d,i) { return (i+1) * 100; }
      });

    points.attr("transform", "translate(" + [w/2,h/2] + ")");
    var dots = points.selectAll(".point")
      .data(data, function(d) { return d.county;})
      .enter()
      .append("circle")
      .classed("point", true)
      .attr({
        cx: 0,
        cy: 0,
        r:  3
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

d3.csv("data/amendment64.csv", function(data) { 
  buildMenu(data); 
  drawRadial(data);
});
