function display_tabular_chart(div_id, table_title, data){
    html_str = "<table><tr><th>User</th><th>No. of Revisions</th></tr>";
    for(var i in data){
        var key = Object.keys(data[i])[0];
        var row =  "<tr><td>";
        row = row + key + "</td><td>" + data[i][key];
        row = row + "</td></tr>";
        html_str = html_str + row;
    }
    html_str = html_str + "</table>";
    $(div_id).html(html_str);

}

function display_barchart(chart_div_id, chart_title, chart_data){
    $(chart_div_id).jqChart({
        title: { text: chart_title},
        animation: { duration: 1 },
        shadows: {
            enabled: true
        },
        series: chart_data
    });

}

function display_barchart2_tab(dropdown_id, chart_div_id, article_title, users_data){
    users = Object.keys(users_data);
    users.unshift("Select user");
    $(dropdown_id).empty();
    display_barchart(chart_div_id, "", []);
    $.each(users, function(val, text){
        $(dropdown_id).append( $('<option></option>').val(val).html(text) );
    });
    $(dropdown_id).change(function(){
        var user = $(dropdown_id + ' :selected').text();
        if(user == "Select user"){
            display_barchart("#barchart2", "", []);
        }else{
            var chart_data = [{
                    type: 'column',
                    title: user,
                    fillStyle: '#418CF0',
                    data: users_data[user]
                }];
            display_barchart("#barchart2", "Distribution data of article " + article_title
                                + " \nby user " + user, chart_data);
        }
    });
}

function display_piechart(chart_div_id, chart_title, pie_chart_data){
    var background = {
        type: 'linearGradient',
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 1,
        colorStops: [{ offset: 0, color: '#d2e6c9' },
                     { offset: 1, color: 'white' }]
    };
    $(chart_div_id).jqChart({
        title: { text: chart_title  },
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
                data: pie_chart_data
            }
        ]
    });

    $(chart_div_id).bind('tooltipFormat', function (e, data) {
        var percentage = data.series.getPercentage(data.value);
        percentage = data.chart.stringFormat(percentage, '%.2f%%');

        return '<b>' + data.dataItem[0] + '</b><br />' +
               data.value + ' (' + percentage + ')';
    });
}

$( function() {
    $( "#individual-charts" ).tabs();
});


$.ajax({
        url: "/data/titles", 
        success: function(result){
            $('#titles').empty();
            result.sort();
            result.unshift("Select title");
            $.each(result, function(val, text){
                $('#titles').append( $('<option></option>').val(val).html(text) );
            });
        }
});
$('#titles').change(function(){
    var title = $('#titles :selected').text();
    $("#individual-stats").html("");
    display_barchart("#barchart1", "", []);
    display_piechart("#piechart1", "", []);
    display_barchart("#barchart2", "", []);
    display_barchart("#barchart3", "", []);
    $("#tabular-chart").html("");
    $("#top-5-users").empty();
    if(title == "Select title"){
        return;
    }
    $("#individual-stats").html("Loading, please wait...");
    $.ajax({
        url: "/data/article?title=" + title, 
        success: function(result){
            for(var m_key in result){
                var value = result[m_key];
                if(m_key == "data") {
                    var html_str = "";
                    var i = 1;
                    for(var d_key in value){
                        if(d_key == "top-5-users"){
                            display_tabular_chart("#tabular-chart", "Top 5 Users' Revisions", value[d_key]);
                        }else{
                            var row = "<p>" + i + "." + d_key + ": " +  value[d_key] + "</p>";
                            html_str = html_str + row; 
                            i = i + 1;
                        }
                    }
                    $("#individual-stats").html(html_str);
                }
                else if(m_key == "charts"){
                    for(var c_key in value){
                        if(c_key == "barchart1"){
                            display_barchart("#barchart1",
                                "Distribution of revisioner of article " + title + " \n(by year & user-type)",value[c_key]);
                        }
                        else if(c_key == "piechart1"){
                            display_piechart("#piechart1", 
                                "Distribution of revisions by user-type of \nthe acrticle " + title,
                                 value[c_key]);
                        }
                        else if(c_key == "barchart2"){
                            display_barchart2_tab("#top-5-users", "#barchart2", title, value[c_key]);
                        }
                        else if(c_key == "barchart3"){
                            display_barchart("#barchart3",
                                "Distribution of revisioner of article " + title + " \n(by year & top 5 users)",value[c_key]);
                        }
                    }
                }
            }
        }
    });
});
