import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProjectComponent } from './project/project.component';
import { ContactComponent } from './contact/contact.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { MediaComponent } from './media/media.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'profile', component: ProfilesComponent },
    { path: 'project', component: ProjectComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'media', component: MediaComponent },
    { path: 'admin', component: AdminComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];
