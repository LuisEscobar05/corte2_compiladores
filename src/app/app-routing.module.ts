import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SalidaComponent } from './components/salida/salida.component';


const routes: Routes = [
  {
    path:'',
    component:HomeComponent
  },
  {
    path:'salida',
    component:SalidaComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
