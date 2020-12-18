import {Component, OnInit} from '@angular/core';
import { ApiService } from "./services/api.service";
import { Datum } from "./interfaces/datum";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'curEx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit{

  public curBase: string;
  public last30Base: string; // currency for (default) router link
  public baseSet: string[];
  public datum: Datum;
  selectedCurrency: any;
  private subApi: Subscription;
  private subDataApi: Subscription;

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.baseSet = [];
    this.curBase = 'EUR';
    this.last30Base = (this.curBase === 'EUR' ? 'AUD' : this.curBase);
    this.selectedCurrency = this.curBase;
  }

  ngOnInit(): void {
    this.subApi = this.route.params.subscribe(
      params => {
        if( this.curBase !== params['curSec'] && params['curSec'] ) {
          this.curBase = params['curSec'];
        } else {
          this.curBase = 'EUR';
        }
        this.api.getDataSets(this.curBase);
        this.getCurDataSet();
      }
    );
  }

  getCurDataSet(): void {
    this.subDataApi = this.api.getDataSub$().subscribe(
      rez => {
        this.datum = rez;
        const curBaseSet = [...rez.baseSet];
        this.baseSet = [... curBaseSet];
        this.baseSet.unshift(this.selectedCurrency);
      },
      error => console.log(error)
    );
  }

  onOptionSelected(): void {
    this.curBase = this.selectedCurrency;
    this.last30Base = (this.curBase === 'EUR' ? 'AUD' : this.curBase);
    this.api.getDataSets(this.curBase);
  }

}
