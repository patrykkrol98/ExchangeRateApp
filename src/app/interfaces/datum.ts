import {Rates} from "./rates";

export interface Datum {
  toDay: string;          // today
  yesterDay: string;      // next to to-day
  monthAgo: string;       // last in the month's range (from lastMonthSet)
  curBase: string;        // current currency base
  latestSet: Rates;       // latest default base set
  baseSet: any;           // currency list for select
  lastMonthSet: Rates;    // calculated from latest last month set

  lastDay: string;        // latest api today
  lastYstrDay: string;    // latest api yesterday
  lastDaySet: any;        // latest api today's data set
  lastYstrDaySet: any;    // latest api yesterday's data set
  lastMonthDates: any;    // sorted array of dates (datum.lastMonthSet.rates)

  // page 1
  initList: any;          // start page data set, incl. 'increase/decrease'
  chartSet: any;          // chart column data set: base<->one currency picked

  // page 2
  // curBaseChartSet: any;   // chart for base for 30 days (see 'chartSet' for page 1)

  // page 3
  // topsBaseChartSet: any;  // top 5 to base chart set today-yesterday (see 'initList' for page 1)

}
