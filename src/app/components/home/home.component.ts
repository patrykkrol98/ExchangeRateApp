import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../services/api.service";
import { Datum } from "../../interfaces/datum";

@Component({
  selector: 'curEx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public curBase: string;
  public datum: Datum;

  constructor( private api: ApiService ) {
    this.curBase        = 'EUR';
  }

  ngOnInit(): void {
    this.api.getDataSets(this.curBase);
    this.api.getDataSub$().subscribe(
      rez => {
        this.datum = rez;
      },
      error => console.log(error)
    );
  }

}
