import { Component, OnInit } from '@angular/core';
import { HallOfFameService } from '../services/hall-of-fame.service';
import { SessionService } from '../services/session.service';
import { Router } from '@angular/router';

import { Metaphor } from "../models/metaphor.model";
import { SessionInstance } from '../models/session-instance.model';
import { DatamuseService } from './../services/datamuse.service';
import { ConceptService } from "./../services/concept.service";
import { MadLibService } from "./../services/mad-lib.service";

@Component({
  selector: 'app-metaphors',
  templateUrl: './metaphors.component.html',
  styleUrls: ['./metaphors.component.css']
})

export class MetaphorsComponent implements OnInit {
  firstConcept: string;
  currentConcept: string;
  currentMetaphors: Metaphor[] = [];
  threshold: number = 10;
  progressTowardsThreshold: number = 0;

  constructor(private datamuseService: DatamuseService,
              private conceptService: ConceptService,
              private hofService: HallOfFameService,
              private sessionService: SessionService,
              private madLibService: MadLibService,
              private router: Router
              ) {}

  ngOnInit() {
    this.start();
  }

  start() {
    this.conceptService.getConcepts().subscribe((concepts) => {
      this.firstConcept = this.conceptService.activateConcept(concepts);
      if (this.firstConcept === 'false') {
        this.router.navigate(['/exhaustion']);
      }
      this.currentConcept = this.firstConcept;
      this.makeMetaphor();
      this.makeMetaphor();
    });
  }


// ==========================================================
// ORIGINAL makeMetaphor
  // makeMetaphor() {
  //   this.datamuseService.getNouns(this.currentConcept).subscribe(response => {
  //     let nounOne: string = response.json()[Math.floor(Math.random() * response.json().length)].word;
  //     let nounTwo: string = response.json()[Math.floor(Math.random() * response.json().length)].word;
  //     while (nounOne === nounTwo) {
  //       nounTwo = response.json()[Math.floor(Math.random() * response.json().length)].word;
  //     }
  //     //returns an object with two keys, a string to be used as a template and a number of concepts necessary to fill the template:
  //     let templateObj = this.madLibService.buildMadLib();
  //     let newMetaphor = new Metaphor(`
  //       ${this.firstConcept}
  //       ${templateObj.template
  //       .replace('CONCEPT2', nounOne)
  //       .replace('CONCEPT3', nounTwo)}`); //if no third concept, this fails quietly and without error.
  //     // let newMetaphor = new Metaphor(`${this.firstConcept} is more than ${nounOne} with ${nounTwo}`);
  //     newMetaphor.concepts.push(nounOne);
  //     newMetaphor.concepts.push(nounTwo);
  //     this.currentMetaphors.push(newMetaphor);
  //   });
  // }






// ==========================================================
// makeMetaphor with WordFrequency limits

makeMetaphor() {
  this.datamuseService.getNounsWithBetterFrequency(this.currentConcept).subscribe(response => {

    var nounOnePrecursor = response.json()[Math.floor(Math.random() * response.json().length)];

    let Freq: number = parseInt(nounOnePrecursor.tags[0].replace("f:", ""));

    let nounOneFreq: string = nounOnePrecursor.tags[0];
    console.log("nounOneFreq = ", nounOneFreq);

    let newFreq: number = parseInt(nounOneFreq.replace("f:", ""));
    console.log("newFreq = ", newFreq);

    if (newFreq >= 10) {
      nounOne = nounOnePrecursor.word;
      // console.log("nounOne = ", nounOne);
    };

//===================================================

    let nounTwo: string = response.json()[Math.floor(Math.random() * response.json().length)].word;

    while (nounOne === nounTwo) {
      nounTwo = response.json()[Math.floor(Math.random() * response.json().length)].word;
    }
    //returns an object with two keys, a string to be used as a template and a number of concepts necessary to fill the template:
    let templateObj = this.madLibService.buildMadLib();
    let newMetaphor = new Metaphor(`
      ${this.firstConcept}
      ${templateObj.template
      .replace('CONCEPT2', nounOne)
      .replace('CONCEPT3', nounTwo)}`); //if no third concept, this fails quietly and without error.
    // let newMetaphor = new Metaphor(`${this.firstConcept} is more than ${nounOne} with ${nounTwo}`);
    newMetaphor.concepts.push(nounOne);
    newMetaphor.concepts.push(nounTwo);
    this.currentMetaphors.push(newMetaphor);
  });
}




  preferMetaphor(metaphor: Metaphor) {
    var newSessionInstance = new SessionInstance(this.currentMetaphors[0], this.currentMetaphors[1], metaphor, this.firstConcept);
    if (this.sessionService.activeSession === null) {
      this.sessionService.createNewSession(newSessionInstance);
    } else {
      this.sessionService.addSessionInstanceToSession(newSessionInstance);
    }

    this.progressTowardsThreshold += 1; // check if the same metaphor was clicked before incrementing
    if (this.sessionService.activeSession.sessions.length > 1) {
      if (metaphor.metaphor !== this.sessionService.activeSession.sessions[this.sessionService.activeSession.sessions.length - 2].selectedMetaphor.metaphor) {
        this.progressTowardsThreshold = 0;
      }
    }

    if (this.progressTowardsThreshold === this.threshold) {
      this.progressTowardsThreshold = 0;
      this.sessionService.commitSession();
      this.conceptService.exhaustConcept(this.conceptService.activeConcept);
      this.currentMetaphors = [];

      this.start();
      return;
    }

    this.currentMetaphors = [];
    this.currentMetaphors.push(metaphor);
    this.currentConcept = metaphor.concepts[Math.floor(Math.random() * metaphor.concepts.length)];
    this.makeMetaphor();

  }
}
