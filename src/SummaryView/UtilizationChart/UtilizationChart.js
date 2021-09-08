import React from 'react';


import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

class UtilizationChart extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  componentDidMount()
  {
    const chart = am4core.create("chartdiv", am4charts.XYChart);

    chart.data = this.props.chartData;
    chart.colors.list = [am4core.color("#A91B60")]
    // Set input format for the dates
    // chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";
    chart.dateFormatter.inputDateFormat = "d-M-yyyy";
    chart.paddingRight = 40;

    // Create axes
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    //dateAxis.skipEmptyPeriods = true;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter.numberFormat = "#%";
    //valueAxis.title.text = "Turnover";

    // Create series
    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "value";
    series.dataFields.dateX = "date";
    series.tooltipText = "{value}"
    series.strokeWidth = 3;
    series.minBulletDistance = 15;

    // Drop-shaped tooltips
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.strokeOpacity = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.label.minWidth = 40;
    series.tooltip.label.minHeight = 40;
    series.tooltip.label.textAlign = "middle";
    series.tooltip.label.textValign = "middle";
    //series.tooltipText = "Utilization: {value.formatNumber('#.0')}"

    series.adapter.add('tooltipHTML', function(text, target)
    {
      //var data = target.tooltipDataItem.dataContext;
      //if (data.value < 0.5 ) return "Utilization: {value.formatNumber('#.0%')}";
      //else if (data.value < 1 && data.value >= 0.5) return "Utilization: {value.formatNumber('#.0%')}";
      //else if (data.value >= 1) return "Utilization: {value.formatNumber('#.0%')}";
      return `Utilization: {value.formatNumber('#.0%')}`;
    });

    // Make bullets grow on hover
    var bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.strokeWidth = 2;
    bullet.circle.radius = 4;
    bullet.circle.fill = am4core.color("#fff");

    var bullethover = bullet.states.create("hover");
    bullethover.properties.scale = 1.3;

    // Make a panning cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panXY";
    chart.cursor.xAxis = dateAxis;
    chart.cursor.snapToSeries = series;

    //dateAxis.start = 0.79;
    //dateAxis.keepSelection = true;

    this.chart = chart;
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
      <div id="chartdiv" style={{ width: "100%", height: "14em" }}></div>
    );
  }

}

export default UtilizationChart;
