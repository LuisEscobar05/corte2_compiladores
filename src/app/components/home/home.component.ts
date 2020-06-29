import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { StackService } from 'src/app/services/stack.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  cadena;
  auxiCadena
  errorMessage;
  message;
  iterator;
  transicion;
  transiciones = [];
  identificador;
  numero;
  tipo;
  restoIdentificador;
  banderaDosPuntos = 0;
  banderaIdentificador = 0;
  banderaParentesisApertura = 0;
  banderaParentesisCierre = 0;
  banderaRestoIdentificador = 0;

  constructor(private router: Router, private dataService: DataService, private pila: StackService) { }
  ngOnInit() {
  }

  evaluar() {
    this.iterator = 0;
    this.cadena = this.cadena;
    this.pila.clear();
    this.transiciones = [];
    if (this.cadena != undefined) {
      this.auxiCadena = this.cadena.split(" ");
      this.firstRule();
    } else {
      this.errorMessage = "No ingreso nada";
      this.dataService.setData(this.transiciones, this.errorMessage);
      this.router.navigateByUrl('/salida');
      this.iterator = 0;
    }
  }

  firstRule(){
    this.banderaDosPuntos=0;
    this.banderaRestoIdentificador=0;
    this.banderaIdentificador=0;
    this.banderaParentesisApertura=0;
    this.banderaParentesisCierre=0;
    this.pila.push("CREARACCEDERVALORES");
    this.pila.push(":");
    this.pila.push("ACCEDERATRIBUTOS");
    this.pila.push("ASIGNARVALORES");
    this.pila.push(":");
    this.pila.push("VALORES");
    this.pila.push("CREARACCEDERVALORES");
    this.pila.push(":");
    this.pila.push("PROPIEDADES");
    this.pila.push("CREAR");
    this.pila.push(":");
    this.pila.push("CREAROBJETOS");
    if (this.auxiCadena[this.iterator] == "CREAROBJETOS") {
      this.popData()// pop a CREAROBJETOS
      this.iterator++;
      this.validarDosPuntos();
      this.router.navigateByUrl('/salida');
      this.dataService.setData(this.transiciones, this.errorMessage);
      this.iterator = 0;
      this.pila.clear();
    } else {
      this.errorMessage = "Error sintactico ----> " + this.auxiCadena[this.iterator] + ", Deberia ser CREAROBJETOS";
      this.dataService.setData(this.transiciones, this.errorMessage);
      this.router.navigateByUrl('/salida');
      this.iterator = 0;
      this.pila.clear();
    }
  }

  validarDosPuntos() {
    if (this.auxiCadena[this.iterator] == ":") {
      this.popData()// pop a :
      this.iterator++;
      if (this.banderaDosPuntos == 0) {
        this.validarCrear();
      }else if (this.banderaDosPuntos == 1){
        this.validarCrearAccederValores();
      }else if (this.banderaDosPuntos == 2){
        this.validarAsignarValores();
      }
    } else {
      this.error();
    }
  }

  validarCrear() {
    if (this.expresionIdentificador()) {
      this.popData()// pop a CREAR
      this.pushData("RestoIdentificador");
      this.pushData("Identificador");
      this.validarIdentificador();
    } else {
      this.error();
    }
  }

  validarIdentificador() {
    if (this.expresionIdentificador()) {
      this.popData()// pop a Identificador
      this.iterator++;
      if (this.banderaIdentificador == 0) {
        this.validarRestoIdentificador();
      }else if (this.banderaIdentificador == 1) {
        this.banderaRestoIdentificador=1; 
        this.validarParentesisApertura();
      }

    } else {
      this.error();
    }
  }

  validarRestoIdentificador() {
    if (this.auxiCadena[this.iterator] == ",") {
      this.iterator++;
      if (this.expresionIdentificador()) {
        this.iterator++;
        this.validarRestoIdentificador();
      } else {
        this.error()
      }
    } else {
      if (this.auxiCadena[this.iterator] == "PROPIEDADES" || this.auxiCadena[this.iterator] == ")" ) {
        this.popData()// pop a RestoIdentificador
        if (this.banderaRestoIdentificador == 0) {
          this.validarPropiedades();
        }else if(this.banderaRestoIdentificador == 1) {
          this.banderaParentesisCierre =0;
          this.validarParentesisCierre();
        }
      } else {
        this.error();
      }
    }
  }

  validarPropiedades() {
    if (this.auxiCadena[this.iterator] == "PROPIEDADES") {
      this.popData()// pop a PROPIEDADES
      this.iterator++;
      this.banderaDosPuntos = 1;
      this.validarDosPuntos();
    } else {
      this.error()
    }
  }

  validarCrearAccederValores() {
    if (this.expresionIdentificador()) {
      this.popData() // pop a CREARACCEDERVALORES
      this.pushData("RestoValor");
      this.pushData(")");
      this.pushData("RestoIdentificador");
      this.pushData("Identificador");
      this.pushData("(");
      this.pushData("Identificador");
      this.banderaIdentificador = 1;
      this.validarIdentificador()
    } else {
      this.error();
    }
  }

  validarParentesisApertura() {
    if (this.auxiCadena[this.iterator] == "(") {
      this.popData()//pop a (
      this.iterator++;
      if (this.banderaParentesisApertura == 0) {
        this.banderaIdentificador = 0;
        this.validarIdentificador();
      }else if(this.banderaParentesisApertura=1){
        this.validarTipoAtributo();
      }
    } else {
      this.error();
    }
  }

  validarParentesisCierre() {
    if (this.auxiCadena[this.iterator] == ")") {
      this.popData()//pop a )
      this.iterator++;
      if (this.banderaParentesisCierre == 0) {
        this.validarRestoValor();
      }else if (this.banderaParentesisCierre == 1) {
        this.validarRestoAsignarValores();
      }
    } else {
      this.error();
    }
  }

  validarRestoValor() {
    if (this.auxiCadena[this.iterator] == ",") {
      this.iterator++;
      if (this.expresionIdentificador()) {
        this.validarCrearAccederValores();
      } else {
        this.error()
      }
    } else {
        if (this.auxiCadena[this.iterator] == "VALORES" || this.auxiCadena[this.iterator] == ")") {
        this.popData()//pop A RestoValor
        this.validarValores();
      } else if(this.auxiCadena[this.identificador]==undefined && this.pila.peek()=="RestoValor" && this.pila.size()==1){
        this.popData()//pop A RestoValor final
        this.errorMessage="Cadena aceptada";
      } else {
        this.error();
      }
    }
  }

  validarValores() {
    if (this.auxiCadena[this.iterator] == "VALORES" || this.auxiCadena[this.iterator]==")") {
      this.popData()//pop a VALORES;
      this.banderaDosPuntos = 2;
      if(this.auxiCadena[this.iterator] == "VALORES"){
        this.iterator++;
        this.validarDosPuntos();
      }else if(this.auxiCadena[this.iterator]==")"){
        this.banderaParentesisCierre =1;
        this.validarParentesisCierre();
      }

    } else {
      this.error();
    }
  }

  validarAsignarValores() {
    if (this.expresionIdentificador()) {
        this.popData()//pop ASIGNARVALORES
      this.iterator++;
      this.pushData("RestoAsignarValores");
      this.pushData(")");
      this.pushData("TipoAtributo");
      this.pushData("(");
      this.pushData("Identificador");
      this.popData()//pop a Identificador
      this.banderaParentesisApertura = 1;
      this.validarParentesisApertura();
    } else {
      this.error();
    }
  }

  validarTipoAtributo(){
    if(this.expresionIdentificador()){
      this.popData()//pop a TipoAtributo
      this.pushData("RestoTipoAtributo");
      this.pushData("Identificador");
      this.popData()//pop a Identificador
      this.iterator++;
      this.validarRestoTipoAtributo();
    }else if(this.expresionNumero()){
      this.popData()//pop a TipoAtributo
      this.pushData("RestoTipoAtributo");
      this.pushData("Numero");
      this.popData()//pop a Numero
      this.iterator++;
      this.validarRestoTipoAtributo();
    }else if(this.auxiCadena[this.iterator]=="CREAROBJETOS"){
      this.popData()//pop a TipoAtributo
      this.pushData("RestoTipoAtributo");
      this.pushData("S");
      this.popData()//pop S
      this.firstRule();
      this.validarRestoTipoAtributo();
    }else{
      this.error();
    }

  }

  validarRestoTipoAtributo(){
    if(this.auxiCadena[this.iterator]==","){
      this.popData()//pop a RestoTipoAtributo
      this.iterator++;
      this.pushData("TipoAtributo");
      this.pushData(",");
      this.popData()//pop a ,
      this.validarTipoAtributo()
    }else if(this.auxiCadena[this.iterator]==")"){
      this.popData()//pop a RestoTipoAtributo
      this.banderaParentesisCierre=1;
      this.validarParentesisCierre();
    }
  }

  validarRestoAsignarValores(){
    if (this.auxiCadena[this.iterator] == ",") {
      this.iterator++;
      if (this.expresionIdentificador()) {
        this.validarAsignarValores();
      } else {
        this.error()
      }
    } else {
        if (this.auxiCadena[this.iterator] == "ACCEDERATRIBUTOS") {
        this.popData()//pop A RestoAsignarValores
        this.validarAccederAtributos();
      } else {
        this.error();
      }
    }
  }

  validarAccederAtributos(){
    if (this.auxiCadena[this.iterator] == "ACCEDERATRIBUTOS") {
      this.popData()//pop a ACCEDERATRIBUTOS;
      this.iterator++;
      this.banderaDosPuntos = 1;
      this.banderaParentesisApertura = 0;
      this.validarDosPuntos();
    } else {
      this.error();
    }
  }

  expresionIdentificador() {
    this.identificador = /^[a-zA-Z]+$/;

    if (this.identificador.test(this.auxiCadena[this.iterator]) && this.auxiCadena[this.iterator]!=undefined) {
      return true;
    } else {
      return false;
    }
  }

  expresionNumero(){
    this.numero = /^[\d]+$/
    if (this.numero.test(this.auxiCadena[this.iterator])) {
      return true;
    } else {
      return false;
    }
  }

  pushData(dato) {
    this.pila.push(dato);
    this.message = "entra: " + this.pila.peek();
    this.transicion = ["" + this.pila.stack, this.message];
    this.transiciones.push(this.transicion);
  }

  popData() {
    this.message = "sale: " + this.pila.peek();
    this.pila.pop();
    this.transicion = ["" + this.pila.stack, this.message];
    this.transiciones.push(this.transicion);
  }

  error() {
    this.errorMessage = "Error sintactico no coincide con la pila ----> " + this.auxiCadena[this.iterator] + ", Deberia ser: " + this.pila.peek();
  }

}
