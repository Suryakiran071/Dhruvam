import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProjectComponent } from './project/project.component';
import { ContactComponent } from './contact/contact.component';
import { ProfilesComponent } from './profiles/profiles.component';


export const routes: Routes = [
    {path:"home", component: HomeComponent},
    { path: 'profile', component: ProfilesComponent },
    { path: 'project', component: ProjectComponent },
    { path: 'contact', component: ContactComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
    
];
