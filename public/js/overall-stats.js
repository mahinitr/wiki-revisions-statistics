$( function() {
	$( "#overall-charts" ).tabs();
} );

$.ajax({url: "/data/overall-barchart", success: function(result){
    html_str = "";
    for(var m_key in result){
        if(m_key == "data"){
            var i = 1;
            for(var d_key in result[m_key]){
                var row = "<p>" + i + "." + d_key + ": " + result[m_key][d_key] + "</p>";
                html_str = html_str + row;
                i = i + 1;
            }
            $("#overall-stats").html(html_str);
        }
        else if(m_key == "charts"){
            for(var c_key in result[m_key]){
                if(c_key == "barchart1"){
                    $('#barChart1').jqChart({
                        title: { text: 'Distribution of revisions (by year and user-type)' },
                        animation: { duration: 1 },
                        shadows: {
                            enabled: true
                        },
                        series: result[m_key][c_key]                                
                    });
                }
                else if(c_key == "piechart1"){
                    var background = {
                        type: 'linearGradient',
                        x0: 0,
                        y0: 0,
                        x1: 0,
                        y1: 1,
                        colorStops: [{ offset: 0, color: '#d2e6c9' },
                                     { offset: 1, color: 'white' }]
                    };
                    $('#pieChart1').jqChart({
                        title: { text: 'Distribution of revisions by user-type' },
                        legend: { title: 'User-Types' },
                        border: { strokeStyle: '#6ba851' },
                        background: background,
                        animation: { duration: 1 },
                        shadows: {
                            enabled: true
                        },
                        series: [
                            {
                                type: 'pie',
                                fillStyles: ['#418CF0', '#FCB441', '#E0400A', '#056492'],
                                labels: {
                                    stringFormat: '%.1f%%',
                                    valueType: 'percentage',
                                    font: '15px sans-serif',
                                    fillStyle: 'white'
                                },
                                explodedRadius: 10,
                                explodedSlices: [5],
                                data: result[m_key][c_key]
                            }
                        ]
                    });

                    $('#pieChart1').bind('tooltipFormat', function (e, data) {
                        var percentage = data.series.getPercentage(data.value);
                        percentage = data.chart.stringFormat(percentage, '%.2f%%');

                        return '<b>' + data.dataItem[0] + '</b><br />' +
                               data.value + ' (' + percentage + ')';
                    });
                }
            }
        }
    }
}});
