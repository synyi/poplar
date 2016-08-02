/// <reference path="typings/svgjs.d.ts" />

import {Annotator, Categories} from './lib/Annotator';
let annotator = new Annotator('drawing');

class HttpClient {
     public get(aUrl) {
        let promise = new Promise((resolve, reject) => {
            let anHttpRequest = new XMLHttpRequest();
            anHttpRequest.onreadystatechange = function() {
                if (anHttpRequest.readyState != 4) return;
                if (anHttpRequest.status == 200)
                    resolve(this.responseText);
                else
                    reject(new Error(this.statusText));
            };
            anHttpRequest.open("GET", aUrl, true);
            anHttpRequest.send( null);
        });
         return promise;
    }
}
let client = new HttpClient();
let promises = [
    client.get('http://localhost:3000/src/test/5934_5-2.json'),
    client.get('http://localhost:3000/src/test/5934_5.label.json')
];

Promise.all(promises).then((responses) => {
   let raw = JSON.parse(responses[0] as any)['content'];
   let raw_labels = responses[1] as any;
   let labels = JSON.parse(raw_labels);
   let results = labels['concepts'].map(x => {
       return {
           'id': x['meta']['id'],
           'category': Categories[x['meta']['category']],
           'pos': [x['meta']['start_index'], x['meta']['end_index'] - 1]
       };
   });
    let relations = [];
    for (let concept of labels['concepts']) {
        let src = concept['meta']['id'];
        if (concept['relations'].length < 1) continue;
        for (let relation of concept['relations']) {
            if ('attribute_id' in relation) {
                relations.push({
                    src,
                    dst: relation['attribute_id'],
                    text: relation['relation_type']
                });
            }
        }
    }
    annotator.setVisiblity('relation', false);
    annotator.setVisiblity('label', false);
    annotator.on('progress', (target, progress) => {
       progress = Math.round(progress * 100);
       let ele = document.getElementById('progress');
       ele.innerHTML = progress + '%';
   });
   annotator.import(raw, results, relations);
});

// annotator.import(raw, results);
