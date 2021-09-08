import React from 'react';


import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

class UtilizationViewChart extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  componentDidMount()
  {
    var chart = am4core.create(this.props.chartID, am4charts.XYChart);

    // Add data
    chart.data = this.props.chartData;

    // Create axes
    chart.dateFormatter.inputDateFormat = "d-M-yyyy";
    chart.paddingLeft = 40;
    chart.paddingBottom = 0;

    //var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    //categoryAxis.dataFields.category = "year";
    //categoryAxis.renderer.grid.template.location = 0;

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.dateFormats.setKey("day", "dd MMM");
    dateAxis.renderer.grid.template.disabled = true;
    dateAxis.skipEmptyPeriods = true;
    //dateAxis.renderer.labels.template.rotation = -45;
    dateAxis.renderer.labels.template.horizontalCenter = "middle";
    dateAxis.renderer.labels.template.verticalCenter = "middle";
    dateAxis.renderer.minGridDistance = 20;
    dateAxis.renderer.labels.template.maxWidth = 96;
    chart.zoomOutButton.disabled = true;
    chart.swipeable = true;

    var nextDay = new Date(this.props.today);
    nextDay.setDate(nextDay.getDate() + 1);
    var range = dateAxis.axisRanges.create();
    range.date = new Date(this.props.today);
    range.endDate = new Date(nextDay);
    range.axisFill.fill = am4core.color("#396478");
    range.axisFill.fillOpacity = 0.2;
    range.grid.strokeOpacity = 0;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.min = 0;
    valueAxis.renderer.grid.template.disabled = true;

    // Create series
    function createSeries(field, name, color) {

      // Set up series
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.name = name;
      series.dataFields.valueY = field;
      series.dataFields.dateX = "date";
      series.sequencedInterpolation = true;
      series.columns.template.fill = am4core.color(color);
      series.strokeWidth = 0;

      // Make it stacked
      series.stacked = true;

      // Configure columns
      series.columns.template.width = am4core.percent(35);
      series.columns.template.tooltipText = `Date: [bold]{dateX.formatDate('EEE, dd MMM')}[/]\nProject: [bold]{name}[/]\nUtilization: [bold]{valueY.formatNumber('#.%')}[/]\n------------------\nTasks:\n` + "[bold]{" + name + "_tasks}[/]";

      series.tooltip.getFillFromObject = false;
      series.tooltip.background.fill = am4core.color(color);
      series.tooltip.label.fill = am4core.color("white");

      // Add label
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = "{valueY.formatNumber('#.%')}";
      labelBullet.label.fill = am4core.color('white');
      labelBullet.locationY = 0.5;
      labelBullet.label.hideOversized = true;

      return series;
    }

    for (var [key, value] of Object.entries(this.props.projectsObject))
    {
      createSeries(key, key, value);
    }
    // Add scrollbar
    //chart.scrollbarX = new am4core.Scrollbar();
    chart.responsive.enabled = true;
    this.chart = chart;
    this.dateAxis = dateAxis;
  }

  componentWillUnmount()
  {
    if (this.chart)
    {
      this.chart.dispose();
    }
  }

  componentDidUpdate(oldProps)
  {
    if (oldProps.chartData !== this.props.chartData)
    {
      this.chart.invalidateData();
      this.chart.data = this.props.chartData;
    }
  }

  render()
  {
    return (
      <div id={this.props.chartID} style={{ width: this.props.chartWidth, height: "14em" }}></div>
    );
  }

}

export default UtilizationViewChart;
