import {IAd} from '../interfaces/interfaces';
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {URL_PATH} from '../app.component';
import {Observable} from 'rxjs';
import {HttpService} from '../services/http.service';

export interface IProductResponse{
data: IAd; status: string;
}

@Injectable()
export class ProductResolver implements Resolve<IProductResponse>{
  constructor(private http: HttpService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IProductResponse>{
    const id = route.paramMap.get('id');

    return  this.http.get<any>(`${URL_PATH}api/product/` + id);
  }
}
