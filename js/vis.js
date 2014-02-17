  function drawRadial(data) {
    var numericFields = ["Ballots Cast", "No", "Registered Voters", "Total Turnout", "Yes"],
        w = 800, h = 800;
        angle = d3.scale.ordinal(),
        rad = d3.scale.linear(),
        svg = d3.select("#vis").append("svg"),
        points = svg.append("g").classed("points", true);

    data.forEach(function(d) {
      numericFields.forEach(function(f) {
        d[f] = +d[f];
      });
    });

    svg.attr({
      width:  w,
      height: h
    });

    points.selectAll(".marker").data(d3.range(4))
      .enter()
      .append("circle")
      .classed("marker", true)
      .attr({
        cx: 0,
        cy: 0,
        r: function(d,i) { return i * 100; }
      });

    angle.rangePoints([0,360]).domain(d3.range(data.length));
    console.log(angle(1), angle(2), angle(3));
    rad.domain([0,d3.max(data, function(d) { return d["Yes"];})])
      .range([0,350]);

    points.attr("transform", "translate(" + [w/2,h/2] + ")");
    points.selectAll(".point").data(data)
      .enter()
      .append("circle")
      .classed("point", true)
      .attr({
        transform: function(d,i) { 
          console.log(d);
          return "rotate(" + angle(i) + ") translate(" + rad(d["Yes"]) + ")";
        },
        cx: 0,
        cy: 0,
        r:  6
      });
  }

  d3.csv("data/amendment64.csv", drawRadial);
