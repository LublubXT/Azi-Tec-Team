var ctx = document.getElementById("myChart");
var data = document.getElementById("data");

var d = new Date();
var n = d.getFullYear();
var m = d.getMonth();
var day = d.getUTCDate();

var date = n + "." + m + "." + day;

var stars = [];
var frameworks = [];


var myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: frameworks,
        datasets: [
            {
                label: "Temp",
                data: stars,
                backgroundColor: "rgba(0, 162, 255, 0.4)",
                borderColor: "rgba(0, 162, 255, 1)",
                borderWidth: 1,
                fill: true,
                lineTension: 0
            }
        ]
    }
});

function addData() {
    var newData = data.value;
    stars.push(newData);
    frameworks.push(date);
    console.log(stars, frameworks);
    var myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: frameworks,
            datasets: [
                {
                    label: "Temp",
                    data: stars,
                    backgroundColor: "rgba(0, 162, 255, 0.4)",
                    borderColor: "rgba(0, 162, 255, 1)",
                    borderWidth: 1,
                    fill: true,
                    lineTension: 0
                }
            ]
        }
    });
}
