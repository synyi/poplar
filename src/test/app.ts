// import {Annotator} from '../annotator/annotator'
//
import {Annotator} from "../annotator/Annotator";
import {TestDataSource} from "./TestDataSource";

let annotator = new Annotator(new TestDataSource(), document.getElementById('demo-annotator-element'));