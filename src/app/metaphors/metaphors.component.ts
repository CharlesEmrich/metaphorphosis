import { Component, OnInit } from '@angular/core';
import { DatamuseService } from '../services/datamuse.service';
import * as RiTa from 'rita';

import { Metaphor } from "./../metaphor.model";

@Component({
  selector: 'app-metaphors',
  templateUrl: './metaphors.component.html',
  styleUrls: ['./metaphors.component.css']
})
export class MetaphorsComponent implements OnInit {
  firstConcept: string = 'love';
  currentConcept: string;
  currentMetaphors: Metaphor[] = [];

  constructor(public datamuseService: DatamuseService) { }

  ngOnInit() {
    console.log('in OnInit');
        // this.datamuseService.getDatamuseResponse();
        this.currentConcept = this.firstConcept;
        this.makeMetaphor();
        this.makeMetaphor();
  }

  makeMetaphor() {
    this.datamuseService.getNouns(this.currentConcept).subscribe(response => {
      let nounOne: string = response.json()[Math.floor(Math.random() * response.json().length)].word;
      let nounTwo: string = response.json()[Math.floor(Math.random() * response.json().length)].word;
      let loopCounter: number = 0;
      while (nounOne === nounTwo && loopCounter < 50) {
        nounTwo = response.json()[Math.floor(Math.random() * response.json().length)].word;
        loopCounter ++;
        if (loopCounter === 50) {
          console.log('Oh no. While ran forever.');
        }
      }
      let newMetaphor = new Metaphor(`${this.firstConcept} is more than ${nounOne} with ${nounTwo}`);
      newMetaphor.concepts.push(nounOne);
      newMetaphor.concepts.push(nounTwo);
      this.currentMetaphors.push(newMetaphor);
      console.log(this.currentMetaphors);
    });
  }

  preferMetaphor(metaphor: Metaphor) {
    this.currentMetaphors = [];
    this.currentMetaphors.push(metaphor);
    this.currentConcept = metaphor.concepts[Math.floor(Math.random() * metaphor.concepts.length)];
    this.makeMetaphor();
  }
}
