import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgBarcodeDetectorModule } from 'ng-barcode-detector';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MaterialModuleModule} from '../app/material-module/material-module.module'
import { BarcodeScannerLivestreamModule } from "ngx-barcode-scanner";
import {WindowService} from '../app/window.service'
import {NgxBarcodeScannerModule} from '@eisberg-labs/ngx-barcode-scanner';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
  BrowserModule,
    ZXingScannerModule,
    AppRoutingModule,
    NgBarcodeDetectorModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MaterialModuleModule,
    BarcodeScannerLivestreamModule,
    NgxBarcodeScannerModule
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },WindowService],
  bootstrap: [AppComponent]
})
export class AppModule { }
