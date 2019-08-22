import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' }
  // { path: 'add-new-drone', loadChildren: './tab2/add-new-drone/add-new-drone.module#AddNewDronePageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes,
      {
        preloadingStrategy: PreloadAllModules ,
        enableTracing: true
      }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
