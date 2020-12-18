import {Injectable, OnDestroy} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {BehaviorSubject, EMPTY, Observable, Subscription} from "rxjs";
import { Rates } from "../interfaces/rates";
import { Datum } from "../interfaces/datum";
import { Chartset } from "../interfaces/chartset";
import {Initlist} from "../interfaces/initlist";

@Injectable({
  providedIn: 'root'
})
export class ApiService implements OnDestroy {

  private readonly apiUrl: string;
  private readonly datum: Datum;

  private apiLatest: Observable<Rates>;
  private subsAPILatest: Subscription;
  private apiLastMonth: Observable<Rates>;
  private subsAPILastMonth: Subscription;
  private subjDatum: BehaviorSubject<Datum>;

  constructor(private http: HttpClient) {
    this.apiUrl = 'https://api.exchangeratesapi.io/';
    this.datum = {
      toDay: '',
      yesterDay: '',
      monthAgo: '',
      curBase: 'EUR',
      baseSet: [],
      latestSet: null,
      lastMonthSet: null,
      lastMonthDates: [],
      lastDay: '',
      lastYstrDay: '',
      lastDaySet: [],
      lastYstrDaySet: null,
      initList: null,
      chartSet: null,
      // curBaseChartSet: [],
      // topsBaseChartSet: []
    };
    this.subjDatum = new BehaviorSubject<Datum>(this.datum);
  }

  getDataSub$(): Observable<Datum> {
    return this.subjDatum.asObservable();
  }

  // api yester-/today sets
  getApiDays(): void {
    this.datum.lastMonthDates = [...(Object.keys( this.datum.lastMonthSet.rates))].sort();
    this.datum.lastDay        = this.datum.lastMonthDates[this.datum.lastMonthDates.length-1];
    this.datum.lastYstrDay    = this.datum.lastMonthDates[this.datum.lastMonthDates.length-2];

    for ( const [cur, num] of Object.entries(this.datum.lastMonthSet.rates[this.datum.lastDay]) ) {
      this.datum.lastDaySet[this.datum.baseSet.indexOf(cur)] = {currency: cur, price: num};
    }
    this.datum.lastYstrDaySet = this.datum.lastMonthSet.rates[this.datum.lastYstrDay];
  }

  // get data sets ready
  getDataSets(base: string = 'EUR'): void {
    this.datum.curBase = base;
    this.getDatum(this.datum.curBase);
    this.subjDatum.next(this.datum);
    // return this.subjDatum.asObservable();
  }

  // get initial data sets & calc date ranges
  getDatum(base: string): void {

    this.datum.curBase    = base;
    let rawToDay          = new Date();
    const rawMonthAgo     = new Date( (new Date()).setMonth(rawToDay.getMonth() - 1) );
    const rawYesterDay    = new Date( (new Date()).setDate(rawToDay.getDate() - 1) );
    this.datum.toDay      = new Date().toISOString().split('T')[0];
    this.datum.yesterDay  = rawYesterDay.toISOString().split('T')[0];
    this.datum.monthAgo   = rawMonthAgo.toISOString().split('T')[0];

    this.apiLatest = this.getData({base: this.datum.curBase || base});

    this.subsAPILatest = this.apiLatest
      .subscribe(
        dat => {
          this.datum.latestSet = dat;
          this.datum.baseSet = [...(Object.keys( this.datum.latestSet.rates))].sort();
          this.subjDatum.next(this.datum);
        },
        error => console.log('api-error:', error)
      );

    this.apiLastMonth = this.getData({
      base: this.datum.curBase || base,
      start: this.datum.monthAgo,
      end: this.datum.toDay});

    this.subsAPILastMonth = this.apiLastMonth
      .subscribe(
        async dat => {
          this.datum.lastMonthSet = dat;
          await this.getApiDays();
          this.datum.initList = await this.createInitList();
          this.subjDatum.next(this.datum);
        },
        error => console.log('apiLast-error:', error)
      );

  }

  // (1) picked currency chart icon click (app.comp)
  // (2) 'Last 30 days' button click, TO-DO: clarify - what to what compare (?)
  // default is used - 'AUD'
  createChartData( secCur: string = 'AUD' ): void {
    this.datum.chartSet = this.createChartDataSet(secCur);
    this.subjDatum.next(this.datum);
  }

  private createInitList(): Initlist {
    let initList: Initlist = {dataSet: []};
    for ( let el of this.datum.lastDaySet ) {
      initList.dataSet.push(
        {
          currency: el.currency,
          spot: el.price,
          shift: parseFloat((+el.price - this.datum.lastYstrDaySet[el.currency]).toFixed(6).toString()),
          per: parseFloat(
            (
              parseFloat((+el.price - this.datum.lastYstrDaySet[el.currency]).toFixed(6).toString()) /
              ( this.datum.lastYstrDaySet[el.currency] / 100 )
            ).toFixed(2).toString()
          )
        }
      );
    }
    return Object.assign({}, initList);
  }

  private createChartDataSet( secCur: string ): Chartset {
    // @ts-ignore
    const chartSet: Chartset = {secCur: secCur, labels: [], dataSet: []};
    for(let day of this.datum.lastMonthDates) {
      chartSet.labels.push(day);
      chartSet.dataSet.push(this.datum.lastMonthSet.rates[day][secCur].toString());
    }
    return chartSet;
  }

  // api queries
  private getData(params: {start?: string; end?: string; base:string}): Observable<Rates> {
    if ( params.base ) {
      let curUrl = (
        'start' in params && 'end' in params ?
          `${this.apiUrl}history?start_at=${params.start}&end_at=${params.end}&base=${params.base}` :
          `${this.apiUrl}latest?base=${params.base}`
      );
      return this.http.get<Rates>(curUrl);
    } else {
      return EMPTY;
    }
  }

  ngOnDestroy(): void {
    this.subsAPILatest.unsubscribe();
    this.subsAPILastMonth.unsubscribe();
  }

}
