import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DxfParser } from 'dxf-parser';
import { ThreeDxf } from 'three-dxf';
import * as $ from 'jquery';

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss']
})
export class ViewPageComponent implements OnInit {
  @ViewChild('cadView') cadView: ElementRef;
  @ViewChild('fileDescription') fileDescription: ElementRef;
  cadCanvas;

  constructor() {}

  ngOnInit() {
  }

  fileChangeEvent(event) {
    const file = event.target.files[0];
    const output = [];
    output.push('<li><strong>', encodeURI(file.name), '</strong> (', file.type || 'n/a', ') - ',
        file.size, ' bytes, last modified: ',
        file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a',
        '</li>');
    this.fileDescription.nativeElement.innerHTML = `<ul>${output.join('')}</ul>`;

    const reader = new FileReader();
    reader.onprogress = this.updateProgress;
    reader.onloadend = this.onSuccess;
    reader.onabort = this.abortUpload;
    reader.onerror = this.errorHandler;
    reader.readAsText(file);
  }

  abortUpload() {
    console.log('Aborted read!');
  }

  errorHandler(evt) {
    switch (evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
        alert('File Not Found!');
        break;
    case evt.target.error.NOT_READABLE_ERR:
        alert('File is not readable');
        break;
    case evt.target.error.ABORT_ERR:
        break; // noop
    default:
        alert('An error occurred reading this file.');
    }
  }

  updateProgress(evt) {
    console.log('progress');
  }

  onSuccess = (evt) => {
    const fileReader = evt.target;
    if (fileReader.error) {
      return console.log('error onloadend!?');
    }
    const parser = new window.DxfParser();
    const dxf = parser.parseSync(fileReader.result);
    // Three.js changed the way fonts are loaded, and now we need to use FontLoader to load a font
    //  and enable TextGeometry. See this example http://threejs.org/examples/?q=text#webgl_geometry_text
    //  and this discussion https://github.com/mrdoob/three.js/issues/7398
    this.cadCanvas = new window.ThreeDxf.Viewer(dxf, document.getElementById('cad-view'), 400, 400);

    // let font;
    // const loader = new THREE.FontLoader();
    // loader.load( '../assets/fonts/helvetiker_regular.typeface.json', ( response ) => {
    //     font = response;
    //     console.log(this.cadView);
    //     this.cadCanvas = new ThreeDxf.Viewer(dxf, this.cadView.nativeElement, 400, 400, font);
    // });
  }
}
