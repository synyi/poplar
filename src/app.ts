/// <reference path="svgjs/svgjs.d.ts" />
import {Annotator, Categories} from './lib/Annotator';
let annotator = new Annotator('drawing');

class HttpClient {
     public get(aUrl, aCallback) {
        let anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = () => {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        };
        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.send( null);
    }
}
let client = new HttpClient();
client.get('http://localhost:3000/src/test/content.txt', (raw) => {
   client.get('http://localhost:3000/src/test/label.json', (raw_label) => {
       let labels = JSON.parse(raw_label);
       let results = labels['concepts'].map(x => {
           return {
               'id': x['meta']['id'],
               'category': Categories[x['meta']['category']],
               'pos': [x['meta']['start_index'], x['meta']['end_index'] - 1]
           };
       });
       annotator.on('progress', (target, progress) => { console.log(progress)});
       annotator.import(raw, results);
   });
});

// annotator.import(raw, results);
