
function processInputText(inputText) {
  d3.select("#chart svg").remove();
  spinnerFunction(stringToArrayConverter(inputText));
}
const playersTextarea = document.getElementById("playersTextarea");
const spinButton = document.getElementById("spin_button");


playersTextarea.addEventListener("input", () => {
  const inputText = playersTextarea.value;
  // Call the processing function with the input text
  processInputText(inputText);
});

document.addEventListener("DOMContentLoaded", () => {
  const defaultInputText = playersTextarea.value; // Get the default value of playersTextarea
  processInputText(defaultInputText); // Call the processing function with the default value
});

playersTextarea.addEventListener("input", () => {
  const inputText = playersTextarea.value;
  d3.select("#chart svg").remove();
  spinnerFunction(stringToArrayConverter(inputText));
});

const stringToArrayConverter = (text) => {
  const playerArray = text.split(/\s+/).filter((word) => word.trim() !== "");
  return playerArray.map((player, index) => {
    return {
      label: player,
      value: index + 1,
      playerName: player,
    };
  });
};

const spinnerFunction = (data) => {
  var padding = { top: 20, right: 40, bottom: 0, left: 0 },
    w = 500 - padding.left - padding.right,
    h = 500 - padding.top - padding.bottom,
    r = Math.min(w, h) / 2,
    rotation = 0,
    oldrotation = 0,
    picked = 100000,
    oldpick = [],
    color = d3.scale.category20();
  var svg = d3
    .select("#chart")
    .append("svg")
    .data([data])
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);
  var container = svg
    .append("g")
    .attr("class", "chartholder")
    .attr("transform", "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")");
  var vis = container.append("g");

  var pie = d3.layout
    .pie()
    .sort(null)
    .value(function (d) {
      return 1;
    });
  // declare an arc generator function
  var arc = d3.svg.arc().outerRadius(r);
  // select paths, use arc generator to draw
  var arcs = vis.selectAll("g.slice").data(pie).enter().append("g").attr("class", "slice");

  arcs
    .append("path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", function (d) {
      return arc(d);
    });
  // add the text
  arcs
    .append("text")
    .attr("transform", function (d) {
      d.innerRadius = 0;
      d.outerRadius = r;
      d.angle = (d.startAngle + d.endAngle) / 2;
      return "rotate(" + ((d.angle * 180) / Math.PI - 90) + ")translate(" + (d.outerRadius - 10) + ")";
    })
    .attr("text-anchor", "end")
    .text(function (d, i) {
      return data[i].label;
    });
  container.on("click", spin);

  function spin(d) {
    container.on("click", null);
    //all slices have been seen, all done
    console.log("OldPick: " + oldpick.length, "Data length: " + data.length);
    if (oldpick.length == data.length) {
      console.log("done");
      container.on("click", null);
      return;
    }
    var ps = 360 / data.length,
      pieslice = Math.round(1440 / data.length),
      rng = Math.floor(Math.random() * 1440 + 360);

    rotation = Math.round(rng / ps) * ps;

    picked = Math.round(data.length - (rotation % 360) / ps);
    picked = picked >= data.length ? picked % data.length : picked;
    if (oldpick.indexOf(picked) !== -1) {
      d3.select(this).call(spin);
      return;
    } else {
      oldpick.push(picked);
    }
    rotation += 90 - Math.round(ps / 2);
    vis
      .transition()
      .duration(3000)
      .attrTween("transform", rotTween)
      .each("end", function () {
        d3.select(".slice:nth-child(" + (picked + 1) + ") path").attr("fill", "#111");
        d3.select(".slice:nth-child(" + (picked + 1) + ") text")
          .attr("fill", "white");
        d3.select("#winner h3").text(`\"${data[picked].playerName}\"  is winner!`);
        oldrotation = rotation
        container.on("click", spin);
      });
  }
  //make arrow
  svg
    .append("g")
    .attr("transform", "translate(" + (w + padding.left + padding.right) + "," + (h / 2 + padding.top) + ")")
    .append("path")
    .attr("d", "M-" + r * 0.15 + ",0L0," + r * 0.05 + "L0,-" + r * 0.05 + "Z")
    .style({ fill: "black" });
  //draw spin circle
  container.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 60).style({ fill: "white", cursor: "pointer" });
  //spin text
  container
    .append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN IT !")
    .style({ "font-weight": "bold", "font-size": "20px", "cursor": "pointer" });

  function rotTween(to) {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function (t) {
      return "rotate(" + i(t) + ")";
    };
  }

};
