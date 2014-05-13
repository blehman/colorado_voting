
function drawRadial(data, selected) {
    var numericFields = ["Yes","No","Total","Registered_Voters","Ballots_Cast","Turnout"],
        angle = d3.scale.ordinal(),
        rad = d3.scale.linear(),
        size = d3.scale.linear(),
        color = d3.scale.threshold().range(["Crimson","IndianRed","LimeGreen","GreenYellow"]),
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
      d.difference = Math.abs((+selected.Yes / (selected.Yes +selected.No)) - (d.Yes / (d.Yes+d.No)));
    });
      var max_diff = d3.max(data, function(d) { return d.difference;});
    angle.rangePoints([0,2 * Math.PI]).domain(d3.range(data.length));
    rad.domain([0,max_diff])
      .range([0,circleWidth/2]);
    size.domain(d3.extent(data,function (d) { return d.Avg_Registered_Voters; }))
      .range([3,13]);
    color.domain([0.45,0.5,0.55,1]);
    //color.domain(d3.extent(data,function (d) { return d.Vote64}))
    //   .range(["#8DF2C8","#213D32"]).interpolate(d3.interpolateHsl); //consider: add multiple colors
 // Update header text.
    d3.select("body").select('#vis').select("h3").text("Similarity to " + selected.County);

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

    dots = dot_selection.data(data, function(d) { return d.County; }); //makes d3 use county instead of index to differentiate items in the array

    dots.enter()
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
        cx: function(d,i) { return Math.sin(angle(i)) * rad(d.difference); },
        cy: function(d,i) { return Math.cos(angle(i)) * rad(d.difference); },
        r: function(d, i) { return size(d.Avg_Registered_Voters); },
        fill: function(d) { return color(d.Vote64); }
      });

    dots.on("mouseover", function (d,i) {
      drawDetail(d,i, this,rad);
    });

    dots.on("mouseout", function (d,i) {
      d3.selectAll(".underline").remove();
    });

    dots.on("click", function(d) {
      d3.selectAll(".underline").remove();
      drawRadial(data, d);
    });

    var drawDetail = function (d,i, element, rad) {
        var detail = d3.select(".detail");
        console.log(rad.domain());
        var selected = detail.selectAll("text").filter(function(inner_d) { return d == inner_d;});

        //console.log(selected)
        var x = selected[0][0].getAttribute("x");
        var y = selected[0][0].getAttribute("y");
        //console.log(d.difference)
        var cx = Math.sin(angle(i)) * rad(d.difference);
        var cy = Math.cos(angle(i)) * rad(d.difference);
        var direction = i % 2 === 0 ? -1 : 1;
        //var direction = function(d,i) { if (i % 2 === 0) { return -1;} else { return 1;}}
        detail.append("path")
            .classed("underline", true)
            //.attr("d", "M" + x + "," + y + "h" + selected[0][0].getComputedTextLength())
            .attr("d", "M" + cx+","+cy+" L"+x+","+y+"h"+direction*selected[0][0].getComputedTextLength());
    };

    function drawText(data,rad) {
      var labels = d3.select(".detail").selectAll(".label")
        .data(data);
      labels.enter()
        .append("text")
        .classed("label",true)
        .classed("left",  function(d,i) { return i % 2 === 0; })
        .classed("right", function(d,i) { return i % 2 !== 0; })
        .attr(
            {
              x: labelX,
              y: labelY
            })
      .text(function(d,i) { return d.County;});
      console.log("rad domain", rad.domain());
      labels.on("mouseover", function(d,i) {
        drawDetail(d,i,this,rad);
        })
      .on("mouseout", function(d,i) {
        d3.selectAll(".underline").remove();
        })
      .on("click", function(d) {
        d3.selectAll(".underline").remove();
        drawRadial(data, d);
    });

     }
    //drawDetail is now in scope so we can call it
    drawText(data,rad);
  }


function labelX (d,i) { if (i % 2 === 0) { return -c2-10;} else { return c2+10;}}
function labelY (d,i) { if (i % 2 === 0) { return -280 + (i * 9);} else { return -280 + (i - 1) * 9;}}

function shortenDetailLine() {
  var line   = detail.select(".detailLine");
  var header = detail.select(".detailHeader");
  d3.select(".detailLine").transition()
    .attr("d", "M"+(300 + header[0][0].getComputedTextLength()) + ",-210 L300,-210 L300,-210");
}

var x_offset=200;
var svg = d3.select("svg"),
      w = 960, h = 600, circleWidth = 600;
var c2=circleWidth/2;
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

d3.csv("data/amendment66_v2.csv", function(data66) {
  d3.csv("data/amendment64_v2.csv", function(data64) {
    data66.forEach( function(d){
      data64.forEach( function(e) {
        if (e.County == d.County) {
          d.Vote64=e.Yes/e.Total;
          d.Avg_Registered_Voters=(d.Registered_Voters+e.Registered_Voters)/2;
          console.log(d.Avg_Registered_Voters);
        }
      });
    });
    //drawText(data66);
    drawRadial(data66, data66[0]);
  });
});
