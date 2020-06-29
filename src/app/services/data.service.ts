import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  private data;
  private errorMessage;

  setData(data,errorMessage){
    this.data= data;
    this.errorMessage = errorMessage;
  }

  getData(){
    let temp = [this.data, this.errorMessage];
    this.clearData();
    return temp;
  }
  clearData(){
    this.data = undefined;
  }
}