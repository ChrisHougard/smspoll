(function ($, google, io) {
    "use strict";

    var PollView = function (pollId) {
        this.pollId = pollId;
        this.googleReady = false;
        this.dataReady = false;

        var self = this;

        google.load('visualization', '1.1', {'packages':['bar']});
        google.setOnLoadCallback(function () {
            self.googleReady = true;
            self.buildChart();
        });

        $(document).ready(function() {
            self.getResults();
        });
    };

    PollView.prototype.getResults = function () {
        var self = this;

        $.ajax({
            data: {
                id: this.pollId
            },
            url: "/api/poll_results",
            cache: false,
            success: function(res) {
                self.results = res.data.options;
                self.dataReady = true;
                self.buildChart();
            }
        });
    };

    PollView.prototype.buildChart = function () {
        if (this.googleReady && this.dataReady) {
            this.data = new google.visualization.DataTable();
            this.data.addColumn('string');
            this.data.addColumn('number');
            for (var i = 0; i < this.results.length; i++) {
                this.data.addRow([this.results[i].option_display_text, parseInt(this.results[i].vote_count)]);
            }

            this.chart = new google.charts.Bar($("#chart")[0]);
            this.drawChart();
        }
    };

    PollView.prototype.drawChart = function() {
        var options = {
            animation:{
                duration: 1000,
                easing: 'out'
            },
            width: '100%',
            bars: 'horizontal',
            legend: {
                position: 'none'
            }
        };
        this.chart.draw(this.data, options);
    };

    window.PollView = PollView;
})(jQuery, google, io);