import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Chart } from 'chart.js';

import { ApiService } from "../services/api.service";
import { Datum } from "../interfaces/datum";

@Component({
  selector: 'curEx-hist',
  templateUrl: './hist.component.html',
  styleUrls: ['./hist.component.css']
})
export class HistComponent implements OnInit, OnDestroy {

  public chartData: { labels: string[]; datasets: any; };

  chartType = 'bar';
  chart: Chart;
  public curSec: string;
  public options: { responsive: boolean; maintainAspectRatio: boolean; };
  public datum: Datum;
  private subApi: Subscription;

  constructor(private api: ApiService, private aroute: ActivatedRoute) {
    this.chartType = 'bar';
    this.options = {responsive: true, maintainAspectRatio: true};
    this.curSec = '';
    this.chartData = {
      labels: [],
      datasets: []
    };
  }

  ngOnInit(): void {
    this.subApi = this.aroute.params.subscribe(
      params => {
        this.curSec = params['curSec'];
        this.api.createChartData(this.curSec);
        this.getChartData();
      }
    );
  }

  getChartData(): void {
    this.api.getDataSub$().subscribe(
      rez => {
        this.datum = rez;
        this.chart = new Chart('barChart', {
          type: this.chartType,
          options: this.options,
          data: {
            labels: this.datum.chartSet.labels,
            datasets: [{
              type: this.chartType,
              label: this.curSec,
              data: this.datum.chartSet.dataSet,
              backgroundColor: 'rgba(0,0,255,0.66)',
            }]
          }
        });
      },
      error => console.log(error)
    );

  }

  ngOnDestroy(): void {
    this.subApi.unsubscribe();
  }

}
