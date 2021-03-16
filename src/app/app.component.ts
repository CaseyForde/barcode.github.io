import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BarcodeFormat, BrowserBarcodeReader, Result } from '@zxing/library';
import { BrowserMultiFormatOneDReader, IScannerControls } from '@zxing/browser';
import Quagga from '@ericblade/quagga2';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { MultiFormatReader,BrowserCodeReader, HTMLCanvasElementLuminanceSource, HybridBinarizer, BinaryBitmap } from '@zxing/library';
import { WindowService } from "./window.service";
import { BarcodeScannerLivestreamComponent } from "ngx-barcode-scanner";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,AfterViewInit{
  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner: BarcodeScannerLivestreamComponent;
  value: string;
  isError = false;

  types:string[] = [
    "ean",
    "upc"
  ]
  constructor(private _window: WindowService,private el: ElementRef){

  }
  barcodeValue;
  ngOnInit(){

  }
  onBarcodeScanned(code: any) {
    console.log(code)
  }

  ngAfterViewInit(){
    this.barcodeScanner.start();
  }

  onClick(){
    Quagga.start()
  }

  onError(error) {
    console.error(error);
    this.isError = true;
  }

  onValueChanges(result) {
    this.barcodeValue = result.codeResult.code;
  }

  onStarted(started) {
    console.log(started);
  }
}
