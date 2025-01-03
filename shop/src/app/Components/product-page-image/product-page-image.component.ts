import {AfterViewInit, Component, Inject, Renderer2} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {URL_PATH} from 'src/app/app.component';
import {handleClose$} from '../../Pages/product/product.component';

@Component({
  selector: 'app-product-page-image',
  templateUrl: './product-page-image.component.html',
  styleUrls: ['./product-page-image.component.scss']
})

export class ProductPageImageComponent implements AfterViewInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { src: string },
    private render: Renderer2) {
  }

  ngAfterViewInit(): void {
    this.render.setAttribute(document.querySelector('.product-img__container >img'), 'src', URL_PATH.slice(0, -1) + this.data.src);
  }

  handleClose(): void {
    handleClose$.next();
  }
}
